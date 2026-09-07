require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASS = process.env.ADMIN_PASSWORD || process.env.ADMIN_PASS || 'Wyt11223344$$';

app.use(cors());
// 50mb payload limit to handle multi-image Base64 uploads cleanly
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

/* Schemas */
const Schema = mongoose.Schema;
const flexOpt = { strict: false, timestamps: true };

const Location = mongoose.models.Location || mongoose.model('Location', new Schema({}, flexOpt));
const Machine = mongoose.models.Machine || mongoose.model('Machine', new Schema({}, flexOpt));
const Product = mongoose.models.Product || mongoose.model('Product', new Schema({}, flexOpt));
const Faq = mongoose.models.Faq || mongoose.model('Faq', new Schema({}, flexOpt));
const Partner = mongoose.models.Partner || mongoose.model('Partner', new Schema({}, flexOpt));
const Settings = mongoose.models.Settings || mongoose.model('Settings', new Schema({}, flexOpt));
const Stats = mongoose.models.Stats || mongoose.model('Stats', new Schema({}, flexOpt));
const Submission = mongoose.models.Submission || mongoose.model('Submission', new Schema({}, flexOpt));

/* Auth Middleware */
function checkAdminAuth(req, res, next) {
  const pass = req.headers['x-admin-pass'] || req.query.pass || req.body.pass;
  if (!ADMIN_PASS || pass === ADMIN_PASS || decodeURIComponent(pass || '') === ADMIN_PASS) {
    return next();
  }
  return res.status(401).json({ success: false, message: 'Unauthorized access' });
}

/* Page Routes */
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

/* Public API */
app.get('/api/content', async (req, res) => {
  try {
    const [locations, machines, products, faqs, partners, settings, stats] = await Promise.all([
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
      settings: settings || {},
      stats: stats || {}
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Generic API Factory */
function buildCrud(route, Model) {
  app.get(`/api/admin/${route}`, checkAdminAuth, async (req, res) => {
    try { res.json(await Model.find().lean()); } 
    catch (e) { res.status(500).json({ error: e.message }); }
  });

  app.post(`/api/admin/${route}`, checkAdminAuth, async (req, res) => {
    try {
      const item = new Model(req.body);
      await item.save();
      res.json(item);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  app.put(`/api/admin/${route}/:id`, checkAdminAuth, async (req, res) => {
    try {
      const updated = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updated);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  app.delete(`/api/admin/${route}/:id`, checkAdminAuth, async (req, res) => {
    try {
      await Model.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });
}

buildCrud('machines', Machine);
buildCrud('locations', Location);
buildCrud('products', Product);
buildCrud('faqs', Faq);
buildCrud('partners', Partner);

/* Submissions / Export */
app.get('/api/admin/submissions', checkAdminAuth, async (req, res) => {
  try { res.json(await Submission.find().sort({ createdAt: -1 }).lean()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server on port ${PORT}`));
}

module.exports = app;