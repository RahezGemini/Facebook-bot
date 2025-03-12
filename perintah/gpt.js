const axios = require("axios");

module.exports = {
  hady: {
    nama: "gpt", 
    kuldown: 6,
    peran: 0,
    penulis: "Rahez", 
    tutor: "<answer>"
  },

  Ayanokoji: async function ({ api, event, args }) {
    const { threadID, messageID, messageReply } = event;

    // Cek apakah pesan adalah reply ke pesan bot
    if (messageReply && messageReply.senderID === api.getCurrentUserID()) {
      const prompt = messageReply.body; // Ambil isi pesan yang di-reply
      if (!prompt) return api.sendMessage('Masukan prompt nya', threadID, messageID);

      try {
        const respon = await axios.get(`https://api.ryzendesu.vip/api/ai/v2/chatgpt?text=${encodeURIComponent(prompt)}`);
        const response = respon.data.response;
        api.sendMessage(response, threadID, messageID);
      } catch (error) {
        console.error("Error contacting AI:", error);
        api.sendMessage("Gagal Mengirim Request.", threadID, messageID);
      }
    } else {
      // Jika bukan reply ke pesan bot, tangani seperti biasa
      const prompt = args.join(' ');
      if (!prompt) return api.sendMessage('Masukan prompt nya', threadID, messageID);

      try {
        const respon = await axios.get(`https://api.ryzendesu.vip/api/ai/v2/chatgpt?text=${encodeURIComponent(prompt)}`);
        const response = respon.data.response;
        api.sendMessage(response, threadID, messageID);
      } catch (error) {
        console.error("Error contacting AI:", error);
        api.sendMessage("Gagal Mengirim Request.", threadID, messageID);
      }
    }
  }
};