const axios = require('axios');
const fs = require('fs');
const path = require('path');

const configPath = path.resolve('./config.json');

let config = {};
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (error) {
  console.error("Gagal membaca config.json:", error);
  process.exit(1);
}

const uptimeEndpoint = "https://potential-halibut-wr599jw7qv5jhgppw-8080.app.github.dev/uptime";

const checkInterval = 60000; 

async function checkUptime() {
  try {
    const startTime = Date.now();
    const response = await axios.get(uptimeEndpoint);
    const responseTime = Date.now() - startTime;


    if (response.data && typeof response.data === 'object') {
      return console.log(`✅ Uptime Status: ${JSON.stringify(response.data)}\nResponse time: ${responseTime}ms`);
    } else {
      return console.log(`✅ Uptime Status: ${response.data}\nResponse time: ${responseTime}ms`);
    }
  } catch (error) {
    return console.log(`❌ Uptime Status: DOWN\nError: ${error.message}`);
  }
}

function startUptimeMonitor() {
  setInterval(async () => {
    const uptimeStatus = await checkUptime();
    console.log("Uptime Status:\n", uptimeStatus);
  }, checkInterval);
}

module.exports = {
  startUptimeMonitor,
};