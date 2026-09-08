require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Body parser middlewares (Crucial for receiving JSON & Form payloads)
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static frontend assets
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.get('/api/content', async (req, res) => {
  try {
    const content = await db.getContent();
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/machines', async (req, res) => {
  try {
    const machine = await db.addMachine(req.body);
    res.json({ success: true, machine });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.delete('/api/machines/:id', async (req, res) => {
  try {
    await db.deleteMachine(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Database cleanup endpoint for empty entries
app.post('/api/admin/clean-db', async (req, res) => {
  try {
    const cleaned = await db.clearAllCorrupt();
    res.json({ success: true, content: cleaned });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});