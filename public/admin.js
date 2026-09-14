const $ = id => document.getElementById(id);
let password = '', section = 'machines', content = {}, imageValue = '', readingImage = false, busy = false, loggingIn = false, authenticated = false, resumeDraft = false;
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
function showLogin() {
  authenticated = false;
  $('login').hidden = false; $('workspace').hidden = true;
  $('logout').hidden = true; $('sections').hidden = true; $('mobile-navigation').hidden = true;
}
function showWorkspace() {
  authenticated = true;
  $('login').hidden = true; $('workspace').hidden = false;
  $('logout').hidden = false; $('sections').hidden = false; $('mobile-navigation').hidden = false;
}
async function api(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', 'x-admin-pass': password } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && authenticated) {
      resumeDraft = true; password = ''; showLogin();
      $('password').focus();
      throw new Error('Please log in again. Your unsaved form is kept until you reconnect.');
    }
    throw new Error(data.error || `Request failed (${response.status}).`);
  }
  return data;
}
function inputField(key, value = '') {
  const group = document.createElement('div'); group.className = 'form-group';
  const label = document.createElement('label'); label.htmlFor = 'field-' + key; label.textContent = labels[key] || title(key);
  const field = document.createElement(['desc', 'descAr', 'a', 'aAr', 'specs', 'items'].includes(key) ? 'textarea' : 'input');
  if (['desc', 'descAr', 'a', 'aAr', 'image', 'specs', 'items'].includes(key)) group.classList.add('wide');
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
  $('section-select').value = section;
  imageValue = ''; $('fields').replaceChildren(); $('content-list').replaceChildren(); $('list-head').replaceChildren();
  document.querySelectorAll('#sections button').forEach(button => button.classList.toggle('active', button.dataset.section === section));
  $('editor').hidden = section === 'submissions';
  $('submission-tools').hidden = section !== 'submissions';
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
  if (section === 'submissions') { submissionHash = ''; await refreshSubmissions(); return; }
  const rows = content[section] || [];
  const headings = section === 'submissions' ? ['Name', 'Email / phone', 'Message / interest', 'Submitted'] : ['Name / question', 'Details', 'Action'];
  const header = document.createElement('tr');
  headings.forEach(value => { const th = document.createElement('th'); th.textContent = value; header.append(th); }); $('list-head').append(header);
  if (!rows.length) { const row = $('content-list').insertRow(); const cell = row.insertCell(); cell.colSpan = headings.length; cell.textContent = 'No entries yet.'; }
  for (const item of rows) {
    const row = $('content-list').insertRow();
    const values = section === 'submissions' ? [item.fullName || `${item.firstName || ''} ${item.lastName || ''}`, `${item.email || ''}\n${item.phone || ''}`, `${item.message || ''}\n${item.interest || ''}`, item.submittedEG || ''] : [item.name || item.q || 'Untitled', item.desc || item.a || item.area || item.initials || ''];
    values.forEach((value, index) => { const cell = row.insertCell(); cell.textContent = value; cell.dataset.label = headings[index]; });
    if (section !== 'submissions') {
      const button = document.createElement('button'); button.className = 'btn btn-danger'; button.textContent = 'Delete'; button.disabled = !item._id;
      button.addEventListener('click', async () => {
        if (busy || readingImage || !confirm('Delete this entry?')) return;
        busy = true; button.disabled = true;
        try { await api(`/api/admin/${section}/${encodeURIComponent(item._id)}`, { method: 'DELETE' }); content = await api('/api/content'); await renderSection(); notify('Entry deleted.'); }
        catch (error) { notify(error.message, true); button.disabled = false; }
        finally { busy = false; }
      }); const action = row.insertCell(); action.dataset.label = 'Action'; action.append(button);
    }
  }
}
$('login-form').addEventListener('submit', async event => {
  event.preventDefault(); if (loggingIn) return;
  loggingIn = true; password = $('password').value;
  const button = $('login-form').querySelector('button[type="submit"], button:not([type])'); button.disabled = true;
  notify('Connecting…');
  try {
    await api('/api/admin/session'); content = await api('/api/content');
    if (!resumeDraft) await renderSection();
    resumeDraft = false; showWorkspace(); $('password').value = '';
    notify('Connected. Your dashboard is ready.');
  } catch (error) { password = ''; showLogin(); notify(error.message, true); }
  finally { loggingIn = false; button.disabled = false; }
});
$('toggle-password').addEventListener('click', () => {
  const show = $('password').type === 'password';
  $('password').type = show ? 'text' : 'password';
  $('toggle-password').textContent = show ? 'Hide' : 'Show';
  $('toggle-password').setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  $('toggle-password').setAttribute('aria-pressed', String(show));
});
$('logout').addEventListener('click', () => {
  if (busy || readingImage || loggingIn) return;
  password = ''; content = {}; imageValue = ''; resumeDraft = false; showLogin();
  $('content-list').replaceChildren(); $('fields').replaceChildren(); notify('Logged out.');
});
async function selectSection(key) {
  if (!authenticated || busy || readingImage) { $('section-select').value = section; return; }
  section = key;
  try { await renderSection(); } catch (error) { notify(error.message, true); }
}
for (const key of Object.keys(definitions)) {
  const button = document.createElement('button'); button.textContent = key === 'faqs' ? 'FAQs' : title(key); button.dataset.section = key;
  button.addEventListener('click', () => selectSection(key)); $('sections').append(button);
  const option = document.createElement('option'); option.value = key; option.textContent = button.textContent; $('section-select').append(option);
}
$('section-select').addEventListener('change', event => selectSection(event.target.value));
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

let submissionHash = '', submissionRequest = 0, refreshingSubmissions = false;
async function refreshSubmissions() {
  const requestId = ++submissionRequest;
  const rows = await api('/api/admin/submissions');
  if (requestId !== submissionRequest || section !== 'submissions' || (!authenticated && !loggingIn)) return;
  const hash = JSON.stringify(rows);
  if (hash === submissionHash) return;
  submissionHash = hash;
  $('list-head').replaceChildren(); $('content-list').replaceChildren();
  const headings = ['Request', 'Contact', 'Message', 'Progress', 'Emails'];
  const header = document.createElement('tr');
  headings.forEach(text => { const th = document.createElement('th'); th.textContent = text; header.append(th); }); $('list-head').append(header);
  $('list-title').textContent = `Submissions (${rows.filter(item => item.status !== 'Done').length} not done)`;
  if (!rows.length) { const cell = $('content-list').insertRow().insertCell(); cell.colSpan = 5; cell.textContent = 'No requests yet.'; }
  for (const item of rows) {
    const row = $('content-list').insertRow();
    function cell(index) { const el = row.insertCell(); el.dataset.label = headings[index]; return el; }
    cell(0).textContent = `${item.fullName || [item.firstName, item.lastName].filter(Boolean).join(' ')}\n${item.submittedEG || ''}`;
    cell(1).textContent = `${item.email || ''}\n${item.phone || ''}`;
    cell(2).textContent = `${item.interest || ''}\n${item.message || ''}`;
    const progress = cell(3), done = item.status === 'Done';
    const badge = document.createElement('span'); badge.className = 'status-badge ' + (done ? 'is-done' : 'is-pending'); badge.textContent = done ? 'Done' : 'Not done'; progress.append(badge);
    if (item.statusUpdatedAt) { const when = document.createElement('small'); when.textContent = 'Updated ' + new Date(item.statusUpdatedAt).toLocaleString(); progress.append(when); }
    const toggle = document.createElement('button'); toggle.type = 'button'; toggle.className = 'btn status-action'; toggle.textContent = done ? 'Mark not done' : 'Mark done'; toggle.disabled = !item._id;
    toggle.addEventListener('click', async () => {
      if (busy) return; busy = true; toggle.disabled = true;
      try {
        await api(`/api/admin/submissions/${encodeURIComponent(item._id)}/status`, { method: 'PATCH', body: JSON.stringify({ status: done ? 'Pending' : 'Done', expectedStatus: done ? 'Done' : 'Pending' }) });
        await refreshSubmissions(); notify('Progress saved for all admins.');
      } catch (error) { notify(error.message, true); if (authenticated) await refreshSubmissions().catch(() => {}); }
      finally { busy = false; toggle.disabled = false; }
    }); progress.append(toggle);
    const delivery = cell(4);
    for (const [key, name] of [['customer', 'Customer'], ['team', 'Team']]) {
      const state = item.notifications?.[key]; const label = document.createElement('small');
      label.textContent = `${name}: ${state?.status === 'Sent' ? 'Sent' : state?.status === 'Failed' ? 'Failed (' + (state.code || 'SEND_FAILED') + ')' : 'Not sent / not recorded'}`; delivery.append(label);
    }
    if (item.notifications?.customer?.status !== 'Sent' || item.notifications?.team?.status !== 'Sent') {
      const retry = document.createElement('button'); retry.type = 'button'; retry.className = 'btn status-action'; retry.textContent = 'Retry unsent emails'; retry.disabled = !item._id;
      retry.addEventListener('click', async () => {
        if (busy || !confirm('Send the emails not recorded as sent for this request?')) return;
        busy = true; retry.disabled = true;
        try { const result = await api(`/api/admin/submissions/${encodeURIComponent(item._id)}/retry-emails`, { method: 'POST' }); await refreshSubmissions(); const sent = Object.values(result.notifications).every(value => value.status === 'Sent'); notify(sent ? 'Emails accepted for delivery.' : 'Some emails could not be sent. Check the email connection and delivery status.', !sent); }
        catch (error) { notify(error.message, true); }
        finally { busy = false; retry.disabled = false; }
      }); delivery.append(retry);
    }
  }
}
$('refresh-submissions').addEventListener('click', async () => { if (busy) return; try { await refreshSubmissions(); notify('Requests refreshed.'); } catch (error) { notify(error.message, true); } });
$('check-email').addEventListener('click', async () => {
  const button = $('check-email'); button.disabled = true;
  try { const result = await api('/api/admin/email-status'); notify(result.ready ? 'Email connection is ready. Notifications go to: ' + result.recipients.join(', ') : 'Email connection failed: ' + result.code + '. Check GMAIL_USER and GMAIL_PASS in your hosting settings.', !result.ready); }
  catch (error) { notify(error.message, true); }
  finally { button.disabled = false; }
});
setInterval(async () => {
  if (!authenticated || section !== 'submissions' || busy || refreshingSubmissions || document.hidden) return;
  refreshingSubmissions = true;
  try { await refreshSubmissions(); } catch (error) { notify(error.message, true); }
  finally { refreshingSubmissions = false; }
}, 10000);
