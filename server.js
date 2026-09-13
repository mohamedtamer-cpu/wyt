require('dotenv').config();
const express = require('express');
const path = require('path');
const crypto = require('crypto');
const db = require('./db');

function createApp(store = db) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '4mb' }));
  app.use(express.urlencoded({ extended: true, limit: '4mb' }));
  app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public/admin.html')));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/api', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  const run = fn => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);
  function admin(req, res, next) {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) return res.status(503).json({ error: 'Set ADMIN_PASSWORD on the server before using the dashboard.' });
    const supplied = req.get('x-admin-pass') || '';
    const hash = value => crypto.createHash('sha256').update(value).digest();
    if (!crypto.timingSafeEqual(hash(supplied), hash(expected))) return res.status(401).json({ error: 'Incorrect admin password.' });
    next();
  }
  app.get('/api/content', run(async (req, res) => res.json(await store.getContent())));
  app.use('/api/admin', admin);
  for (const collection of ['machines', 'locations', 'products', 'faqs', 'partners']) {
    app.get(`/api/admin/${collection}`, run(async (req, res) => res.json((await store.getContent())[collection])));
    app.post(`/api/admin/${collection}`, run(async (req, res) => {
      const item = await store.addItem(collection, req.body);
      res.status(201).json({ success: true, item, machine: collection === 'machines' ? item : undefined });
    }));
    app.delete(`/api/admin/${collection}/:id`, run(async (req, res) => {
      await store.deleteItem(collection, req.params.id);
      res.json({ success: true });
    }));
  }
  for (const section of ['settings', 'stats']) {
    app.put(`/api/admin/${section}`, run(async (req, res) => res.json({ success: true, data: await store.updateSection(section, req.body) })));
  }
  app.post('/api/machines', admin, run(async (req, res) => res.status(201).json({ success: true, machine: await store.addItem('machines', req.body) })));
  app.delete('/api/machines/:id', admin, run(async (req, res) => { await store.deleteItem('machines', req.params.id); res.json({ success: true }); }));
  app.get('/api/admin/submissions', run(async (req, res) => res.json(await store.getSubmissions())));
  app.post('/api/contact', run(async (req, res) => {
    const data = {};
    for (const key of ['firstName', 'lastName', 'email', 'phone', 'interest', 'message', 'lang']) {
      data[key] = typeof req.body?.[key] === 'string' ? req.body[key].trim() : '';
      if (data[key].length > (key === 'message' ? 5000 : 200)) return res.status(400).json({ error: `${key} is too long.` });
    }
    if (!data.firstName || !data.lastName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || !data.message) return res.status(400).json({ error: 'Enter your name, a valid email address, and a message.' });
    await store.addSubmission({ ...data, fullName: `${data.firstName} ${data.lastName}`, ip: req.ip });
    res.status(201).json({ success: true });
  }));
  app.use('/api', (req, res) => res.status(404).json({ error: 'API endpoint not found.' }));
  app.use((err, req, res, next) => {
    const status = err.status || (err.name === 'ValidationError' ? 400 : 500);
    if (status >= 500) console.error('[WYT]', err.name);
    res.status(status).json({ success: false, error: status === 413 ? 'Image or request is too large. Choose an image under 2 MB.' : status >= 500 ? 'Unable to access the database. Check the server database configuration and connection.' : err.message });
  });
  return app;
}
const app = createApp();
if (require.main === module) app.listen(process.env.PORT || 3000, () => console.log(`Server running on port ${process.env.PORT || 3000}`));
module.exports = app;
module.exports.createApp = createApp;
