// ============================================================
//  api.js  —  Modern Furniture  |  Frontend ↔ Backend Bridge
//
//  Load this FIRST on every page:
//    <script src="assets/js/api.js"></script>
//
//  This file handles:
//    • Auth  (login, register, logout, token)
//    • Products (list with filters, single product)
//    • Orders (place order, my orders)
//    • Cart  (localStorage-based, no login required)
//    • Server health check (for login page banner)
// ============================================================

const API_BASE = 'http://localhost:5000/api';

// ── Internal online-check cache ──────────────────────────────
// login.html sets this to null to force a recheck
let _online = null;

async function _checkOnline() {
  if (_online !== null) return _online;
  try {
    const r = await fetch(API_BASE + '/health', {
      signal: AbortSignal.timeout(3000),
    });
    _online = r.ok;
  } catch {
    _online = false;
  }
  return _online;
}

// ── Generic fetch wrapper ─────────────────────────────────────
async function _req(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };

  // Attach JWT token if logged in
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;

  try {
    const res = await fetch(API_BASE + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('API Error:', err.message);
    return { success: false, message: 'Cannot reach server. Is it running on port 5000?' };
  }
}

// ════════════════════════════════════════════════════════════
//  AUTH
// ════════════════════════════════════════════════════════════

/**
 * Login user
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{success, token, user} | {success, message}>}
 */
async function loginUser(email, password) {
  return _req('POST', '/auth/login', { email, password });
}

/**
 * Register new user
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @param {string} phone  (optional)
 * @returns {Promise<{success, token, user} | {success, message}>}
 */
async function registerUser(name, email, password, phone = '') {
  return _req('POST', '/auth/register', { name, email, password, phone });
}

/**
 * Verify token and get current user — used by index.html session guard
 * @returns {Promise<{success, user} | {success, message}>}
 */
async function getMe() {
  return _req('GET', '/auth/me');
}

// ── Auth helpers ─────────────────────────────────────────────

/** Save token + user to localStorage after login/register */
function saveAuth(data) {
  if (data.token) localStorage.setItem('lb_token', data.token);
  if (data.user)  localStorage.setItem('lb_user',  JSON.stringify(data.user));
}

/** Remove all auth data */
function clearAuth() {
  localStorage.removeItem('lb_token');
  localStorage.removeItem('lb_user');
}

/** Get JWT token string */
function getToken() {
  return localStorage.getItem('lb_token') || null;
}

/** Get current user object */
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('lb_user'));
  } catch {
    return null;
  }
}

/** Check if user is logged in */
function isLoggedIn() {
  return !!getToken();
}

/** Logout: clear storage and redirect to login */
function logout() {
  clearAuth();
  window.location.href = 'login.html';
}

// ════════════════════════════════════════════════════════════
//  PRODUCTS
// ════════════════════════════════════════════════════════════

/**
 * Get products list with optional filters
 * @param {Object} params  — { category, search, sort, minPrice, maxPrice, page, limit }
 * @returns {Promise<{success, products, total, page, pages}>}
 */
async function getProducts(params = {}) {
  // Remove empty/undefined keys
  const clean = {};
  Object.entries(params).forEach(([k, v]) => {
    if (v !== '' && v !== undefined && v !== null) clean[k] = v;
  });
  const qs = new URLSearchParams(clean).toString();
  return _req('GET', '/products' + (qs ? '?' + qs : ''));
}

/**
 * Get a single product by ID
 * @param {string} id  — MongoDB _id
 * @returns {Promise<{success, product} | {success, message}>}
 */
async function getProduct(id) {
  return _req('GET', '/products/' + id);
}

// ════════════════════════════════════════════════════════════
//  ORDERS
// ════════════════════════════════════════════════════════════

/**
 * Place an order (requires login)
 * @param {Object} orderData
 * @returns {Promise<{success, order} | {success, message}>}
 */
async function placeOrder(orderData) {
  return _req('POST', '/orders', orderData);
}

/**
 * Get current user's order history
 * @returns {Promise<{success, orders}>}
 */
async function getMyOrders() {
  return _req('GET', '/orders/myorders');
}

// ════════════════════════════════════════════════════════════
//  CART  (stored in localStorage — no login required)
// ════════════════════════════════════════════════════════════

/** Get cart array from localStorage */
function getCart() {
  try {
    return JSON.parse(localStorage.getItem('lb_cart')) || [];
  } catch {
    return [];
  }
}

/** Save cart array to localStorage and update badge */
function saveCart(cart) {
  localStorage.setItem('lb_cart', JSON.stringify(cart));
  _updateBadge();
}

/**
 * Add item to cart — merges qty if already present
 * @param {{ id, name, price, emoji }} item
 */
function addToCart(item) {
  const cart     = getCart();
  const existing = cart.find(i => i.id === item.id);

  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }

  saveCart(cart);
  _showAddedToast(item.name);
}

/** Remove item from cart by id */
function removeFromCart(id) {
  saveCart(getCart().filter(i => i.id !== id));
}

/** Empty the entire cart */
function clearCart() {
  localStorage.removeItem('lb_cart');
  _updateBadge();
}

/** Get cart subtotal (price × qty for all items) */
function getCartTotal() {
  return getCart().reduce((sum, i) => sum + i.price * (i.qty || 1), 0);
}

// ════════════════════════════════════════════════════════════
//  UI HELPERS
// ════════════════════════════════════════════════════════════

/** Update all .cart-badge elements with current cart count */
function _updateBadge() {
  const count = getCart().reduce((s, i) => s + (i.qty || 1), 0);
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.textContent = count;
  });
}

/** Show a small toast notification when product is added to cart */
function _showAddedToast(productName) {
  let toast = document.getElementById('_lb_toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = '_lb_toast';
    Object.assign(toast.style, {
      position:       'fixed',
      bottom:         '2rem',
      right:          '2rem',
      zIndex:         '9999',
      background:     '#3D2314',
      color:          '#D4A853',
      padding:        '0.85rem 1.5rem',
      borderRadius:   '50px',
      fontFamily:     "'Jost', sans-serif",
      fontSize:       '0.88rem',
      fontWeight:     '600',
      boxShadow:      '0 8px 30px rgba(0,0,0,0.25)',
      display:        'flex',
      alignItems:     'center',
      gap:            '0.6rem',
      transform:      'translateY(120px)',
      opacity:        '0',
      transition:     'all 0.35s cubic-bezier(0.175,0.885,0.32,1.275)',
      pointerEvents:  'none',
    });
    document.body.appendChild(toast);
  }

  toast.innerHTML =
    '<i class="fas fa-check-circle"></i> "' + productName + '" added to cart!';

  // Slide in
  requestAnimationFrame(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity   = '1';
  });

  // Slide out after 2.8 s
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => {
    toast.style.transform = 'translateY(120px)';
    toast.style.opacity   = '0';
  }, 2800);
}

// ── Run on every page: keep the badge in sync ─────────────────
document.addEventListener('DOMContentLoaded', _updateBadge);