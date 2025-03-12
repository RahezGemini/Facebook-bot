const webs = require('./web');
const login = require('./facebook/fb-chat-api');
const { logo, warna, font, ayanokoji } = require('./facebook/log');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const axios = require('axios');
const { spawn } = require('child_process');
const { version } = require('./package');
const gradient = require('gradient-string');
const { ai, awalan, nama, admin, proxy, port, bahasa: nakano, maintain, chatdm, notifkey, aikey, setting, zonawaktu, database, config } = require('./config');
const { kuldown } = require('./facebook/kuldown');
const moment = require('moment-timezone');
const now = moment.tz(zonawaktu);
// const lang = require('./lang/lang.js');
const uptime = require('./bot/uptime');
global.db = {
    userdata: {},
    threaddata: {},
};

process.on('unhandledRejection', error => console.log(logo.error + error));
process.on('uncaughtException', error => console.log(logo.error + error));

const zen = { host: proxy, port: port };
const kiyopon = gradient("#ADD8E6", "#4682B4", "#00008B")(logo.ayanokoji);
const tanggal = now.format('YYYY-MM-DD');
const waktu = now.format('HH:mm:ss');
const web = `https://${process.env.PROJECT_DOMAIN}.glitch.me`;
global.Ayanokoji = { awalan: awalan, nama: nama, admin: admin, logo: logo, aikey: aikey, bahasa: nakano, web, maintain:  maintain, waktu: waktu, tanggal: tanggal };
global.Akari = { url: config.url, port: port, notifkey: notifkey, awalan: awalan, nama: nama, admin: admin, logo: logo, aikey: aikey, bahasa: nakano, web: web, maintain: maintain, waktu: waktu, tanggal: tanggal, database: database, urlfire: config.urlfire, uptimekey: config.uptimekey }

async function notiferr(notif) {
  try {
    const oreki = `Error Project\n\nNama: ${nama}\nError: ${notif}`;
    await axios.get(`https://api.callmebot.com/facebook/send.php?apikey=${notifkey}&text=${encodeURIComponent(oreki)}`);
  } catch (error) {
    console.log(logo.error + 'Terjadi kesalahan pada notif', error);
  }
}

async function getStream(url, filename) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');
    const filePath = path.join(__dirname, 'facebook', filename);
    fs.writeFileSync(filePath, buffer);
    return filePath;
  } catch (error) {
    throw error;
  }
}

async function Message(pesan) {
      try {
        await api.sendMessage(pesan, event.threadID, event.messageID);
      } catch (error) {
     console.log(logo.error + 'Gagal membalas pesan: ', error);
   }
}

let data = {};
const dbPath = path.join('bot', 'db', 'user.db');
if (fs.existsSync(dbPath)) {
  try {
    data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  } catch (error) {
    console.log(logo.error + 'Gagal membaca user.db: ', error);
    data = {};
  }
} else {
  fs.writeFileSync(dbPath, JSON.stringify({}, null, 2));
}

let threadData = {};
const threadDbPath = path.join('bot', 'db', 'thread.db');
if (fs.existsSync(threadDbPath)) {
  try {
    threadData = JSON.parse(fs.readFileSync(threadDbPath, 'utf-8'));
  } catch (error) {
    console.log(logo.error + 'Gagal membaca thread.db: ', error);
    threadData = {};
  }
} else {
  fs.writeFileSync(threadDbPath, JSON.stringify({}, null, 2));
}

async function addData(id) {
  if (!data[id]) {
    try {
      const userInfo = await api.getUserInfo(id);
      const userName = userInfo[id]?.name || 'Facebook User';
      
      data[id] = { 'nama': userName, 'userID': id, 'dollar': 0, 'exp': 0, "ban": "false", 'level': 1, 'daily': null };
      console.log(ayanokoji('database') + `${id} pengguna baru.`);
      simpan();
    } catch (error) {
      console.log(logo.error + 'Gagal mengambil informasi pengguna: ', error);

      data[id] = { 'nama': 'Facebook User', 'userID': id, 'dollar': 0, 'exp': 0, "ban": "false", 'level': 1, 'daily': null };
      simpan();
    }
  }
}

function setUser(id, item, value) {
  if (['nama', 'daily'].includes(item)) {
    data[id][item] = value;
  } else if (['dollar', 'exp', 'level'].includes(item)) {
    if (typeof value === 'number') {
      data[id][item] = value;
    } else {
      console.log(ayanokoji('database') + 'Nilai untuk ' + item + ' harus berupa angka.');
      return;
    }
  }
  simpan();
  console.log(ayanokoji('database') + 'Pembaruan berhasil.');
}

function getData(id) {
  return data[id] || data;
}

function simpan() {
  fs.writeFile(dbPath, JSON.stringify(data, null, 2), err => {
    if (err) console.log(logo.error + "Terjadi kesalahan pada db: ", err);
  });
}

function saveThreadData(threadID, threadInfo) {
  const threadsave = {
    nama: threadInfo.name || 'Thread Name', 
    TID: threadID, 
    anggota: threadInfo.participantIDs.length,
    admin: threadInfo.adminIDs ? threadInfo.adminIDs.length : 0,
    ban: "false"
  };

  threadData[threadID] = threadsave;
  fs.writeFile(threadDbPath, JSON.stringify(threadData, null, 2), err => {
    if (err) console.log(logo.error + "Terjadi kesalahan pada thread db: ", err);
  });
}

function ThreadData(threadID) {
  return threadData[threadID] || { nama: 'Thread Name', TID: threadID, anggota: 0, admin: 0, ban: "false" };
}


function setThread(threadID, item, value) {
  if (threadData[threadID]) {
    if (['nama', 'ban'].includes(item)) {
      threadData[threadID][item] = value;
    } else if (['anggota', 'admin'].includes(item)) {
      if (typeof value === 'number') {
        threadData[threadID][item] = value;
      } else {
        console.log(ayanokoji('database') + 'Nilai untuk ' + item + ' harus berupa angka.');
        return;
      }
    }
    simpanThread();
    console.log(ayanokoji('database') + 'Pembaruan thread berhasil.');
  } else {
    console.log(ayanokoji('database') + `Thread ${threadID} tidak ditemukan.`);
  }
}

function getAllUser() {
  return data;
}

function getAllThread() {
  return threadData;
}

function simpanThread() {
  fs.writeFile(threadDbPath, JSON.stringify(threadData, null, 2), err => {
    if (err) console.log(logo.error + "Terjadi kesalahan pada thread db: ", err);
  });
}

function loadC() {
  try {
    const data = fs.readFileSync('config.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log(logo.error + 'Gagal membaca kiyotaka.json: ', error);
    return {};
  }
}

console.log(kiyopon);
setInterval(loadC, 1000);

cron.schedule('0 */4 * * *', () => {
  console.clear();
  console.log(ayanokoji('restar') + 'Memulai ulang bot...');
  const child = spawn("node", ["index.js"], { cwd: __dirname, stdio: "inherit", shell: true });
  child.on('error', err => console.log(logo.error + 'Ada error pada autorest: ', err));
  child.on('exit', code => {
    if (code === 0) console.log(ayanokoji('restar') + nama + ' berhasil dimulai ulang.');
    else console.log(logo.error + nama + ' gagal dimulai ulang: ', code);
  });
});

// Ekspos fungsi ke global scope
global.notiferr = notiferr;
global.getStream = getStream;
global.Message = Message;
global.addData = addData;
global.setUser = setUser;
global.getData = getData;
global.saveThreadData = saveThreadData;
global.ThreadData = ThreadData;
global.setThread = setThread;
global.getAllUser = getAllUser;
global.getAllThread = getAllThread;

console.log(ayanokoji('versi') + `${version}.`);
console.log(ayanokoji('prefix') + `${awalan}`);
console.log(ayanokoji('bahasa') + `${nakano}.`);
console.log(ayanokoji('database') + `Tersambung ke database ${database}`);
console.log(ayanokoji('admin') + `${admin}.`);
console.log(ayanokoji('webview') + `${web}.`);

fs.readdir('./perintah', (err, files) => {
  const commands = files.map(file => path.parse(file).name);
  console.log(ayanokoji('perintah') + `${commands}.`);
});

let akun;
try {
  akun = fs.readFileSync('account.txt', 'utf8');
  if (!akun || !JSON.parse(akun)) {
    console.log(logo.error + 'Kamu belum memasukkan cookie atau cookie tidak valid.');
    process.exit();
  }
} catch (error) {
  console.log(logo.error + 'Gagal membaca account.txt: ', error);
  process.exit();
}

login({ appState: JSON.parse(akun, zen) }, setting, (err, api) => {
  if (err) {
    notiferr(`Terjadi kesalahan saat login: ${err.message || err.error}`);
    console.log(logo.error + `Terjadi kesalahan saat login: ${err.message || err.error}`);
    process.exit();
  }

    function addExpAndDollar(userID) {
  if (data[userID] && data[userID].ban !== "true") { // Cek apakah pengguna tidak di-ban
    data[userID].exp += 10;
    data[userID].dollar += 0.5;

    
    if (data[userID].exp >= 1000) {
      data[userID].level += 1;
      data[userID].exp = 0;
      data[userID].dollar += 200;
      console.log(ayanokoji('database') + `${data[userID].nama} telah naik ke level ${data[userID].level}.`);
      api.sendMessage(`Selamat ${data[userID].nama} telah naik ke level ${data[userID].level} dan mendapatkan 200$`, event.threadID); // Kirim pesan ke pengguna
    }

    simpan(); 
  }
}

  api.listenMqtt((err, event) => {
    if (err) {
      notiferr(`${err.message || err.error}`);
      console.log(logo.error + `${err.message || err.error}`);
      process.exit();
    }

      const threadInfo = ThreadData(event.threadID);
  if (threadInfo.ban === "true") {
    console.log(ayanokoji('database') + `Thread ${event.threadID} di-ban, bot akan keluar.`);
    api.removeUserFromGroup(api.getCurrentUserID(), event.threadID);
    return;
  }

         const userglobal = getData(event.senderID);
         global.db.userData = {
             nama: userglobal.nama,
             userid: userglobal.userid,
             dollar: userglobal.dollar,
             exp: userglobal.exp,
             level: userglobal.level,
             ban: userglobal.ban,
             daily: userglobal.daily
         };
       
    const body = event.body;
    if (!body || (global.Ayanokoji.maintain === true && !admin.includes(event.senderID)) || (chatdm === false && event.isGroup == false && !admin.includes(event.senderID))) return;
    
    const userData = getData(event.senderID);

    if (userData && userData.ban === "true") {
      if (body.toLowerCase() == "prefix") return api.sendMessage(`Anda Telah terkena ban maka tidak bisa menggunakan perintah`, event.threadID, event.messageID);
      if (body.trim() === awalan) return api.sendMessage(`Anda Telah terkena ban maka tidak bisa menggunakan perintah`, event.threadID, event.messageID);   
      return;
    }

if (userData && userData.ban !== "true") {
    addExpAndDollar(event.senderID);
  }

      
    if (!body.startsWith(awalan)) {
        addData(event.senderID, api);
    if (body.toLowerCase() === "prefix") {
    return api.sendMessage(`Awalan ${nama} adalah ${awalan}`, event.threadID, event.messageID);
  }
    if (ai === "true") {
        if (body.toLowerCase() === "ai") {
        api.sendMessage('test', event.threadID)
        }
    }
  return; 
}
      if (body.startsWith(awalan)) {
    if (body.trim() === awalan) return api.sendMessage(`Halo! Gunakan ${awalan}menu untuk melihat daftar perintah.`, event.threadID, event.messageID);
          
    const cmd = body.slice(awalan.length).trim().split(/ +/g).shift().toLowerCase();

      async function hady_cmd(cmd, api, event) {
  const args = body?.replace(`${awalan}${cmd}`, "")?.trim().split(' ');
  try {
    const threadInfo = await new Promise((resolve, reject) => {
      api.getThreadInfo(event.threadID, (err, info) => {
        if (err) reject(err);
        else resolve(info);
      });
    });

    addData(event.senderID, api);
    saveThreadData(event.threadID, threadInfo);
    uptime.startUptimeMonitor(api);

    const adminIDs = threadInfo.adminIDs.map(admin => admin.id);
    const files = fs.readdirSync(path.join(__dirname, '/perintah'));
    let commandFound = false;
api
    for (const file of files) {
      if (file.endsWith('.js')) {
        const commandPath = path.join(path.join(__dirname, '/perintah'), file);
        const { hady, Ayanokoji, bahasa } = require(commandPath);

        if (hady && hady.nama === cmd && typeof Ayanokoji === 'function') {
          commandFound = true;
          console.log(logo.cmds + `Menjalankan perintah ${hady.nama}.`);
          const bhs = veng => bahasa[nakano][veng];

          if (kuldown(event.senderID, hady.nama, hady.kuldown) == 'hadi') {
            if (hady.peran == 0 || !hady.peran) {
              await Ayanokoji({ api, event, args, bhs, getStream, loadC, setUser, getData, ThreadData, setThread, getAllUser, getAllThread, Message });
              return;
            }
            if ((hady.peran == 2 || hady.peran == 1) && admin.includes(event.senderID) || hady.peran == 0) {
              await Ayanokoji({ api, event, args, bhs, getStream, loadC, setUser, getData, ThreadData, setThread, getAllUser, getAllThread, Message });
              return;
            } else if (hady.peran == 1 && adminIDs.includes(event.senderID) || hady.peran == 0) {
              await Ayanokoji({ api, event, args, bhs, getStream, loadC, setUser, getData, ThreadData, setThread, getAllUser, getAllThread, Message });
              return;
            } else {
              api.setMessageReaction("❗", event.messageID);
            }
          } else {
            Message('Sedang Couldown mohon tunggu...');
          }
        }
      }
    }

    if (!commandFound) {
      return api.sendMessage(`Perintah ${cmd} Tidak di Temukan`, event.threadID);
    }
  } catch (error) {
    notiferr(`Perintah error: ${error.message}`);
    console.log(logo.error + 'Perintah error: ' + error.message);
  }
}

    hady_cmd(cmd, api, event);
  };
 })
})