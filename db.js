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

/* Helper to prevent empty object insertions */
function validateData(data, entityName) {
  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    throw new Error(`${entityName} payload cannot be empty`);
  }
}

/* Safe array filter comparing string representation of IDs */
function filterById(array, id) {
  return (array || []).filter(item => item && item._id && String(item._id) !== String(id));
}

module.exports = {
  getContent: async () => {
    const doc = await getContentDoc();
    return doc.toObject();
  },

  getSubmissions: async () => {
    await connectDB();
    return await SubmissionModel.find().lean();
  },

  addSubmission: async (data) => {
    await connectDB();
    validateData(data, 'Submission');
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

  addLocation: async (data) => {
    validateData(data, 'Location');
    const doc = await getContentDoc();
    const item = Object.assign({ _id: new mongoose.Types.ObjectId().toString() }, data);
    doc.locations.push(item);
    doc.markModified('locations');
    await doc.save();
    return item;
  },

  deleteLocation: async (id) => {
    const doc = await getContentDoc();
    doc.locations = filterById(doc.locations, id);
    doc.markModified('locations');
    await doc.save();
    return true;
  },

  setFeatured: async (id) => {
    const doc = await getContentDoc();
    doc.locations.forEach(l => {
      if (l && l._id) {
        l.featured = (String(l._id) === String(id));
      }
    });
    doc.markModified('locations');
    await doc.save();
    return true;
  },

  addMachine: async (data) => {
    validateData(data, 'Machine');
    const doc = await getContentDoc();
    const item = Object.assign({ _id: new mongoose.Types.ObjectId().toString() }, data);
    doc.machines.push(item);
    doc.markModified('machines');
    await doc.save();
    return item;
  },

  deleteMachine: async (id) => {
    const doc = await getContentDoc();
    doc.machines = filterById(doc.machines, id);
    doc.markModified('machines');
    await doc.save();
    return true;
  },

  addProduct: async (data) => {
    validateData(data, 'Product');
    const doc = await getContentDoc();
    const item = Object.assign({ _id: new mongoose.Types.ObjectId().toString() }, data);
    doc.products.push(item);
    doc.markModified('products');
    await doc.save();
    return item;
  },

  deleteProduct: async (id) => {
    const doc = await getContentDoc();
    doc.products = filterById(doc.products, id);
    doc.markModified('products');
    await doc.save();
    return true;
  },

  addFaq: async (data) => {
    validateData(data, 'FAQ');
    const doc = await getContentDoc();
    const item = Object.assign({ _id: new mongoose.Types.ObjectId().toString() }, data);
    doc.faqs.push(item);
    doc.markModified('faqs');
    await doc.save();
    return item;
  },

  deleteFaq: async (id) => {
    const doc = await getContentDoc();
    doc.faqs = filterById(doc.faqs, id);
    doc.markModified('faqs');
    await doc.save();
    return true;
  },

  addPartner: async (data) => {
    validateData(data, 'Partner');
    const doc = await getContentDoc();
    const item = Object.assign({ _id: new mongoose.Types.ObjectId().toString() }, data);
    doc.partners.push(item);
    doc.markModified('partners');
    await doc.save();
    return item;
  },

  deletePartner: async (id) => {
    const doc = await getContentDoc();
    doc.partners = filterById(doc.partners, id);
    doc.markModified('partners');
    await doc.save();
    return true;
  },

  /* One-time cleanup helper to automatically purge corrupt/empty documents across all sections */
  clearCorruptItems: async () => {
    const doc = await getContentDoc();

    doc.machines = (doc.machines || []).filter(m => m && m._id && (m.name || m.nameAr || (m.specs && m.specs.length > 0)));
    doc.locations = (doc.locations || []).filter(l => l && l._id && (l.name || l.nameAr));
    doc.products = (doc.products || []).filter(p => p && p._id && (p.name || p.nameAr));
    doc.faqs = (doc.faqs || []).filter(f => f && f._id && (f.q || f.qAr));
    doc.partners = (doc.partners || []).filter(p => p && p._id && (p.name || p.nameAr));

    doc.markModified('machines');
    doc.markModified('locations');
    doc.markModified('products');
    doc.markModified('faqs');
    doc.markModified('partners');

    await doc.save();
    return doc.toObject();
  }
};