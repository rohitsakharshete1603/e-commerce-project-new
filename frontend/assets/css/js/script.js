/* ============================================================
   script.js — Laxmi Bhandi & Furniture
   UI interactions: navbar scroll, hero slider, mobile menu,
   scroll-to-top
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Navbar scroll effect ──────────────────────────────────
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ── Hero Slider ───────────────────────────────────────────
  const slides    = document.querySelectorAll('.hero-slide');
  const dots      = document.querySelectorAll('.hero-dot');
  const prevBtn   = document.querySelector('.hero-arrow.prev');
  const nextBtn   = document.querySelector('.hero-arrow.next');
  let   current   = 0;
  let   autoTimer = null;

  function goToSlide(n) {
    if (!slides.length) return;
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goToSlide(current + 1), 5000);
  }

  if (slides.length) {
    prevBtn?.addEventListener('click', () => { goToSlide(current - 1); startAuto(); });
    nextBtn?.addEventListener('click', () => { goToSlide(current + 1); startAuto(); });
    dots.forEach((d, i) => d.addEventListener('click', () => { goToSlide(i); startAuto(); }));
    startAuto();
  }

  // ── Mobile Menu ───────────────────────────────────────────
  const navToggle   = document.getElementById('navToggle');
  const mobileMenu  = document.getElementById('mobileMenu');
  const mobileClose = mobileMenu?.querySelector('.mobile-close');
  const overlay     = mobileMenu?.querySelector('.mobile-menu-overlay');

  function openMenu()  { mobileMenu?.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function closeMenu() { mobileMenu?.classList.remove('open'); document.body.style.overflow = ''; }

  navToggle?.addEventListener('click', openMenu);
  mobileClose?.addEventListener('click', closeMenu);
  overlay?.addEventListener('click', closeMenu);

  // ── Scroll-to-top ─────────────────────────────────────────
  const scrollBtn = document.querySelector('.scroll-top');
  if (scrollBtn) {
    window.addEventListener('scroll', () => {
      scrollBtn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ── Active nav link ───────────────────────────────────────
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) link.classList.add('active');
  });

  // ── Search button (basic) ─────────────────────────────────
  document.querySelector('.nav-search-btn')?.addEventListener('click', () => {
    const q = prompt('Search for furniture:');
    if (q && q.trim()) {
      window.location.href = `product.html?search=${encodeURIComponent(q.trim())}`;
    }
  });

});