const axios = require('axios');
const fs = require('fs').promises; // Use promises for better async handling
const path = require('path');
const { logo } = require('./facebook/log');

/**
 * Check if a file exists on the GitHub repository.
 * @param {string} filename - The filename to check.
 * @returns {boolean} - Returns true if the file exists, otherwise false.
 */
async function kei(filename) {
  try {
    const response = await axios.get(`https://raw.githubusercontent.com/RahezGemimi/Facebook-bot/refs/heads/main/${filename}`);
    return response.status === 200;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log(logo.error + `File ${filename} bukan file dari ayanokoji.`);
    } else {
      console.log(logo.error + `Terjadi kesalahan saat memeriksa file ${filename}: ${error.message}`);
    }
    return false;
  }
}

/**
 * Update a file from the GitHub repository.
 * @param {string} filename - The filename to update.
 */
async function ayanokoji(filename) {
  const fileExists = await kei(filename);
  if (!fileExists) return;

  try {
    const { data } = await axios.get(`https://raw.githubusercontent.com/RahezGemimi/Facebook-bot/refs/heads/main/${filename}`, { responseType: 'arraybuffer' });
    await fs.writeFile(path.join(__dirname, filename), data);
    console.log(logo.update + `Berhasil memperbarui file ${filename}.`);
  } catch (error) {
    console.log(logo.error + `Gagal memperbarui file ${filename}: ${error.message}`);
  }
}

/**
 * Check for updates and update files if necessary.
 */
async function kiyotaka() {
  try {
    // Read local version.json
    const versionFilePath = path.join(__dirname, 'version.json');
    const versionData = JSON.parse(await fs.readFile(versionFilePath, 'utf8'));
    const { version } = versionData;

    if (!version) {
      console.log(logo.error + 'Versi tidak ditemukan di version.json, pembaruan dibatalkan.');
      return;
    }

    // Fetch remote version.json
    const { data: remoteVersionData } = await axios.get('https://raw.githubusercontent.com/RahezGemimi/Facebook-bot/refs/heads/main/version.json');

    if (!remoteVersionData.version) {
      console.log(logo.error + 'Versi tidak ditemukan di repositori GitHub, pembaruan dibatalkan.');
      return;
    }

    // Validate version
    if (version !== remoteVersionData.version) {
      console.log(logo.error + 'Versi tidak valid. Mohon gunakan versi yang sesuai dari repositori GitHub.');
      return;
    }

    // Check if an update is available
    const { data: remotePackageData } = await axios.get('https://raw.githubusercontent.com/RahezGemimi/Facebook-bot/refs/heads/main/package.json');
    if (version === remotePackageData.version) {
      console.log(logo.update + 'Kamu sudah menggunakan versi terbaru.');
      return;
    }

    // Read the current directory
    const files = await fs.readdir(__dirname);

    // Filter and update files concurrently
    const updatePromises = files
      .filter((file) => file !== 'version.json' && file !== 'account.txt' && file !== 'config.json')
      .map(async (file) => {
        try {
          const stats = await fs.stat(path.join(__dirname, file));
          if (stats.isFile()) {
            await ayanokoji(file);
          }
        } catch (error) {
          console.log(logo.error + `Gagal memeriksa status file ${file}: ${error.message}`);
        }
      });

    await Promise.all(updatePromises); // Wait for all updates to complete
  } catch (error) {
    console.log(logo.error + `Terjadi kesalahan saat memeriksa pembaruan: ${error.message}`);
  }
}

// Run the update check
kiyotaka();