const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');
const port = '8080';
const app = express();

app.use(cors());
app.use(bodyParser());

app.listen(port, () => {
    console.log(`Server berjalan di port ${port}`);
  }).on('error', (err) => {
    console.log('Gagal memulai server: ', err);
  });
  
  app.get('/uptime', (req, res) => {
    res.send('Server is alive');
  });
  
  app.get('/laporan', (req, res) => {
    res.sendFile(path.join(__dirname, 'facebook', 'html', 'feedback.html'));
  });
  
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'facebook', 'html', 'home.html')); 
  })
  
  app.get('/social', (req, res) => {
    res.sendFile(path.join(__dirname, 'facebook', 'html', 'social.html'));
  });
  
  app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'facebook', 'html', 'login.html'));
  });
  
  app.get('/gemini', async (req, res) => {
    const text = req.query.pesan || 'hai';
  
    try {
      const data = { contents: [{ parts: [{ text }] }] };
      const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${aikey}`, data, {
        headers: { 'Content-Type': 'application/json' }
      });
      const answer = response.data.candidates[0].content.parts[0].text;
      res.json({ pembuat: "Google Gemini", answer });
    } catch (error) {
      res.status(500).json({ error: 'Maaf ada kesalahan: ' + error.message });
    }
  });
  
  app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'facebook', 'html', '404.html'));
  });