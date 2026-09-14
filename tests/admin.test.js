const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
function setup() {
  const elements = new Map();
  function element() { return { hidden: false, value: '', type: 'password', dataset: {}, listeners: {}, children: [], classList: { add() {}, toggle() {} }, addEventListener(name, fn) { this.listeners[name] = fn; }, append(child) { this.children.push(child); }, replaceChildren() { this.children = []; }, setAttribute() {}, focus() {}, querySelector() { return this.button ||= element(); } }; }
  const get = id => { if (!elements.has(id)) elements.set(id, element()); return elements.get(id); };
  const replies = [];
  const context = vm.createContext({ document: { getElementById: get, createElement: element, querySelectorAll: () => [] }, URLSearchParams, location: { search: '', pathname: '/admin' }, history: {}, setInterval: () => 0, fetch: async () => { const [status, data] = replies.shift(); return { ok: status < 400, status, json: async () => data }; } });
  vm.runInContext(fs.readFileSync('public/admin.js', 'utf8'), context);
  vm.runInContext('renderSection = async () => { globalThis.renderCount = (globalThis.renderCount || 0) + 1; };', context);
  return { get, replies, context };
}
test('failed login stays logged out; valid retry opens dashboard; 401 preserves draft for re-login', async () => {
  const { get, replies, context } = setup();
  get('password').value = 'wrong'; replies.push([401, { error: 'Incorrect admin password.' }]);
  await get('login-form').listeners.submit({ preventDefault() {} });
  assert.equal(get('workspace').hidden, true); assert.equal(get('login').hidden, false); assert.match(get('notice').textContent, /Incorrect/);
  get('password').value = 'correct'; replies.push([200, { success: true }], [200, {}]);
  await get('login-form').listeners.submit({ preventDefault() {} });
  assert.equal(get('workspace').hidden, false); assert.equal(get('mobile-navigation').hidden, false); assert.equal(context.renderCount, 1);
  replies.push([401, { error: 'Incorrect admin password.' }]);
  await assert.rejects(vm.runInContext("api('/api/admin/machines', { method: 'POST' })", context), /unsaved form/);
  assert.equal(get('workspace').hidden, true);
  get('password').value = 'correct'; replies.push([200, { success: true }], [200, {}]);
  await get('login-form').listeners.submit({ preventDefault() {} });
  assert.equal(get('workspace').hidden, false); assert.equal(context.renderCount, 1, 're-login must not rebuild and erase the draft');
});
test('content loading failure does not leave a false logged-in dashboard', async () => {
  const { get, replies } = setup(); get('password').value = 'correct';
  replies.push([200, { success: true }], [500, { error: 'Database unavailable' }]);
  await get('login-form').listeners.submit({ preventDefault() {} });
  assert.equal(get('workspace').hidden, true); assert.equal(get('logout').hidden, true); assert.match(get('notice').textContent, /Database unavailable/);
});
