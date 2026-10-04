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

function cal() {
  let h = WD.map(d => `<i class="wd">${d}</i>`).join('');
  const first = new Date(2026, 9, 1).getDay();
  for (let i = 0; i < first; i++) h += `<button class="day mute" disabled>${27 + i}</button>`;
  for (let d = 1; d <= 31; d++) {
    const has = tasks.some(t => !t.done && (t.day === d || t.start === d));
    h += `<button class="day ${d === S.sel ? 'sel' : ''} ${has ? 'has' : ''}" data-d="${d}">${d}</button>`;
  }
  return `<div class="cal">${h}</div>`;
}

const timerCard = () => `<div class="tcard"><span class="sub" style="padding:0">Timer belajar</span>
  <div class="ring js-timer">${fmt(S.secs)}</div>
  <div class="row" style="padding:0"><button class="btn" data-act="start">Mulai</button>
  <button class="btn sec" data-act="pause">Pause</button><button class="btn sec" data-act="reset">Reset</button></div></div>
  <p class="hint">Fokus 25 menit, lalu istirahat 5 menit.</p>`;

const alarmCard = (a, i, ctl) => `<div class="acard ${a.on ? '' : 'off'}"><div><b>${a.time}</b><div class="sub" style="padding:0">${a.label}</div></div>
  ${ctl ? `<button class="tg ${a.on ? 'on' : ''}" data-act="tg" data-i="${i}" aria-label="Aktifkan alarm"></button>` : ''}</div>`;

//Render
function topbar() {
  const v = S.view, hm = n => `<span class="ic hm">${ic(n)}</span>`;
  const todayTxt = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  let title, sub = '', left = '', right = '', addBtn = true;
  switch (v) {
    case 'today': title = 'Hari ini'; sub = todayTxt; break;
    case 'learning': title = '📖 Learning'; sub = active('Learning') + ' tugas aktif'; left = hm('menu'); right = hm('search') + hm('bell') + hm('more'); break;
    case 'personal': title = '🏠 Personal'; sub = active('Personal') + ' tugas aktif'; right = hm('search') + hm('bell') + hm('more'); break;
    case 'calendar': title = 'Kalender'; sub = 'Pilih tanggal untuk melihat tugas'; right = hm('search') + hm('bell'); break;
    case 'clock': title = 'Jam'; sub = 'Alarm dan timer belajar'; right = hm('bell') + hm('more'); addBtn = false; break;
    case 'detail': title = 'Detail Tugas'; left = `<button class="ic" data-go="${S.back}" aria-label="Kembali">${ic('back')}</button>`;
      right = `<button class="ic del" data-act="delT" aria-label="Hapus tugas">${ic('trash')}</button>` + hm('more'); addBtn = false; break;
  }
  $('top').innerHTML = `${left}<div class="tt"><h1>${title}</h1><p class="dk-sub">${sub}</p></div>${right}
    ${addBtn ? '<button class="btn dk" data-act="open">+ Tambah Tugas</button>' : ''}`;
}

function view() {
  let h = '';
  $('view').className = 'v-' + S.view + ' v-' + S.tab;
  switch (S.view) {
    case 'today':
      h = `<div class="cols">
          <div><h3>📖 Learning <small>${active('Learning')} tugas aktif</small></h3>${list(tasks.filter(t => t.cat === 'Learning'))}</div>
          <div><h3>🏠 Personal <small>${active('Personal')} tugas aktif</small></h3>${list(tasks.filter(t => t.cat === 'Personal'))}</div>
        </div>`;
      break;
    case 'learning':
    case 'personal': {
      const cat = S.view === 'learning' ? 'Learning' : 'Personal';
      h = `<div class="tabs">
          <button class="chip ${cat === 'Learning' ? 'on' : ''}" data-go="learning">📖 Learning</button>
          <button class="chip ${cat === 'Personal' ? 'on' : ''}" data-go="personal">🏠 Personal</button></div>
        <p class="sub mcount">${active(cat)} tugas aktif</p>${list(tasks.filter(t => t.cat === cat))}`;
      break;
    }
    case 'calendar': {
      const day = dayTasks();
      h = `<div class="calcard">${monthHead()}${cal()}</div>
        <div class="mday"><div class="dh"><h3>${dateLong(S.sel)}</h3><small>${day.length} tugas</small></div>${list(day, 'cal')}</div>`;
      break;
    }
    case 'clock':
      h = `<div class="seg"><button class="${S.tab === 'alarm' ? 'on' : ''}" data-act="tab-alarm">Alarm</button>
          <button class="${S.tab === 'timer' ? 'on' : ''}" data-act="tab-timer">Timer</button></div>
        <section class="blk-alarm">
          <div class="clock"><div class="big js-clock"></div><p class="js-date"></p></div>
          <h3>Alarm berikutnya</h3>${alarms.map((a, i) => alarmCard(a, i, true)).join('')}
          <div class="pad"><button class="btn addAl" data-act="addAlarm">+ Tambah Alarm</button></div>
        </section>
        <section class="blk-timer">${timerCard()}</section>`;
      break;
    case 'detail': {
      const t = tasks.find(x => x.id === S.cur);
      if (!t) { h = '<p class="empty">Tugas tidak ditemukan.</p>'; break; }
      const full = t.day ? `${t.day} Oktober 2026` : t.due, dn = t.check.filter(c => c.d).length;
      h = `<h2 class="dt">${t.title}</h2>
        <div class="pad" style="margin-bottom:12px"><span class="badge">${t.cat} • ${t.sub || 'Personal'}</span></div>
        <div class="info"><div class="box"><small>Deadline</small><b>${full}</b></div>
        <div class="box"><small>Status</small><b>${t.done ? 'Selesai' : 'Belum selesai'}</b></div></div>
        <div class="dh"><h3>Checklist</h3><small>${dn}/${t.check.length}</small></div>
        <div class="box">${t.check.length ? t.check.map((c, i) => `<label class="chk"><input type="checkbox" data-i="${i}" ${c.d ? 'checked' : ''}>${c.t}</label>`).join('') : '<p class="empty" style="padding:8px">Belum ada checklist.</p>'}</div>
        <h3>Catatan</h3><div class="box"><textarea id="note" placeholder="Tulis catatan...">${t.note}</textarea></div>
        <div class="row act"><button class="btn sec" data-act="save">Simpan perubahan</button>
        <button class="btn" data-act="begin">Mulai tugas</button></div>`;
      break;
    }
  }
  $('view').innerHTML = h;
}

function nav() {
  const items = [['today','calcheck','Hari ini'],['learning','book','Learning'],['personal','home','Personal'],
                 ['calendar','cal','Kalender'],['clock','clock','Jam']];
  let s = `<div class="logo"><span>${ic('tasks', 18)}</span> MyTodo</div>`;
  items.forEach(([v, i, l]) => {
    const n = v === 'learning' ? active('Learning') : v === 'personal' ? active('Personal') : '';
    s += `<button data-go="${v}" class="${S.view === v ? 'on' : ''}">${ic(i, 20)}<span style="flex:1">${l}</span><small>${n}</small></button>`;
  });
  s += `<span class="sp"></span><button>${ic('sliders', 20)}<span>Pengaturan</span></button>`;
  $('sideNav').innerHTML = s;
  const tv = ['learning', 'personal', 'detail', 'today'];
  const b = [['learning','tasks','Tugas'],['calendar','cal','Kalender'],['clock','clock','Jam'],['personal','grid','Lainnya']];
  $('bottomNav').innerHTML = b.map(([v, i, l]) => {
    const on = v === 'learning' ? tv.includes(S.view) && S.view !== 'personal' : v === 'personal' ? false : S.view === v;
    return `<button data-go="${v}" class="${on ? 'on' : ''}">${ic(i)}<span>${l}</span></button>`;
  }).join('');
}

function right() {
  const a = alarms.find(x => x.on);
  if (S.view === 'calendar') {
    const day = dayTasks();
    $('right').innerHTML = `<h2 class="rh">${dateLong(S.sel)}</h2><small class="sub" style="padding:0">${day.length} tugas</small>
      ${list(day, 'cal')}<span class="sp"></span><button class="btn block" data-act="open">+ Tambah Tugas</button>`;
  } else if (S.view === 'clock') {
    $('right').innerHTML = `<h2 class="rh">Timer belajar</h2>${timerCard()}`;
  } else {
    $('right').innerHTML = `${monthHead()}${cal()}
      <div><h4>Jam</h4><div class="mini"><div class="big js-clock"></div><p class="js-date"></p></div></div>
      <div><h4>Alarm berikutnya</h4>${a ? alarmCard(a, 0, true) : '<p class="sub" style="padding:0">Tidak ada alarm aktif</p>'}</div>
      <div><h4>Timer belajar</h4><div class="acard"><div><b class="js-timer">${fmt(S.secs)}</b><div class="sub" style="padding:0">Fokus belajar</div></div>
        <button class="btn" data-act="start">Mulai</button></div></div>`;
  }
}

function render() {
  topbar(); view(); nav(); right(); tick(true);
  $('searchForm').hidden = !['today', 'learning', 'personal', 'calendar'].includes(S.view);
}
const go = v => { if (v === 'detail') S.back = S.view; S.view = v; render(); scrollTo(0, 0); };

// Jam, timer, alarm 
function beep() {
  try {
    const c = new (window.AudioContext || window.webkitAudioContext)(), o = c.createOscillator();
    o.connect(c.destination); o.frequency.value = 880; o.start();
    setTimeout(() => { o.stop(); c.close(); }, 900);
  } catch (e) {}
}
function tick(draw) {
  const n = new Date(), hm = n.toTimeString().slice(0, 5);
  document.querySelectorAll('.js-clock').forEach(e => e.textContent = hm);
  document.querySelectorAll('.js-date').forEach(e => e.textContent =
    n.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^(\S+) /, '$1, '));
  document.querySelectorAll('.js-timer').forEach(e => e.textContent = fmt(S.secs));
  if (draw) return;
  if (S.run) {
    if (S.secs > 0) S.secs--;
    if (S.secs === 0) { S.run = false; beep(); setTimeout(() => alert('Timer belajar selesai!'), 50); }
  }
  alarms.forEach(a => {
    if (a.on && a.time === hm && S.fired !== hm + a.label) {
      S.fired = hm + a.label; beep(); setTimeout(() => alert('⏰ ' + a.label + ' (' + a.time + ')'), 50);
    }
  });
}
setInterval(() => tick(false), 1000);

//Tambah tugas
function addTask() {
  const title = $('fTitle').value.trim();
  if (!title) { $('fTitle').focus(); return; }
  const dt = new Date($('fDate').value + 'T00:00'), cat = $('fCat').value;
  const inOkt = dt.getMonth() === 9 && dt.getFullYear() === 2026;
  tasks.push(mk(nextId++, title, cat, cat === 'Learning' ? 'Umum' : '', dt.getDate() + ' ' + MON[dt.getMonth()], inOkt ? dt.getDate() : 0));
  $('modal').classList.remove('open');
  if (!['today', 'calendar'].includes(S.view)) S.view = cat.toLowerCase();
  render();
}

// Event handling
document.addEventListener('click', e => {
  const g = e.target.closest('[data-go]');
  if (g) return go(g.dataset.go);
  const tk = e.target.closest('.task');
  if (tk && e.target.closest('.b')) { S.cur = +tk.dataset.id; return go('detail'); }
  const d = e.target.closest('[data-d]');
  if (d) { S.sel = +d.dataset.d; S.view = 'calendar'; return render(); }
  const a = e.target.closest('[data-act]');
  if (!a) return;
  const act = a.dataset.act;
  if (act === 'open') { $('taskForm').reset(); $('modal').classList.add('open'); $('fTitle').focus(); }
  else if (act === 'close') $('modal').classList.remove('open');
  else if (act === 'delT') { tasks = tasks.filter(t => t.id !== S.cur); go(S.back); }
  else if (act === 'tab-alarm') { S.tab = 'alarm'; render(); }
  else if (act === 'tab-timer') { S.tab = 'timer'; render(); }
  else if (act === 'start') { S.run = true; if (S.secs === 0) S.secs = 1500; }
  else if (act === 'pause') S.run = false;
  else if (act === 'reset') { S.run = false; S.secs = 1500; tick(true); }
  else if (act === 'tg') { alarms[+a.dataset.i].on = !alarms[+a.dataset.i].on; render(); }
  else if (act === 'addAlarm') {
    const time = prompt('Jam alarm (format 24 jam, contoh 06:30):', '06:30');
    if (!time) return;
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return alert('Format jam salah. Contoh: 06:30');
    alarms.push({ time, label: prompt('Nama alarm:', 'Alarm baru') || 'Alarm', on: true });
    alarms.sort((x, y) => x.time.localeCompare(y.time));
    render();
  }
  else if (act === 'save') {
    tasks.find(t => t.id === S.cur).note = $('note').value;
    a.textContent = 'Tersimpan ✓'; setTimeout(() => a.textContent = 'Simpan perubahan', 1200);
  }
  else if (act === 'begin') { S.tab = 'timer'; S.run = true; go('clock'); }
});

document.addEventListener('change', e => {
  const t = e.target;
  if (t.type !== 'checkbox') return;
  const tk = t.closest('.task');
  if (tk) { tasks.find(x => x.id == tk.dataset.id).done = t.checked; render(); }
  else if (t.dataset.i !== undefined) { tasks.find(x => x.id === S.cur).check[+t.dataset.i].d = t.checked; render(); }
});
$('q').addEventListener('input', e => { S.q = e.target.value.trim().toLowerCase(); view(); });
$('taskForm').addEventListener('submit', e => { e.preventDefault(); addTask(); });
$('modal').addEventListener('click', e => { if (e.target === $('modal')) $('modal').classList.remove('open'); });

render();
