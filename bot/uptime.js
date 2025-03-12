const axios = require('axios');
const { config, port } = require('./config');
const { uptimekey, url, notifkey } = config;
const { Ayanokoji, logo } = require('./facebook/log');

const PORT = port || (!isNaN(port) && port) || 3001;

let myUrl = url || `https://${process.env.REPL_OWNER
    ? `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
    : process.env.API_SERVER_EXTERNAL == "https://api.glitch.com"
        ? `${process.env.PROJECT_DOMAIN}.glitch.me`
        : `localhost:${PORT}`}`;
myUrl.includes('localhost') && (myUrl = myUrl.replace('https', 'http'));
myUrl += '/uptime';

let status = 'ok';

// Fungsi untuk mengirim status ke UptimeRobot
async function sendToUptimeRobot(status) {
    const uptimeRobotUrl = `https://api.uptimerobot.com/v2/getMonitors?api_key=${uptimekey}`;
    try {
        await axios.post(uptimeRobotUrl, {
            status: status
        });
    } catch (error) {
        console.log(logo.error + 'Gagal mengirim status ke UptimeRobot: ', error);
    }
}

setTimeout(async function autoUptime() {
    try {
        await axios.get(myUrl);
        if (status != 'ok') {
            status = 'ok';
            console.log(Ayanokoji("UPTIME") + "Bot Online");
            const mes = `UPTIME BOT AKTIF\nProject: ${nama}`;
            const res = await axios.get(`https://api.callmebot.com/facebook/send.php?apikey=${notifkey}&text=${encodeURIComponent(mes)}`);
            sendToUptimeRobot('up');
        }
    } catch (e) {
        const err = e.response?.data || e;
        if (status != 'ok')
            return;
        status = 'failed';

        if (err.statusAccountBot == "can't login") {
            console.log(Ayanokoji("UPTIME") + "Gagal Login");
            const mes2 = `GAGAL LOGIN PADA UPTIME\nProject: ${nama}`;
            const res2 = await axios.get(`https://api.callmebot.com/facebook/send.php?apikey=${notifkey}&text=${encodeURIComponent(mes2)}`);
            sendToUptimeRobot('down'); // Kirim status 'down' ke UptimeRobot
        } else if (err.statusAccountBot == "block spam") {
            console.log(Ayanokoji("UPTIME") + "Akun telah di block");
            const mes3 = `AKUN TERKUNCI\nProject: ${nama}`;
            const res3 = await axios.get(`https://api.callmebot.com/facebook/send.php?apikey=${notifkey}&text=${encodeURIComponent(mes3)}`);
            sendToUptimeRobot('down'); // Kirim status 'down' ke UptimeRobot
        }
    }
    global.timeOutUptime = setInterval(autoUptime, 180 * 1000);
}, ( 180) * 1000);
 autoUptime()
console.log(Ayanokoji("UPTIME") + "uptime aktif pada url" + myUrl);