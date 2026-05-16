/* ================================================================
   api.js — Laxmi Bhandi & Furniture
   AUTO-DETECTS if backend is running.
   If backend is offline → uses localStorage mock so login still works.
   ================================================================ */

const API_BASE = 'http://localhost:5000';

// ── Backend online check (runs once per page load) ─────────────
let _online = null; // null=unknown true=yes false=no

async function _checkOnline() {
  if (_online !== null) return _online;
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 3000);
    const r = await fetch(API_BASE + '/api/health', { signal: ctrl.signal });
    _online = r.status < 500;
  } catch {
    _online = false;
  }
  return _online;
}

// ── Token / session helpers ────────────────────────────────────
function getToken()        { return localStorage.getItem('lb_token') || null; }
function getCurrentUser()  { try { return JSON.parse(localStorage.getItem('lb_user')); } catch { return null; } }
function saveAuth(data)    { if (data.token) localStorage.setItem('lb_token', data.token); if (data.user) localStorage.setItem('lb_user', JSON.stringify(data.user)); }
function clearAuth()       { localStorage.removeItem('lb_token'); localStorage.removeItem('lb_user'); }
function logout()          { clearAuth(); window.location.href = 'login.html'; }

// ── Real HTTP request ──────────────────────────────────────────
async function _req(path, opts = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}), ...(opts.headers || {}) };
  try {
    const r = await fetch(API_BASE + path, { ...opts, headers });
    const ct = r.headers.get('content-type') || '';
    if (!ct.includes('application/json')) return null;
    return await r.json();
  } catch { return null; }
}

// ── MOCK auth using localStorage ───────────────────────────────
function _getUsers() { try { return JSON.parse(localStorage.getItem('lb_users') || '[]'); } catch { return []; } }
function _saveUsers(u) { localStorage.setItem('lb_users', JSON.stringify(u)); }
function _fakeToken(id) { return 'mock.' + btoa(id + '.' + Date.now()); }

function _mockRegister(name, email, password, phone) {
  const users = _getUsers();
  if (users.find(u => u.email === email))
    return { success: false, message: 'Email already registered. Please login.' };
  const user = { _id: 'u' + Date.now(), name, email, password, phone: phone || '', role: 'user' };
  users.push(user);
  _saveUsers(users);
  const { password: _, ...safe } = user;
  return { success: true, token: _fakeToken(user._id), user: safe };
}

function _mockLogin(email, password) {
  const user = _getUsers().find(u => u.email === email && u.password === password);
  if (!user) return { success: false, message: 'Invalid email or password.' };
  const { password: _, ...safe } = user;
  return { success: true, token: _fakeToken(user._id), user: safe };
}

// ── Public auth API ────────────────────────────────────────────
async function loginUser(email, password) {
  if (await _checkOnline()) {
    const d = await _req('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    if (d) return d;
  }
  return _mockLogin(email, password);
}

async function registerUser(name, email, password, phone) {
  if (await _checkOnline()) {
    const d = await _req('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password, phone }) });
    if (d) return d;
  }
  return _mockRegister(name, email, password, phone);
}

async function getMe() {
  if (await _checkOnline()) {
    const d = await _req('/api/auth/me');
    if (d) return d;
  }
  const user = getCurrentUser();
  return user ? { success: true, user } : { success: false };
}

// ── Products ───────────────────────────────────────────────────
async function getProducts(p) { const q = new URLSearchParams(p || {}).toString(); return _req('/api/products' + (q ? '?' + q : '')); }
async function getProduct(id) { return _req('/api/products/' + id); }

// ── Cart (always localStorage) ─────────────────────────────────
function getCart()           { try { return JSON.parse(localStorage.getItem('lb_cart') || '[]'); } catch { return []; } }
function saveCart(c)         { localStorage.setItem('lb_cart', JSON.stringify(c)); _updateBadge(); }
function getCartCount()      { return getCart().reduce((s, i) => s + i.qty, 0); }
function getCartTotal()      { return getCart().reduce((s, i) => s + i.price * i.qty, 0); }
function clearCart()         { localStorage.removeItem('lb_cart'); _updateBadge(); }
function removeFromCart(id)  { saveCart(getCart().filter(i => i.id !== id)); }
function updateCartQty(id,q) { const c=getCart(), i=c.find(x=>x.id===id); if(i){i.qty=Math.max(1,q);saveCart(c);} }

function addToCart(p) {
  const c = getCart(), ex = c.find(i => i.id === p.id);
  ex ? ex.qty++ : c.push({ ...p, qty: 1 });
  saveCart(c);
  _toast('🛒 "' + p.name + '" added to cart!');
}

function _updateBadge() {
  const n = getCartCount();
  document.querySelectorAll('.cart-badge').forEach(b => { b.textContent = n; b.style.display = n ? 'flex' : 'none'; });
}

// ── Toast ──────────────────────────────────────────────────────
function _toast(msg) {
  let t = document.getElementById('lb-toast');
  if (!t) {
    t = document.createElement('div'); t.id = 'lb-toast';
    t.style.cssText = 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%) translateY(120px);background:#3D2314;color:#D4A853;padding:.85rem 1.75rem;border-radius:50px;font-family:Jost,sans-serif;font-size:.88rem;font-weight:600;z-index:9999;transition:transform .35s ease;box-shadow:0 8px 32px rgba(61,35,20,.3);white-space:nowrap;';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(t._t);
  t._t = setTimeout(() => { t.style.transform = 'translateX(-50%) translateY(120px)'; }, 2800);
}

// ── Session guard ──────────────────────────────────────────────
async function verifySession() {
  if (!getToken()) { window.location.href = 'login.html'; return false; }
  const d = await getMe();
  if (!d || !d.success) { clearAuth(); window.location.href = 'login.html'; return false; }
  return true;
}

// ── Init on every page ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  _updateBadge();
  document.querySelectorAll('.add-cart-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const card = btn.closest('[data-id]');
      if (!card) return;
      addToCart({ id: card.dataset.id, name: card.dataset.name, price: parseInt(card.dataset.price), emoji: card.dataset.emoji || '🛋️' });
    });
  });
});