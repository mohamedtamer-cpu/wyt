const fs   = require('fs');
const path = require('path');

/* ════════════════════════════════════════
   WYT — DB.JS
   Works with LOCAL JSON (no setup needed)
   AND with MongoDB Atlas (when MONGODB_URI is set)
════════════════════════════════════════ */

const DATA_DIR = path.join(__dirname, 'data');
const FILE     = path.join(DATA_DIR, 'content.json');
const SUBS     = path.join(DATA_DIR, 'submissions.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

/* ── DEFAULTS ── */
const DEFAULTS = {
  settings: { whatsapp:'201009999632', email:'mohamedtamer668er@gmail.com', phone:'+20 1009999632', address:'Cairo, Egypt', addressAr:'القاهرة، مصر', hours:'Sun–Thu, 9AM – 5PM', hoursAr:'الأحد–الخميس، 9ص – 5م' },
  stats: {
    machines:  { value:500, suffix:'+', label:'Machines Deployed',  labelAr:'ماكينة منتشرة' },
    locations: { value:120, suffix:'+', label:'Partner Locations',   labelAr:'موقع شريك' },
    uptime:    { value:98,  suffix:'%', label:'Uptime',              labelAr:'وقت تشغيل' }
  },
  locations: [
    { _id:'loc1', name:'Orascom HQ, Cairo',       nameAr:'مقر أوراسكوم، القاهرة',              type:'Corporate Office', typeAr:'مكتب شركة', machine:'WYT Pro 500',   area:'Main lobby',     areaAr:'الردهة الرئيسية', image:'https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=85', featured:true  },
    { _id:'loc2', name:'GymNation, Maadi',         nameAr:'GymNation، المعادي',                  type:'Gym',              typeAr:'جيم',        machine:'WYT Pro 500',   area:'Reception',      areaAr:'الاستقبال',       image:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=85', featured:false },
    { _id:'loc3', name:'Maadi Medical Centre',     nameAr:'ماعدي ميديكال',                       type:'Hospital',         typeAr:'مستشفى',     machine:'WYT Fresh',     area:'Staff corridor', areaAr:'ممر الموظفين',    image:'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&q=85', featured:false },
    { _id:'loc4', name:'AUC Campus, New Cairo',   nameAr:'الجامعة الأمريكية، القاهرة الجديدة',  type:'University',       typeAr:'جامعة',      machine:'WYT Compact',   area:'Student hub',    areaAr:'مركز الطلاب',     image:'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&q=85', featured:false },
    { _id:'loc5', name:'Hilton Cairo, Zamalek',   nameAr:'هيلتون القاهرة، الزمالك',             type:'Hotel',            typeAr:'فندق',       machine:'WYT Brew',      area:'Guest floor',    areaAr:'طابق الضيوف',     image:'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=85', featured:false },
    { _id:'loc6', name:'Elsewedy Electric, Oct',  nameAr:'السويدي إليكتريك، أكتوبر',            type:'Factory',          typeAr:'مصنع',       machine:'WYT Pro 500',   area:'Break room',     areaAr:'غرفة الاستراحة',  image:'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=85', featured:false }
  ],
  machines: [
    { _id:'mach1', name:'WYT Pro 500',      nameAr:'WYT Pro 500',      badge:'Best Seller', badgeAr:'الأكثر مبيعاً', desc:'Flagship full-size combo — snacks & chilled drinks.',  descAr:'ماكينة كاملة للوجبات والمشروبات المبردة.',   image:'machine.jfif', specs:[{l:'Dimensions',v:'180×90×80 cm'},{l:'Capacity',v:'60 slots'},{l:'Display',v:'15" HD Touchscreen'},{l:'Payments',v:'Card, NFC, Apple/Google Pay'},{l:'Connectivity',v:'4G + WiFi'}] },
    { _id:'mach2', name:'WYT Brew Station', nameAr:'WYT Brew Station', badge:'New',         badgeAr:'جديد',          desc:'Bean-to-cup coffee & hot drinks.',                     descAr:'قهوة طازجة ومشروبات ساخنة.',                 image:'machine.jfif', specs:[{l:'Drinks',v:'8 varieties'},{l:'Display',v:'10" Touchscreen'},{l:'Payments',v:'Cashless & contactless'},{l:'Cleaning',v:'Auto-clean cycle'}] },
    { _id:'mach3', name:'WYT Fresh',        nameAr:'WYT Fresh',        badge:'',            badgeAr:'',              desc:'Refrigerated meals, salads & fresh produce.',          descAr:'وجبات مبردة وسلطات ومنتجات طازجة.',          image:'machine.jfif', specs:[{l:'Capacity',v:'40 slots'},{l:'Temperature',v:'2°C – 8°C'},{l:'Display',v:'15" HD Touchscreen'},{l:'Special',v:'Auto expiry alerts'}] },
    { _id:'mach4', name:'WYT Compact',      nameAr:'WYT Compact',      badge:'',            badgeAr:'',              desc:'Slim snack machine for smaller venues.',               descAr:'ماكينة نحيلة للأماكن الصغيرة.',              image:'machine.jfif', specs:[{l:'Capacity',v:'32 slots'},{l:'Display',v:'7" Digital screen'},{l:'Payments',v:'Card, NFC, Cash'}] }
  ],
  products: [
    { _id:'prod1', name:'Snacks & Sweets',  nameAr:'وجبات خفيفة وحلويات', desc:'Chips, chocolates, biscuits.',  descAr:'شيبس وشوكولاتة وبسكويت.', image:'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&q=80', items:['Lays','Kit Kat','Oreos','Pringles'] },
    { _id:'prod2', name:'Cold Beverages',   nameAr:'مشروبات باردة',        desc:'Sodas, water, energy drinks.',  descAr:'مياه غازية وطاقة وعصائر.', image:'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=600&q=80', items:['Coca-Cola','Red Bull','Aquafina'] },
    { _id:'prod3', name:'Healthy Options',  nameAr:'خيارات صحية',          desc:'Protein bars, nuts, salads.',   descAr:'بروتين بار ومكسرات.',       image:'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80', items:['Kind Bar','Almonds','Salads'] },
    { _id:'prod4', name:'Hot Beverages',    nameAr:'مشروبات ساخنة',        desc:'Espresso, latte, hot choc.',    descAr:'إسبريسو ولاتيه وشوكولاتة.', image:'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80', items:['Espresso','Latte','Hot Choc'] }
  ],
  faqs: [
    { _id:'faq1', q:'Is there really no cost to host a machine?',    qAr:'هل لا توجد تكلفة لاستضافة الماكينة؟',    a:'Yes — WYT covers 100% of the machine cost, installation, maintenance, and restocking.',            aAr:'نعم — WYT تتحمل 100% من التكلفة.' },
    { _id:'faq2', q:'How often is the machine restocked?',           qAr:'كم مرة يتم تعبئة الماكينة؟',             a:'Our smart system monitors stock in real-time and triggers a restock before items run out.',        aAr:'نظامنا يراقب المخزون ويرسل تنبيهاً قبل نفاده.' },
    { _id:'faq3', q:'What payment methods do your machines accept?', qAr:'ما طرق الدفع المقبولة؟',                  a:'All WYT machines accept cards, Apple Pay, Google Pay, Fawry, and Vodafone Cash.',                 aAr:'البطاقات وApple Pay وGoogle Pay وفوري.' },
    { _id:'faq4', q:'What happens if the machine breaks down?',      qAr:'ماذا يحدث إذا تعطلت الماكينة؟',          a:'Remote diagnostics alert our team instantly. On-site visits happen within 24 hours.',             aAr:'يتلقى فريقنا تنبيهاً فورياً. زيارات ميدانية خلال 24 ساعة.' },
    { _id:'faq5', q:'Can we customise what the machine stocks?',     qAr:'هل يمكننا تخصيص محتوى الماكينة؟',        a:'Absolutely. We tailor product selection to your venue demographic.',                              aAr:'بالتأكيد. نخصص المنتجات حسب بيئتك.' },
    { _id:'faq6', q:'What areas do you serve?',                      qAr:'ما المناطق التي تخدمونها؟',               a:'Cairo, Giza and Alexandria, with expansion plans throughout 2025–2026.',                          aAr:'القاهرة والجيزة والإسكندرية.' },
    { _id:'faq7', q:'How do I get started?',                         qAr:'كيف أبدأ؟',                              a:'Fill in the contact form. Our team will reach out within 24 hours.',                            aAr:'فقط املأ نموذج التواصل وسيرد فريقنا خلال 24 ساعة.' }
  ],
  partners: [
    { _id:'par1', name:'GymNation',     initials:'GN', color:'#1a6fa8', bg:'#e8f4fd' },
    { _id:'par2', name:'Maadi Medical', initials:'MM', color:'#c67c1a', bg:'#fef3e8' },
    { _id:'par3', name:'Orascom',       initials:'OC', color:'#2e7d32', bg:'#edf7ed' },
    { _id:'par4', name:'AUC',           initials:'AU', color:'#6d28d9', bg:'#f3e8ff' },
    { _id:'par5', name:'Hilton Cairo',  initials:'HC', color:'#b91c1c', bg:'#fde8e8' },
    { _id:'par6', name:'Elsewedy',      initials:'EE', color:'#1557c0', bg:'#e8f0fe' }
  ]
};

/* ════ JSON helpers ════ */
function readContent() {
  try { if (fs.existsSync(FILE)) return JSON.parse(fs.readFileSync(FILE,'utf8')); } catch {}
  const d = JSON.parse(JSON.stringify(DEFAULTS));
  fs.writeFileSync(FILE, JSON.stringify(d, null, 2));
  return d;
}
function writeContent(data) { fs.writeFileSync(FILE, JSON.stringify(data, null, 2)); }

function readSubs() {
  try { if (fs.existsSync(SUBS)) return JSON.parse(fs.readFileSync(SUBS,'utf8')); } catch {}
  return [];
}
function writeSubs(data) { fs.writeFileSync(SUBS, JSON.stringify(data, null, 2)); }

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }

/* ════ EXPORTED API ════ */
const DB = {

  /* Content */
  getAll: () => readContent(),

  getContent: () => {
    const c = readContent();
    return {
      settings : c.settings  || DEFAULTS.settings,
      stats    : c.stats     || DEFAULTS.stats,
      locations: c.locations || [],
      machines : c.machines  || [],
      products : c.products  || [],
      faqs     : c.faqs     || [],
      partners : c.partners  || []
    };
  },

  /* Settings */
  updateSettings: (data) => {
    const c = readContent();
    c.settings = Object.assign({}, c.settings || {}, data);
    writeContent(c); return c.settings;
  },
  updateStats: (data) => {
    const c = readContent();
    c.stats = Object.assign({}, c.stats || {}, data);
    writeContent(c); return c.stats;
  },

  /* Locations */
  addLocation: (item) => {
    const c = readContent();
    c.locations = c.locations || [];
    const doc = Object.assign({ _id: uid(), featured: c.locations.length === 0 }, item);
    c.locations.push(doc); writeContent(c); return doc;
  },
  deleteLocation: (id) => {
    const c = readContent();
    c.locations = (c.locations||[]).filter(x => x._id !== id);
    writeContent(c);
  },
  setFeatured: (id) => {
    const c = readContent();
    c.locations = (c.locations||[]).map(x => Object.assign({}, x, { featured: x._id === id }));
    writeContent(c);
  },

  /* Machines */
  addMachine: (item) => {
    const c = readContent();
    c.machines = c.machines || [];
    const doc = Object.assign({ _id: uid(), specs: [] }, item);
    c.machines.push(doc); writeContent(c); return doc;
  },
  deleteMachine: (id) => {
    const c = readContent();
    c.machines = (c.machines||[]).filter(x => x._id !== id);
    writeContent(c);
  },

  /* Products */
  addProduct: (item) => {
    const c = readContent();
    c.products = c.products || [];
    const doc = Object.assign({ _id: uid(), items: [] }, item);
    c.products.push(doc); writeContent(c); return doc;
  },
  deleteProduct: (id) => {
    const c = readContent();
    c.products = (c.products||[]).filter(x => x._id !== id);
    writeContent(c);
  },

  /* FAQs */
  addFaq: (item) => {
    const c = readContent();
    c.faqs = c.faqs || [];
    const doc = Object.assign({ _id: uid() }, item);
    c.faqs.push(doc); writeContent(c); return doc;
  },
  deleteFaq: (id) => {
    const c = readContent();
    c.faqs = (c.faqs||[]).filter(x => x._id !== id);
    writeContent(c);
  },

  /* Partners */
  addPartner: (item) => {
    const c = readContent();
    c.partners = c.partners || [];
    const doc = Object.assign({ _id: uid() }, item);
    c.partners.push(doc); writeContent(c); return doc;
  },
  deletePartner: (id) => {
    const c = readContent();
    c.partners = (c.partners||[]).filter(x => x._id !== id);
    writeContent(c);
  },

  /* Submissions */
  addSubmission: (item) => {
    const subs = readSubs();
    const doc  = Object.assign({ _id: uid(), status:'new', submittedAt: new Date().toISOString(), submittedEG: new Date().toLocaleString('en-EG',{timeZone:'Africa/Cairo'}) }, item);
    subs.unshift(doc); writeSubs(subs); return doc;
  },
  getSubmissions: () => readSubs(),
  updateSubmissionStatus: (id, status) => {
    const subs = readSubs();
    const i = subs.findIndex(s => s._id === id);
    if (i > -1) { subs[i].status = status; writeSubs(subs); return subs[i]; }
  },
  deleteSubmission: (id) => {
    writeSubs(readSubs().filter(s => s._id !== id));
  }
};

module.exports = DB;