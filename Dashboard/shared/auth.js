/* PanaboOne auth (localStorage demo — no server) */
const POAuth = (() => {
  const AK = 'po_accounts', SK = 'po_session', LK = 'po_last';
  const read = () => { try { return JSON.parse(localStorage.getItem(AK)) || {}; } catch (e) { return {}; } };
  const hash = async s => {
    try { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('panaboone:' + s));
      return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
    catch (e) { let h = 5381; for (const c of s) h = (h * 33) ^ c.charCodeAt(0); return 'x' + (h >>> 0).toString(16); }
  };
  const start = u => { localStorage.setItem(SK, u); localStorage.setItem(LK, u); };
  async function register(f) {
    const business = (f.business || '').trim(), fullName = (f.fullName || '').trim(), user = (f.username || '').trim().toLowerCase(), pw = f.password || '';
    if (!business || !fullName || !user || !pw) return {ok: false, error: 'Please fill out all fields.'};
    if (!/^[a-z0-9_.]{3,20}$/.test(user)) return {ok: false, error: 'Username must be 3–20 characters: letters, numbers, _ or . only.'};
    if (pw.length < 6) return {ok: false, error: 'Password must be at least 6 characters.'};
    const acc = read();
    if (acc[user]) return {ok: false, error: 'That username is already taken.'};
    acc[user] = {username: user, business, fullName, bizType: ['product','service','both'].includes(f.bizType) ? f.bizType : 'product', pass: await hash(pw), created: Date.now()};
    try { localStorage.setItem(AK, JSON.stringify(acc)); start(user); } catch (e) { return {ok: false, error: 'Could not save the account (browser storage is full).'}; }
    return {ok: true};
  }
  async function login(username, pw) {
    const user = (username || '').trim().toLowerCase();
    if (!user || !pw) return {ok: false, error: 'Enter your username and password.'};
    const a = read()[user];
    if (!a || a.pass !== await hash(pw)) return {ok: false, error: 'Incorrect username or password.'};
    start(user); return {ok: true};
  }
  async function changePassword(user, cur, next, again) {
    const acc = read(), a = acc[user];
    if (!a) return {ok: false, error: 'Account not found. Please log in again.'};
    if (!cur || !next || !again) return {ok: false, error: 'Please fill out all password fields.'};
    if (a.pass !== await hash(cur)) return {ok: false, error: 'Current password is incorrect.'};
    if (next.length < 6) return {ok: false, error: 'New password must be at least 6 characters.'};
    if (next !== again) return {ok: false, error: 'New passwords do not match.'};
    if (next === cur) return {ok: false, error: 'New password must be different from the current one.'};
    a.pass = await hash(next);
    try { localStorage.setItem(AK, JSON.stringify(acc)); } catch (e) { return {ok: false, error: 'Could not save (browser storage is full).'}; }
    return {ok: true};
  }
  const session = () => { try { return localStorage.getItem(SK) || ''; } catch (e) { return ''; } };
  const logout = () => { try { localStorage.removeItem(SK); } catch (e) {} };
  return {register, login, changePassword, session, logout};
})();
