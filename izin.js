const GAS_URL = 'https://script.google.com/macros/s/AKfycbxjx6qzwE6nd1ndHfAMalnzpOe5G2wEwnGpiSbiYK2B40eTJdEz1m9tW_GBIMyeqX0I2Q/exec';
const API_SECRET = 'KLMPK5_2026_AMAN';

// nama jamaah
const daftarNama = [
  "Ahmad Alfian Nugroho",
  "Diki Dwi Nugroho",
  "Ginar Putri Utami",
  "Sumardi",
  "Rifqi Nurhuda",
  "Yunus Abdul Rahman",
  "Hukmi Diniati",
  "Adi Kurniawan",
  "Aulia Rizqi Nurfadillah"
];


function escapeHTML(str) {
  return str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}


const elTanggal = document.getElementById('tanggal');
if (elTanggal) {
  const now = new Date();
  const iso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0];
  elTanggal.value = iso;
  elTanggal.max = iso;
}

// kategori
function toggleSelect() {
  const opt = document.getElementById('select-options');
  const trigger = document.getElementById('select-trigger');
  const isHidden = opt.classList.contains('hidden');
  
  opt.classList.toggle('hidden', !isHidden);
  trigger.classList.toggle('active', isHidden);
}

document.querySelectorAll('input[name="kategori"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    document.getElementById('kategori').value = radio.value;
    document.getElementById('ph').textContent = radio.value;
    document.getElementById('select-options').classList.add('hidden');
    document.getElementById('select-trigger').classList.remove('active');
  });
});

//cari nma
const inNama = document.getElementById('nama');
const hasil = document.getElementById('hasilNama');
const clearBtn = document.getElementById('clearNama');

function clearNama() {
  inNama.value = '';
  hasil.classList.add('hidden');
  clearBtn.classList.add('hidden');
  inNama.focus();
}

function cariNama() {
  const ketik = inNama.value.trim();
  
  // Show/hide tombol X
  if (ketik.length > 0) {
    clearBtn.classList.remove('hidden');
  } else {
    clearBtn.classList.add('hidden');
  }

  const query = ketik.toLowerCase();
  hasil.innerHTML = '';

  // Minimal 2 huruf baru search
  if (query.length < 2) {
    hasil.classList.add('hidden');
    return;
  }

  const cocok = daftarNama
    .filter((n) => n.toLowerCase().includes(query))
    .slice(0, 8); // 

  if (cocok.length === 0) {
    hasil.innerHTML = '<div style="color:#999;font-style:italic">Nama tidak ditemukan</div>';
  } else {
    cocok.forEach((nama) => {
      const div = document.createElement('div');
      div.textContent = nama;
      div.onclick = () => {
        inNama.value = nama;
        hasil.classList.add('hidden');
      };
      hasil.appendChild(div);
    });
  }

  hasil.classList.remove('hidden');
}

inNama.addEventListener('input', cariNama);
inNama.addEventListener('focus', cariNama);

// sumbit
function kirimIzin() {
  // 1. Honeypot anti bot
  if (document.getElementById('website').value !== '') {
    return;
  }

  // 2. Rate limit 30 detik
  const last = localStorage.getItem('lastIzin');
  if (last && Date.now() - parseInt(last) < 30000) {
    showStatus('⏳ Tunggu 30 detik sebelum kirim lagi ya', 'error');
    return;
  }

  const nama = inNama.value.trim();
  const kategori = document.getElementById('kategori').value;
  const alasan = document.getElementById('alasan').value.trim();
  const tanggal = document.getElementById('tanggal').value;

  // 3. Validasi
  if (!nama || !kategori || !alasan || !tanggal) {
    showStatus('⚠️ Lengkapi semua field ya!', 'error');
    return;
  }

  if (!daftarNama.includes(nama)) {
    showStatus('⚠️ Pilih nama dari daftar, jangan ketik manual!', 'error');
    return;
  }

  if (/[<>]/.test(alasan)) {
    showStatus('Alasan tidak boleh mengandung < >', 'error');
    return;
  }

  // 4. Loading state
  const btn = document.getElementById('btn-kirim');
  const btnText = document.getElementById('btn-text');
  const btnLoader = document.getElementById('btn-loader');

  btn.disabled = true;
  btnText.classList.add('hidden');
  btnLoader.classList.remove('hidden');

  // 5. Payload aman
  const payload = {
    token: API_SECRET,
    nama: nama.substring(0, 50),
    kategori: kategori,
    id: '-',
    keterangan: escapeHTML(alasan.substring(0, 100))
  };

  try {
    const blob = new Blob([JSON.stringify(payload)], { type: 'text/plain' });
    navigator.sendBeacon(GAS_URL, blob);
  } catch (e) {
    fetch(GAS_URL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(payload)
    });
  }

  localStorage.setItem('lastIzin', Date.now().toString());

  // 6. Success
  setTimeout(() => {
    showStatus('✅ Izin berhasil terkirim!', 'success');
    
    inNama.value = '';
    document.getElementById('alasan').value = '';
    document.getElementById('kategori').value = '';
    document.getElementById('ph').textContent = 'Pilih kategori';
    clearBtn.classList.add('hidden');
    
    btn.disabled = false;
    btnText.classList.remove('hidden');
    btnLoader.classList.add('hidden');
  }, 900);
}

// --- Status ---
function showStatus(msg, type) {
  const el = document.getElementById('status');
  el.textContent = msg;
  el.className = 'status ' + (type === 'success' ? 'success' : 'error');
  el.classList.remove('hidden');

  if (type === 'success') {
    setTimeout(() => el.classList.add('hidden'), 5000);
  }
}

// --- Close dropdown kalau klik luar ---
document.addEventListener('click', (e) => {
  if (!e.target.closest('.custom-select')) {
    document.getElementById('select-options')?.classList.add('hidden');
    document.getElementById('select-trigger')?.classList.remove('active');
  }
  
  if (!e.target.closest('#nama') && 
      !e.target.closest('#hasilNama') && 
      !e.target.closest('#clearNama')) {
    hasil.classList.add('hidden');
  }
});