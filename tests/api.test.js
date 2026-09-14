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
    addSubmission: async data => { const item = { ...data, _id: String(submissions.length + 1), status: 'Pending' }; submissions.push(item); return item; }, getSubmissions: async () => submissions,
    updateSubmissionNotifications: async (id, notifications) => { submissions.find(item => item._id === id).notifications = notifications; },
    claimSubmissionEmailRetry: async id => submissions.find(item => item._id === id),
    updateSubmissionStatus: async (id, status, expectedStatus) => {
      const item = submissions.find(item => item._id === id);
      if (!item) throw Object.assign(new Error('Not found'), { status: 404 });
      if (item.status !== expectedStatus) throw Object.assign(new Error('Changed by another admin'), { status: 409 });
      item.status = status; return item;
    }
  };
  let failEmail = false, deliveries = 0;
  const emailService = { verify: async () => ({ ready: true, recipients: ['team@example.com'] }), sendSubmission: async (item, previous = {}) => {
    deliveries++;
    if (failEmail) throw new Error('SMTP unavailable');
    assert.ok(item._id); assert.ok(submissions.includes(item), 'save must happen before sending');
    return { customer: { status: 'Sent' }, team: { status: 'Sent' } };
  } };
  const server = createApp(store, emailService).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = (url, method = 'GET', body, authenticated = true) => fetch(base + url, { method, headers: { 'Content-Type': 'application/json', ...(authenticated ? { 'x-admin-pass': process.env.ADMIN_PASSWORD } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  try {
    assert.equal((await request('/admin')).status, 200);
    assert.equal((await request('/api/admin/session', 'GET', undefined, false)).status, 401);
    assert.equal((await request('/api/admin/session')).status, 200);
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
    assert.equal(deliveries, 1);
    assert.equal(submissions[0].notifications.customer.status, 'Sent');
    assert.equal((await request('/api/admin/submissions/1/status', 'PATCH', { status: 'Done', expectedStatus: 'Pending' }, false)).status, 401);
    assert.equal((await request('/api/admin/submissions/1/status', 'PATCH', { status: 'Other', expectedStatus: 'Pending' })).status, 400);
    assert.equal((await request('/api/admin/submissions/1/status', 'PATCH', { status: 'Done', expectedStatus: 'Pending' })).status, 200);
    assert.equal((await (await request('/api/admin/submissions')).json())[0].status, 'Done');
    assert.equal((await request('/api/admin/submissions/1/status', 'PATCH', { status: 'Done', expectedStatus: 'Pending' })).status, 409);
    assert.equal((await request('/api/admin/submissions/1/status', 'PATCH', { status: 'Pending', expectedStatus: 'Done' })).status, 200);
    assert.equal((await request('/api/admin/submissions/missing/status', 'PATCH', { status: 'Done', expectedStatus: 'Pending' })).status, 404);
    assert.equal((await request('/api/admin/email-status', 'GET', undefined, false)).status, 401);
    assert.equal((await (await request('/api/admin/email-status')).json()).ready, true);
    assert.equal((await request('/api/admin/submissions/1/retry-emails', 'POST', undefined, false)).status, 401);
    assert.equal((await request('/api/admin/submissions/1/retry-emails', 'POST')).status, 200);
    failEmail = true;
    assert.equal((await request('/api/contact', 'POST', { firstName: 'Test', lastName: 'User', email: 'test@example.com', message: 'Email failure test' }, false)).status, 201);
    assert.equal(submissions.length, 2, 'email failure must not lose a request');
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
