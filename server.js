require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASS = process.env.ADMIN_PASS || 'Wyt11223344$$';

// Serverless-safe upload directory setup
const uploadDir = process.env.VERCEL ? '/tmp/uploads' : path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (err) {
    console.error('Directory creation skipped:', err.message);
  }
}

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadDir));

// Database Connection Middleware
let isConnected = false;
async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  if (process.env.MONGODB_URI) {
    const db = await mongoose.connect(process.env.MONGODB_URI);
    isConnected = db.connections[0].readyState;
  }
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database Connection Failed', error: err.message });
  }
});

/* ─── Schemas ─── */
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

/* ─── Routes ─── */
app.get('/api/content', async (req, res) => {
  const locations = await Location.find();
  const machines = await Machine.find();
  const products = await Product.find();
  const faqs = await Faq.find();
  const partners = await Partner.find();
  const settings = await Settings.findOne() || {};
  const stats = await Stats.findOne() || {};
  res.json({ locations, machines, products, faqs, partners, settings, stats });
});

// Admin FAQs
app.get('/api/admin/faqs', checkAdminAuth, async (req, res) => {
  const faqs = await Faq.find();
  res.json(faqs);
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
  await Faq.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Admin Submissions
app.get('/api/admin/submissions', checkAdminAuth, async (req, res) => {
  const subs = await Submission.find().sort({ submittedAt: -1 });
  res.json(subs);
});

app.put('/api/admin/submissions/:id/status', checkAdminAuth, async (req, res) => {
  const updated = await Submission.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json(updated);
});

app.delete('/api/admin/submissions/:id', checkAdminAuth, async (req, res) => {
  await Submission.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Admin Locations
app.post('/api/admin/locations', checkAdminAuth, upload.single('image'), async (req, res) => {
  let imageUrl = req.body.imageUrl || (req.file ? '/uploads/' + req.file.filename : '');
  const loc = new Location({ ...req.body, image: imageUrl });
  await loc.save();
  res.json(loc);
});

app.delete('/api/admin/locations/:id', checkAdminAuth, async (req, res) => {
  await Location.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Admin Machines
app.post('/api/admin/machines', checkAdminAuth, upload.single('image'), async (req, res) => {
  let imageUrl = req.file ? '/uploads/' + req.file.filename : '';
  let specs = req.body.specs ? (typeof req.body.specs === 'string' ? JSON.parse(req.body.specs) : req.body.specs) : [];
  const mach = new Machine({ ...req.body, image: imageUrl, specs });
  await mach.save();
  res.json(mach);
});

app.delete('/api/admin/machines/:id', checkAdminAuth, async (req, res) => {
  await Machine.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Admin Products
app.post('/api/admin/products', checkAdminAuth, upload.single('image'), async (req, res) => {
  let imageUrl = req.body.imageUrl || (req.file ? '/uploads/' + req.file.filename : '');
  const items = req.body.items ? req.body.items.split(',').map(i => i.trim()) : [];
  const prod = new Product({ ...req.body, items, image: imageUrl });
  await prod.save();
  res.json(prod);
});

app.delete('/api/admin/products/:id', checkAdminAuth, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Admin Partners
app.post('/api/admin/partners', checkAdminAuth, async (req, res) => {
  const partner = new Partner(req.body);
  await partner.save();
  res.json(partner);
});

app.delete('/api/admin/partners/:id', checkAdminAuth, async (req, res) => {
  await Partner.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Admin Stats & Settings
app.put('/api/admin/stats', checkAdminAuth, async (req, res) => {
  let stats = await Stats.findOne();
  if (stats) { Object.assign(stats, req.body); await stats.save(); }
  else { stats = new Stats(req.body); await stats.save(); }
  res.json(stats);
});

app.put('/api/admin/settings', checkAdminAuth, async (req, res) => {
  let settings = await Settings.findOne();
  if (settings) { Object.assign(settings, req.body); await settings.save(); }
  else { settings = new Settings(req.body); await settings.save(); }
  res.json(settings);
});

// Serve frontend admin page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;