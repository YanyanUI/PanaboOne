/* PanaboOne — shared footer for Login / Create Account (same footer as the customer page) */
(() => {
  const me = document.currentScript, R = me.src.replace(/Dashboard\/shared\/footer\.js.*$/, ''), D = R + 'Dashboard/Customer/discover.html';
  document.body.insertAdjacentHTML('beforeend', `<footer class="ft" id="contact">
  <div class="in fg2">
    <div class="fc fbr"><a class="brand" href="https://yanyanui.github.io/PanaboOne-Promotional/index.html?fbclid=IwY2xjawVkuDxleHRuA2FlbQIxMABwZG9mBWJyaWQRMWxITHVndnowVHJDNDNGd2pzcnRjBmFwcF9pZBAyMjIwMzkxNzg4MjAwODkyAAEfJ5z8IrJIoittgcteaAasw9DOfpciKGsmZWJBztgnxBvwKKs4vCmr88jjW94_aem_SkK-3KxDL0nPyK58nJuVQQ#services" target="_blank" rel="noopener noreferrer" aria-label="PanaboOne Promotional website"><svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><g stroke-width="5" fill="none"><circle cx="32" cy="18" r="12" stroke="#a33fa8"/><circle cx="46" cy="32" r="12" stroke="#3aa7dd"/><circle cx="32" cy="46" r="12" stroke="#3b5bd6"/><circle cx="18" cy="32" r="12" stroke="#7a3fb8"/></g><circle cx="32" cy="32" r="4" fill="#5b3fd4"/></svg><span>Panabo<b>One</b></span></a>
      <p class="tag2">Discover Local. Support Local.</p>
      <p class="desc">Your online marketplace for Panabo City. Find fresh food, handmade goods, repair shops, salons and more, all from neighbors who run them.</p>
      <div class="so"><a href="https://www.facebook.com/profile.php?id=61596672921674" target="_blank" rel="noopener noreferrer" aria-label="PanaboOne on Facebook"><svg fill="currentColor" viewBox="0 0 24 24"><path d="M13.5 22v-8h2.7l.5-3.4h-3.2V8.5c0-1 .4-1.7 1.8-1.7h1.5V3.8A19 19 0 0 0 14.2 3.7c-2.6 0-4.3 1.6-4.3 4.4v2.5H7v3.4h2.9v8h3.6Z"/></svg></a><a href="#" aria-label="TikTok"><svg fill="currentColor" viewBox="0 0 24 24"><path d="M16.6 2h-3.2v13.2a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9a6.1 6.1 0 1 0 5.2 6V8.4a7.4 7.4 0 0 0 4.3 1.4V6.6A4.3 4.3 0 0 1 16.6 2Z"/></svg></a><a href="#" aria-label="YouTube"><svg fill="currentColor" viewBox="0 0 24 24"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10 15V9l5.2 3L10 15Z"/></svg></a><a href="#" aria-label="Messenger"><svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.2 2 11.5c0 2.9 1.3 5.4 3.4 7.1V22l3.1-1.7c1.1.3 2.3.5 3.5.5 5.5 0 10-4.2 10-9.3S17.5 2 12 2Zm1 12.4-2.5-2.6-4.9 2.6 5.4-5.7 2.6 2.6 4.8-2.6-5.4 5.7Z"/></svg></a></div></div>
    <div class="fc"><h4>Explore</h4><ul><li><a href="${D}">Home</a></li><li><a href="${D}?v=stores">Browse Stores</a></li><li><a href="${D}?v=local">Local Businesses</a></li><li><a href="${D}?v=posters">Posters</a></li><li><a href="${D}?v=about">About Us</a></li></ul></div>
    <div class="fc"><h4>Categories</h4><ul><li><a href="${D}?t=product">Products</a></li><li><a href="${D}?t=service">Services</a></li><li><a href="${D}?v=stores">Shops Near You</a></li></ul>
      <h4 style="margin-top:24px">For Businesses</h4><ul><li><a href="${R}CreateAccount/createAccount.html">Create Your Store</a></li><li><a href="${R}index.html">Business Login</a></li></ul></div>
    <div class="fc"><h4>Support</h4><ul><li><button type="button" class="fl" data-info="help">Help Center</button></li><li><button type="button" class="fl" data-info="contact">Contact Us</button></li><li><button type="button" class="fl" data-info="terms">Terms &amp; Conditions</button></li><li><button type="button" class="fl" data-info="privacy">Privacy Policy</button></li></ul></div>
    <div class="fc ct2"><h4>Get in Touch</h4><ul>
      <li class="ci"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg><span>Panabo City,<br>Davao del Norte, Philippines</span></li>
      <li class="ci"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/></svg><a href="tel:+639171234567">0917 123 4567</a></li>
      <li class="ci"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg><a href="mailto:hello@panaboone.com">hello@panaboone.com</a></li>
      <li class="ci"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><span>Mon–Sat, 8:00 AM – 5:00 PM<small>We reply within one business day</small></span></li></ul></div>
  </div>
  <div class="cp"><div class="in"><span>© <span id="yr">2026</span> PanaboOne. All rights reserved.</span><span>Made with <span class="hr">♥</span> in Panabo City, Davao del Norte</span></div></div>
</footer>`);
  document.getElementById('yr').textContent = new Date().getFullYear();
  const INFO = {
  contact: ['Contact Us', 'Email hello@panaboone.com or call 0917 123 4567, Monday to Saturday, 8:00 AM to 5:00 PM. To reach a shop, open its store page and tap Contact.'],
  help: ['Help Center', 'Search for a product or service, or browse stores, then open a listing to see the shop\'s phone number, address and hours. Business owners can create a free store from the Login page.'],
  terms: ['Terms & Conditions', 'PanaboOne lists local businesses in Panabo City. Prices, availability and orders are handled between you and the business.'],
  privacy: ['Privacy Policy', 'PanaboOne only shows the business information that owners choose to publish on their store page.']
};
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  document.querySelector('.ft').addEventListener('click', e => {
    const b = e.target.closest('[data-info]'); if (!b) return;
    let m = document.getElementById('fminfo');
    if (!m) { m = document.createElement('div'); m.className = 'fm'; m.id = 'fminfo'; document.body.appendChild(m);
      m.onmousedown = ev => { if (ev.target === m) m.classList.remove('show'); };
      addEventListener('keydown', ev => { if (ev.key === 'Escape') m.classList.remove('show'); }); }
    const [t, x] = INFO[b.dataset.info];
    m.innerHTML = `<div class="fmb"><h2>${esc(t)}</h2><p>${esc(x)}</p><button type="button">Close</button></div>`;
    m.querySelector('button').onclick = () => m.classList.remove('show'); m.classList.add('show');
  });
})();
