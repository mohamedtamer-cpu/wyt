require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASS = process.env.ADMIN_PASSWORD || process.env.ADMIN_PASS || 'Wyt11223344$$';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

app.use(express.static(path.join(__dirname, 'public')));

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

/* ─── Flexible Schemas ─── */
const Schema = mongoose.Schema;
const strictFalse = { strict: false, timestamps: true };

const Submission = mongoose.models.Submission || mongoose.model('Submission', new Schema({}, strictFalse));
const Location = mongoose.models.Location || mongoose.model('Location', new Schema({}, strictFalse));
const Machine = mongoose.models.Machine || mongoose.model('Machine', new Schema({}, strictFalse));
const Product = mongoose.models.Product || mongoose.model('Product', new Schema({}, strictFalse));
const Faq = mongoose.models.Faq || mongoose.model('Faq', new Schema({}, strictFalse));
const Partner = mongoose.models.Partner || mongoose.model('Partner', new Schema({}, strictFalse));
const Settings = mongoose.models.Settings || mongoose.model('Settings', new Schema({}, strictFalse));
const Stats = mongoose.models.Stats || mongoose.model('Stats', new Schema({}, strictFalse));
const Upload = mongoose.models.Upload || mongoose.model('Upload', new Schema({}, strictFalse));

/* ─── Auth Middleware ─── */
function checkAdminAuth(req, res, next) {
  const pass = req.headers['x-admin-pass'] || req.query.pass || req.body.pass;
  if (!ADMIN_PASS || pass === ADMIN_PASS || decodeURIComponent(pass || '') === ADMIN_PASS) {
    return next();
  }
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
app.get('/api/events', (req, res) => res.status(200).json({ status: 'ok' }));

app.get('/api/content', async (req, res) => {
  try {
    const [locations, machines, products, faqs, partners, settingsDoc, statsDoc] = await Promise.all([
      Location.find().lean(),
      Machine.find().lean(),
      Product.find().lean(),
      Faq.find().lean(),
      Partner.find().lean(),
      Settings.findOne().lean(),
      Stats.findOne().lean()
    ]);
    res.json({
      locations: locations || [],
      machines: machines || [],
      products: products || [],
      faqs: faqs || [],
      partners: partners || [],
      settings: settingsDoc || {},
      stats: statsDoc || {}
    });
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

/* ─── Upload Endpoints ─── */
const handleUpload = async (req, res) => {
  try {
    const file = req.file || (req.files && req.files[0]);
    if (!file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    const filename = `${Date.now()}-${file.originalname || 'image.png'}`;
    const record = new Upload({ url: base64Image, filename });
    await record.save();
    res.json({ success: true, url: base64Image, filename, _id: record._id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

app.post('/api/admin/uploads', checkAdminAuth, upload.any(), handleUpload);
app.post('/api/admin/upload', checkAdminAuth, upload.any(), handleUpload);

app.get('/api/admin/uploads', checkAdminAuth, async (req, res) => {
  try {
    const uploads = await Upload.find().sort({ createdAt: -1 }).lean();
    res.json(uploads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/uploads/:id', checkAdminAuth, async (req, res) => {
  try {
    const query = mongoose.Types.ObjectId.isValid(req.params.id) ? { _id: req.params.id } : { filename: req.params.id };
    await Upload.deleteOne(query);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─── Generic CRUD Builder ─── */
function registerCrudRoutes(singular, PluralModel) {
  app.get(`/api/admin/${singular}s`, checkAdminAuth, async (req, res) => {
    try {
      const items = await PluralModel.find().lean();
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post(`/api/admin/${singular}s`, checkAdminAuth, async (req, res) => {
    try {
      const item = new PluralModel(req.body);
      await item.save();
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put(`/api/admin/${singular}s/:id`, checkAdminAuth, async (req, res) => {
    try {
      const updated = await PluralModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete(`/api/admin/${singular}s/:id`, checkAdminAuth, async (req, res) => {
    try {
      await PluralModel.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

registerCrudRoutes('location', Location);
registerCrudRoutes('machine', Machine);
registerCrudRoutes('product', Product);
registerCrudRoutes('faq', Faq);
registerCrudRoutes('partner', Partner);

/* ─── Location Special Routes ─── */
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

/* ─── Submissions & Export ─── */
app.get('/api/admin/submissions', checkAdminAuth, async (req, res) => {
  try {
    const subs = await Submission.find().sort({ createdAt: -1 }).lean();
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
    const subs = await Submission.find().sort({ createdAt: -1 }).lean();
    let csv = 'Date,Full Name,Email,Phone,Interest,Message,Status\n';
    subs.forEach(s => {
      const date = s.submittedAt || s.createdAt ? new Date(s.submittedAt || s.createdAt).toISOString() : '';
      csv += `"${date}","${s.fullName || ''}","${s.email || ''}","${s.phone || ''}","${s.interest || ''}","${(s.message || '').replace(/"/g, '""')}","${s.status || ''}"\n`;
    });
    res.header('Content-Type', 'text/csv');
    res.attachment('submissions.csv');
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─── Settings & Stats ─── */
app.get('/api/admin/stats', checkAdminAuth, async (req, res) => {
  try {
    const stats = await Stats.findOne().lean() || {};
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
    const settings = await Settings.findOne().lean() || {};
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

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;