module.exports = {
  hady: {
    nama: "set",
    penulis: "Rahez",
    peran: 2,
    kuldown: 10,
    tutor: "<exp/dollar> <jumlah>"
  },

  Ayanokoji: async function ({ api, event, args, getData, setUser }) {
    try {
      if (args.length < 2) {
        return api.sendMessage("❌ Penggunaan: set <exp/dollar> <jumlah>", event.threadID, event.messageID);
      }

      const type = args[0].toLowerCase(); 
      const amount = parseFloat(args[1]);

      
      if (isNaN(amount) || amount < 0) {
        return api.sendMessage("❌ Jumlah harus berupa angka positif.", event.threadID, event.messageID);
      }

      
      const targetID = event.messageReply?.senderID || event.senderID;

      
      const userData = getData(targetID);

      if (!userData) {
        return api.sendMessage("❌ Pengguna tidak ditemukan di database.", event.threadID, event.messageID);
      }

      
      if (type === "exp") {
        setUser(targetID, "exp", amount);
        return api.sendMessage(`✅ Berhasil mengatur EXP ${userData.nama} menjadi ${amount}.`, event.threadID, event.messageID);
      } else if (type === "dollar") {
        setUser(targetID, "dollar", amount);
        return api.sendMessage(`✅ Berhasil mengatur Dollar ${userData.nama} menjadi ${amount}.`, event.threadID, event.messageID);
      } else {
        return api.sendMessage("❌ Tipe yang valid adalah 'exp' atau 'dollar'.", event.threadID, event.messageID);
      }
    } catch (error) {
      console.error("Error in set command:", error);
      return api.sendMessage("❌ Terjadi kesalahan saat menjalankan perintah.", event.threadID, event.messageID);
    }
  }
};