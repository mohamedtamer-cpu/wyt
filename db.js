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
    const doc = await getContentDoc();
    const item = Object.assign({ _id: new mongoose.Types.ObjectId().toString() }, data);
    doc.locations.push(item);
    doc.markModified('locations');
    await doc.save();
    return item;
  },

  deleteLocation: async (id) => {
    const doc = await getContentDoc();
    doc.locations = doc.locations.filter(l => l._id !== id);
    doc.markModified('locations');
    await doc.save();
    return true;
  },

  setFeatured: async (id) => {
    const doc = await getContentDoc();
    doc.locations.forEach(l => l.featured = (l._id === id));
    doc.markModified('locations');
    await doc.save();
    return true;
  },

  addMachine: async (data) => {
    const doc = await getContentDoc();
    const item = Object.assign({ _id: new mongoose.Types.ObjectId().toString() }, data);
    doc.machines.push(item);
    doc.markModified('machines');
    await doc.save();
    return item;
  },

  deleteMachine: async (id) => {
    const doc = await getContentDoc();
    doc.machines = doc.machines.filter(m => m._id !== id);
    doc.markModified('machines');
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
    doc.products = doc.products.filter(p => p._id !== id);
    doc.markModified('products');
    await doc.save();
    return true;
  },

  addFaq: async (data) => {
    const doc = await getContentDoc();
    const item = Object.assign({ _id: new mongoose.Types.ObjectId().toString() }, data);
    doc.faqs.push(item);
    doc.markModified('faqs');
    await doc.save();
    return item;
  },

  deleteFaq: async (id) => {
    const doc = await getContentDoc();
    doc.faqs = doc.faqs.filter(f => f._id !== id);
    doc.markModified('faqs');
    await doc.save();
    return true;
  },

  addPartner: async (data) => {
    const doc = await getContentDoc();
    const item = Object.assign({ _id: new mongoose.Types.ObjectId().toString() }, data);
    doc.partners.push(item);
    doc.markModified('partners');
    await doc.save();
    return item;
  },

  deletePartner: async (id) => {
    const doc = await getContentDoc();
    doc.partners = doc.partners.filter(p => p._id !== id);
    doc.markModified('partners');
    await doc.save();
    return true;
  }
};