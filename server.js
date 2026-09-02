require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASS = process.env.ADMIN_PASS || 'Wyt11223344$$';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve all static assets from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Database connection middleware for API routes
let isConnected = false;
async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is missing.');
  }
  const db = await mongoose.connect(process.env.MONGODB_URI);
  isConnected = db.connections[0].readyState;
}

app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/* ─── Schemas & Models ─── */
const Submission = mongoose.models.Submission || mongoose.model('Submission', new mongoose.Schema({
  fullName: String, email: String, phone: String, interest: String, message: String, status: { type: String, default: 'new' }, submittedAt: { type: Date, default: Date.now }
}));

const Location = mongoose.models.Location || mongoose.model('Location', new mongoose.Schema({
  name: String, nameAr: String, type: String, typeAr: String, machine: String, area: String, areaAr: String, image: String, featured: { type: Boolean, default: false }
}));

const Machine = mongoose.models.Machine || mongoose.model('Machine', new mongoose.Schema({
  name: String, nameAr: String, badge: String, badgeAr: String, desc: String, descAr: String, image: String, specs: Array
}));

const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
  name: String, nameAr: String, desc: String, descAr: String, items: [String], image: String
}));

const Faq = mongoose.models.Faq || mongoose.model('Faq', new mongoose.Schema({
  q: String, qAr: String, a: String, aAr: String
}));

const Partner = mongoose.models.Partner || mongoose.model('Partner', new mongoose.Schema({
  name: String, initials: String, color: String, bg: String
}));

const Settings = mongoose.models.Settings || mongoose.model('Settings', new mongoose.Schema({
  whatsapp: String, email: String, phone: String, address: String, addressAr: String, hours: String, hoursAr: String
}));

const Stats = mongoose.models.Stats || mongoose.model('Stats', new mongoose.Schema({
  machines: Object, locations: Object, uptime: Object
}));

/* ─── Auth Middleware ─── */
function checkAdminAuth(req, res, next) {
  const pass = req.headers['x-admin-pass'] || req.query.pass;
  if (pass === ADMIN_PASS) return next();
  return res.status(401).json({ success: false, message: 'Unauthorized access' });
}

/* ─── Page Routes ─── */
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ─── API Endpoints ─── */
app.get('/api/content', async (req, res) => {
  try {
    const locations = await Location.find();
    const machines = await Machine.find();
    const products = await Product.find();
    const faqs = await Faq.find();
    const partners = await Partner.find();
    const settings = await Settings.findOne() || {};
    const stats = await Stats.findOne() || {};
    res.json({ locations, machines, products, faqs, partners, settings, stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/faqs', checkAdminAuth, async (req, res) => {
  try {
    const faqs = await Faq.find();
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/faqs', checkAdminAuth, async (req, res) => {
  try {
    const faq = new Faq(req.body);
    await faq.save();
    res.json(faq);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/admin/faqs/:id', checkAdminAuth, async (req, res) => {
  try {
    await Faq.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/submissions', checkAdminAuth, async (req, res) => {
  try {
    const subs = await Submission.find().sort({ submittedAt: -1 });
    res.json(subs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/submissions/:id/status', checkAdminAuth, async (req, res) => {
  try {
    const updated = await Submission.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/submissions/:id', checkAdminAuth, async (req, res) => {
  try {
    await Submission.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/locations', checkAdminAuth, async (req, res) => {
  try {
    const loc = new Location(req.body);
    await loc.save();
    res.json(loc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/locations/:id', checkAdminAuth, async (req, res) => {
  try {
    await Location.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/machines', checkAdminAuth, async (req, res) => {
  try {
    const mach = new Machine(req.body);
    await mach.save();
    res.json(mach);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/machines/:id', checkAdminAuth, async (req, res) => {
  try {
    await Machine.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/products', checkAdminAuth, async (req, res) => {
  try {
    const prod = new Product(req.body);
    await prod.save();
    res.json(prod);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/products/:id', checkAdminAuth, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/partners', checkAdminAuth, async (req, res) => {
  try {
    const partner = new Partner(req.body);
    await partner.save();
    res.json(partner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/partners/:id', checkAdminAuth, async (req, res) => {
  try {
    await Partner.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/stats', checkAdminAuth, async (req, res) => {
  try {
    let stats = await Stats.findOne();
    if (stats) { Object.assign(stats, req.body); await stats.save(); }
    else { stats = new Stats(req.body); await stats.save(); }
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/settings', checkAdminAuth, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (settings) { Object.assign(settings, req.body); await settings.save(); }
    else { settings = new Settings(req.body); await settings.save(); }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;