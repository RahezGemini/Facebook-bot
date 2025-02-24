const fs = require('fs');
const path = require('path');

const banDBPath = path.join(__dirname, 'db', 'banT.db');

// Fungsi untuk membaca database ban
function readBanDB() {
  if (!fs.existsSync(banDBPath)) {
    fs.writeFileSync(banDBPath, JSON.stringify([]));
    return [];
  }

  try {
    const data = fs.readFileSync(banDBPath, 'utf-8');
    if (!data.trim()) {
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading ban database:', error);
    return [];
  }
}

// Fungsi untuk menulis ke database ban
function writeBanDB(data) {
  try {
    fs.writeFileSync(banDBPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing to ban database:', error);
  }
}

module.exports = {
  hady: { 
    nama: "thread", 
    penulis: "Rahez", 
    kuldown: 10,
    peran: 2, // Hanya admin yang bisa menggunakan perintah ini
    tutor: "<ban/unban/list> [THREADID (untuk unban)]"
  }, 
  
  Ayanokoji: async function ({ args, api, event, threadData, setThread }) {
    if (!args.join(' ')) {
      return api.sendMessage('Gunakan <ban/unban/list> [THREADID (untuk unban)]', event.threadID, event.messageID);
    }

    // Cek apakah perintah digunakan di chat pribadi
    if (event.threadID === event.senderID) {
      return api.sendMessage("Tidak bisa dilakukan di chat pribadi.", event.threadID);
    }

    const action = args[0].toLowerCase(); // Ambil aksi (ban/unban/list)

    if (action === "ban") {
      const threadID = event.threadID; // Ambil ID thread
      const banList = readBanDB();

      // Cek apakah thread sudah di-ban
      if (banList.includes(threadID)) {
        return api.sendMessage(`Thread ${threadID} sudah di-ban.`, event.threadID);
      }

      // Tambahkan thread ke daftar ban
      banList.push(threadID);
      writeBanDB(banList);

      // Set status ban di threadData
      setThread(threadID, 'ban', 'true');

      api.sendMessage(`Thread ${threadID} berhasil di-ban.`, event.threadID);
    } else if (action === "unban") {
      // Ambil THREADID dari argumen (jika ada)
      const threadID = args[1];

      if (!threadID) {
        return api.sendMessage('Mohon berikan THREADID yang akan di-unban.', event.threadID, event.messageID);
      }

      const banList = readBanDB();

      // Cek apakah thread ada di daftar ban
      if (!banList.includes(threadID)) {
        return api.sendMessage(`Grup dengan TID: ${threadID} Tidak di ban.`, event.threadID);
      }

      // Hapus thread dari daftar ban
      const newBanList = banList.filter(id => id !== threadID);
      writeBanDB(newBanList);

      // Set status ban di threadData
      setThread(threadID, 'ban', 'false');

      api.sendMessage(`Thread ${threadID} berhasil di-unban.`, event.threadID);
    } else if (action === "list") {
      const banList = readBanDB();

      if (banList.length > 0) {
        // Format pesan untuk menampilkan daftar thread yang di-ban
        let message = "|======= DAFTAR THREAD YANG DI-BAN ========|\n";
        banList.forEach((threadID, index) => {
          const threadInfo = threadData[threadID] || { nama: 'Unknown Thread' };
          message += `\nNama: ${threadInfo.nama}\nThreadID: ${threadID}\n`;
          if (index < banList.length - 1) {
            message += "|---------------------------------------------|\n";
          }
        });
        message += "|=============================================|";

        api.sendMessage(message, event.threadID);
      } else {
        api.sendMessage("Tidak ada thread yang di-ban.", event.threadID);
      }
    } else {
      api.sendMessage("Perintah tidak valid. Gunakan ban, unban, atau list.", event.threadID);
    }
  }
};