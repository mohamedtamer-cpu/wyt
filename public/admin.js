const params = new URLSearchParams(window.location.search);
const PASS = params.get('pass') || 'Wyt11223344$$';

let selectedImageBase64 = '';

function convertImageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

document.getElementById('img-input')?.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    try {
      selectedImageBase64 = await convertImageToBase64(file);
      const preview = document.getElementById('img-preview');
      preview.src = selectedImageBase64;
      preview.style.display = 'block';
    } catch (err) {
      alert('Failed to read image file');
    }
  }
});

async function addMachine() {
  const specsRaw = document.getElementById('m-specs').value;
  const specs = specsRaw.split('\n').filter(l => l.trim()).map(line => {
    const [label, val] = line.split('|');
    return { label: (label || '').trim(), val: (val || '').trim() };
  });

  const payload = {
    name: document.getElementById('m-name').value,
    badge: document.getElementById('m-badge').value,
    desc: document.getElementById('m-desc').value,
    image: selectedImageBase64,
    specs: specs
  };

  const res = await fetch(`/api/admin/machines?pass=${encodeURIComponent(PASS)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-pass': PASS },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    alert('Machine Added Successfully!');
    selectedImageBase64 = '';
    document.getElementById('m-form').reset();
    document.getElementById('img-preview').style.display = 'none';
    loadMachines();
  } else {
    alert('Error adding machine');
  }
}

async function loadMachines() {
  const res = await fetch(`/api/admin/machines?pass=${encodeURIComponent(PASS)}`, {
    headers: { 'x-admin-pass': PASS }
  });
  const data = await res.json();
  const tbody = document.getElementById('machines-list');
  tbody.innerHTML = '';

  data.forEach(m => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img src="${m.image || '/images/vending machine.jpg'}" class="table-img" /></td>
      <td><b>${m.name || '—'}</b></td>
      <td>${m.badge || '—'}</td>
      <td>${m.desc || '—'}</td>
      <td><button class="btn btn-danger" onclick="deleteMachine('${m._id}')">Delete</button></td>
    `;
    tbody.appendChild(tr);
  });
}

async function deleteMachine(id) {
  if (!confirm('Are you sure?')) return;
  await fetch(`/api/admin/machines/${id}?pass=${encodeURIComponent(PASS)}`, {
    method: 'DELETE',
    headers: { 'x-admin-pass': PASS }
  });
  loadMachines();
}

document.addEventListener('DOMContentLoaded', loadMachines);