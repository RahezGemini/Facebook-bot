const fs = require('fs');
const path = require('path');

// Path ke file config.json
const configPath = path.resolve('./config.json');

// Membaca file config.json
let config = {};
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (error) {
  console.error("Gagal membaca config.json:", error);
  process.exit(1);
}

module.exports = {
  hady: {
    nama: "admin",
    penulis: "Hady Zen",
    kuldown: 6,
    peran: 2,
    tutor: "<list/add/del>"
  },
  
  bahasa: {
    id: { hadi: "Kamu belum memberikan id nya.",
          aya: "Berhasil menambahkan admin.", 
          nokoji: "Berhasil menghapus admin.",
          zen: "Id yang kamu berikan bukanlah admin.", 
          in: "Kamu salah penggunaan, gunakan list, add, del." }, 
    en: { hadi: "You haven't provided the id.",
          aya: "Added admin successfully.", 
          nokoji: "Successfully deleted admin.",
          zen: "The id you provided is not admin.", 
          in: "You are using it wrong, use list, add, del." }
  }, 
    
  Ayanokoji: async function({ api, event, args, bhs, loadC }) {
    const { threadID, messageID } = event;

    // Fungsi untuk mendapatkan nama pengguna dari ID
    async function getUserName(userID) {
      try {
        const userInfo = await api.getUserInfo(userID);
        return userInfo[userID].name;
      } catch (error) {
        console.error("Gagal mendapatkan nama pengguna:", error);
        return "Unknown User";
      }
    }

    // Fungsi untuk menyimpan perubahan ke config.json
    function saveConfig() {
      try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      } catch (error) {
        console.error("Gagal menyimpan config.json:", error);
      }
    }

    switch (args[0]) {
      case 'list':
        if (config.admin.length === 0) {
          api.sendMessage("Tidak ada admin yang terdaftar.", threadID, messageID);
          return;
        }

        let adminList = "LIST ADMIN =>\n";
        for (const userID of config.admin) {
          const userName = await getUserName(userID);
          adminList += `${userName} (${userID})\n`;
        }
        api.sendMessage(adminList, threadID, messageID);
        break;

      case 'add':
        if (args.length < 2) return api.sendMessage(bhs('hadi'), threadID, messageID);
        const newAdminID = args[1];
        if (config.admin.includes(newAdminID)) {
          api.sendMessage("ID ini sudah menjadi admin.", threadID, messageID);
          return;
        }

        const newAdminName = await getUserName(newAdminID);
        config.admin.push(newAdminID);
        saveConfig();
        api.sendMessage(`${bhs('aya')}\n${newAdminName} (${newAdminID})`, threadID, messageID);
        await loadC();
        break;

      case 'del':
        if (args.length < 2) return api.sendMessage(bhs('hadi'), threadID, messageID);
        const adminIDToRemove = args[1];
        const index = config.admin.indexOf(adminIDToRemove);
        if (index !== -1) {
          const removedAdminName = await getUserName(adminIDToRemove);
          config.admin.splice(index, 1);
          saveConfig();
          api.sendMessage(`${bhs('nokoji')}\n${removedAdminName} (${adminIDToRemove})`, threadID, messageID);
          await loadC();
        } else {
          api.sendMessage(bhs('zen'), threadID, messageID);
        }
        break;

      default:
        api.sendMessage(bhs('in'), threadID, messageID);
    }
  }
};