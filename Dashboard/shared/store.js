/* PanaboOne shared data + UI helpers (localStorage based) */
const PO = (() => {
  const U = (() => { try { const b = new URLSearchParams(location.search).get('b'); if (b) return b.toLowerCase(); return localStorage.getItem('po_session') || localStorage.getItem('po_last') || ''; } catch (e) { return ''; } })();
  const ACC = (() => { try { return (JSON.parse(localStorage.getItem('po_accounts')) || {})[U] || null; } catch (e) { return null; } })();
  const KEY = U ? 'panaboone_v1_' + U : 'panaboone_v1';
  const FONTS = {'Inter':'Inter (Modern & Clean)','Poppins':'Poppins (Friendly)','Playfair Display':'Playfair Display (Elegant)','Lora':'Lora (Classic Serif)','Montserrat':'Montserrat (Bold)','Nunito':'Nunito (Rounded)','DM Sans':'DM Sans (Neutral)','Raleway':'Raleway (Stylish)','Oswald':'Oswald (Condensed)','Quicksand':'Quicksand (Playful)'};
  const COLORS = ['#6b3410','#c8642a','#5b3fd4','#2f7d4f','#b83a3a','#1f3b73'];
  /* default look: black + purple accent (Primary = black, Accent = buttons/highlights) */
  const THEME0 = {color:'#111111',accent:'#7b58eb',bg:'#ffffff',text:'#111111'};
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const uid = () => 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const fmt = n => '₱' + Number(n || 0).toLocaleString('en-PH', {maximumFractionDigits: 2});
  const slugify = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'store';
  const $ = id => document.getElementById(id);
  const dayKey = (d = new Date()) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

  function defaults() {
    const draft = {template:1,color:THEME0.color,accent:THEME0.accent,bg:THEME0.bg,text:THEME0.text,font:'Inter',logo:'',banner:'',showBanner:true,showContactBar:false,showFilters:true,
      name:"Juan's Bakery",headline:'Freshly baked, locally made.',
      sub:'Cakes, pastries, and bread baked every morning in Panabo City. Order from our shelf, or message us to reserve yours.',
      about:"Juan's Bakery is a family-owned bakery in Panabo City, serving fresh cakes, pastries and bread every day.",
      phone:'0912 345 6789',address:'Panabo City, Davao del Norte',hours:'Open Daily: 7:00 AM - 7:00 PM'};
    const seed = [['Chocolate Cake',450,'Cakes','Rich moist chocolate cake with chocolate shavings.'],['Ube Cake',420,'Cakes','Soft ube layer cake with ube buttercream.'],
      ['Cookies',150,'Pastries','Chewy chocolate chip cookies, 6 pcs.'],['Espresso Cake',380,'Cakes','Coffee-flavored layered cake with mocha frosting.'],['Pandesal',60,'Bread','Fresh pandesal, 10 pcs.']];
    const products = seed.map((s, i) => ({id:uid()+i,name:s[0],price:s[1],category:s[2],description:s[3],image:'',available:true,status:'visible',type:'product',stock:20,created:Date.now()-i}));
    if (ACC) { Object.assign(draft, {name: ACC.business, headline: 'Welcome to ' + ACC.business, sub: 'Browse our products and contact us to order.', about: ACC.business + ' is a local business in Panabo City.', phone: '', address: 'Panabo City, Davao del Norte', hours: '', messaging: ''}); products.length = 0; }
    return {products, draft, published: JSON.parse(JSON.stringify(draft)), stats:{visits:0,views:{}}, activity:[], plan:'tier1', bizType: ACC ? (ACC.bizType || 'product') : 'product'};
  }

  let data = null;
  try { data = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
  if (!data || !data.draft) { data = defaults(); try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} }
  if (!data.published) data.published = JSON.parse(JSON.stringify(data.draft));
  if (!data.stats) data.stats = {visits:0,views:{}};
  if (!data.activity) data.activity = [];
  if (!data.bizType) data.bizType = (ACC && ACC.bizType) || 'product';
  if (!data.plan) data.plan = 'tier1';
  data.products.forEach(p => { if (!p.type) p.type = 'product'; if (p.status === 'draft') p.status = 'hidden'; });
  /* one-time: the old untouched brown default becomes the new black default */
  if (!data._bk1) { [data.draft, data.published].forEach(o => { if (o && o.color === '#6b3410' && (!o.bg || o.bg === '#fdf6ec') && (!o.text || o.text === '#3b2412')) Object.assign(o, THEME0); }); data._bk1 = 1; try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} }
  /* new customization fields (defaults) + contact bar OFF by default (one-time migration) */
  const fillT = o => { if (!o) return; o.accent = o.accent || o.color; o.bg = o.bg || THEME0.bg; o.text = o.text || THEME0.text; o.radius = o.radius || 'md'; if (o.overlay == null) o.overlay = 55; };
  fillT(data.draft); fillT(data.published);
  if (!data._cb2) { data.draft.showContactBar = false; data.published.showContactBar = false; data._cb2 = 1; try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} }
  /* business type: listings of an inactive type are only hidden, never deleted */
  const act = p => data.bizType === 'both' || data.bizType === (p.type || 'product');
  const list = () => data.products.filter(act);
  const LBL = () => ({product: {n: 'Products', one: 'Product'}, service: {n: 'Services', one: 'Service'}, both: {n: 'Listings', one: 'Listing'}})[data.bizType];
  const priceTxt = p => p.type === 'service' ? (p.price ? 'Starting at ' + fmt(p.price) : '') : fmt(p.price);   /* service price is optional */

  function save() {
    try {
      const cur = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (cur && cur.stats) data.stats = cur.stats; // keep analytics counted from the public store tab
      localStorage.setItem(KEY, JSON.stringify(data));
      return true;
    } catch (e) { toast('Browser storage is full. Use a smaller picture.', 'err'); return false; }
  }
  function track(fn, user) {
    const K = user ? 'panaboone_v1_' + user : KEY;
    try {
      const cur = JSON.parse(localStorage.getItem(K)), s = cur.stats;
      const v0 = s.visits || 0, w0 = Object.assign({}, s.views || {});
      fn(s);
      const dd = (s.daily = s.daily || {}), t = (dd[dayKey()] = dd[dayKey()] || {v: 0, w: 0, p: {}});
      t.v += (s.visits || 0) - v0;
      for (const id in (s.views || {})) { const n = s.views[id] - (w0[id] || 0); if (n > 0) { t.w += n; t.p[id] = (t.p[id] || 0) + n; } }
      localStorage.setItem(K, JSON.stringify(cur));
    } catch (e) {}
  }
  function log(type, detail) { data.activity.unshift({t: Date.now(), type, detail}); data.activity.length = Math.min(data.activity.length, 30); save(); }
  function toast(msg, type) {
    const t = document.createElement('div'); t.className = 'toast ' + (type || ''); t.textContent = msg;
    document.body.appendChild(t); setTimeout(() => t.remove(), 2400);
  }
  function img(file, max = 900, q = .82) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onerror = rej;
      r.onload = () => { const im = new Image(); im.onerror = rej; im.onload = () => {
        const k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas');
        c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', q)); };
        im.src = r.result; };
      r.readAsDataURL(file);
    });
  }
  /* video storage (IndexedDB) — videos are too large for localStorage */
  const vid = (() => {
    let db = null;
    const open = () => db ? Promise.resolve(db) : new Promise((res, rej) => { const r = indexedDB.open('panaboone_media', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('v'); r.onsuccess = () => { db = r.result; res(db); }; r.onerror = () => rej(r.error); });
    const run = (mode, f) => open().then(d => new Promise((res, rej) => { const t = d.transaction('v', mode), q = f(t.objectStore('v'));
      t.oncomplete = () => res(q && q.result); t.onerror = t.onabort = () => rej(t.error); }));
    const get = id => run('readonly', st => st.get(id));
    return {put: (id, blob) => run('readwrite', st => st.put(blob, id)), get, del: id => run('readwrite', st => st.delete(id)),
      url: async id => { try { const b = await get(id); return b ? URL.createObjectURL(b) : ''; } catch (e) { return ''; } }};
  })();
  const vcache = {};
  /* all pictures of a listing (cover first) */
  const imgsOf = p => (p.images && p.images.length) ? p.images : (p.image ? [p.image] : []);

  const loaded = {};
  function loadFont(f) {
    if (!f || loaded[f]) return; loaded[f] = 1;
    const l = document.createElement('link'); l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=' + f.replace(/ /g, '+') + ':wght@400;500;600;700&display=swap';
    document.head.appendChild(l);
  }
  const stack = f => `'${f}',system-ui,sans-serif`;

  const lum = h => { const m = /^#?([0-9a-f]{6})$/i.exec(h || ''); if (!m) return .5; const n = parseInt(m[1], 16); return (.299 * (n >> 16) + .587 * ((n >> 8) & 255) + .114 * (n & 255)) / 255; };
  const mix = (a, b, t) => { const p = h => { const n = parseInt(String(h).slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
    if (!/^#[0-9a-f]{6}$/i.test(a) || !/^#[0-9a-f]{6}$/i.test(b)) return a; const x = p(a), y = p(b);
    return '#' + x.map((v, i) => Math.round(v * (1 - t) + y[i] * t).toString(16).padStart(2, '0')).join(''); };
  const RAD = {sharp: '0px', md: '12px', soft: '24px'};
  const theme = c => { const pc = c.color || THEME0.color, ac = c.accent || pc, bg = c.bg || THEME0.bg, tx = c.text || THEME0.text, dark = lum(bg) < .45;
    return {pc, ac, bg, tx, dark, card: dark ? mix(bg, '#ffffff', .1) : '#ffffff', on: lum(pc) > .6 ? '#1b1230' : '#ffffff', oa: lum(ac) > .6 ? '#1b1230' : '#ffffff', r: RAD[c.radius] || RAD.md, ov: (c.overlay == null ? 55 : c.overlay) / 100}; };

  /* ---------- store renderer: tabs (Home/About/Contact/Location) + edit mode ---------- */
  const PAGES = [['home','Home'],['about','About'],['contact','Contact'],['location','Location']];
  const HX = /^#[0-9a-f]{6}$/i, lnk = v => /^https?:/i.test(v) ? v : 'https://' + v;
  const mapSvg = th => { const base = mix(th.bg, th.pc, .08), rd = th.card, pk = mix(th.bg, '#3a9d5d', .25), wt = mix(th.bg, '#3aa7dd', .3);
    return `<svg viewBox="0 0 800 340" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" aria-hidden="true"><rect width="800" height="340" fill="${base}"/><path d="M0 255C140 225 240 300 400 272S680 232 800 272V340H0Z" fill="${wt}"/><rect x="520" y="36" width="190" height="90" rx="14" fill="${pk}"/><g stroke="${rd}" stroke-width="14" stroke-linecap="round" fill="none"><path d="M-10 120 810 90"/><path d="M180-10 230 350"/><path d="M560-10 520 350"/></g><g stroke="${rd}" stroke-width="7" fill="none"><path d="M0 200 800 190"/><path d="M380 0 390 340"/><path d="M80 0 60 340"/><path d="M700 0 690 340"/></g><g transform="translate(372 70)"><ellipse cx="28" cy="84" rx="15" ry="5" fill="#0003"/><path d="M28 0C12.5 0 0 12.5 0 28c0 20 28 54 28 54s28-34 28-54C56 12.5 43.5 0 28 0Z" fill="${th.pc}"/><circle cx="28" cy="28" r="11" fill="#fff"/></g></svg>`; };


  /* ---------- real map + distance (Location tab) ---------- */
  const GK = 'po_geo_v1:';
  const geocode = async addr => {
    addr = (addr || '').trim(); if (!addr) return null;
    const scoped = addr + ', Panabo City, Davao del Norte, Philippines';
    const tries = /panabo/i.test(addr) ? [[addr, false]] : [[scoped, false], [addr, false]];
    tries.push(['Panabo City, Davao del Norte, Philippines', true]);
    for (const [q, approx] of tries) {
      let hit = null; try { hit = JSON.parse(localStorage.getItem(GK + q)); } catch (e) {}
      if (!hit) { try {
        const r = await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=ph&q=' + encodeURIComponent(q), {headers: {Accept: 'application/json'}});
        const j = await r.json();
        if (j && j[0]) { hit = {lat: +j[0].lat, lng: +j[0].lon}; try { localStorage.setItem(GK + q, JSON.stringify(hit)); } catch (e) {} }
      } catch (e) { return null; } }
      if (hit) return {lat: hit.lat, lng: hit.lng, approx};
    }
    return null;
  };
  const here = () => new Promise((ok, no) => {
    if (!navigator.geolocation) return no({code: 0});
    if (window.isSecureContext === false) return no({code: -1});
    navigator.geolocation.getCurrentPosition(p => ok({lat: p.coords.latitude, lng: p.coords.longitude}), no, {enableHighAccuracy: true, timeout: 15000, maximumAge: 60000});
  });
  const km = (a, b) => { const r = x => x * Math.PI / 180, h = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2; return 12742 * Math.asin(Math.sqrt(h)); };
  const fkm = x => x < 1 ? Math.round(x * 1000) + ' m' : x.toFixed(x < 10 ? 1 : 0) + ' km';
  const fmin = m => m < 60 ? Math.max(1, Math.round(m)) + ' min' : Math.floor(m / 60) + ' hr ' + Math.round(m % 60) + ' min';
  let _lf = null;
  const loadLeaflet = () => window.L && window.L.map ? Promise.resolve() : (_lf = _lf || new Promise((ok, no) => {
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css'; document.head.appendChild(l);
    const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js'; s.onload = ok; s.onerror = () => { _lf = null; no(); }; document.head.appendChild(s);
  }));
  const pinned = c => c.pinned && isFinite(parseFloat(c.lat)) && isFinite(parseFloat(c.lng)) ? {lat: +c.lat, lng: +c.lng, approx: !!c.pinApprox} : null;

  async function initMap(el, c) {
    const box = el.querySelector('#lmap'); if (!box) return;
    const out = el.querySelector('.ldist'), btn = el.querySelector('.lnear'), dir = el.querySelector('.ldir'), note = el.querySelector('.lnote');
    const q = encodeURIComponent(c.address || '');
    const fail = m => { box.innerHTML = `<div class="mapfail"><span>🗺️</span><p>${m}</p></div>`; if (btn) btn.style.display = 'none'; if (dir) dir.href = 'https://www.google.com/maps/search/?api=1&query=' + q; };
    box.innerHTML = '<div class="mapfail"><span>⏳</span><p>Loading map…</p></div>';
    const dest = pinned(c) || await geocode(c.address);
    if (!box.isConnected) return;
    if (!dest) return fail(c.address ? 'We could not find this address on the map.' : 'The store has not set an address yet.');
    try { await loadLeaflet(); } catch (e) { return fail('Map could not load. Check your internet connection.'); }
    if (!box.isConnected) return;
    const Lf = window.L; box.innerHTML = '';
    const map = Lf.map(box, {scrollWheelZoom: false, tap: false}).setView([dest.lat, dest.lng], dest.approx ? 13 : 16);
    Lf.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19, attribution: '© OpenStreetMap'}).addTo(map);
    Lf.marker([dest.lat, dest.lng], {icon: Lf.divIcon({className: 'lpinw', html: '<span class="lpin"></span>', iconSize: [34, 34], iconAnchor: [17, 34]}), title: c.name}).addTo(map);
    setTimeout(() => map.invalidateSize(), 150);
    if (dest.approx && note) note.textContent = 'Approximate pin. The store has not set the exact spot yet.';
    const base = 'https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=' + dest.lat + ',' + dest.lng;
    if (dir) dir.href = base;
    if (!btn) return;
    btn.onclick = async () => {
      const label = (a, b) => btn.innerHTML = `<span>${a}</span>${b ? `<small>${b}</small>` : ''}`;
      btn.disabled = true; label('📍 Locating you…', 'Please allow location access if asked.'); out.innerHTML = '';
      let me; try { me = await here(); } catch (e) {
        btn.disabled = false; label('📍 Show distance from me', 'See how far you are from this store. Your location is not saved.');
        out.innerHTML = `<span class="lerr">${e && e.code === 1 ? 'Location is blocked. Allow location for this site in your browser, then try again.' : e && e.code === -1 ? 'Location only works on https (or localhost).' : 'Could not get your location. Try again.'}</span>`; return; }
      if (!box.isConnected) return;
      const line = km(me, dest); let road = null;
      Lf.marker([me.lat, me.lng], {icon: Lf.divIcon({className: 'lpinw', html: '<span class="lme"></span>', iconSize: [18, 18], iconAnchor: [9, 9]}), title: 'You'}).addTo(map);
      try {
        const r = await fetch(`https://router.project-osrm.org/route/v1/driving/${me.lng},${me.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`);
        const j = await r.json(); if (j.routes && j.routes[0]) road = j.routes[0];
      } catch (e) {}
      if (!box.isConnected) return;
      if (road) { const ln = Lf.geoJSON(road.geometry, {style: {color: c.color || '#5b3fd4', weight: 5, opacity: .85}}).addTo(map); map.fitBounds(ln.getBounds(), {padding: [30, 30]}); }
      else { Lf.polyline([[me.lat, me.lng], [dest.lat, dest.lng]], {color: c.color || '#5b3fd4', weight: 4, dashArray: '8 8'}).addTo(map); map.fitBounds([[me.lat, me.lng], [dest.lat, dest.lng]], {padding: [30, 30]}); }
      out.innerHTML = road ? `<b>🚗 ${fkm(road.distance / 1000)}</b> by road · about <b>${fmin(road.duration / 60)}</b><small>${fkm(line)} in a straight line</small>`
        : `<b>${fkm(line)}</b> away (straight line)<small>Road route is not available right now.</small>`;
      if (dir) dir.href = base + '&origin=' + me.lat + ',' + me.lng;
      btn.disabled = false; label('📍 Update my location', 'Tap again if you moved.');
    };
  }

  /* ---------- PREMIUM LAYOUT (template 13): glass menu, 3D coverflow carousel, scroll-driven 3D flip tiles ---------- */
  function premium(el, c, products, edit) {
    const P = c.prem || {}, nav = el.querySelector('.nav'), hero = el.querySelector('.hero'), g = el.querySelector('.grid'), sec = el.querySelector('.sec[data-id="products"]');
    el.style.setProperty('--cols', P.cols || 3);
    const cards = g ? [...g.querySelectorAll('.pc')] : [], title = P.title || (c.name + ' / Collection'), mq = P.marquee == null ? c.name : P.marquee, undo = [];
    const items = cards.map(cd => products.find(x => x.id === cd.dataset.pid)).filter(Boolean);
    const calm = edit || P.anim === false || (window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches);
    let at = hero;
    if (mq && at) { const s = `<span>${esc(mq)}</span>`.repeat(6); at.insertAdjacentHTML('afterend', `<div class="pmq"><div class="pmt">${s}${s}</div></div>`); at = at.nextElementSibling; }
    if (P.cover !== false && items.length > 1 && at) {
      at.insertAdjacentHTML('afterend', `<section class="pcf"><div class="pcft">${esc(title)}</div><div class="pcfs">${items.map((p, i) => { const im = imgsOf(p)[0];
        return `<div class="pcc" data-i="${i}">${im ? `<img src="${im}" alt="">` : '<span class="pce"></span>'}<div class="pci"><span>${esc(p.name)}</span><b>${priceTxt(p)}</b></div></div>`; }).join('')}</div></section>`);
      const st = el.querySelector('.pcfs'), cs = [...st.children]; let cur = 0, sx = null;
      const set = n => { cur = (n + cs.length) % cs.length; cs.forEach((x, i) => { let o = i - cur; if (o > cs.length / 2) o -= cs.length; if (o < -cs.length / 2) o += cs.length;
        x.style.setProperty('--o', o); x.style.setProperty('--a', Math.abs(o)); x.classList.toggle('on', !o); x.style.visibility = Math.abs(o) > 3 ? 'hidden' : 'visible'; }); };
      set(0);
      st.onclick = e => { const x = e.target.closest('.pcc'); if (!x) return; const i = +x.dataset.i; if (i === cur) { if (cards[i]) cards[i].click(); } else set(i); };
      st.onpointerdown = e => { sx = e.clientX; }; st.onpointerup = e => { if (sx != null && Math.abs(e.clientX - sx) > 40) set(cur + (e.clientX < sx ? 1 : -1)); sx = null; };
      if (!calm) { const tm = setInterval(() => { if (!el.isConnected) return clearInterval(tm); if (!st.matches(':hover')) set(cur + 1); }, 2800); undo.push(() => clearInterval(tm)); }
    }
    const sh = sec && sec.querySelector('.sh'); if (sh) sh.insertAdjacentHTML('afterbegin', `<span class="pbig">${esc(c.name)}</span>`);
    if (P.hover !== 'zoom') cards.forEach(cd => { const p = products.find(x => x.id === cd.dataset.pid), im = p && imgsOf(p)[1], box = cd.querySelector('.im');
      if (im && box) box.insertAdjacentHTML('beforeend', `<img class="im2" src="${im}" alt="">`); });
    if (calm) el.classList.add('noanim');
    else {
      const h2 = hero && hero.querySelector('h2');
      if (h2 && !h2.querySelector('.pw')) h2.innerHTML = h2.textContent.trim().split(/\s+/).map((w, i) => `<span class="pw" style="--i:${i}"><i>${esc(w)}</i></span>`).join(' ');
      const sc = el.closest('.pvwrap') || window; let raf = 0;
      const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { const y = sc === window ? window.scrollY : sc.scrollTop;
        if (hero) hero.style.setProperty('--py', Math.min(y, 800) * .25 + 'px');
        if (P.flip !== false) { const vh = sc === window ? innerHeight : sc.clientHeight, base = sc === window ? 0 : sc.getBoundingClientRect().top;
          cards.forEach(cd => { const r = cd.getBoundingClientRect(), p = Math.max(-1.3, Math.min(1.3, (r.top + r.height / 2 - base - vh / 2) / (vh / 2)));
            cd.style.setProperty('--rx', (p * 42).toFixed(1)); cd.style.setProperty('--op', Math.max(0, 1 - Math.max(0, Math.abs(p) - .8) * 1.7).toFixed(2)); }); } }); };
      sc.addEventListener('scroll', on, {passive: true}); addEventListener('resize', on); on();
      undo.push(() => { sc.removeEventListener('scroll', on); removeEventListener('resize', on); cancelAnimationFrame(raf); });
    }
    el._pcl = () => undo.forEach(f => f());
  }

  /* ---------- PREMIUM PRO layouts: 14 Neon Noir, 15 Film Strip, 16 Orbit ---------- */
  function premiumX(el, c, products, edit) {
    const P = c.prem || {}, t = +c.template, hero = el.querySelector('.hero'), sec = el.querySelector('.sec[data-id="products"]'), cards = [...el.querySelectorAll('.grid .pc')], undo = [];
    const items = cards.map(cd => products.find(x => x.id === cd.dataset.pid)).filter(Boolean), title = P.title || (c.name + ' / Collection');
    const calm = edit || P.anim === false || (window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches);
    const sc = el.closest('.pvwrap') || window, VH = () => sc === window ? innerHeight : sc.clientHeight, TOP = () => sc === window ? 0 : sc.getBoundingClientRect().top;
    const h2 = hero && hero.querySelector('h2');
    if (calm) el.classList.add('noanim');
    const frame = f => { let raf = 0; const run = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(f); };
      sc.addEventListener('scroll', run, {passive: true}); addEventListener('resize', run); run();
      undo.push(() => { sc.removeEventListener('scroll', run); removeEventListener('resize', run); cancelAnimationFrame(raf); }); };
    const card = (p, i, cls) => { const im = imgsOf(p)[0]; return `<div class="${cls}" data-pid="${p.id}">${im ? `<img src="${im}" alt="">` : '<span class="pce"></span>'}<em class="pnum">${String(i + 1).padStart(2, '0')}</em><div class="pci"><span>${esc(p.name)}</span><b>${priceTxt(p)}</b></div></div>`; };
    if (t === 14) {   /* NEON NOIR: scrambling headline, aurora, cursor spotlight, 3D tilt cards */
      if (h2 && !calm) { const tx = h2.textContent.trim(); let f = 0; const tm = setInterval(() => { h2.textContent = [...tx].map((ch, i) => ch === ' ' || i < f ? ch : '▒░#@$%&*+=?'[Math.random() * 11 | 0]).join(''); f += .7; if (f >= tx.length) { clearInterval(tm); h2.textContent = tx; } }, 40); undo.push(() => clearInterval(tm)); }
      if (!calm) { cards.forEach(cd => { cd.onpointermove = e => { const r = cd.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          cd.style.transform = `perspective(700px) rotateY(${(x - .5) * 18}deg) rotateX(${(.5 - y) * 18}deg) translateZ(10px)`; cd.style.setProperty('--mx', x * 100 + '%'); cd.style.setProperty('--my', y * 100 + '%'); };
          cd.onpointerleave = () => { cd.style.transform = ''; }; });
        if (sec) sec.onpointermove = e => { const r = sec.getBoundingClientRect(); sec.style.setProperty('--sx', e.clientX - r.left + 'px'); sec.style.setProperty('--sy', e.clientY - r.top + 'px'); }; }
    }
    if (t === 15 && hero && items.length) {   /* FILM STRIP: scroll pins the page and slides products sideways */
      hero.insertAdjacentHTML('afterend', `<section class="phs" data-id="products"><div class="phst"><div class="phsb">${esc(c.name)}</div><div class="phsr">${items.map((p, i) => card(p, i, 'phc')).join('')}</div><div class="phsp"><i></i></div></div></section>`);
      const S = el.querySelector('.phs'), st = S.firstChild, tr = S.querySelector('.phsr'), bg = S.querySelector('.phsb'), bar = S.querySelector('.phsp i'), cs = [...tr.children];
      if (!calm) frame(() => { const vh = VH(), vw = st.clientWidth, L = st.getBoundingClientRect().left, over = Math.max(0, tr.scrollWidth - vw + vw * .08);
        S.style.height = vh + over + 'px'; st.style.height = vh + 'px';
        const p = Math.max(0, Math.min(1, -(S.getBoundingClientRect().top - TOP()) / Math.max(1, over)));
        tr.style.transform = `translateX(${-p * over}px)`; bg.style.transform = `translateX(${-p * 30}%)`; bar.style.transform = `scaleX(${p})`;
        cs.forEach(x => { const r = x.getBoundingClientRect(), d = (r.left + r.width / 2 - L - vw / 2) / vw; x.style.setProperty('--px', d.toFixed(3)); x.style.setProperty('--s', (1 - Math.min(.18, Math.abs(d) * .25)).toFixed(3)); }); });
    }
    if (t === 16 && hero && items.length) {   /* ORBIT: products on a 3D ring, drag to spin, live name + price */
      const k = Math.ceil(7 / items.length), list = Array.from({length: items.length * k}, (_, i) => items[i % items.length]), n = list.length;
      hero.insertAdjacentHTML('afterend', `<section class="por" data-id="products"><div class="porb">${esc(c.name)}</div><div class="pors"><div class="porr">${list.map((p, i) => card(p, i % items.length, 'poc')).join('')}</div></div><div class="porc"><b></b><span>${esc(title)}</span></div></section>`);
      const S = el.querySelector('.por'), ring = S.querySelector('.porr'), cs = [...ring.children], cap = S.querySelector('.porc b');
      let ang = 0, vel = 0, dn = null, hv = false, raf = 0;
      const loop = () => { const w = cs[0].offsetWidth || 180, R = Math.round(w * .56 / Math.tan(Math.PI / n)) + 40;
        if (dn == null) { ang += vel; vel *= .94; if (!hv && !calm) ang += .15; }
        ring.style.transform = `translateZ(${-R}px) rotateY(${ang}deg)`; let best = 0, bd = 999;
        cs.forEach((x, i) => { x.style.transform = `rotateY(${i * 360 / n}deg) translateZ(${R}px)`; const a = ((i * 360 / n + ang) % 360 + 540) % 360 - 180;
          if (Math.abs(a) < bd) { bd = Math.abs(a); best = i; } x.style.opacity = (.3 + .7 * Math.max(0, 1 - Math.abs(a) / 120)).toFixed(2); });
        cap.textContent = list[best].name + '   ' + priceTxt(list[best]); if (!calm) raf = requestAnimationFrame(loop); };
      S.onpointerdown = e => { dn = e.clientX; vel = 0; }; S.onpointermove = e => { if (dn != null) { vel = (e.clientX - dn) * .3; ang += vel; dn = e.clientX; } };
      S.onpointerup = () => { dn = null; }; S.onmouseenter = () => { hv = true; }; S.onmouseleave = () => { hv = false; dn = null; };
      loop(); undo.push(() => cancelAnimationFrame(raf));
    }
    el._pcl = () => undo.forEach(f => f());
  }


  /* ---------- colours: Premium "animation color" (P.fx background, P.fg glow) + Diamond gem color (P.dm) ---------- */
  const GEMS = {gold: ['Gold', '#f5c451'], rose: ['Rose', '#ff7eb6'], emerald: ['Emerald', '#2ee59d'], amethyst: ['Amethyst', '#a96bff'], ruby: ['Ruby', '#ff4d5e'], silver: ['Silver', '#cfd3e6'], sunset: ['Sunset', '#ff8a3d']};
  const gem = c => { const P = c.prem || {}, h = GEMS[P.dm] ? GEMS[P.dm][1] : (HX.test(P.dm || '') ? P.dm : GEMS.gold[1]); return {a: h, d: mix(h, '#000000', .45), l: mix(h, '#ffffff', .58)}; };
  const fxVars = (el, c, th) => { const P = c.prem || {}, set = (k, v) => el.style.setProperty('--' + k, v), dia = c.template >= 17;
    if (HX.test(P.fx || '')) { set('fx', P.fx); set('fxc', mix(P.fx, '#ffffff', .07)); set('fxt', lum(P.fx) > .6 ? '#111111' : '#ffffff'); }
    let G;
    if (dia) { G = gem(c); set('ac', G.a); set('oa', lum(G.a) > .6 ? '#1b1230' : '#ffffff'); set('fx2', G.l); }
    else { const a = HX.test(P.fg || '') ? P.fg : th.ac; G = {a, d: mix(a, '#000000', .4), l: mix(a, '#ffffff', .6)};
      if (HX.test(P.fg || '')) { set('ac', a); set('oa', lum(a) > .6 ? '#1b1230' : '#ffffff'); set('fx2', mix(a, '#ffffff', .45)); } }
    set('g1', G.a); set('g2', G.d); set('g3', G.l); };
  const gemInner = '<polygon points="6,3 18,3 23,9 1,9" fill="var(--g1)"/><polygon points="1,9 23,9 12,22" fill="var(--g2)"/><polygon points="6,3 9,9 12,3" fill="var(--g3)"/><polygon points="12,3 15,9 18,3" fill="var(--g3)" opacity=".8"/><polygon points="9,9 15,9 12,22" fill="var(--g3)" opacity=".35"/>';
  const gemSvg = dia => `<span class="pdia" title="${dia ? 'Diamond' : 'Premium'} store"><svg viewBox="0 0 24 24" aria-hidden="true">${gemInner}</svg></span>`;

  /* ---------- DIAMOND layouts (Tier 3): 17 Prism / 18 Warp / 19 Crown / 20 Facet ---------- */
  function diamond(el, c, products, edit) {
    const P = c.prem || {}, t = +c.template, G = gem(c), hero = el.querySelector('.hero'), sec = el.querySelector('.sec[data-id="products"]'),
      cards = [...el.querySelectorAll('.grid .pc')], undo = [], sp = P.sparkle !== false;
    const items = cards.map(cd => products.find(x => x.id === cd.dataset.pid)).filter(Boolean), title = P.title || (c.name + ' / Collection');
    const calm = edit || P.anim === false || (window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches);
    const sc = el.closest('.pvwrap') || window, VH = () => sc === window ? innerHeight : sc.clientHeight, TOP = () => sc === window ? 0 : sc.getBoundingClientRect().top;
    el.classList.add('dm'); el.classList.add(calm ? 'noanim' : 'dmr');
    const card = (p, i, cls) => { const im = imgsOf(p)[0]; return `<div class="${cls}" data-pid="${p.id}">${im ? `<img src="${im}" alt="">` : '<span class="pce"></span>'}<em class="pnum">${String(i + 1).padStart(2, '0')}</em><div class="pci"><span>${esc(p.name)}</span><b>${priceTxt(p)}</b></div></div>`; };

    /* twinkling 4-point stars drawn on a canvas behind the headline */
    const glitter = host => { if (calm || !sp || !host) return;
      const cv = document.createElement('canvas'), x = cv.getContext && cv.getContext('2d'); if (!x) return; cv.className = 'dcv'; host.prepend(cv);
      const cols = [G.l, G.a, '#ffffff'], S = Array.from({length: innerWidth < 700 ? 32 : 68}, () => ({x: Math.random(), y: Math.random(), r: .6 + Math.random() * 2.2, p: Math.random() * 6.28, s: .6 + Math.random() * 1.6, v: .00008 + Math.random() * .00025, c: cols[Math.random() * 3 | 0]}));
      let raf = 0, w = 0, h = 0, tt = 0;
      const loop = () => { if (!el.isConnected) return; const W = host.clientWidth, H = host.clientHeight, dpr = Math.min(2, devicePixelRatio || 1);
        if (W !== w || H !== h) { w = W; h = H; cv.width = W * dpr; cv.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); }
        x.clearRect(0, 0, W, H); tt += .016;
        S.forEach(s => { s.y -= s.v * 16; if (s.y < -.02) { s.y = 1.02; s.x = Math.random(); }
          const a = .35 + .65 * Math.abs(Math.sin(tt * s.s + s.p)), px = s.x * W, py = s.y * H, r = s.r * (.7 + a * .6);
          x.globalAlpha = a; x.fillStyle = s.c; x.shadowColor = s.c; x.shadowBlur = 10; x.beginPath(); x.moveTo(px, py - r * 3);
          x.quadraticCurveTo(px, py, px + r * 3, py); x.quadraticCurveTo(px, py, px, py + r * 3); x.quadraticCurveTo(px, py, px - r * 3, py); x.quadraticCurveTo(px, py, px, py - r * 3); x.fill(); });
        x.globalAlpha = 1; raf = requestAnimationFrame(loop); };
      loop(); undo.push(() => cancelAnimationFrame(raf)); };
    /* sparkle trail that follows the mouse */
    const trail = host => { if (calm || !sp || !host) return; let last = 0;
      host.addEventListener('pointermove', e => { if (e.pointerType === 'touch') return; const n = performance.now(); if (n - last < 45) return; last = n;
        const r = host.getBoundingClientRect(), s = document.createElement('i'); s.className = 'dtr'; s.textContent = '✦';
        s.style.left = e.clientX - r.left + 'px'; s.style.top = e.clientY - r.top + 'px'; s.style.setProperty('--dx', (Math.random() * 40 - 20) + 'px'); s.style.fontSize = 8 + Math.random() * 14 + 'px';
        host.appendChild(s); s.onanimationend = () => s.remove(); }); };
    /* 3D tilt + light sheen that follows the pointer */
    const tilt = (list, k) => { if (calm) return; list.forEach(cd => {
      cd.onpointermove = e => { if (e.pointerType === 'touch') return; const r = cd.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        cd.style.transform = `perspective(800px) rotateY(${(x - .5) * k}deg) rotateX(${(.5 - y) * k}deg) translateZ(14px)`; cd.style.setProperty('--mx', x * 100 + '%'); cd.style.setProperty('--my', y * 100 + '%'); };
      cd.onpointerleave = () => { cd.style.transform = ''; }; }); };
    /* blur-to-sharp reveal while scrolling */
    const reveal = list => { if (calm || !('IntersectionObserver' in window)) { list.forEach(x => x.classList.add('in')); return; }
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), {root: sc === window ? null : sc, threshold: .1});
      list.forEach((x, i) => { x.style.setProperty('--d', (i % 3) * 110 + 'ms'); io.observe(x); }); undo.push(() => io.disconnect()); };

    if (hero) { hero.insertAdjacentHTML('afterbegin', `<div class="dau"><i></i><i></i><i></i></div><div class="dgm"><svg viewBox="0 0 24 24" aria-hidden="true">${gemInner}</svg></div>`);
      const h2 = hero.querySelector('h2'); if (h2) h2.classList.add('dsh'); glitter(hero); trail(hero); }
    let own = false;

    if (t === 17) {   /* PRISM: aurora + shimmering headline + holographic tilt cards */
      const m = P.marquee == null ? c.name : P.marquee;
      if (hero && m) { const r = `<span>${esc(m)}</span>`.repeat(6); hero.insertAdjacentHTML('afterend', `<div class="dmq"><div class="dmt">${r}${r}</div></div>`); }
      trail(sec);
    }

    if (t === 18 && hero && items.length && !calm) {   /* WARP: scrolling flies you through the products in 3D */
      own = true; el.classList.add('dmx');
      hero.insertAdjacentHTML('afterend', `<section class="dwp" data-id="products"><div class="dwps"><canvas class="dwc"></canvas><div class="dwt">${esc(title)}</div><div class="dwz">${items.map((p, i) => card(p, i, 'dwk')).join('')}</div><div class="dwi"><b></b><span></span></div><div class="dwh">Scroll ↓</div><div class="dwb"><i></i></div></div></section>`);
      const S = el.querySelector('.dwp'), st = S.firstChild, cv = S.querySelector('.dwc'), x = cv.getContext('2d'), ks = [...S.querySelectorAll('.dwk')], n = ks.length,
        cap = S.querySelector('.dwi b'), cap2 = S.querySelector('.dwi span'), bar = S.querySelector('.dwb i'), hint = S.querySelector('.dwh'), D = 560, cols = [G.l, G.a, '#ffffff'];
      const stars = Array.from({length: 110}, () => ({x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random() * .95 + .05, c: cols[Math.random() * 3 | 0]}));
      let raf = 0, pp = 0, vel = 0, key = '', last = -1;
      const loop = () => { if (!el.isConnected) return;
        const vh = VH(), w = st.clientWidth; S.style.height = vh * (1 + Math.max(1, n) * .85) + 'px'; st.style.height = vh + 'px';
        const p = Math.max(0, Math.min(1, -(S.getBoundingClientRect().top - TOP()) / Math.max(1, S.offsetHeight - vh)));
        vel += (Math.abs(p - pp) * 70 - vel) * .15; pp = p;
        const k2 = p.toFixed(4) + '|' + w + '|' + vh;
        if (k2 !== key) { key = k2; const cam = -D * .4 + p * (n - 1 + .4) * D, sx = w * (w < 600 ? .16 : .23); let best = 0, bz = 1e9;
          ks.forEach((k, i) => { const z = cam - i * D, side = i % 2 ? 1 : -1, op = Math.max(0, Math.min(1, (z + D * 2.6) / (D * 1.2), (D * .62 - z) / (D * .3)));
            k.style.transform = `translate3d(calc(-50% + ${side * sx}px),calc(-50% + ${((i % 3) - 1) * vh * .06}px),${z}px) rotateY(${-side * 14}deg)`;
            k.style.opacity = op.toFixed(3); k.style.pointerEvents = op > .6 ? 'auto' : 'none'; if (Math.abs(z) < bz) { bz = Math.abs(z); best = i; } });
          if (best !== last) { last = best; cap.textContent = items[best].name; cap2.textContent = priceTxt(items[best]); }
          bar.style.transform = `scaleX(${p})`; hint.style.opacity = p > .02 ? 0 : 1; }
        const CW = w, CH = vh; if (cv.width !== CW || cv.height !== CH) { cv.width = CW; cv.height = CH; }
        x.clearRect(0, 0, CW, CH); x.lineCap = 'round';
        stars.forEach(s => { const z0 = s.z; s.z -= .0035 + vel * .03;
          if (s.z <= .03) { s.x = Math.random() * 2 - 1; s.y = Math.random() * 2 - 1; s.z = 1; return; }
          const a0 = CW * .13, x0 = CW / 2 + s.x / z0 * a0, y0 = CH / 2 + s.y / z0 * a0, x1 = CW / 2 + s.x / s.z * a0, y1 = CH / 2 + s.y / s.z * a0;
          x.globalAlpha = Math.min(1, (1 - s.z) * 1.4); x.strokeStyle = s.c; x.lineWidth = .6 + (1 - s.z) * 1.8; x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.stroke(); });
        x.globalAlpha = 1; raf = requestAnimationFrame(loop); };
      loop(); undo.push(() => cancelAnimationFrame(raf));
    }

    if (t === 19 && hero && items.length && !calm) {   /* CROWN: a rotating diamond that opens each product with a circular reveal */
      own = true; el.classList.add('dmx');
      hero.insertAdjacentHTML('afterend', `<section class="dcr" data-id="products"><div class="dcrt">${esc(title)}</div><div class="dcrg"><div class="dcrs"><div class="dor o1"></div><div class="dor o2"></div><div class="dcrw" data-pid="${items[0].id}"><div class="dcrb"><i></i></div><div class="dcrm">${items.map(p => { const im = imgsOf(p)[0]; return im ? `<img class="dcri" src="${im}" alt="">` : '<span class="dcri pce">🛍️</span>'; }).join('')}</div></div></div>`
        + `<div class="dcrf"><small class="dcrn"></small><h3 class="dcrh"></h3><div class="dcrp"></div><p class="dcrd"></p><button type="button" class="dcrv" data-pid="${items[0].id}">View details →</button></div></div>`
        + `<div class="dcrx">${items.map((p, i) => { const im = imgsOf(p)[0]; return `<button type="button" class="dcrq" data-i="${i}" aria-label="${esc(p.name)}">${im ? `<img src="${im}" alt="">` : ''}</button>`; }).join('')}</div></section>`);
      const S = el.querySelector('.dcr'), ims = [...S.querySelectorAll('.dcri')], ths = [...S.querySelectorAll('.dcrq')], pids = [...S.querySelectorAll('[data-pid]')], f = S.querySelector('.dcrf'),
        nE = S.querySelector('.dcrn'), hE = S.querySelector('.dcrh'), pE = S.querySelector('.dcrp'), dE = S.querySelector('.dcrd'), w = S.querySelector('.dcrw'), stg = S.querySelector('.dcrs');
      let cur = -1, tm = 0;
      const show = i => { i = (i + items.length) % items.length; if (i === cur) return; const old = cur, p = items[i]; cur = i;
        ims.forEach((im, k) => { im.classList.toggle('on', k === i); im.classList.toggle('pv', k === old); }); ths.forEach((b, k) => b.classList.toggle('on', k === i));
        pids.forEach(e => { e.dataset.pid = p.id; });
        nE.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(items.length).padStart(2, '0'); hE.textContent = p.name; pE.textContent = priceTxt(p);
        const d = p.description || ''; dE.textContent = d.slice(0, 120) + (d.length > 120 ? '…' : '');
        f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); };
      const auto = () => { clearInterval(tm); tm = setInterval(() => { if (!el.isConnected) return clearInterval(tm); if (!S.matches(':hover')) show(cur + 1); }, 4300); };
      S.querySelector('.dcrx').onclick = e => { const b = e.target.closest('[data-i]'); if (b) { show(+b.dataset.i); auto(); } };
      stg.onpointermove = e => { if (e.pointerType === 'touch') return; const r = stg.getBoundingClientRect(); w.style.transform = `rotateY(${((e.clientX - r.left) / r.width - .5) * 22}deg) rotateX(${(.5 - (e.clientY - r.top) / r.height) * 22}deg)`; };
      stg.onpointerleave = () => { w.style.transform = ''; };
      show(0); auto(); undo.push(() => clearInterval(tm));
    }

    if (t === 20) {   /* SINGLE SHOWCASE (diamond): drifting gem shards in the banner + a light that follows the cursor behind the one-picture slider */
      if (hero && !calm) hero.insertAdjacentHTML('afterbegin', `<div class="d20s">${Array.from({length: 14}, (_, i) => `<i style="--x:${(i * 7.3 + 4) % 96}%;--s:${14 + (i * 11) % 30}px;--t:${9 + (i * 3) % 8}s;--dl:${-(i * 1.7)}s"></i>`).join('')}</div>`);
      if (sec) { trail(sec); if (!calm) sec.addEventListener('pointermove', e => { const r = sec.getBoundingClientRect(); sec.style.setProperty('--sx', (e.clientX - r.left) + 'px'); sec.style.setProperty('--sy', (e.clientY - r.top) + 'px'); }); }
    }
    if (!own) { tilt(cards, t === 20 ? 22 : 16); reveal(cards); }
    el._pcl = () => undo.forEach(f => f());
  }

  function renderStore(el, c, products, opts = {}) {
    { const tr = data.plan === 'tier3' ? 3 : data.plan === 'tier2' ? 2 : 1;   /* Premium 13-16 = Tier 2+, Diamond 17-19 = Tier 3 only */
      if (c.template >= 17 && tr < 3) c = Object.assign({}, c, {template: tr === 2 ? 13 : 1}); else if (c.template >= 13 && tr < 2) c = Object.assign({}, c, {template: 1}); }
    const edit = !!opts.edit, vis = products.filter(p => p.status === 'visible' && act(p)).sort((a, b) => { const o = c.productOrder || [], r = p => o.indexOf(p.id) < 0 ? 1e6 : o.indexOf(p.id); return r(a) - r(b); });
    const cats = [...new Set(vis.map(p => p.category).filter(Boolean))];
    if (!el._cat || (el._cat !== 'All' && !cats.includes(el._cat))) el._cat = 'All';
    const list = vis.filter(p => el._cat === 'All' || p.category === el._cat);
    const tabs = PAGES.filter(([t]) => t === 'home' || c['show' + t[0].toUpperCase() + t.slice(1)] !== false);
    if (!tabs.some(t => t[0] === el._tab)) el._tab = 'home';
    const tab = el._tab, th = theme(c), again = () => renderStore(el, c, products, opts), fire = (k, f) => opts.onChange && opts.onChange(k, f);
    loadFont(c.font);
    clearInterval(el._sp);
    el.className = 'sf t' + c.template + (edit ? ' edit' : '') + (opts.fill ? ' fill' : '');
    [['pc', th.pc], ['ac', th.ac], ['bg', th.bg], ['tx', th.tx], ['card', th.card], ['on', th.on], ['oa', th.oa], ['r', th.r], ['ov', th.ov]].forEach(([k, v]) => el.style.setProperty('--' + k, v));
    ['fx', 'fxt', 'fxc', 'fx2', 'g1', 'g2', 'g3'].forEach(k => el.style.removeProperty('--' + k));
    el.style.fontFamily = stack(c.font);
    el.style.setProperty('--bn', c.banner ? `url("${c.banner}")` : `linear-gradient(135deg,color-mix(in srgb,${c.color} 65%,#000),${c.color})`);
    const bd = f => ` data-bind="${f}"`, eb = (f, ph) => bd(f) + (edit ? ` contenteditable="true" spellcheck="false" data-ph="${esc(ph)}"` : '');
    const bsv = id => (c.blockStyle || {})[id] || {};
    const bs = id => { const s = bsv(id); let r = ''; if (HX.test(s.bg) && !(id === 'hero' && c.banner)) r += id === 'hero' ? `--bn:linear-gradient(${s.bg},${s.bg});` : `background:${s.bg};`; if (HX.test(s.tx)) r += `color:${s.tx};`; if (+s.fs) r += `--fs:${+s.fs};`; if (id === 'hero' && +s.h) r += `min-height:${+s.h}px;`; return r; };
    const chrome = (id, lb, drag = true) => { if (!edit) return '';
      const s = bsv(id), t4 = c.template == 4, dbg = id === 'hero' ? th.pc : id === 'nav' ? (t4 ? th.pc : th.bg) : id === 'foot' ? mix(th.pc, '#000000', .28) : ['address', 'phone', 'hours', 'messaging'].includes(id) ? th.card : th.bg,
        dtx = (id === 'hero' || id === 'foot') ? '#ffffff' : id === 'nav' && t4 ? th.on : th.tx;
      return `<span class="eh${drag ? '' : ' nd'}" ${drag ? 'draggable="true"' : ''}>${drag ? '⠿ ' : ''}${lb}</span><span class="etb"><b class="etl">${lb}</b><button type="button" class="edn" data-done>✓ Done</button><span class="etsp"></span>${drag ? '<button type="button" data-mv="-1" title="Move up">▲</button><button type="button" data-mv="1" title="Move down">▼</button>' : ''}<button type="button" data-fs="-1" title="Smaller text">A−</button><button type="button" data-fs="1" title="Larger text">A+</button>${id === 'hero' ? '<button type="button" data-pick="banner">🖼 Banner</button>' : ''}${id === 'hero' && c.banner ? '' : `<label>BG<input type="color" data-bc="bg" value="${HX.test(s.bg) ? s.bg : dbg}"></label>`}<label>Text<input type="color" data-bc="tx" value="${HX.test(s.tx) ? s.tx : dtx}"></label><button type="button" data-rs title="Reset">↺</button></span>${id === 'hero' ? '<span class="rz" title="Drag up/down to resize the banner"></span>' : ''}`; };
    const ord = (ids) => { const o = ((c.order || {})[tab] || []).filter(x => ids.includes(x)); return [...o, ...ids.filter(x => !o.includes(x))]; };
    const logo = `<span class="lg" ${edit ? 'data-pick="logo" title="Click to replace the logo"' : ''}>${c.logo ? `<img src="${c.logo}" alt="">` : `<span class="ini">${esc((c.name || 'S')[0])}</span>`}</span>`;
    const chips = (c.showFilters && cats.length) ? `<div class="chips">${['All', ...cats].map(x => `<button class="chip ${x === el._cat ? 'on' : ''}" data-cat="${esc(x)}">${esc(x)}</button>`).join('')}</div>` : '';
    const grid = list.length ? `<div class="grid">${list.map(p => `<div class="pc" data-pid="${p.id}" ${edit ? 'draggable="true"' : ''}>${edit ? '<span class="pmv"><button type="button" data-pm="-1" title="Move earlier">◀</button><button type="button" data-pm="1" title="Move later">▶</button></span>' : ''}<div class="im">${p.image ? `<img src="${p.image}" alt="">` : ''}${p.available ? '' : '<span class="so">Sold out</span>'}</div><div class="bd"><div class="nm">${esc(p.name)}</div>${p.type === 'service' && p.duration ? `<div class="du">${esc(p.duration)}</div>` : ''}<div class="pr"><b>${priceTxt(p)}</b><span class="vd">View Details</span></div></div></div>`).join('')}</div>`
      : `<div class="none">No items on display yet.</div>`;
    /* service templates (9-12): video + your work — taken from Listings (service images/video) */
    const vp = vis.find(p => p.video);
    /* "Our Work": pictures the owner adds here (c.works). If none were added yet, fall back to the pictures from Listings. */
    const own = (c.works || []).filter(w => w && w.src);
    const works = own.length ? own.map(w => ({src: w.src, own: w.id})) : vis.flatMap(p => imgsOf(p).map(src => ({src, id: p.id, n: p.name})));
    const vbox = () => vp ? `<div class="vbox"><video data-vid="${vp.video.id}" controls muted playsinline preload="metadata"></video></div>`
      : ((edit || c.template == 9) ? `<div class="vbox"><div class="vph">${edit ? '🎬 Add a video to a service in Listings to show it here' : ''}</div></div>` : '');
    const workHtml = n => (own.length ? works : works.slice(0, n)).map(w => w.own
      ? `<div class="wk own"><img src="${w.src}" alt="">${edit ? `<button type="button" class="wrm" data-wrm="${esc(w.own)}" title="Remove picture" aria-label="Remove picture">×</button>` : ''}</div>`
      : `<button type="button" class="wk" data-pid="${w.id}" title="${esc(w.n)}"><img src="${w.src}" alt=""></button>`).join('');
    const addW = edit ? `<div class="wadd"><button type="button" class="btn sm" data-pick="work"${own.length >= 10 ? ' disabled' : ''}>＋ Add picture</button><span class="muted">${own.length ? own.length + ' / 10 pictures' : 'Showing pictures from your Listings. Add your own to replace them.'}</span></div>` : '';
    const mblk = inner => `<div class="sec" data-id="media" data-blk="media" style="${bs('media')}">${chrome('media', 'Our Work')}${inner}${addW}</div>`;
    const emptyW = edit ? '<div class="none">📷 No pictures yet. Click “Add picture” below.</div>' : '';
    let media = '';
    if (((c.template >= 9 && c.template <= 12 && c.template != 11) || c.template == 20) && (works.length || edit)) media = mblk(`<div class="mh"><h3>Our Work</h3></div>${works.length ? `<div class="works">${workHtml(c.template == 9 ? 5 : 8)}</div>` : emptyW}`);
    /* template 12 "Single Showcase": one service at a time (picture + offer). Many services -> it slides. */
    const spot = () => `<div class="spot"><div class="spv"><div class="spt">${list.map(p => { const im = imgsOf(p)[0];
      return `<div class="spl" data-pid="${p.id}" role="button" tabindex="0" aria-label="${esc(p.name)} — view details"><div class="spi">${im ? `<img class="spbg" src="${im}" alt="" aria-hidden="true"><img class="spm1" src="${im}" alt="${esc(p.name)}">` : `<span class="spe"><b>${esc(p.name)}</b></span>`}${p.available ? '' : '<span class="so">Unavailable</span>'}</div></div>`; }).join('')}</div></div>
      ${list.length > 1 ? `<button type="button" class="spn l" data-sp="-1" aria-label="Previous service">‹</button><button type="button" class="spn r" data-sp="1" aria-label="Next service">›</button><div class="spd">${list.map((_, i) => `<i data-spi="${i}"></i>`).join('')}</div>` : ''}</div>`;
    const has = t => tabs.some(x => x[0] === t);
    let body = '';
    if (tab === 'home') {
      const parts = {};
      if (c.showBanner) parts.hero = `<div class="hero ${c.banner ? 'img' : ''}" data-blk="hero" style="${bs('hero')}">${chrome('hero', 'Banner')}<div class="txt"><h2${eb('headline', 'Headline')}>${esc(c.headline)}</h2><p${eb('sub', 'Banner text')}>${esc(c.sub)}</p><a class="b1" data-tab="home" data-scroll="products">${data.bizType === 'service' ? 'Our Services' : 'Shop Products'}</a><a class="b2" data-tab="${has('location') ? 'location' : 'contact'}">Visit Us</a></div><div class="himg">${c.template == 9 ? vbox() : ''}</div></div>`;
      if (media && c.template != 12 && c.template != 20) parts.media = media;
      parts.products = `<div class="sec" data-id="products" data-blk="products" style="${bs('products')}">${chrome('products', 'Products')}<div class="sh"><h3>${{product: 'Our Products', service: 'Our Services', both: 'Products & Services'}[data.bizType]}</h3>${c.template == 12 || c.template == 20 ? '' : chips}</div>${c.template == 11 ? `<div class="two"><div>${grid}</div><aside class="aside">${vbox()}${works.length || edit ? `<div class="mh"><h3>Our Work</h3></div>` : ''}<div class="works">${workHtml(4)}</div>${addW}</aside></div>` : (c.template == 12 || c.template == 20) && list.length ? spot() : grid}</div>`;
      if (media && (c.template == 12 || c.template == 20)) parts.media = media;
      body = ord(Object.keys(parts)).map(k => parts[k]).join('');
    } else if (tab === 'about') {
      body = `<div class="sec page"><div class="abt" data-blk="about" style="${bs('about')}">${chrome('about', 'About', false)}<div class="alogo">${c.logo ? `<img src="${c.logo}" alt="">` : `<span class="ini">${esc((c.name || 'S')[0])}</span>`}</div><div><h3>About <span${bd('name')}>${esc(c.name)}</span></h3><p${eb('about', 'Write your About Us...')}>${esc(c.about)}</p></div></div></div>`;
    } else if (tab === 'contact') {
      const card = (id, ic, lb, inner, extra = '') => `<div class="ccard" data-blk="${id}" style="${bs(id)}">${chrome(id, lb)}<span class="ci">${ic}</span><div><small>${lb}</small><b><span${eb(id, lb)}>${esc(c[id])}</span></b>${extra}</div></div>`;
      const tel = String(c.phone || '').replace(/[^\d+]/g, ''), cs = {
        address: card('address', '📍', 'Address'),
        phone: card('phone', '📞', 'Phone', '', c.phone ? `<br><a class="cb" href="tel:${esc(tel)}">Call now</a>` : ''),
        hours: card('hours', '🕒', 'Open Hours')};
      if (c.messaging || edit) cs.messaging = card('messaging', '💬', 'Messaging', '', c.messaging ? `<br><a class="cb" href="${esc(lnk(c.messaging))}" target="_blank" rel="noopener">Message us</a>` : '');
      body = `<div class="sec page"><h3>Contact Us</h3><p class="lead">Reach out to <span${bd('name')}>${esc(c.name)}</span> — we'd love to hear from you.</p><div class="cgrid">${ord(Object.keys(cs)).map(k => cs[k]).join('')}</div></div>`;
    } else {
      body = `<div class="sec page"><h3>Find Us</h3><p class="lead">Visit our store${c.address ? ' at the address below' : ''}.</p><div class="locgrid"><div class="mapbox" id="lmap"></div><div class="loccard" data-blk="locinfo"><small>📍 Location</small><b${eb('address', 'Address')}>${esc(c.address)}</b><small>🕒 <span${bd('hours')}>${esc(c.hours)}</span></small><div class="ldist" aria-live="polite"></div><p class="lnote"></p><div class="lbtns"><button type="button" class="cb lnear"><span>📍 Show distance from me</span><small>See how far you are from this store. Your location is not saved.</small></button><a class="cb ldir alt" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.address || '')}" target="_blank" rel="noopener"><span>➜ Get Directions</span><small>Opens Google Maps so you can navigate here.</small></a></div></div></div></div>`;
    }
    const nav = `<div class="nav" data-blk="nav" style="${bs('nav')}">${chrome('nav', 'Menu', false)}<div class="brand">${logo}<span${eb('name', 'Store name')}>${esc(c.name)}</span></div><div class="links">${tabs.map(([t, l]) => `<a data-tab="${t}" class="${t === tab ? 'act' : ''}">${l}</a>`).join('')}${has('contact') ? '<a class="cta" data-tab="contact">Contact Us</a>' : ''}</div></div>`;
    el.innerHTML = `${c.showContactBar ? `<div class="cbar"><span>📍 <span${bd('address')}>${esc(c.address)}</span></span><span>📞 <span${bd('phone')}>${esc(c.phone)}</span> &nbsp;|&nbsp; <span${bd('hours')}>${esc(c.hours)}</span></span></div>` : ''}${nav}${body}<div class="foot" data-blk="foot" style="${bs('foot')}">${chrome('foot', 'Footer', false)}<div><b${bd('name')}>${esc(c.name)}</b></div><div>PanaboOne · Discover Local. Support Local.</div></div>`;

    if (el._pcl) { el._pcl(); el._pcl = null; }
    if (c.template >= 13) { fxVars(el, c, th); const bn = el.querySelector('.brand'); if (bn) bn.insertAdjacentHTML('beforeend', gemSvg(c.template >= 17)); (c.template == 13 ? premium : c.template <= 16 ? premiumX : diamond)(el, c, products, edit); }
    if (tab === 'location') initMap(el, c);
    if ('ResizeObserver' in window) { if (!el._ro) { el._ro = new ResizeObserver(() => el.classList.toggle('nw', el.clientWidth < 680)); el._ro.observe(el); } }
    el.classList.toggle('nw', el.clientWidth < 680);

    /* animated templates 5-8 (switched off while editing) */
    if (!edit) {
      const g = el.querySelector('.grid'), cs = g ? [...g.children] : [];
      if (cs.length) {
        if (c.template == 5) {   /* marquee: repeat the cards so the loop never shows a gap */
          const k = Math.max(1, Math.ceil(8 / cs.length)), half = cs.map(x => x.outerHTML).join('').repeat(k);
          g.innerHTML = half + half.replace(/class="pc"/g, 'class="pc sfdup"');
          g.style.setProperty('--dur', Math.max(20, cs.length * k * 5) + 's');
        }
        if (c.template == 7 && 'IntersectionObserver' in window) {   /* reveal while scrolling */
          const io = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; const n = e.target; io.unobserve(n);
            n.style.transitionDelay = (cs.indexOf(n) % 4) * 90 + 'ms'; n.classList.add('rv');
            setTimeout(() => { n.classList.remove('rv0', 'rv'); n.style.transitionDelay = ''; }, 1300); }), {threshold: .15});
          cs.forEach(n => { n.classList.add('rv0'); io.observe(n); });
        }
        if (c.template == 8) {   /* spotlight moves from product to product */
          let k = 0; const on = () => { if (!el.isConnected) return clearInterval(el._sp); cs.forEach(n => n.classList.remove('spot')); cs[k++ % cs.length].classList.add('spot'); };
          on(); el._sp = setInterval(on, 2200);
        }
      }
    }

    el.querySelectorAll('video[data-vid]').forEach(v => { const id = v.dataset.vid; (vcache[id] = vcache[id] || vid.url(id)).then(u => { if (u) v.src = u; }); });
    const go = (t, s) => { if (!has(t)) t = 'home'; const same = t === el._tab; el._tab = t; if (!same) again();
      const tg = s && el.querySelector(`[data-id="${s}"]`);
      if (tg) tg.scrollIntoView({behavior: 'smooth', block: 'start'}); else { const w = el.closest('.pvwrap'); w ? (w.scrollTop = 0) : window.scrollTo(0, 0); } };
    if (edit) el.querySelectorAll('a[href]').forEach(a => a.onclick = e => e.preventDefault());
    el.querySelectorAll('[data-tab]').forEach(a => a.onclick = e => { e.preventDefault(); go(a.dataset.tab, a.dataset.scroll); });
    el.querySelectorAll('[data-sc]').forEach(b => b.onclick = () => { const g = el.querySelector('.grid'); if (g) g.scrollBy({left: +b.dataset.sc * g.clientWidth * .8, behavior: 'smooth'}); });
    el.querySelectorAll('[data-cat]').forEach(b => b.onclick = () => { el._cat = b.dataset.cat; again(); });
    el.querySelectorAll('[data-pid]').forEach(card => card.onclick = () => { const p = products.find(x => x.id === card.dataset.pid); if (p && opts.onProduct) opts.onProduct(p); });
    /* Single Showcase slider */
    el.querySelectorAll('.spot').forEach(sp => { const t = sp.querySelector('.spt'), n = t.children.length; let i = Math.min(el._sp || 0, n - 1), x0 = 0, sw = false;
      const go = k => { i = (k + n) % n; el._sp = i; t.style.transform = `translateX(${-i * 100}%)`; sp.querySelectorAll('.spd i').forEach((d, j) => d.classList.toggle('on', j === i)); };
      sp.querySelectorAll('[data-sp]').forEach(b => b.onclick = e => { e.stopPropagation(); go(i + +b.dataset.sp); });
      sp.querySelectorAll('[data-spi]').forEach(b => b.onclick = e => { e.stopPropagation(); go(+b.dataset.spi); });
      sp.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; sw = false; }, {passive: true});
      sp.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - x0; if (n > 1 && Math.abs(dx) > 40) { sw = true; go(i + (dx < 0 ? 1 : -1)); } });
      sp.addEventListener('click', e => { if (sw) { e.stopPropagation(); e.preventDefault(); sw = false; } }, true);
      go(i); });
    /* tap an added "Our Work" picture to enlarge it */
    el.querySelectorAll('.wk.own').forEach(w => w.onclick = e => { if (edit || e.target.closest('.wrm')) return;
      const o = document.createElement('div'); o.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.85);display:grid;place-items:center;padding:16px;cursor:zoom-out';
      o.innerHTML = `<img src="${w.querySelector('img').src}" alt="" style="max-width:100%;max-height:100%;border-radius:12px">`; o.onclick = () => o.remove(); document.body.appendChild(o); });
    if (!edit) { document.body.classList.remove('etb-open'); return; }

    /* tap a section -> it becomes "selected"; on phones its tools pop up as a bottom sheet (see customization.html) */
    const pickBlk = t => { const b = t && t.closest && t.closest('[data-blk]'); el._sel = b ? b.dataset.blk : null;
      el.querySelectorAll('[data-blk].sel').forEach(x => { if (x !== b) x.classList.remove('sel'); }); if (b) b.classList.add('sel');
      document.body.classList.toggle('etb-open', !!b); };
    const clearSel = () => { el._sel = null; el.querySelectorAll('.sel').forEach(x => x.classList.remove('sel')); document.body.classList.remove('etb-open'); el.classList.remove('typing'); };
    el.onpointerdown = e => { if (!e.target.closest('.etb')) pickBlk(e.target); };
    el.onfocusin = e => { if (!e.target.closest('.etb')) pickBlk(e.target); el.classList.toggle('typing', !!e.target.isContentEditable); };
    el.onfocusout = () => setTimeout(() => { const a = document.activeElement; el.classList.toggle('typing', !!(a && a.isContentEditable && el.contains(a))); }, 0);
    el.querySelectorAll('[data-done]').forEach(b => b.onclick = e => { e.stopPropagation(); clearSel(); if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); });
    if (el._sel) { const b = el.querySelector(`[data-blk="${el._sel}"]`); if (b) { b.classList.add('sel'); document.body.classList.add('etb-open'); } else clearSel(); }

    el.querySelectorAll('[contenteditable]').forEach(n => {
      n.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); n.blur(); } };
      n.onpaste = e => { e.preventDefault(); document.execCommand('insertText', false, (e.clipboardData.getData('text/plain') || '').replace(/\s+/g, ' ')); };
      n.oninput = () => { const f = n.dataset.bind, v = n.textContent; c[f] = v; el.querySelectorAll(`[data-bind="${f}"]`).forEach(o => { if (o !== n) o.textContent = v; }); fire('text', f); };
    });
    el.querySelectorAll('[data-pick]').forEach(b => b.onclick = e => { e.stopPropagation(); opts.onPick && opts.onPick(b.dataset.pick); });
    el.querySelectorAll('[data-wrm]').forEach(b => b.onclick = e => { e.stopPropagation(); c.works = (c.works || []).filter(w => w.id !== b.dataset.wrm); fire('style'); again(); });
    el.querySelectorAll('.etb').forEach(tb => { const b = tb.closest('[data-blk]'), id = b.dataset.blk;
      tb.querySelectorAll('input[data-bc]').forEach(i => i.oninput = () => { c.blockStyle = c.blockStyle || {}; (c.blockStyle[id] = c.blockStyle[id] || {})[i.dataset.bc] = i.value;
        if (i.dataset.bc === 'tx') b.style.color = i.value; else if (id === 'hero') b.style.setProperty('--bn', `linear-gradient(${i.value},${i.value})`); else b.style.background = i.value; fire('style'); });
      tb.querySelector('[data-rs]').onclick = () => { if (c.blockStyle) delete c.blockStyle[id]; fire('style'); again(); }; });
    el.querySelectorAll('[data-mv]').forEach(b => b.onclick = e => { e.stopPropagation(); const blk = b.closest('[data-blk]'), ids = [...blk.parentNode.children].filter(x => x.dataset.blk).map(x => x.dataset.blk), i = ids.indexOf(blk.dataset.blk), j = i + +b.dataset.mv;
      if (j < 0 || j >= ids.length) return; [ids[i], ids[j]] = [ids[j], ids[i]]; c.order = c.order || {}; c.order[tab] = ids; fire('order'); again(); });
    el.querySelectorAll('[data-fs]').forEach(bn => bn.onclick = () => { const b = bn.closest('[data-blk]'), id = b.dataset.blk; c.blockStyle = c.blockStyle || {}; const st = c.blockStyle[id] = c.blockStyle[id] || {};
      st.fs = Math.min(2, Math.max(.7, Math.round(((+st.fs || 1) + .1 * +bn.dataset.fs) * 10) / 10)); b.style.setProperty('--fs', st.fs); fire('style'); });
    el.querySelectorAll('.rz').forEach(z => z.onpointerdown = e => { e.preventDefault(); const b = z.closest('[data-blk]'), id = b.dataset.blk, y0 = e.clientY, h0 = b.offsetHeight; z.setPointerCapture(e.pointerId);
      z.onpointermove = ev => { const h = Math.max(160, Math.min(700, Math.round(h0 + ev.clientY - y0))); b.style.minHeight = h + 'px'; c.blockStyle = c.blockStyle || {}; (c.blockStyle[id] = c.blockStyle[id] || {}).h = h; fire('style'); };
      z.onpointerup = () => { z.onpointermove = z.onpointerup = null; }; });
    const setP = ids => { const full = vis.map(p => p.id), slots = []; full.forEach((id, i) => { if (ids.includes(id)) slots.push(i); }); slots.forEach((s, k) => full[s] = ids[k]); c.productOrder = full; fire('order'); again(); };
    const pids = () => [...el.querySelectorAll('.grid [data-pid]')].map(x => x.dataset.pid);
    el.querySelectorAll('[data-pm]').forEach(b => b.onclick = e => { e.stopPropagation(); const ids = pids(), id = b.closest('[data-pid]').dataset.pid, i = ids.indexOf(id), j = i + +b.dataset.pm; if (j < 0 || j >= ids.length) return; ids.splice(i, 1); ids.splice(j, 0, id); setP(ids); });
    let dp = null;
    el.querySelectorAll('.grid [data-pid]').forEach(cd => { cd.ondragstart = e => { dp = cd; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', cd.dataset.pid); setTimeout(() => dp && dp.classList.add('dragging'), 0); };
      cd.ondragend = () => { dp && dp.classList.remove('dragging'); dp = null; };
      cd.ondragover = e => { if (dp && dp !== cd) { e.preventDefault(); cd.classList.add('dropt'); } }; cd.ondragleave = () => cd.classList.remove('dropt');
      cd.ondrop = e => { cd.classList.remove('dropt'); if (!dp || dp === cd) return; e.preventDefault(); const ids = pids(), f = ids.indexOf(dp.dataset.pid), t = ids.indexOf(cd.dataset.pid); ids.splice(f, 1); ids.splice(t, 0, dp.dataset.pid); dp = null; setP(ids); }; });
    let drag = null;
    el.querySelectorAll('.eh[draggable]').forEach(h => { h.ondragstart = e => { drag = h.closest('[data-blk]'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', drag.dataset.blk); e.dataTransfer.setDragImage(drag, 20, 20); setTimeout(() => drag && drag.classList.add('dragging'), 0); }; h.ondragend = () => { drag && drag.classList.remove('dragging'); drag = null; }; });
    el.querySelectorAll('[data-blk]').forEach(b => {
      b.ondragover = e => { if (drag && drag !== b && drag.parentNode === b.parentNode) { e.preventDefault(); b.classList.add('dropt'); } };
      b.ondragleave = () => b.classList.remove('dropt');
      b.ondrop = e => { b.classList.remove('dropt'); if (!drag || drag === b || drag.parentNode !== b.parentNode) return; e.preventDefault();
        const ids = [...b.parentNode.children].filter(x => x.dataset.blk).map(x => x.dataset.blk), from = ids.indexOf(drag.dataset.blk), to = ids.indexOf(b.dataset.blk);
        ids.splice(from, 1); ids.splice(to, 0, drag.dataset.blk); c.order = c.order || {}; c.order[tab] = ids; drag = null; fire('order'); again(); };
    });
  }

  /* ---------- admin shell ---------- */
  const ICONS = {
    home:'M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5',
    products:'m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Zm0 0v18m8-13.5L4 16.5m16-9-8 4.5-8-4.5',
    storefront:'M4 9h16M4 9l1-4h14l1 4M4 9v10h16V9M9 19v-5h6v5',
    custom:'M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.5-2s0-2 1.5-2h2a3 3 0 0 0 3-3A9 9 0 0 0 12 3Z',
    poster:'M4 5h16v14H4V5Zm0 11 4-4 3 3 4-5 5 6M9 9h.01',
    analytics:'M4 20V10m5 10V4m5 16v-7m5 7V8',
    subscription:'M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4',
    settings:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0-13v3m0 14v3M2 12h3m14 0h3M4.9 4.9 7 7m10 10 2.1 2.1m0-14.2L17 7M7 17l-2.1 2.1'};
  const NAV = [['home','Home','dashboard.html'],['products','Listings','Product/product.html'],['storefront','Storefront','StoreFront/storefront.html'],['custom','Customization','Customization/customization.html'],['poster','Poster Maker','Poster/poster.html'],['analytics','Analytics','Analytics/analytics.html'],['subscription','Subscription','Subscription/subscription.html'],['settings','Settings','Settings/settings.html']];
  function shell(active, root) {
    let ok = false; try { ok = !!localStorage.getItem('po_session'); } catch (e) {}
    const up = root ? '' : '../';
    if (!ok) { location.replace(up + '../index.html'); return; }
    const logo = `<svg width="26" height="26" viewBox="0 0 64 64" fill="none"><g stroke-width="5" fill="none"><circle cx="32" cy="18" r="12" stroke="#a33fa8"/><circle cx="46" cy="32" r="12" stroke="#3aa7dd"/><circle cx="32" cy="46" r="12" stroke="#3b5bd6"/><circle cx="18" cy="32" r="12" stroke="#7a3fb8"/></g><circle cx="32" cy="32" r="4" fill="#5b3fd4"/></svg>`;
    $('side').innerHTML = `<a class="logo" href="${up}Customer/discover.html" target="_blank" rel="noopener" title="View as a customer (new tab)">${logo}<span>Panabo<b>One</b></span></a>` + NAV.map(n =>
      `<a href="${n[2] === '#' ? '#' : up + n[2]}" class="${n[0] === active ? 'on' : ''}" ${n[2] === '#' ? 'data-soon' : ''}><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${ICONS[n[0]]}"/></svg>${n[0] === 'products' ? LBL().n : n[1]}</a>`).join('');
    $('side').querySelectorAll('[data-soon]').forEach(a => a.onclick = e => { e.preventDefault(); toast('Coming soon 🙂'); });
    const nm = data.draft.name;
    $('top').innerHTML = `<button class="icon hb" id="hb" aria-label="Toggle navigation" title="Menu"><svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button><button class="icon" aria-label="Notifications"><svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6m4 10a2 2 0 0 0 4 0"/></svg></button><div class="avatar"><i>${esc(nm[0] || 'S')}</i>${esc(nm)}</div><button class="btn sm" id="logout">Logout</button>`;
    $('logout').onclick = () => { try { localStorage.removeItem('po_session'); } catch (e) {} location.href = up + '../index.html'; };
    document.body.classList.add('admin');
    /* hamburger: desktop = show / hide the sidebar (remembered); phone = slide-in drawer with a dimmed backdrop */
    const mq = matchMedia('(max-width:760px)');
    let off = false; try { off = localStorage.getItem('po_nav') === 'off'; } catch (e) {}
    let bd = document.querySelector('.navbd'); if (!bd) { bd = document.createElement('div'); bd.className = 'navbd'; document.body.appendChild(bd); }
    const apply = () => {
      const b = document.body, h = $('hb');
      if (mq.matches) { b.classList.remove('nav-off'); if (h) h.setAttribute('aria-expanded', String(b.classList.contains('nav-open'))); }
      else { b.classList.remove('nav-open'); b.classList.toggle('nav-off', off); if (h) h.setAttribute('aria-expanded', String(!off)); }
    };
    const closeDrawer = () => { document.body.classList.remove('nav-open'); apply(); };
    apply();
    (mq.addEventListener ? mq.addEventListener('change', apply) : mq.addListener(apply));
    $('hb').onclick = () => {
      if (mq.matches) { document.body.classList.toggle('nav-open'); apply(); return; }
      off = !document.body.classList.contains('nav-off'); apply(); try { localStorage.setItem('po_nav', off ? 'off' : 'on'); } catch (e) {}
    };
    bd.onclick = closeDrawer;
    addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });
  }
  return {GEMS, get data() { return data; }, vid, imgsOf, act, list, LBL, priceTxt, user: U, log, save, track, dayKey, toast, img, esc, fmt, uid, slugify, renderStore, geocode, here, theme, lum, mix, shell, loadFont, stack, FONTS, COLORS, THEME0, $};
})();
