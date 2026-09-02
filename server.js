require('dotenv').config();
const express    = require('express');
const nodemailer = require('nodemailer');
const path       = require('path');
const fs         = require('fs');
const multer     = require('multer');
const DB         = require('./db');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));
if (!process.env.VERCEL) {
  if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
  }
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, 'uploads/'),
  filename:    (_, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g,'-'))
});
const upload = multer({ storage, limits:{ fileSize: 8*1024*1024 } });

const RECIPIENTS = ['mohamedtamer668er@gmail.com','Ytmimy@gmail.com','Wellwensh@gmail.com'];
const transporter = nodemailer.createTransport({
  service:'gmail', auth:{ user:process.env.GMAIL_USER, pass:process.env.GMAIL_PASS }
});
transporter.verify(err => err ? console.error('Email:',err.message) : console.log('✅  Email ready'));

/* ── SSE real-time ── */
let clients = [];
function push() {
  clients = clients.filter(r => !r.writableEnded);
  clients.forEach(r => r.write('data: update\n\n'));
  console.log('[SSE] pushed to', clients.length, 'client(s)');
}

function auth(req, res, next) {
  const p = req.query.pass || req.headers['x-admin-pass'];
  if (p !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error:'Unauthorized' });
  next();
}

/* ════ PUBLIC ════ */

app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type',  'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection',    'keep-alive');
  res.write('data: connected\n\n');
  clients.push(res);
  req.on('close', () => { clients = clients.filter(c => c !== res); });
});

app.get('/api/content', (req, res) => {
  try { res.json(DB.getContent()); }
  catch(e) { res.status(500).json({error:e.message}); }
});

app.post('/api/contact', async (req, res) => {
  const { firstName='', lastName='', email='', phone='Not provided', interest='Not specified', message='', lang='en' } = req.body;
  if (!firstName || !email) return res.status(400).json({success:false,error:'Name and email required.'});
  let record;
  try { record = DB.addSubmission({ firstName, lastName, fullName:(firstName+' '+lastName).trim(), email, phone, interest, message, lang, ip: req.headers['x-forwarded-for']||req.socket.remoteAddress }); }
  catch(e) { console.error('[DB]',e.message); }
  const cfg = DB.getContent().settings || {};
  const total = DB.getSubmissions().length;
  const isAr = lang === 'ar';
  const teamMail = {
    from:`"WYT Website" <${process.env.GMAIL_USER}>`,
    to:RECIPIENTS.join(', '),
    replyTo:`"${firstName} ${lastName}" <${email}>`,
    subject:`New WYT Request — ${firstName} ${lastName}`,
    html:`<div style="font-family:Arial;max-width:600px;margin:0 auto"><div style="background:#111318;padding:24px 32px;border-radius:12px 12px 0 0"><h2 style="color:#fff;margin:0">New Request</h2><p style="color:rgba(255,255,255,.4);margin:6px 0 0;font-size:13px">${new Date().toLocaleString('en-EG',{timeZone:'Africa/Cairo'})} · Total: ${total}</p></div><div style="background:#fff;padding:28px 32px;border:1px solid #eee"><table style="width:100%;border-collapse:collapse"><tr><td style="padding:10px 0;border-bottom:1px solid #f5f5f5;color:#999;font-size:11px;font-weight:700;text-transform:uppercase;width:100px">Name</td><td style="padding:10px 0;border-bottom:1px solid #f5f5f5">${firstName} ${lastName}</td></tr><tr><td style="padding:10px 0;border-bottom:1px solid #f5f5f5;color:#999;font-size:11px;font-weight:700;text-transform:uppercase">Email</td><td style="padding:10px 0;border-bottom:1px solid #f5f5f5"><a href="mailto:${email}">${email}</a></td></tr><tr><td style="padding:10px 0;border-bottom:1px solid #f5f5f5;color:#999;font-size:11px;font-weight:700;text-transform:uppercase">Phone</td><td style="padding:10px 0;border-bottom:1px solid #f5f5f5">${phone}</td></tr><tr><td style="padding:10px 0;border-bottom:1px solid #f5f5f5;color:#999;font-size:11px;font-weight:700;text-transform:uppercase">Interest</td><td style="padding:10px 0;border-bottom:1px solid #f5f5f5">${interest}</td></tr><tr><td style="padding:10px 0;color:#999;font-size:11px;font-weight:700;text-transform:uppercase;vertical-align:top">Message</td><td style="padding:10px 0"><div style="background:#f8f7f3;border-radius:8px;padding:14px;white-space:pre-wrap">${message||'—'}</div></td></tr></table></div><div style="background:#f8f7f3;padding:12px 32px;border-radius:0 0 12px 12px;text-align:center;font-size:12px;color:#aaa">Reply to respond to ${firstName}</div></div>`
  };
  const autoReply = {
    from:`"WYT Vending" <${process.env.GMAIL_USER}>`,
    to:email,
    subject:isAr ? `استلمنا طلبك يا ${firstName}! — WYT` : `We got your request, ${firstName}! — WYT`,
    html:`<div style="font-family:Arial;max-width:600px;margin:0 auto;${isAr?'direction:rtl':''}"><div style="background:#111318;padding:32px;text-align:center;border-radius:12px 12px 0 0"><h1 style="color:#fff;margin:0;font-size:22px">${isAr?'استلمنا طلبك!':'Got your request!'}</h1><p style="color:rgba(255,255,255,.5);margin:8px 0 0">${isAr?'سنتواصل معك خلال 24 ساعة':'We\'ll be in touch within 24 hours'}</p></div><div style="background:#fff;padding:32px;border:1px solid #eee"><p style="font-size:16px">${isAr?'مرحباً':'Hi'} <strong>${firstName}</strong>,</p><p style="font-size:15px;color:#555;line-height:1.75;margin:12px 0">${isAr?'شكراً للتواصل مع WYT. سيرد فريقنا خلال <strong>24 ساعة</strong>':'Thank you for reaching out. Our team will contact you within <strong>24 hours</strong>'}.</p><div style="background:#f8f7f3;border-radius:10px;padding:18px;margin:20px 0"><p style="margin:5px 0;font-size:14px"><strong>${isAr?'الاسم':'Name'}:</strong> ${firstName} ${lastName}</p><p style="margin:5px 0;font-size:14px"><strong>${isAr?'الهاتف':'Phone'}:</strong> ${phone}</p><p style="margin:5px 0;font-size:14px"><strong>${isAr?'الاهتمام':'Interest'}:</strong> ${interest}</p></div><div style="text-align:center;margin-top:24px"><a href="https://wa.me/${cfg.whatsapp||'201009999632'}" style="background:#25D366;color:#fff;padding:13px 28px;border-radius:99px;text-decoration:none;font-weight:700">${isAr?'تواصل على واتساب':'Chat on WhatsApp'}</a></div></div><div style="background:#f8f7f3;padding:14px;text-align:center;font-size:12px;color:#aaa;border-radius:0 0 12px 12px">© 2025 WYT Vending Solutions · Cairo, Egypt</div></div>`
  };
  try { await Promise.all([transporter.sendMail(teamMail), transporter.sendMail(autoReply)]); }
  catch(e) { console.error('[EMAIL]',e.message); }
  res.json({success:true});
});

/* ════ ADMIN API ════ */

app.post('/api/admin/upload', auth, upload.single('image'), (req,res) => {
  if (!req.file) return res.status(400).json({error:'No file.'});
  res.json({success:true, url:'uploads/'+req.file.filename});
});

app.get('/api/admin/uploads', auth, (req,res) => {
  const files = fs.existsSync('uploads') ? fs.readdirSync('uploads').filter(f=>!f.startsWith('.')).map(f=>({name:f,url:'uploads/'+f})) : [];
  res.json(files);
});
app.delete('/api/admin/uploads/:filename', auth, (req,res) => {
  const f = path.join('uploads', req.params.filename);
  if (fs.existsSync(f)) fs.unlinkSync(f);
  res.json({success:true});
});

app.put('/api/admin/settings', auth, (req,res) => { const r=DB.updateSettings(req.body); push(); res.json(r); });
app.put('/api/admin/stats',    auth, (req,res) => { const r=DB.updateStats(req.body);    push(); res.json(r); });

app.post('/api/admin/locations', auth, upload.single('image'), (req,res) => {
  const img = req.file ? 'uploads/'+req.file.filename : req.body.imageUrl||'';
  const r = DB.addLocation(Object.assign({}, req.body, {image:img}));
  push(); res.json(r);
});
app.delete('/api/admin/locations/:id', auth, (req,res) => { DB.deleteLocation(req.params.id); push(); res.json({success:true}); });
app.put('/api/admin/locations/:id/feature', auth, (req,res) => { DB.setFeatured(req.params.id); push(); res.json({success:true}); });

app.post('/api/admin/machines', auth, upload.single('image'), (req,res) => {
  const img = req.file ? 'uploads/'+req.file.filename : req.body.imageUrl||'machine.jfif';
  let specs = [];
  try { specs = JSON.parse(req.body.specs||'[]'); } catch {}
  const r = DB.addMachine(Object.assign({}, req.body, {image:img, specs}));
  push(); res.json(r);
});
app.delete('/api/admin/machines/:id', auth, (req,res) => { DB.deleteMachine(req.params.id); push(); res.json({success:true}); });

app.post('/api/admin/products', auth, upload.single('image'), (req,res) => {
  const img   = req.file ? 'uploads/'+req.file.filename : req.body.imageUrl||'';
  const items = (req.body.items||'').split(',').map(s=>s.trim()).filter(Boolean);
  const r = DB.addProduct(Object.assign({}, req.body, {image:img, items}));
  push(); res.json(r);
});
app.delete('/api/admin/products/:id', auth, (req,res) => { DB.deleteProduct(req.params.id); push(); res.json({success:true}); });

app.post('/api/admin/faqs',       auth, (req,res) => { const r=DB.addFaq(req.body);              push(); res.json(r); });
app.delete('/api/admin/faqs/:id', auth, (req,res) => { DB.deleteFaq(req.params.id);              push(); res.json({success:true}); });

app.post('/api/admin/partners',       auth, (req,res) => { const r=DB.addPartner(req.body);       push(); res.json(r); });
app.delete('/api/admin/partners/:id', auth, (req,res) => { DB.deletePartner(req.params.id);       push(); res.json({success:true}); });

app.get('/api/admin/submissions', auth, (req,res) => res.json(DB.getSubmissions()));
app.put('/api/admin/submissions/:id/status', auth, (req,res) => res.json(DB.updateSubmissionStatus(req.params.id, req.body.status)));
app.delete('/api/admin/submissions/:id', auth, (req,res) => { DB.deleteSubmission(req.params.id); res.json({success:true}); });
app.get('/api/admin/export', auth, (req,res) => {
  const subs = DB.getSubmissions();
  const csv = [['ID','Date','Name','Email','Phone','Interest','Language','Status','Message'].join(','),
    ...subs.map(s=>[s._id,s.submittedEG,'"'+s.fullName+'"',s.email,s.phone,'"'+s.interest+'"',s.lang,s.status,'"'+(s.message||'').replace(/"/g,'""')+'"'].join(','))
  ].join('\n');
  res.setHeader('Content-Type','text/csv');
  res.setHeader('Content-Disposition','attachment;filename=wyt-submissions-'+Date.now()+'.csv');
  res.send(csv);
});

app.get('/admin', (req,res) => {
  if (!req.query.pass) return res.send(`<!DOCTYPE html><html><head><title>WYT Admin</title><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,Arial,sans-serif;background:#f8f7f3;display:flex;align-items:center;justify-content:center;min-height:100vh}.box{background:#fff;border-radius:16px;padding:48px 40px;text-align:center;box-shadow:0 8px 48px rgba(0,0,0,.08);width:340px}img{height:44px;margin:0 auto 24px;display:block;object-fit:contain}h2{font-size:20px;font-weight:700;margin-bottom:6px;color:#111318}p{color:#9ca3af;font-size:14px;margin-bottom:28px}input{width:100%;padding:12px 14px;border:1.5px solid #e8e6e0;border-radius:10px;font-size:14px;margin-bottom:14px;outline:none;transition:border-color .2s}input:focus{border-color:#111318}button{width:100%;background:#111318;color:#fff;border:none;padding:14px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;transition:background .2s}button:hover{background:#2d3140}</style></head><body><div class="box"><img src="images/WhatsApp Image 2026-02-10 at 7.54.49 PM.jpeg" alt="WYT"/><h2>WYT Admin Panel</h2><p>Enter your admin password</p><form method="GET" action="/admin"><input type="password" name="pass" placeholder="Password" required autofocus/><button>Login →</button></form></div></body></html>`);
  if (req.query.pass !== process.env.ADMIN_PASSWORD) return res.status(401).send('<h2 style="font-family:Arial;text-align:center;margin-top:40px;color:#dc2626">Wrong password — <a href="/admin">Try again</a></h2>');
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('*', (req,res) => res.sendFile(path.join(__dirname,'index.html')));

app.listen(PORT, () => {
  console.log('\n✅  WYT running   → http://localhost:' + PORT);
  console.log('🔐  Admin panel   → http://localhost:' + PORT + '/admin');
  console.log('📁  Database      → data/content.json + data/submissions.json\n');
});
// Only listen when running locally (not on Vercel)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the app for Vercel serverless environment
module.exports = app;