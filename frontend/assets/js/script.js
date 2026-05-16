// ============================================================
//  script.js  —  Modern Furniture
//  Global scripts: navbar, mobile menu, scroll, hero slider
// ============================================================

document.addEventListener('DOMContentLoaded', function () {

 // ── NAVBAR: inject full dropdown on every page ──────────────
const dropdown = document.getElementById('userDropdown');
if (dropdown) {
  dropdown.innerHTML = `
    <div id="userNameLabel" style="padding:0.75rem 1rem;font-size:0.82rem;border-bottom:1px solid var(--cream-dark);min-height:2.5rem;"></div>
    <a href="profile.html" class="dd-link" onmouseover="this.style.background='var(--cream)'" onmouseout="this.style.background='transparent'" style="display:flex;align-items:center;gap:0.6rem;padding:0.7rem 1rem;font-size:0.88rem;color:var(--wood-dark);border-radius:8px;text-decoration:none;">
      <i class="fas fa-user-circle" style="color:var(--wood-mid);width:16px;"></i> My Profile
    </a>
    <a href="my-orders.html" class="dd-link" onmouseover="this.style.background='var(--cream)'" onmouseout="this.style.background='transparent'" style="display:flex;align-items:center;gap:0.6rem;padding:0.7rem 1rem;font-size:0.88rem;color:var(--wood-dark);border-radius:8px;text-decoration:none;">
      <i class="fas fa-shopping-bag" style="color:var(--wood-mid);width:16px;"></i> My Orders
    </a>
    <a href="login.html" id="ddLoginLink" onmouseover="this.style.background='var(--cream)'" onmouseout="this.style.background='transparent'" style="display:flex;align-items:center;gap:0.6rem;padding:0.7rem 1rem;font-size:0.88rem;color:var(--wood-dark);border-radius:8px;text-decoration:none;">
      <i class="fas fa-sign-in-alt" style="color:var(--wood-mid);width:16px;"></i> Login / Register
    </a>
    <button onclick="logout()" id="ddLogoutBtn" onmouseover="this.style.background='#fff0f0'" onmouseout="this.style.background='transparent'" style="display:none;width:100%;align-items:center;gap:0.6rem;padding:0.7rem 1rem;font-size:0.88rem;color:#e54444;border-radius:8px;border:none;background:none;cursor:pointer;font-family:'Jost',sans-serif;text-align:left;">
      <i class="fas fa-sign-out-alt" style="width:16px;"></i> Logout
    </button>
  `;

    // Show/hide based on login state
    const user = (function() { try { return JSON.parse(localStorage.getItem('lb_user')); } catch(e) { return null; } })();

    if (user) {
      const label = document.getElementById('userNameLabel');
      if (label) label.innerHTML = '<span style="font-size:0.72rem;color:var(--text-muted);">Signed in as</span><br><strong style="color:var(--wood-dark);font-size:0.85rem;">👋 ' + user.name + '</strong>';

      const loginLink = document.getElementById('ddLoginLink');
      const logoutBtn = document.getElementById('ddLogoutBtn');
      if (loginLink) loginLink.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'flex';

      // Update avatar button with user initial or photo
      const menuBtn = document.getElementById('userMenuBtn');
      if (menuBtn) {
        if (user.avatar && user.avatar.length > 0) {
          menuBtn.innerHTML = '<img src="' + user.avatar + '" style="width:36px;height:36px;border-radius:50%;object-fit:cover;">';
          menuBtn.style.padding = '0';
          menuBtn.style.overflow = 'hidden';
        } else {
          menuBtn.innerHTML = '<span style="font-weight:700;font-size:1rem;">' + user.name.charAt(0).toUpperCase() + '</span>';
        }
      }
    } else {
      // Hide profile/orders for guests
      dropdown.querySelectorAll('.dd-link').forEach(function(l) { l.style.display = 'none'; });
    }

    // Toggle dropdown
    const menuBtn = document.getElementById('userMenuBtn');
    if (menuBtn) {
      menuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
      });
    }
    document.addEventListener('click', function() { dropdown.style.display = 'none'; });
    dropdown.addEventListener('click', function(e) { e.stopPropagation(); });
  }

  // ── MOBILE MENU ──────────────────────────────────────────────
  const navToggle  = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileClose = document.querySelector('.mobile-close');
  const mobileOverlay = document.querySelector('.mobile-menu-overlay');

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', function() {
      mobileMenu.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }
  function closeMobile() {
    if (mobileMenu) mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }
  if (mobileClose) mobileClose.addEventListener('click', closeMobile);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobile);

  // ── NAVBAR SCROLL EFFECT ─────────────────────────────────────
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', function() {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  // ── SCROLL TO TOP BUTTON ─────────────────────────────────────
  const scrollBtn = document.querySelector('.scroll-top');
  if (scrollBtn) {
    window.addEventListener('scroll', function() {
      scrollBtn.classList.toggle('visible', window.scrollY > 400);
    });
    scrollBtn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── HERO SLIDER ──────────────────────────────────────────────
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.hero-dot');
  let current  = 0;
  let sliderInterval;

  function goToSlide(n) {
    slides.forEach(function(s) { s.classList.remove('active'); });
    dots.forEach(function(d)   { d.classList.remove('active'); });
    current = (n + slides.length) % slides.length;
    if (slides[current]) slides[current].classList.add('active');
    if (dots[current])   dots[current].classList.add('active');
  }

  if (slides.length > 0) {
    sliderInterval = setInterval(function() { goToSlide(current + 1); }, 4500);

    const prev = document.querySelector('.hero-arrow.prev');
    const next = document.querySelector('.hero-arrow.next');
    if (prev) prev.addEventListener('click', function() { clearInterval(sliderInterval); goToSlide(current - 1); });
    if (next) next.addEventListener('click', function() { clearInterval(sliderInterval); goToSlide(current + 1); });
    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() { clearInterval(sliderInterval); goToSlide(i); });
    });
  }

  // ── CART BADGE ────────────────────────────────────────────────
  if (typeof _updateBadge === 'function') _updateBadge();

});