const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Buat koneksi ke database SQLite
const dbPath = path.join(__dirname, './bot/db/web.aqlite');
const db = new sqlite3.Database(dbPath);

// Buat tabel users jika belum ada
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )
  `);
});

// Fungsi untuk hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Fungsi untuk membandingkan password
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Handle Form Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  // Cari user di database
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
    if (err) {
      return alert('Terjadi kesalahan saat login.');
    }
    if (!row) {
      return alert('Username tidak ditemukan.');
    }

    // Bandingkan password
    const isMatch = await comparePassword(password, row.password);
    if (isMatch) {
      alert('Login berhasil!');
    } else {
      alert('Password salah.');
    }
  });
});

// Handle Form Register
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('registerUsername').value;
  const password = document.getElementById('registerPassword').value;

  // Hash password sebelum disimpan
  const hashedPassword = await hashPassword(password);

  // Simpan user ke database
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
    if (err) {
      return alert('Username sudah digunakan.');
    }
    alert('Registrasi berhasil! Silakan login.');
    showLoginForm();
  });
});

// Toggle antara form login dan register
document.getElementById('showRegister').addEventListener('click', (e) => {
  e.preventDefault();
  showRegisterForm();
});

document.getElementById('showLogin').addEventListener('click', (e) => {
  e.preventDefault();
  showLoginForm();
});

const showLoginForm = () => {
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('registerForm').style.display = 'none';
};

const showRegisterForm = () => {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('registerForm').style.display = 'block';
};