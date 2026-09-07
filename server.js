require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASS = process.env.ADMIN_PASSWORD || process.env.ADMIN_PASS || 'Wyt11223344$$';

// Multer memory storage configuration (Vercel & serverless friendly)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 } // 8MB limit
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static assets from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection Middleware
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

const Upload = mongoose.models.Upload || mongoose.model('Upload', new mongoose.Schema({
  url: String, filename: String, createdAt: { type: Date, default: Date.now }
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

/* ─── Public API Endpoints ─── */
app.get('/api/events', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

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

app.post(['/api/submissions', '/api/contact'], async (req, res) => {
  try {
    const submission = new Submission(req.body);
    await submission.save();
    res.json({ success: true, submission });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ─── Admin Image Upload Endpoints ─── */
const handleUpload = async (req, res) => {
  try {
    const file = req.file || (req.files && req.files[0]);
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    const filename = `${Date.now()}-${file.originalname || 'image.png'}`;
    const record = new Upload({ url: base64Image, filename });
    await record.save();
    res.json({ success: true, url: base64Image, filename, _id: record._id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

function normalizeAdminContent(req) {
  const body = { ...(req.body || {}) };
  const file = (req.files || []).find(item => item.fieldname === 'image');

  if (file) {
    body.image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  } else if (body.imageUrl) {
    body.image = body.imageUrl;
  }
  delete body.imageUrl;

  if (typeof body.specs === 'string') {
    try {
      body.specs = JSON.parse(body.specs);
    } catch {
      body.specs = [];
    }
  }
  if (typeof body.items === 'string') {
    body.items = body.items.split(',').map(item => item.trim()).filter(Boolean);
  }

  return body;
}

app.post('/api/admin/uploads', checkAdminAuth, upload.any(), handleUpload);
app.post('/api/admin/upload', checkAdminAuth, upload.any(), handleUpload);

app.get('/api/admin/uploads', checkAdminAuth, async (req, res) => {
  try {
    const uploads = await Upload.find().sort({ createdAt: -1 });
    res.json(uploads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/uploads/:id', checkAdminAuth, async (req, res) => {
  try {
    const query = mongoose.Types.ObjectId.isValid(req.params.id) 
      ? { _id: req.params.id } 
      : { filename: req.params.id };
    await Upload.deleteOne(query);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─── Admin Submissions & Export Endpoints ─── */
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

app.get('/api/admin/export', checkAdminAuth, async (req, res) => {
  try {
    const subs = await Submission.find().sort({ submittedAt: -1 });
    let csv = 'Date,Full Name,Email,Phone,Interest,Message,Status\n';
    subs.forEach(s => {
      const date = s.submittedAt ? new Date(s.submittedAt).toISOString() : '';
      csv += `"${date}","${s.fullName || ''}","${s.email || ''}","${s.phone || ''}","${s.interest || ''}","${(s.message || '').replace(/"/g, '""')}","${s.status || ''}"\n`;
    });
    res.header('Content-Type', 'text/csv');
    res.attachment('submissions.csv');
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─── Admin Locations Endpoints ─── */
app.get('/api/admin/locations', checkAdminAuth, async (req, res) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/locations', checkAdminAuth, upload.any(), async (req, res) => {
  try {
    const loc = new Location(normalizeAdminContent(req));
    await loc.save();
    res.json(loc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/locations/:id/feature', checkAdminAuth, async (req, res) => {
  try {
    const loc = await Location.findById(req.params.id);
    if (!loc) return res.status(404).json({ error: 'Location not found' });
    loc.featured = !loc.featured;
    await loc.save();
    res.json(loc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/locations/:id', checkAdminAuth, async (req, res) => {
  try {
    const updated = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
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

/* ─── Admin Machines Endpoints ─── */
app.get('/api/admin/machines', checkAdminAuth, async (req, res) => {
  try {
    const machines = await Machine.find();
    res.json(machines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/machines', checkAdminAuth, upload.any(), async (req, res) => {
  try {
    const mach = new Machine(normalizeAdminContent(req));
    await mach.save();
    res.json(mach);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/machines/:id', checkAdminAuth, async (req, res) => {
  try {
    const updated = await Machine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
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

/* ─── Admin Products Endpoints ─── */
app.get('/api/admin/products', checkAdminAuth, async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/products', checkAdminAuth, upload.any(), async (req, res) => {
  try {
    const prod = new Product(normalizeAdminContent(req));
    await prod.save();
    res.json(prod);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/products/:id', checkAdminAuth, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
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

/* ─── Admin FAQs Endpoints ─── */
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

app.put('/api/admin/faqs/:id', checkAdminAuth, async (req, res) => {
  try {
    const updated = await Faq.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
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

/* ─── Admin Partners Endpoints ─── */
app.get('/api/admin/partners', checkAdminAuth, async (req, res) => {
  try {
    const partners = await Partner.find();
    res.json(partners);
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

app.put('/api/admin/partners/:id', checkAdminAuth, async (req, res) => {
  try {
    const updated = await Partner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
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

/* ─── Admin Stats & Settings Endpoints ─── */
app.get('/api/admin/stats', checkAdminAuth, async (req, res) => {
  try {
    const stats = await Stats.findOne() || {};
    res.json(stats);
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

app.get('/api/admin/settings', checkAdminAuth, async (req, res) => {
  try {
    const settings = await Settings.findOne() || {};
    res.json(settings);
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

/* ─── Server Initialization ─── */
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;