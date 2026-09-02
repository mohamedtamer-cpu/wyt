const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123'; // Set your admin password here

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer Storage Configuration
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
app.use(express.static(__dirname)); // Serves admin_2.html and static files

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wyt_db')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

/* ─── Database Schemas & Models ─── */

const SubmissionSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  interest: String,
  message: String,
  status: { type: String, default: 'new' },
  submittedAt: { type: Date, default: Date.now }
});

const LocationSchema = new mongoose.Schema({
  name: String,
  nameAr: String,
  type: String,
  typeAr: String,
  machine: String,
  area: String,
  areaAr: String,
  image: String,
  featured: { type: Boolean, default: false }
});

const MachineSchema = new mongoose.Schema({
  name: String,
  nameAr: String,
  badge: String,
  badgeAr: String,
  desc: String,
  descAr: String,
  image: String,
  specs: [{ l: String, v: String }]
});

const ProductSchema = new mongoose.Schema({
  name: String,
  nameAr: String,
  desc: String,
  descAr: String,
  items: [String],
  image: String
});

const FaqSchema = new mongoose.Schema({
  q: String,
  qAr: String,
  a: String,
  aAr: String
});

const PartnerSchema = new mongoose.Schema({
  name: String,
  initials: String,
  color: String,
  bg: String
});

const SettingsSchema = new mongoose.Schema({
  whatsapp: String,
  email: String,
  phone: String,
  address: String,
  addressAr: String,
  hours: String,
  hoursAr: String
});

const StatsSchema = new mongoose.Schema({
  machines: { value: Number, suffix: String, label: String, labelAr: String },
  locations: { value: Number, suffix: String, label: String, labelAr: String },
  uptime: { value: Number, suffix: String, label: String, labelAr: String }
});

const Submission = mongoose.model('Submission', SubmissionSchema);
const Location = mongoose.model('Location', LocationSchema);
const Machine = mongoose.model('Machine', MachineSchema);
const Product = mongoose.model('Product', ProductSchema);
const Faq = mongoose.model('Faq', FaqSchema);
const Partner = mongoose.model('Partner', PartnerSchema);
const Settings = mongoose.model('Settings', SettingsSchema);
const Stats = mongoose.model('Stats', StatsSchema);

/* ─── Admin Authentication Middleware ─── */

function checkAdminAuth(req, res, next) {
  const pass = req.headers['x-admin-pass'] || req.query.pass;
  if (pass === ADMIN_PASS) {
    return next();
  }
  return res.status(401).json({ success: false, message: 'Unauthorized' });
}

/* ─── Public API Endpoint (Site Data) ─── */

app.get('/api/content', async (req, res) => {
  try {
    const locations = await Location.find();
    const machines = await Machine.find();
    const products = await Product.find();
    const faqs = await Faq.find();
    const partners = await Partner.find();
    let settings = await Settings.findOne();
    let stats = await Stats.findOne();

    res.json({
      locations,
      machines,
      products,
      faqs,
      partners,
      settings: settings || {},
      stats: stats || {}
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─── Admin API Routes ─── */

// Submissions
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

app.get('/api/admin/export', checkAdminAuth, async (req, res) => {
  const subs = await Submission.find().sort({ submittedAt: -1 });
  let csv = 'Date,Name,Email,Phone,Interest,Message,Status\n';
  subs.forEach(s => {
    csv += `"${s.submittedAt.toISOString()}","${s.fullName || ''}","${s.email || ''}","${s.phone || ''}","${s.interest || ''}","${(s.message || '').replace(/"/g, '""')}","${s.status}"\n`;
  });
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=submissions.csv');
  res.send(csv);
});

// Locations
app.post('/api/admin/locations', checkAdminAuth, upload.single('image'), async (req, res) => {
  try {
    let imageUrl = req.body.imageUrl || '';
    if (req.file) {
      imageUrl = '/uploads/' + req.file.filename;
    }
    const loc = new Location({ ...req.body, image: imageUrl });
    await loc.save();
    res.json(loc);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/admin/locations/:id', checkAdminAuth, async (req, res) => {
  await Location.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.put('/api/admin/locations/:id/feature', checkAdminAuth, async (req, res) => {
  await Location.updateMany({}, { featured: false });
  const loc = await Location.findByIdAndUpdate(req.params.id, { featured: true }, { new: true });
  res.json(loc);
});

// Machines
app.post('/api/admin/machines', checkAdminAuth, upload.single('image'), async (req, res) => {
  try {
    let imageUrl = req.file ? '/uploads/' + req.file.filename : 'machine.jfif';
    let specs = [];
    if (req.body.specs) {
      specs = typeof req.body.specs === 'string' ? JSON.parse(req.body.specs) : req.body.specs;
    }
    const mach = new Machine({ ...req.body, image: imageUrl, specs });
    await mach.save();
    res.json(mach);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/admin/machines/:id', checkAdminAuth, async (req, res) => {
  await Machine.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Products
app.post('/api/admin/products', checkAdminAuth, upload.single('image'), async (req, res) => {
  try {
    let imageUrl = req.body.imageUrl || '';
    if (req.file) {
      imageUrl = '/uploads/' + req.file.filename;
    }
    const items = req.body.items ? req.body.items.split(',').map(i => i.trim()) : [];
    const prod = new Product({ ...req.body, items, image: imageUrl });
    await prod.save();
    res.json(prod);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/admin/products/:id', checkAdminAuth, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// FAQs
app.post('/api/admin/faqs', checkAdminAuth, async (req, res) => {
  const faq = new Faq(req.body);
  await faq.save();
  res.json(faq);
});

app.delete('/api/admin/faqs/:id', checkAdminAuth, async (req, res) => {
  await Faq.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Partners
app.post('/api/admin/partners', checkAdminAuth, async (req, res) => {
  const partner = new Partner(req.body);
  await partner.save();
  res.json(partner);
});

app.delete('/api/admin/partners/:id', checkAdminAuth, async (req, res) => {
  await Partner.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Stats
app.put('/api/admin/stats', checkAdminAuth, async (req, res) => {
  let stats = await Stats.findOne();
  if (stats) {
    Object.assign(stats, req.body);
    await stats.save();
  } else {
    stats = new Stats(req.body);
    await stats.save();
  }
  res.json(stats);
});

// Settings
app.put('/api/admin/settings', checkAdminAuth, async (req, res) => {
  let settings = await Settings.findOne();
  if (settings) {
    Object.assign(settings, req.body);
    await settings.save();
  } else {
    settings = new Settings(req.body);
    await settings.save();
  }
  res.json(settings);
});

// Image Uploads Library
app.get('/api/admin/uploads', checkAdminAuth, (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json([]);
    const fileList = files.map(filename => ({
      name: filename,
      url: 'uploads/' + filename
    }));
    res.json(fileList);
  });
});

app.post('/api/admin/upload', checkAdminAuth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  res.json({ success: true, url: 'uploads/' + req.file.filename });
});

app.delete('/api/admin/uploads/:filename', checkAdminAuth, (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  res.json({ success: true });
});

// Public Form Submission Endpoint (for frontend users)
app.post('/api/submissions', async (req, res) => {
  try {
    const sub = new Submission(req.body);
    await sub.save();
    res.json({ success: true, id: sub._id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => console.log(`WYT Admin Server running on port ${PORT}`));