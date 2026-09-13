const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../server');
const { validateItem } = require('../db');
test('admin authentication, content CRUD, contact validation, and JSON failures', async () => {
  process.env.ADMIN_PASSWORD = 'test-only-password';
  const content = { machines: [], locations: [], products: [], faqs: [], partners: [], settings: {}, stats: {} }, submissions = [];
  const store = {
    getContent: async () => content,
    addItem: async (key, data) => { const item = { ...validateItem(key, data), _id: 'test-id' }; content[key].push(item); return item; },
    deleteItem: async (key, id) => { content[key] = content[key].filter(item => item._id !== id); },
    updateSection: async (key, data) => content[key] = data,
    addSubmission: async data => submissions.push(data), getSubmissions: async () => submissions
  };
  const server = createApp(store).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = (url, method = 'GET', body, authenticated = true) => fetch(base + url, { method, headers: { 'Content-Type': 'application/json', ...(authenticated ? { 'x-admin-pass': process.env.ADMIN_PASSWORD } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  try {
    assert.equal((await request('/admin')).status, 200);
    assert.equal((await request('/api/admin/machines', 'GET', undefined, false)).status, 401);
    assert.equal((await request('/api/machines', 'POST', { name: 'Unauthorized' }, false)).status, 401);
    for (const key of ['machines', 'locations', 'products', 'faqs', 'partners']) {
      const data = key === 'faqs' ? { q: 'Question?', a: 'Answer' } : { name: 'Test <item>' };
      assert.equal((await request(`/api/admin/${key}`, 'POST', data)).status, 201);
      const items = await (await request(`/api/admin/${key}`)).json(); assert.equal(items.length, 1);
      assert.equal((await (await request('/api/content')).json())[key].length, 1);
      assert.equal((await request(`/api/admin/${key}/test-id`, 'DELETE')).status, 200);
      assert.equal(content[key].length, 0);
    }
    assert.equal((await request('/api/admin/machines', 'POST', { name: '   ' })).status, 400);
    assert.equal((await request('/api/admin/machines', 'POST', { name: 'Test', image: 'javascript:alert(1)' })).status, 400);
    assert.equal((await request('/api/admin/settings', 'PUT', { phone: '123' })).status, 200);
    assert.equal((await request('/api/contact', 'POST', {}, false)).status, 400);
    assert.equal((await request('/api/contact', 'POST', { firstName: 'Test', lastName: 'User', email: 'test@example.com', message: 'Hello' }, false)).status, 201);
    assert.equal((await (await request('/api/admin/submissions')).json()).length, 1);
    const malformed = await fetch(base + '/api/admin/machines', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
    assert.equal(malformed.status, 400); assert.equal((await malformed.json()).success, false);
    assert.equal((await request('/api/unknown')).status, 404);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
test('validates FAQ content and normalizes machine specifications', () => {
  assert.equal(validateItem('faqs', { q: 'Why?', a: 'Because.' }).q, 'Why?');
  assert.deepEqual(validateItem('machines', { name: 'Machine', specs: [{ label: 'Capacity', val: '60' }] }).specs, [{ l: 'Capacity', v: '60' }]);
  assert.throws(() => validateItem('machines', { name: 'Machine', specs: [null] }));
});
