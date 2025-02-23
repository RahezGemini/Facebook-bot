const fs = require('fs');
const path = require('path');

const banDBPath = path.join(__dirname, 'db', 'ban.db');

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
    nama: "user", 
    penulis: "Rahez", 
    kuldown: 10,
    peran: 0,
    tutor: "<ban/unban/list>"
  }, 
  
  Ayanokoji: async function ({ args, api, event, getData, setUser }) {
    if (!args.join(' ')) {
        return api.sendMessage('Gunakan <ban/unban/banlist>', event.threadID, event.messageID);
    }

    if (args[0] === "ban") {
        const userID = event.messageReply.senderID;
        const banList = readBanDB();
        setUser(userID, 'ban', 'true');
        if (!banList.includes(userID)) {
          banList.push(userID);
          writeBanDB(banList);
          api.sendMessage(`UserID: ${userID} berhasil di-ban.`, event.threadID);
        } else {
          api.sendMessage(`UserID: ${userID} sudah di-ban.`, event.threadID);
        }
    } else if (args[0] === "unban") {
        const userID1 = event.messageReply.senderID;
        setUser(userID1, 'ban', 'false');
        const banList = readBanDB();
        if (banList.includes(userID1)) {
          const newBanList = banList.filter(id => id !== userID1);
          writeBanDB(newBanList);
          api.sendMessage(`UserID: ${userID1} berhasil di-unban.`, event.threadID);
        } else {
          api.sendMessage(`UserID: ${userID1} tidak ditemukan dalam daftar ban.`, event.threadID);
        }
    } else if (args[0] === "banlist") {
        const banList = readBanDB();
        if (banList.length > 0) {
          api.sendMessage(`Daftar user yang di-ban:\n${banList.join('\n')}`, event.threadID);
        } else {
          api.sendMessage("Tidak ada user yang di-ban.", event.threadID);
        }
    } else {
        api.sendMessage("Perintah tidak valid. Gunakan ban, unban, atau list.", event.threadID);
    }
  }
};