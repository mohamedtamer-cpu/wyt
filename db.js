const mongoose = require('mongoose');

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGODB_URI);
};

const ContentSchema = new mongoose.Schema({
  settings: { type: Object, default: {} },
  stats: { type: Object, default: {} },
  locations: { type: Array, default: [] },
  machines: { type: Array, default: [] },
  products: { type: Array, default: [] },
  faqs: { type: Array, default: [] },
  partners: { type: Array, default: [] }
});

const SubmissionSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  fullName: String,
  email: String,
  phone: String,
  interest: String,
  message: String,
  lang: String,
  ip: String,
  status: { type: String, default: 'Pending' },
  submittedEG: { type: String, default: () => new Date().toLocaleString('en-EG', { timeZone: 'Africa/Cairo' }) }
});

const ContentModel = mongoose.models.Content || mongoose.model('Content', ContentSchema);
const SubmissionModel = mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);

async function getContentDoc() {
  await connectDB();
  let doc = await ContentModel.findOne();
  if (!doc) {
    doc = await ContentModel.create({
      settings: {}, stats: {}, locations: [], machines: [], products: [], faqs: [], partners: []
    });
  }
  return doc;
}

function isValidItem(item) {
  if (!item || typeof item !== 'object') return false;
  return Boolean(item.name || item.title || item.image || (item.specs && item.specs.length > 0));
}

function sanitizeArray(arr) {
  return (arr || []).filter(item => item && item._id && isValidItem(item));
}

module.exports = {
  getContent: async () => {
    const doc = await getContentDoc();
    // Clean up empty/corrupt entries dynamically on fetch
    doc.machines = sanitizeArray(doc.machines);
    doc.locations = sanitizeArray(doc.locations);
    doc.products = sanitizeArray(doc.products);
    doc.faqs = sanitizeArray(doc.faqs);
    doc.partners = sanitizeArray(doc.partners);
    return doc.toObject();
  },

  getSubmissions: async () => {
    await connectDB();
    return await SubmissionModel.find().lean();
  },

  addSubmission: async (data) => {
    await connectDB();
    return await SubmissionModel.create(data);
  },

  updateSubmissionStatus: async (id, status) => {
    await connectDB();
    return await SubmissionModel.findByIdAndUpdate(id, { status }, { new: true });
  },

  deleteSubmission: async (id) => {
    await connectDB();
    return await SubmissionModel.findByIdAndDelete(id);
  },

  updateSettings: async (settings) => {
    const doc = await getContentDoc();
    doc.settings = Object.assign({}, doc.settings, settings);
    doc.markModified('settings');
    await doc.save();
    return doc.settings;
  },

  updateStats: async (stats) => {
    const doc = await getContentDoc();
    doc.stats = Object.assign({}, doc.stats, stats);
    doc.markModified('stats');
    await doc.save();
    return doc.stats;
  },

  addMachine: async (data) => {
    if (!isValidItem(data)) {
      throw new Error("Cannot save empty machine details.");
    }
    const doc = await getContentDoc();
    const item = Object.assign({ _id: new mongoose.Types.ObjectId().toString() }, data);
    doc.machines = sanitizeArray(doc.machines);
    doc.machines.push(item);
    doc.markModified('machines');
    await doc.save();
    return item;
  },

  deleteMachine: async (id) => {
    const doc = await getContentDoc();
    doc.machines = (doc.machines || []).filter(
      (m) => m && m._id && String(m._id) !== String(id) && isValidItem(m)
    );
    doc.markModified('machines');
    await doc.save();
    return true;
  },

  addLocation: async (data) => {
    const doc = await getContentDoc();
    const item = Object.assign({ _id: new mongoose.Types.ObjectId().toString() }, data);
    doc.locations.push(item);
    doc.markModified('locations');
    await doc.save();
    return item;
  },

  deleteLocation: async (id) => {
    const doc = await getContentDoc();
    doc.locations = (doc.locations || []).filter(l => l && l._id && String(l._id) !== String(id));
    doc.markModified('locations');
    await doc.save();
    return true;
  },

  addProduct: async (data) => {
    const doc = await getContentDoc();
    const item = Object.assign({ _id: new mongoose.Types.ObjectId().toString() }, data);
    doc.products.push(item);
    doc.markModified('products');
    await doc.save();
    return item;
  },

  deleteProduct: async (id) => {
    const doc = await getContentDoc();
    doc.products = (doc.products || []).filter(p => p && p._id && String(p._id) !== String(id));
    doc.markModified('products');
    await doc.save();
    return true;
  },

  clearAllCorrupt: async () => {
    const doc = await getContentDoc();
    doc.machines = sanitizeArray(doc.machines);
    doc.locations = sanitizeArray(doc.locations);
    doc.products = sanitizeArray(doc.products);
    doc.faqs = sanitizeArray(doc.faqs);
    doc.partners = sanitizeArray(doc.partners);
    doc.markModified('machines');
    doc.markModified('locations');
    doc.markModified('products');
    doc.markModified('faqs');
    doc.markModified('partners');
    await doc.save();
    return doc.toObject();
  }
};