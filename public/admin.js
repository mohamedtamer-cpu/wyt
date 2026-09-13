const $ = id => document.getElementById(id);
let password = '', section = 'machines', content = {}, imageValue = '', readingImage = false, busy = false;
const definitions = {
  machines: ['name', 'nameAr', 'badge', 'badgeAr', 'desc', 'descAr', 'image', 'specs'],
  locations: ['name', 'nameAr', 'type', 'typeAr', 'machine', 'area', 'areaAr', 'image', 'featured'],
  products: ['name', 'nameAr', 'desc', 'descAr', 'image', 'items'],
  faqs: ['q', 'qAr', 'a', 'aAr'],
  partners: ['name', 'initials', 'bg', 'color', 'image'],
  settings: ['whatsapp', 'email', 'phone', 'address', 'addressAr', 'hours', 'hoursAr'],
  stats: ['machines', 'locations', 'uptime'], submissions: []
};
const labels = { nameAr: 'Name (Arabic)', badgeAr: 'Badge (Arabic)', desc: 'Description', descAr: 'Description (Arabic)', typeAr: 'Type (Arabic)', areaAr: 'Area (Arabic)', q: 'Question', qAr: 'Question (Arabic)', a: 'Answer', aAr: 'Answer (Arabic)', bg: 'Badge background color', color: 'Badge text color', specs: 'Specifications (one per line: Label | Value)', items: 'Product items (one per line)', addressAr: 'Address (Arabic)', hoursAr: 'Hours (Arabic)' };
const title = text => text.charAt(0).toUpperCase() + text.slice(1);
function notify(message, error = false) { $('notice').textContent = message; $('notice').className = error ? 'error' : 'success'; }
async function api(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', 'x-admin-pass': password } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status}).`);
  return data;
}
function inputField(key, value = '') {
  const group = document.createElement('div'); group.className = 'form-group';
  const label = document.createElement('label'); label.htmlFor = 'field-' + key; label.textContent = labels[key] || title(key);
  const field = document.createElement(['desc', 'descAr', 'a', 'aAr', 'specs', 'items'].includes(key) ? 'textarea' : 'input');
  field.id = label.htmlFor; field.name = key; field.className = 'form-control';
  field.type = key === 'featured' ? 'checkbox' : key === 'image' ? 'file' : key === 'email' ? 'email' : 'text';
  if (key === 'featured') field.checked = !!value;
  else if (key !== 'image') field.value = value;
  if (['name', 'q', 'a'].includes(key)) field.required = true;
  group.append(label, field);
  if (key === 'image') {
    field.accept = 'image/png,image/jpeg,image/webp,image/gif';
    const hint = document.createElement('small'); hint.textContent = 'PNG, JPEG, WebP or GIF, up to 2 MB.';
    const preview = document.createElement('img'); preview.className = 'image-preview'; preview.hidden = true;
    group.append(hint, preview);
    field.addEventListener('change', async () => {
      imageValue = ''; preview.hidden = true;
      const file = field.files[0]; if (!file) return;
      if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type) || file.size > 2 * 1024 * 1024) { field.value = ''; notify('Choose a supported image under 2 MB.', true); return; }
      readingImage = true; $('save').disabled = true;
      try {
        imageValue = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
        preview.src = imageValue; preview.hidden = false;
      } catch { notify('Could not read the selected image.', true); }
      finally { readingImage = false; $('save').disabled = false; }
    });
  }
  return group;
}
async function renderSection() {
  imageValue = ''; $('fields').replaceChildren(); $('content-list').replaceChildren(); $('list-head').replaceChildren();
  document.querySelectorAll('#sections button').forEach(button => button.classList.toggle('active', button.dataset.section === section));
  $('editor').hidden = section === 'submissions';
  $('editor-title').textContent = ['settings', 'stats'].includes(section) ? `Update ${section}` : `Add ${section === 'faqs' ? 'FAQ' : section.slice(0, -1)}`;
  $('list-title').textContent = title(section);
  $('save').textContent = ['settings', 'stats'].includes(section) ? 'Save changes' : 'Add item';
  if (section === 'stats') {
    for (const key of definitions.stats) for (const field of ['value', 'suffix', 'label', 'labelAr']) {
      const group = inputField(`${key}-${field}`, content.stats?.[key]?.[field] ?? (field === 'value' ? 0 : ''));
      if (field === 'value') { const input = group.querySelector('input'); input.type = 'number'; input.min = '0'; input.required = true; }
      $('fields').append(group);
    }
  } else for (const key of definitions[section]) $('fields').append(inputField(key, section === 'settings' ? content.settings?.[key] || '' : ''));
  if (['settings', 'stats'].includes(section)) { $('list-title').textContent = 'Changes appear on the website within 5 seconds.'; return; }
  const rows = section === 'submissions' ? await api('/api/admin/submissions') : content[section] || [];
  const headings = section === 'submissions' ? ['Name', 'Email / phone', 'Message / interest', 'Submitted'] : ['Name / question', 'Details', 'Action'];
  const header = document.createElement('tr');
  headings.forEach(value => { const th = document.createElement('th'); th.textContent = value; header.append(th); }); $('list-head').append(header);
  if (!rows.length) { const row = $('content-list').insertRow(); const cell = row.insertCell(); cell.colSpan = headings.length; cell.textContent = 'No entries yet.'; }
  for (const item of rows) {
    const row = $('content-list').insertRow();
    const values = section === 'submissions' ? [item.fullName || `${item.firstName || ''} ${item.lastName || ''}`, `${item.email || ''}\n${item.phone || ''}`, `${item.message || ''}\n${item.interest || ''}`, item.submittedEG || ''] : [item.name || item.q || 'Untitled', item.desc || item.a || item.area || item.initials || ''];
    values.forEach(value => { row.insertCell().textContent = value; });
    if (section !== 'submissions') {
      const button = document.createElement('button'); button.className = 'btn btn-danger'; button.textContent = 'Delete'; button.disabled = !item._id;
      button.addEventListener('click', async () => {
        if (busy || readingImage || !confirm('Delete this entry?')) return;
        busy = true; button.disabled = true;
        try { await api(`/api/admin/${section}/${encodeURIComponent(item._id)}`, { method: 'DELETE' }); content = await api('/api/content'); await renderSection(); notify('Entry deleted.'); }
        catch (error) { notify(error.message, true); button.disabled = false; }
        finally { busy = false; }
      }); row.insertCell().append(button);
    }
  }
}
$('login-form').addEventListener('submit', async event => {
  event.preventDefault(); password = $('password').value;
  const button = event.submitter; button.disabled = true;
  try { await api('/api/admin/machines'); content = await api('/api/content'); $('login').hidden = true; $('workspace').hidden = false; $('logout').hidden = false; $('password').value = ''; await renderSection(); notify('Connected. Your dashboard is ready.'); }
  catch (error) { password = ''; notify(error.message, true); }
  finally { button.disabled = false; }
});
$('logout').addEventListener('click', () => { password = ''; content = {}; $('workspace').hidden = true; $('login').hidden = false; $('logout').hidden = true; $('content-list').replaceChildren(); notify('Logged out.'); });
for (const key of Object.keys(definitions)) {
  const button = document.createElement('button'); button.textContent = title(key); button.dataset.section = key;
  button.addEventListener('click', async () => { if (!password || busy || readingImage) return; section = key; try { await renderSection(); } catch (error) { notify(error.message, true); } }); $('sections').append(button);
}
$('content-form').addEventListener('submit', async event => {
  event.preventDefault(); if (busy || readingImage) return;
  const form = new FormData(event.target), payload = {};
  try {
    if (section === 'stats') for (const key of definitions.stats) payload[key] = { value: Number(form.get(`${key}-value`)), suffix: form.get(`${key}-suffix`), label: form.get(`${key}-label`), labelAr: form.get(`${key}-labelAr`) };
    else for (const key of definitions[section]) {
      const value = form.get(key);
      if (key === 'image') payload.image = imageValue;
      else if (key === 'featured') payload.featured = value === 'on';
      else if (key === 'items') payload.items = value.split('\n').map(v => v.trim()).filter(Boolean);
      else if (key === 'specs') payload.specs = value.split('\n').filter(v => v.trim()).map(line => {
        const split = line.indexOf('|'); if (split < 1 || !line.slice(split + 1).trim()) throw new Error('Each specification needs Label | Value.');
        return { l: line.slice(0, split).trim(), v: line.slice(split + 1).trim() };
      });
      else payload[key] = value.trim();
    }
    busy = true; $('save').disabled = true;
    await api(`/api/admin/${section}`, { method: ['settings', 'stats'].includes(section) ? 'PUT' : 'POST', body: JSON.stringify(payload) });
    notify('Saved successfully.');
    content = await api('/api/content'); await renderSection();
  } catch (error) { notify(error.message, true); }
  finally { busy = false; $('save').disabled = false; }
});
// Remove passwords from old bookmarked URLs; login credentials stay only in memory.
if (new URLSearchParams(location.search).has('pass')) history.replaceState(null, '', location.pathname);
