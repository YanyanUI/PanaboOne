/* PanaboOne seed — 30 preset accounts + automatic picture detection
   ------------------------------------------------------------
   ASSETS LOCATION:  <project root>/assets/
     assets/products/product1/product1-1.png … product1-4.png + productbanner1.png   (product1 → product10)
     assets/services/service1/service1-1.png … service1-4.png + servicebanner1.png   (service1 → service10)
     assets/featured/featured1.png … featured10.png                                  (1 picture per featured account)
     assets/logos/product1.png … product10.png   (logo of businessproduct1..10)
     assets/logos/service1.png … service10.png   (logo of businessservice1..10)
     assets/logos/featured1.png … featured10.png (logo of featured1..10)
     assets/posters/product1.png … product10.png (poster of businessproduct1..10)
     assets/posters/service1.png … service10.png (poster of businessservice1..10)

   TEMPLATES:
     businessservice1..5            → service layouts 9-12
     businessservice6..10 + businessproduct1..10 → Premium 13-16 + Diamond 17-20 (all 8 used)
   Any extension (jpg/jpeg/png/webp/jfif/avif) is detected automatically.

   ACCOUNTS (all editable in the Dashboard):
     businessproduct1..10 / businessproduct123
     businessservice1..10 / businessservice123
     featured1..10        / featured123      ← these appear under "Featured Listings"
     contest1             / contest123       ← contestant account (Tier 3 / Diamond, products + services allowed)
       assets/contest/contest1-1.png … contest1-4.png + contestbanner1.png
       assets/logos/contest1.png   assets/posters/contest1.png
*/
const POSeed = (() => {
  const CONFIG = {
    root: '../../assets/',
    productImg: (n, i) => `products/product${n}/product${n}-${i}`,
    productBanner: n => `products/product${n}/productbanner${n}`,
    serviceImg: (n, i) => `services/service${n}/service${n}-${i}`,
    serviceBanner: n => `services/service${n}/servicebanner${n}`,
    featured: n => `featured/featured${n}`,
    logo: (kind, n) => `logos/${kind}${n}`,
    poster: (kind, n) => `posters/${kind}${n}`,
    count: 10, perBiz: 4
  };
  /* one ready-made poster per business account (product1-10, service1-10), shown on Posters + Home once the PNG exists */
  const posterItem = (kind, n, url) => ({id: `seed-poster-${kind}${n}`, t: Date.now() - n, title: (kind === 'service' ? 'Business Service ' : kind === 'contest' ? 'Contest Business ' : 'Business Product ') + n + ' Poster', img: url, status: 'visible', src: 'asset'});
  const KINDS = {
    product:  {prefix: 'businessproduct', pass: 'businessproduct123', label: 'Business Product ', svc: false},
    service:  {prefix: 'businessservice', pass: 'businessservice123', label: 'Business Service ', svc: true},
    featured: {prefix: 'featured',        pass: 'featured123',        label: 'Featured Business ', svc: false},
    contest:  {prefix: 'contest',         pass: 'contest123',         label: 'Contest Business ',  svc: false, biz: 'both', count: 1}
  };
  const kcount = k => KINDS[k].count || CONFIG.count;
  const BASE = new URL(CONFIG.root, document.currentScript.src).href;
  const AK = 'po_accounts';
  const EXT = ['jpg', 'jpeg', 'png', 'webp', 'jfif', 'avif', 'JPG', 'JPEG', 'PNG', 'WEBP'];
  const COLORS = ['#6b3410', '#c8642a', '#5b3fd4', '#2f7d4f', '#b83a3a', '#1f3b73'];
  const read = () => { try { return JSON.parse(localStorage.getItem(AK)) || {}; } catch (e) { return {}; } };
  const keyOf = u => 'panaboone_v1_' + u;

  /* same hash as auth.js (must match!) */
  const hash = async s => {
    try { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('panaboone:' + s));
      return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
    catch (e) { let h = 5381; for (const c of s) h = (h * 33) ^ c.charCodeAt(0); return 'x' + (h >>> 0).toString(16); }
  };

  const probe = u => new Promise(r => { const i = new Image(); i.onload = () => r(true); i.onerror = () => r(false); i.src = u; });
  const cache = {};
  let hit = '';
  const find = rel => cache[rel] || (cache[rel] = (async () => {
    const order = hit ? [hit, ...EXT.filter(e => e !== hit)] : EXT;
    for (const e of order) { const u = BASE + rel + '.' + e; if (await probe(u)) { hit = e; return u; } }
    return '';
  })());

  const imgPath = (kind, n, k) => kind === 'contest' ? `contest/contest${n}-${k}` : kind === 'service' ? CONFIG.serviceImg(n, k) : kind === 'featured' ? CONFIG.featured(n) : CONFIG.productImg(n, k);
  const bannerPath = (kind, n) => kind === 'contest' ? `contest/contestbanner${n}` : kind === 'service' ? CONFIG.serviceBanner(n) : kind === 'featured' ? '' : CONFIG.productBanner(n);

  /* which layout each preset account uses */
  function tplOf(kind, n) {
    if (kind === 'featured') return (n - 1) % 4 + 1;
    if (kind === 'contest') return 17;                                  /* Diamond layout */
    if (kind === 'service' && n <= 5) return 9 + (n - 1) % 4;          /* service style 9-12 */
    const k = kind === 'service' ? n - 6 : 5 + n - 1;                  /* 15 accounts share the 8 premium/diamond layouts */
    return 13 + k % 8;                                                 /* 13-16 Premium, 17-20 Diamond */
  }
  const planOf = t => t >= 17 ? 'tier3' : t >= 13 ? 'tier2' : 'tier1';
  const GEMKEYS = ['gold', 'rose', 'emerald', 'amethyst', 'ruby', 'silver', 'sunset'];
  const FX = ['#14102e', '#0f1d2e', '#2a0f24', '#0e2a22'];

  async function build(kind, n) {
    const K = KINDS[kind], svc = K.svc, fe = kind === 'featured', user = K.prefix + n, name = K.label + n;
    const cnt = fe ? 1 : CONFIG.perBiz;
    const imgs = await Promise.all(Array.from({length: cnt}, (_, k) => find(imgPath(kind, n, k + 1))));
    const bp = bannerPath(kind, n), banner = bp ? await find(bp) : '', logo = await find(CONFIG.logo(kind, n)), poster = fe ? '' : await find(CONFIG.poster(kind, n));
    const tpl = tplOf(kind, n);
    const phone = '0917 ' + String(100 + n).padStart(3, '0') + (svc ? ' 2' : fe ? ' 3' : ' 1') + String(100 + n * 7).slice(-3);
    const draft = {template: tpl, color: COLORS[(n - 1) % COLORS.length], font: 'Poppins', logo, banner, showBanner: true, showContactBar: false, showFilters: true,
      name, headline: 'Welcome to ' + name,
      sub: svc ? 'Browse our services and contact us to book.' : 'Browse our products and contact us to order.',
      about: name + ' is a local business in Panabo City.',
      phone, address: 'Panabo City, Davao del Norte', hours: 'Open Daily: 8:00 AM - 6:00 PM', messaging: ''};
    if (tpl >= 13) draft.prem = {dm: GEMKEYS[(n - 1) % GEMKEYS.length], fx: FX[(n - 1) % FX.length]};
    const now = Date.now(), tag = svc ? 's' : fe ? 'f' : kind === 'contest' ? 'c' : 'p';
    const products = imgs.map((image, k) => ({
      id: `seed-${tag}${n}-${k + 1}`, created: now - k, type: svc ? 'service' : 'product',
      name: fe ? 'Featured Product ' + n : (svc ? 'Service ' : 'Product ') + n + '-' + (k + 1),
      price: fe ? 150 + n * 10 : 100 + (k + 1) * 50 + n * 10,
      category: svc ? 'Service' : 'Product',
      description: fe ? 'Featured product ' + n + ' from ' + name + '.' : (svc ? 'Sample service ' : 'Sample product ') + n + '-' + (k + 1) + ' from ' + name + '.',
      image, available: true, status: 'visible',
      ...(svc ? {duration: '1 hr', area: 'Panabo City', contact: phone} : {stock: 20})}));
    const data = {products, draft, published: JSON.parse(JSON.stringify(draft)), stats: {visits: 0, views: {}}, activity: [], plan: planOf(tpl), bizType: K.biz || (svc ? 'service' : 'product')};
    return {user, kind, n, poster, data, acc: {username: user, business: name, fullName: name + ' Owner', bizType: data.bizType, pass: await hash(K.pass), created: now}};
  }

  /* only creates accounts that do not exist yet (never overwrites your edits); force=true → rebuild all */
  async function run(force) {
    try {
      const acc = read(), jobs = [];
      for (const kind of Object.keys(KINDS)) for (let n = 1; n <= kcount(kind); n++) {
        const u = KINDS[kind].prefix + n;
        if (force || !acc[u] || !localStorage.getItem(keyOf(u))) jobs.push(build(kind, n));
      }
      if (!jobs.length) return;
      const all = await Promise.all(jobs);
      all.forEach(x => {
        acc[x.user] = Object.assign({}, acc[x.user] || {}, x.acc);
        localStorage.setItem(keyOf(x.user), JSON.stringify(x.data));
        if (x.poster && (force || !localStorage.getItem('po_posters_' + x.user))) { localStorage.setItem('po_posters_' + x.user, JSON.stringify([posterItem(x.kind, x.n, x.poster)])); localStorage.setItem('po_pz_' + x.user, '1'); }
      });
      localStorage.setItem(AK, JSON.stringify(acc));
    } catch (e) { console.warn('PanaboOne seed failed', e); }
  }

  /* one-time: give already-created preset accounts their new layout + plan (so you don't need ?reseed=1) */
  function retemplate() {
    try {
      if (localStorage.getItem('po_seed_tpl8')) return;
      for (const kind of ['product', 'service']) for (let n = 1; n <= CONFIG.count; n++) {
        const key = keyOf(KINDS[kind].prefix + n), raw = localStorage.getItem(key); if (!raw) continue;
        const d = JSON.parse(raw), t = tplOf(kind, n);
        [d.draft, d.published].forEach(o => { if (!o) return; o.template = t; if (t >= 13) o.prem = Object.assign({dm: GEMKEYS[(n - 1) % GEMKEYS.length], fx: FX[(n - 1) % FX.length]}, o.prem || {}); });
        d.plan = planOf(t);
        localStorage.setItem(key, JSON.stringify(d));
      }
      localStorage.setItem('po_seed_tpl8', '1');
    } catch (e) { console.warn('PanaboOne retemplate failed', e); }
  }

  /* seeded products/banners that still have no picture → look again (once per tab session) */
  async function refresh() {
    try {
      if (sessionStorage.getItem('po_seed_chk4')) return;
      sessionStorage.setItem('po_seed_chk4', '1');
      const jobs = [];
      for (const kind of Object.keys(KINDS)) for (let n = 1; n <= kcount(kind); n++) jobs.push((async () => {
        const key = keyOf(KINDS[kind].prefix + n), raw = localStorage.getItem(key); if (!raw) return;
        const d = JSON.parse(raw); let ch = false;
        await Promise.all(d.products.filter(p => String(p.id).startsWith('seed-') && !p.image).map(async p => {
          const k = +String(p.id).split('-').pop(), u = await find(imgPath(kind, n, k)); if (u) { p.image = u; ch = true; } }));
        if (!d.draft.logo) { const lu = await find(CONFIG.logo(kind, n)); if (lu) { d.draft.logo = lu; if (d.published && !d.published.logo) d.published.logo = lu; ch = true; } }
        const bp = bannerPath(kind, n);
        if (bp && !d.draft.banner) { const u = await find(bp);
          if (u) { d.draft.banner = u; if (d.published && !d.published.banner) d.published.banner = u; ch = true; } }
        if (ch) localStorage.setItem(key, JSON.stringify(d));
      })());
      /* posters dropped into assets/posters/ later: add them once (a poster the owner deletes does not come back) */
      for (const kind of ['product', 'service', 'contest']) for (let n = 1; n <= kcount(kind); n++) jobs.push((async () => {
        const user = KINDS[kind].prefix + n, pk = 'po_posters_' + user;
        if (!localStorage.getItem(keyOf(user)) || localStorage.getItem('po_pz_' + user)) return;
        const u = await find(CONFIG.poster(kind, n)); if (!u) return;
        let g = []; try { g = JSON.parse(localStorage.getItem(pk)) || []; } catch (e) {}
        if (!g.some(p => p.id === 'seed-poster-' + kind + n)) g.unshift(posterItem(kind, n, u));
        localStorage.setItem(pk, JSON.stringify(g)); localStorage.setItem('po_pz_' + user, '1');
      })());
      await Promise.all(jobs);
    } catch (e) { console.warn('PanaboOne seed refresh failed', e); }
  }

  try { if (!localStorage.getItem('po_rm_store20')) { const a = read(); for (let i = 1; i <= 20; i++) { delete a['store' + i]; localStorage.removeItem('panaboone_v1_store' + i); localStorage.removeItem('po_posters_store' + i); }
    localStorage.setItem(AK, JSON.stringify(a)); localStorage.setItem('po_rm_store20', '1'); localStorage.removeItem('po_seed_v3'); } } catch (e) {}
  const force = /[?&]reseed=1/.test(location.search);
  console.log('PanaboOne seed: assets base =', BASE, '— test:', BASE + 'featured/featured1.png');
  const ready = run(force).then(retemplate).then(refresh);
  return {ready, find};
})();
