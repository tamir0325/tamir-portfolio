/*
 * app.js — консолын интерфэйс.
 * Хэрэглэгчийн бичсэн query-г SQL.execute()-д өгч, буцаж ирсэн үр дүнг дэлгэцэнд зурна.
 */
(() => {
  const $ = (s) => document.querySelector(s);
  const output = $('#output');
  const input = $('#query');
  const form = $('#prompt');

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const history = [];
  let historyIndex = 0;
  let typing = false;

  // Хадгалсан query-ууд (зүүн самбар)
  const SAVED = [
    { label: 'Миний тухай', q: 'SELECT * FROM about;' },
    { label: 'Шилдэг ур чадвар', q: 'SELECT name, category, level FROM skills WHERE level >= 80 ORDER BY level DESC;' },
    { label: 'Бүх бүтээл', q: 'SELECT * FROM projects ORDER BY year DESC;' },
    { label: 'Холбогдох', q: 'SELECT * FROM contact;' },
    { label: 'Тусламж', q: 'HELP;' },
  ];

  const KEYWORDS = ['SELECT', 'FROM', 'WHERE', 'ORDER', 'BY', 'LIMIT', 'ASC', 'DESC', 'LIKE', 'SHOW', 'TABLES', 'HELP', 'CLEAR', 'THEME', 'DESCRIBE'];

  // ---------- Туслах функцүүд ----------
  const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Query-г өнгөөр ялгаж харуулна (syntax highlighting)
  function highlight(q) {
    return q
      .split(/('[^']*'?|"[^"]*"?|\b\d+\b|\b\w+\b)/)
      .map((tok) => {
        if (/^['"]/.test(tok)) return `<span class="str">${escapeHtml(tok)}</span>`;
        if (/^\d+$/.test(tok)) return `<span class="num">${tok}</span>`;
        if (KEYWORDS.includes(tok.toUpperCase())) return `<span class="kw">${escapeHtml(tok)}</span>`;
        return escapeHtml(tok);
      })
      .join('');
  }

  // Нэг нүдний утгыг баганаас нь хамааруулж зурна
  function formatCell(col, value, row) {
    if (col === 'level') {
      return `<div class="bar"><div class="bar-track"><div class="bar-fill" style="width:${value}%"></div></div><span class="num">${value}</span></div>`;
    }
    if (Array.isArray(value)) return value.map((v) => `<span class="chip">${escapeHtml(v)}</span>`).join('');
    if (col === 'handle' && row.__url) {
      return `<a href="${escapeHtml(row.__url)}" target="_blank" rel="noopener">${escapeHtml(value)}</a>`;
    }
    if (col === 'url' || col === 'link') {
      return `<a href="${escapeHtml(value)}" target="_blank" rel="noopener">${escapeHtml(value.replace(/^(https?:\/\/|mailto:)/, ''))}</a>`;
    }
    if (col === 'table_name') return `<a data-q="SELECT * FROM ${value};">${value}</a>`;
    if (typeof value === 'number') return `<span class="num">${value}</span>`;
    return escapeHtml(value);
  }

  // ---------- Үр дүн зурах ----------
  function renderGrid({ cols, rows }) {
    const head = cols.map((c) => `<th>${escapeHtml(c)}</th>`).join('');
    const body = rows
      .map((r) => `<tr>${cols.map((c) => `<td>${formatCell(c, r[c], r)}</td>`).join('')}</tr>`)
      .join('');
    return `<div class="grid-wrap"><table class="grid"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
  }

  // Нэг мөртэй үр дүнг "түлхүүр: утга" хэлбэрээр
  function renderKeyValue({ cols, rows }) {
    const r = rows[0];
    return `<dl class="kv">${cols.map((c) => `<dt>${escapeHtml(c)}</dt><dd>${formatCell(c, r[c], r)}</dd>`).join('')}</dl>`;
  }

  // about хүснэгт (field/value) ч мөн түлхүүр: утга
  function renderFieldValue({ rows }) {
    return `<dl class="kv">${rows.map((r) => `<dt>${escapeHtml(r.field)}</dt><dd>${escapeHtml(r.value)}</dd>`).join('')}</dl>`;
  }

  // projects-ийг карт хэлбэрээр. Зөвхөн SELECT хийсэн багануудыг л харуулна.
  function renderCards({ cols, rows }) {
    const has = (c) => cols.includes(c);
    const cards = rows.map((p) => `
      <article class="card">
        ${has('image') ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title || 'Бүтээл')}" loading="lazy">` : ''}
        <div class="card-body">
          ${has('id') || has('year') || has('type') ? `<div class="card-id">${[has('id') && '#' + p.id, has('year') && p.year, has('type') && p.type].filter(Boolean).join(' · ')}</div>` : ''}
          ${has('title') ? `<h3>${escapeHtml(p.title)}</h3>` : ''}
          ${has('description') ? `<p>${escapeHtml(p.description)}</p>` : ''}
          ${has('stack') ? `<div>${formatCell('stack', p.stack)}</div>` : ''}
          ${has('link') ? `<a class="card-link" href="${escapeHtml(p.link)}" target="_blank" rel="noopener">${p.link.includes('github.com') ? '→ GitHub' : '→ Live сайт үзэх'}</a>` : ''}
        </div>
      </article>`).join('');
    return `<div class="cards">${cards}</div>`;
  }

  function renderRows(res, ms) {
    if (res.rows.length === 0) return `<div class="muted">no rows selected</div>`;

    let html;
    if (res.table === 'projects' && res.cols.includes('title')) html = renderCards(res);
    else if (res.table === 'about' && res.cols.join() === 'field,value') html = renderFieldValue(res);
    else if (res.rows.length === 1 && res.cols.length > 1) html = renderKeyValue(res);
    else html = renderGrid(res);

    const n = res.rows.length;
    return `${html}<div class="meta">${n} мөр сонгогдлоо (${ms} сек)</div>`;
  }

  function renderHelp() {
    const ex = [
      ['SELECT * FROM about;', 'Миний тухай'],
      ['SELECT * FROM skills ORDER BY level DESC;', 'Ур чадварууд'],
      ["SELECT * FROM skills WHERE category = 'data';", 'Шүүлтүүртэй'],
      ['SELECT title, stack FROM projects;', 'Сонгосон баганууд'],
      ["SELECT * FROM projects WHERE stack LIKE '%React%';", 'LIKE хайлт'],
      ['SELECT * FROM contact;', 'Холбоо барих'],
      ['SHOW TABLES;', 'Бүх хүснэгт'],
      ['DESC projects;', 'Хүснэгтийн бүтэц'],
      ['THEME;', 'Гэрэл/харанхуй горим'],
      ['CLEAR;', 'Дэлгэц цэвэрлэх'],
    ];
    return `<div class="help-grid">${ex.map(([q, d]) => `<a data-q="${escapeHtml(q)}">${escapeHtml(q)}</a><span>${d}</span>`).join('')}</div>
      <div class="meta">Дээрх query дээр дарахад шууд ажиллана. Нуугдмал команд ч бий... 🤫</div>`;
  }

  // ---------- Гол урсгал ----------
  function addEntry(q) {
    const el = document.createElement('div');
    el.className = 'entry';
    el.innerHTML = `<div class="q"><span class="ps">SQL&gt;</span> ${highlight(q)}</div><div class="res"></div>`;
    output.appendChild(el);
    return el;
  }

  function run(q) {
    const t0 = performance.now();
    const res = SQL.execute(q, DB);
    const ms = ((performance.now() - t0) / 1000 + 0.001).toFixed(3);

    if (res.type === 'clear') {
      output.innerHTML = '';
      return;
    }

    const el = addEntry(q);
    const box = el.querySelector('.res');

    switch (res.type) {
      case 'rows': box.innerHTML = renderRows(res, ms); break;
      case 'error': box.innerHTML = `<div class="err"><b>${escapeHtml(res.code)}:</b> ${escapeHtml(res.msg)}</div>`; break;
      case 'text': box.innerHTML = res.html; break;
      case 'help': box.innerHTML = renderHelp(); break;
      case 'theme':
        setTheme(res.value || (document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
        box.innerHTML = `<div class="muted">Горим: ${document.documentElement.dataset.theme}</div>`;
        break;
      case 'hire':
        box.innerHTML = `<div class="hired">✔ 1 row inserted into job_offers.</div>
          <div>Баярлалаа! 🎉 Дэлгэрэнгүйг ярилцъя → <a data-q="SELECT * FROM contact;">SELECT * FROM contact;</a></div>`;
        confetti();
        break;
    }

    // Шинэ үр дүнгийн эхэнд гүйлгэнэ
    output.scrollTop = el.offsetTop - 8;
  }

  function submit(q) {
    q = q.trim();
    if (!q) return;
    history.push(q);
    historyIndex = history.length;
    input.value = '';
    run(q);
  }

  // Query-г үсэг үсгээр бичиж харуулаад ажиллуулна
  async function typeAndRun(q) {
    if (typing) return;
    typing = true;
    input.value = '';
    if (!reducedMotion) {
      for (const ch of q) {
        input.value += ch;
        await sleep(12 + Math.random() * 18);
      }
      await sleep(150);
    }
    typing = false;
    submit(q);
  }

  // ---------- Тема ----------
  function setTheme(t) {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('theme', t); } catch (e) { /* storage хаалттай байж болно */ }
  }

  // ---------- Confetti (HIRE TAMIR) ----------
  function confetti() {
    if (reducedMotion) return;
    const colors = ['#f2b134', '#5ec2a8', '#ff7a6b', '#7cb6ff'];
    for (let i = 0; i < 60; i++) {
      const c = document.createElement('span');
      c.className = 'confetti';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = colors[i % colors.length];
      c.style.animationDuration = 1.6 + Math.random() * 1.6 + 's';
      c.style.animationDelay = Math.random() * 0.4 + 's';
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 4000);
    }
  }

  // ---------- Tab-аар нөхөх ----------
  function autocomplete() {
    const m = input.value.match(/(\w*)$/);
    const prefix = m[1].toLowerCase();
    if (!prefix) return;
    const words = [...KEYWORDS, ...Object.keys(DB)];
    const hit = words.find((w) => w.toLowerCase().startsWith(prefix) && w.toLowerCase() !== prefix);
    if (hit) input.value = input.value.slice(0, -prefix.length) + hit + ' ';
  }

  // ---------- Эвентүүд ----------
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!typing) submit(input.value);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && history.length) {
      e.preventDefault();
      historyIndex = Math.max(0, historyIndex - 1);
      input.value = history[historyIndex];
    } else if (e.key === 'ArrowDown' && history.length) {
      e.preventDefault();
      historyIndex = Math.min(history.length, historyIndex + 1);
      input.value = history[historyIndex] || '';
    } else if (e.key === 'Tab') {
      e.preventDefault();
      autocomplete();
    }
  });

  // Үр дүн доторх [data-q] холбоос дээр дарахад тэр query-г ажиллуулна
  output.addEventListener('click', (e) => {
    const a = e.target.closest('[data-q]');
    if (a) typeAndRun(a.dataset.q);
  });

  $('#themeBtn').addEventListener('click', () => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });

  // ---------- Зүүн самбар ----------
  const tableIcon = '<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="12" height="10" rx="1.5"/><path d="M2 7h12M6 7v6"/></svg>';
  const queryIcon = '<span class="ico">▸</span>';

  $('#tableList').innerHTML = Object.keys(DB)
    .map((t) => `<li><button type="button" data-q="SELECT * FROM ${t};">${tableIcon}${t}<span class="count">${DB[t].length}</span></button></li>`)
    .join('');
  $('#savedList').innerHTML = SAVED
    .map((s) => `<li><button type="button" data-q="${escapeHtml(s.q)}">${queryIcon}${s.label}</button></li>`)
    .join('');
  document.querySelector('.schema').addEventListener('click', (e) => {
    const b = e.target.closest('[data-q]');
    if (b) typeAndRun(b.dataset.q);
  });

  // ---------- Цаг (Улаанбаатар) ----------
  const clock = $('#clock');
  const tick = () => {
    clock.textContent = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Ulaanbaatar', hour: '2-digit', minute: '2-digit' }) + ' UB';
  };
  tick();
  setInterval(tick, 30000);

  // ---------- Эхлэл ----------
  try {
    const saved = localStorage.getItem('theme');
    if (saved) setTheme(saved);
  } catch (e) { /* ignore */ }

  output.innerHTML = `<div class="entry muted">tamir.db v1.0 — Oracle маягийн SQL консол.<br>
    Эхлэх бол <a data-q="HELP;">HELP;</a> гэж бичих эсвэл зүүн талаас сонгоорой.</div>`;

  setTimeout(() => typeAndRun('SHOW TABLES;'), 700);
})();
