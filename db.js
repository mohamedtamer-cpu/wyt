const mongoose = require('mongoose');
const seed = require('./data/content.json');
let connection;
async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not configured.');
  if (!connection) connection = mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 }).finally(() => { connection = null; });
  await connection;
}
const collections = ['machines', 'locations', 'products', 'faqs', 'partners'];
const schema = new mongoose.Schema({ settings: Object, stats: Object, locations: Array, machines: Array, products: Array, faqs: Array, partners: Array });
const Content = mongoose.models.Content || mongoose.model('Content', schema);
const Submission = mongoose.models.Submission || mongoose.model('Submission', new mongoose.Schema({
  firstName: String, lastName: String, fullName: String, email: String, phone: String,
  interest: String, message: String, lang: String, ip: String,
  status: { type: String, default: 'Pending' },
  submittedEG: { type: String, default: () => new Date().toLocaleString('en-EG', { timeZone: 'Africa/Cairo' }) }
}, { timestamps: true }));
async function getContentDoc() {
  await connectDB();
  let doc = await Content.findOne();
  if (!doc) {
    // A fixed ID prevents concurrent first requests from creating duplicate documents.
    doc = await Content.findOneAndUpdate({ _id: '000000000000000000000001' }, { $setOnInsert: seed }, { upsert: true, returnDocument: 'after' });
  }
  return doc;
}
function bad(message) { const error = new Error(message); error.status = 400; throw error; }
function validateItem(collection, data) {
  if (!collections.includes(collection) || !data || typeof data !== 'object' || Array.isArray(data)) bad('Invalid content.');
  const item = {};
  for (const key of ['name', 'nameAr', 'badge', 'badgeAr', 'desc', 'descAr', 'image', 'type', 'typeAr', 'machine', 'area', 'areaAr', 'q', 'qAr', 'a', 'aAr', 'initials', 'bg', 'color']) {
    if (data[key] !== undefined) {
      if (typeof data[key] !== 'string') bad(`${key} must be text.`);
      item[key] = data[key].trim();
      if (item[key].length > (key === 'image' ? 2800000 : 10000)) bad(`${key} is too long.`);
    }
  }
  if (collection === 'faqs' ? (!item.q || !item.a) : !item.name) bad(collection === 'faqs' ? 'Question and answer are required.' : 'Name is required.');
  if (item.image && !/^(\/[^/]|https?:\/\/|data:image\/(png|jpeg|webp|gif);base64,)/i.test(item.image)) bad('Choose a PNG, JPEG, WebP, GIF, or an HTTP image URL.');
  if (data.specs !== undefined) {
    if (!Array.isArray(data.specs) || data.specs.length > 50) bad('Invalid specifications.');
    item.specs = data.specs.map(sp => {
      if (!sp || typeof sp !== 'object') bad('Invalid specification.');
      const l = sp.l ?? sp.label, v = sp.v ?? sp.val;
      if (typeof l !== 'string' || typeof v !== 'string' || !l.trim() || !v.trim() || l.length > 500 || v.length > 500) bad('Each specification needs a label and value.');
      return { l: l.trim(), v: v.trim() };
    });
  }
  if (data.items !== undefined) {
    if (!Array.isArray(data.items) || data.items.length > 100 || data.items.some(v => typeof v !== 'string' || v.length > 200)) bad('Invalid product items.');
    item.items = data.items.map(v => v.trim()).filter(Boolean);
  }
  if (data.featured !== undefined) item.featured = data.featured === true;
  return item;
}
module.exports = {
  validateItem,
  getContent: async () => {
    const doc = (await getContentDoc()).toObject();
    // Do not delete or hide legacy entries merely because they lack a name or ID.
    for (const key of collections) doc[key] = (doc[key] || []).filter(item => item && typeof item === 'object' && !Array.isArray(item));
    return doc;
  },
  addItem: async (collection, data) => {
    const item = { ...validateItem(collection, data), _id: new mongoose.Types.ObjectId().toString() };
    const doc = await getContentDoc();
    await Content.updateOne({ _id: doc._id }, { $push: { [collection]: item } });
    return item;
  },
  deleteItem: async (collection, id) => {
    if (!collections.includes(collection)) bad('Invalid collection.');
    const doc = await getContentDoc();
    const existing = (doc[collection] || []).find(item => item && String(item._id) === id);
    if (!existing) { const error = new Error('Item not found.'); error.status = 404; throw error; }
    await Content.updateOne({ _id: doc._id }, { $pull: { [collection]: { _id: existing._id } } });
  },
  updateSection: async (section, data) => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) bad('Invalid settings.');
    const updates = {};
    if (section === 'settings') {
      for (const key of ['whatsapp', 'email', 'phone', 'address', 'addressAr', 'hours', 'hoursAr']) {
        if (data[key] === undefined) continue;
        if (typeof data[key] !== 'string' || data[key].length > 500) bad(`Invalid ${key}.`);
        updates[`${section}.${key}`] = data[key].trim();
      }
    } else if (section === 'stats') {
      for (const key of ['machines', 'locations', 'uptime']) {
        if (!data[key]) continue;
        const stat = data[key];
        if (!Number.isFinite(stat.value) || stat.value < 0) bad('Counter values must be non-negative numbers.');
        for (const field of ['suffix', 'label', 'labelAr']) if (typeof stat[field] !== 'string' || stat[field].length > 200) bad(`Invalid ${field}.`);
        updates[`${section}.${key}`] = { value: stat.value, suffix: stat.suffix, label: stat.label, labelAr: stat.labelAr };
      }
    } else bad('Invalid section.');
    const doc = await getContentDoc();
    if (!Object.keys(updates).length) bad('No settings supplied.');
    const updated = await Content.findByIdAndUpdate(doc._id, { $set: updates }, { returnDocument: 'after' });
    return updated[section];
  },
  getSubmissions: async () => { await connectDB(); return Submission.find().sort({ _id: -1 }).lean(); },
  addSubmission: async data => { await connectDB(); return Submission.create(data); }
};
