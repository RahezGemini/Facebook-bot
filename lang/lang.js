// lang/lang.js
const fs = require('fs');
const path = require('path');

// Mengambil konfigurasi bahasa dari config.json
const configPath = path.join(__dirname, '../config.json');
let config;

try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (error) {
    console.error("Error reading config.json:", error);
    process.exit(1);
}

// Daftar bahasa yang tersedia
const languages = {
    ID: require('./language/id.lang'),
    EN: require('./language/en.lang')
};

// Memeriksa apakah bahasa yang dipilih ada
let currentLanguage = config.bahasa.toUpperCase();
if (!languages[currentLanguage]) {
    console.error(`Bahasa '${currentLanguage}' tidak ditemukan. Program akan berhenti.`);
    process.exit(1);
}

// Fungsi untuk mendapatkan teks berdasarkan kunci
function lang(key, variables = {}) {
    if (languages[currentLanguage][key]) {
        let text = languages[currentLanguage][key];
        for (const [k, v] of Object.entries(variables)) {
            text = text.replace(new RegExp(`\\\${${k}}`, 'g'), v);
        }
        return text;
    } else {
        console.warn(`Terjemahan untuk '${key}' tidak ditemukan dalam '${currentLanguage}'.`);
        return `[${key}]`; // Kembalikan kunci sebagai placeholder jika terjemahan tidak ada
    }
}

// Ekspor fungsi lang
module.exports = lang;