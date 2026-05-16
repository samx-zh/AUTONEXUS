// AutoNexus — Express.js Backend
// Run: npm install express cors && node server.js

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const MESSAGES_FILE = path.join(__dirname, 'messages.txt');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve HTML files

// POST /contact — Save message to file
app.post('/contact', (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validation
  if (!name || name.trim().length < 2) {
    return res.status(400).json({ error: 'Name must be at least 2 characters.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'A valid email is required.' });
  }

  if (!message || message.trim().length < 10) {
    return res.status(400).json({ error: 'Message must be at least 10 characters.' });
  }

  // Format and append to file
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const entry = `
========================================
📅 Date    : ${timestamp}
👤 Name    : ${name.trim()}
📧 Email   : ${email.trim()}
📌 Subject : ${subject ? subject.trim() : '(no subject)'}
💬 Message :
${message.trim()}
========================================
`;

  try {
    fs.appendFileSync(MESSAGES_FILE, entry, 'utf8');
    console.log(`[${timestamp}] New message from ${name} <${email}>`);

    res.json({
      success: true,
      message: `Thank you, ${name.split(' ')[0]}! Your message has been saved and the admin will respond soon.`
    });
  } catch (err) {
    console.error('File write error:', err);
    res.status(500).json({ error: 'Server error saving message.' });
  }
});

// GET /messages — View all messages (admin only in real app)
app.get('/messages', (req, res) => {
  try {
    if (fs.existsSync(MESSAGES_FILE)) {
      const content = fs.readFileSync(MESSAGES_FILE, 'utf8');
      res.type('text/plain').send(content || 'No messages yet.');
    } else {
      res.type('text/plain').send('No messages yet.');
    }
  } catch (err) {
    res.status(500).send('Error reading messages.');
  }
});

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║       AutoNexus Backend Server        ║
  ╠═══════════════════════════════════════╣
  ║  🚀 Running on: http://localhost:${PORT}  ║
  ║  📁 Serving:    HTML files            ║
  ║  💾 Messages:   messages.txt          ║
  ╚═══════════════════════════════════════╝

  Visit: http://localhost:${PORT}/index.html
  Messages saved to: messages.txt
  `);
});