const MON = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const WD = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];

//Ikon gaya Lucide
const IC = {
  menu:'<path d="M4 12h16M4 6h16M4 18h16"/>', search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  more:'<circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>',
  back:'<path d="m15 18-6-6 6-6"/>', next:'<path d="m9 18 6-6-6-6"/>',
  trash:'<path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  cal:'<path d="M8 2v4M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  calcheck:'<path d="M8 2v4M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/>',
  clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  tasks:'<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8M13 12h8M13 18h8"/>',
  grid:'<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
  book:'<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  home:'<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  sliders:'<path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4"/>'
};
const ic = (n, s = 24) => `<svg class="i" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IC[n]}</svg>`;

//Data array of objects
const mk = (id, title, cat, sub, due, day, start) =>
  ({ id, title, cat, sub, due, day, start: start || 0, done: false, note: '', check: [] });
let tasks = [
  mk(1, 'Projek individu pemweb', 'Learning', 'Pemrograman Web', '5 Okt', 5, 1),
  mk(2, 'Telaah kurikulum SMP', 'Learning', 'Telaah Kurikulum', '6 Okt', 6),
  mk(3, 'Laprak jarkomdat', 'Learning', 'Jaringan & Komunikasi Data', '9 Okt', 9),
  mk(4, 'Resume lahan basah', 'Learning', 'Lahan Basah', '6 Okt', 6),
  mk(5, 'Menyalin code mata kuliah desain', 'Learning', 'Desain & Analisis Algoritma', '5 Okt', 5),
  mk(6, 'Laprak pemweb 5', 'Learning', 'Pemrograman Web', '8 Okt', 8),
  mk(7, 'Beresin kamar', 'Personal', '', 'Hari ini', 1),
  mk(8, 'Cuci pakaian', 'Personal', '', 'Hari ini', 1),
  mk(9, 'Belanja kebutuhan', 'Personal', '', '3 Okt', 3),
  mk(10, 'Rapikan meja belajar', 'Personal', '', '4 Okt', 4)
];
tasks[0].note = 'Kerjakan proyek individu Pemrograman Web sesuai ketentuan tugas.';
tasks[0].check = ['Buat struktur HTML','Rapikan CSS','Tambahkan JavaScript','Tes halaman','Buat responsive design']
  .map(t => ({ t, d: false }));
let alarms = [{ time: '07:00', label: 'Kuliah pagi', on: true }];
const S = { view: innerWidth >= 1024 ? 'today' : 'learning', back: 'learning', sel: 1, cur: 1,
            tab: 'alarm', secs: 1500, run: false, fired: '', q: '' };
let nextId = 11;
const $ = id => document.getElementById(id);

// Helper 
const active = cat => tasks.filter(t => t.cat === cat && !t.done).length;
const fmt = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
const dateLong = d => new Date(2026, 9, d)
  .toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^(\S+) /, '$1, ');
const dayTasks = () => tasks.filter(t => t.day === S.sel || t.start === S.sel);

const card = (t, mode) => `
  <article class="task ${t.done ? 'done' : ''}" data-id="${t.id}">
    <input type="checkbox" ${t.done ? 'checked' : ''} aria-label="Tandai selesai">
    <div class="b"><b>${t.title}</b>
      <div class="meta"><span>${t.cat === 'Personal' ? 'Personal' : mode === 'cal' ? 'Learning • ' + t.sub : t.sub}</span>
        <span class="due">${ic('cal', 12)}${t.due}</span></div>
    </div>
  </article>`;

const list = (arr0, mode) => {
  const arr = arr0.filter(t => t.title.toLowerCase().includes(S.q));
  return arr.length ? `<div class="list">${arr.map(t => card(t, mode)).join('')}</div>`
    : `<p class="empty">${S.q ? 'Tidak ada tugas yang cocok.' : 'Belum ada tugas. Tekan + untuk menambah.'}</p>`;
};

const monthHead = () => `<div class="mh"><button class="ic" aria-label="Bulan sebelumnya">${ic('back', 20)}</button>
  <b>Oktober 2026</b><button class="ic" aria-label="Bulan berikutnya">${ic('next', 20)}</button></div>`;
