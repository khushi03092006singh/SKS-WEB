/**
 * SKS Artist Studio — Main JavaScript
 * Handles: Sticky header, mobile menu, portfolio filters,
 *          lightbox, testimonial carousel, scroll-reveal,
 *          contact form, newsletter, back-to-top, cookie banner
 */

'use strict';

/* ─── UTILITIES ──────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─── 1. STICKY HEADER ───────────────────────────────────────── */
(function initStickyHeader() {
  const header = $('#header');
  if (!header) return;

  const handleScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
})();

/* ─── MEET THE ARTIST SECTION OBSERVER & COUNTERS ───────────── */
(function initArtistSection() {
  const artistSection = $('#artist');
  if (!artistSection) return;

  const numberEls = $$('.card-number', artistSection);
  let animated = false;

  const animateCounters = () => {
    numberEls.forEach((el) => {
      const target = parseInt(el.dataset.target, 10) || 0;
      const suffix = el.dataset.suffix || '';
      const duration = 1600;
      const startTime = performance.now();

      const step = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(easeProgress * target);

        el.textContent = currentValue + suffix;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target + suffix;
        }
      };

      requestAnimationFrame(step);
    });
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        artistSection.classList.add('revealed');
        if (!animated) {
          animated = true;
          setTimeout(animateCounters, 300);
        }
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  observer.observe(artistSection);
})();

/* ─── 2. ACTIVE NAV LINK (Intersection Observer) ─────────────── */
(function initActiveNav() {
  const sections = $$('section[id], header[id]');
  const navLinks = $$('.nav-links a');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + entry.target.id) {
              link.classList.add('active');
            }
          });
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  sections.forEach((section) => observer.observe(section));
})();

/* ─── 3. MOBILE MENU ─────────────────────────────────────────── */
(function initMobileMenu() {
  const hamburger = $('#hamburger');
  const mobileMenu = $('#mobile-menu');
  if (!hamburger || !mobileMenu) return;

  let isOpen = false;

  const toggle = () => {
    isOpen = !isOpen;
    hamburger.classList.toggle('active', isOpen);
    mobileMenu.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen.toString());
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  const close = () => {
    if (!isOpen) return;
    isOpen = false;
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', toggle);

  // Close when a nav link is clicked
  $$('a', mobileMenu).forEach((link) => {
    link.addEventListener('click', close);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) close();
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (isOpen && !mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
      close();
    }
  });
})();

/* ─── 4. SMOOTH SCROLL ───────────────────────────────────────── */
(function initSmoothScroll() {
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const headerH = $('#header')?.offsetHeight || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH;

      if (prefersReducedMotion) {
        window.scrollTo(0, top);
      } else {
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
})();

/* ─── 5. SCROLL REVEAL ───────────────────────────────────────── */
(function initScrollReveal() {
  if (prefersReducedMotion) return;

  const reveals = $$('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  reveals.forEach((el) => observer.observe(el));
})();

/* ─── 6. PORTFOLIO SECTION ANIMATIONS & FILTERS ──────────────── */
(function initPortfolioAnimations() {
  const portfolioSection = $('#portfolio');
  const portfolioHeader  = $('.portfolio-header', portfolioSection);
  const filterBtns       = $$('.filter-btn');
  const items            = $$('.portfolio-item');

  if (!portfolioSection || !items.length) return;

  // 1. Heading Scroll Reveal (Fade-up)
  if (portfolioHeader) {
    const headerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          portfolioHeader.classList.add('revealed');
          headerObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    headerObserver.observe(portfolioHeader);
  }

  // 2. Staggered Scroll Reveal for Portfolio Cards (Fade-up + Scale 0.95 -> 1)
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const item = entry.target;
        const index = items.indexOf(item);
        const delay = (index % 4) * 90; // Staggered delay per card

        setTimeout(() => {
          item.classList.add('revealed');
          // Start subtle floating animation after entrance finishes
          setTimeout(() => {
            if (!prefersReducedMotion && item.style.display !== 'none') {
              item.classList.add('floating');
            }
          }, 650);
        }, delay);

        cardObserver.unobserve(item);
      }
    });
  }, { threshold: 0.08 });

  items.forEach(item => cardObserver.observe(item));

  // 3. Category Filter Switch (Smooth Fade-out / Fade-in & Scale Transition)
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Active state button animation
      filterBtns.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      let visibleCounter = 0;

      items.forEach((item) => {
        const cat = item.dataset.category || '';
        const matches = filter === 'all' || cat.includes(filter);

        if (matches) {
          item.style.display = '';
          item.classList.remove('floating');
          
          const staggerDelay = (visibleCounter % 4) * 70 + 40;
          visibleCounter++;

          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0) scale(1)';
            item.classList.add('revealed');
            
            setTimeout(() => {
              if (!prefersReducedMotion && item.style.display !== 'none') {
                item.classList.add('floating');
              }
            }, 600);
          }, staggerDelay);
        } else {
          item.classList.remove('floating', 'revealed');
          item.style.opacity = '0';
          item.style.transform = 'translateY(25px) scale(0.92)';
          
          setTimeout(() => {
            item.style.display = 'none';
          }, 320);
        }
      });
    });
  });
})();

/* ─── 7. LIGHTBOX ────────────────────────────────────────────── */
(function initLightbox() {
  const lightbox  = $('#lightbox');
  const lbImg     = $('#lightbox-img');
  const lbCaption = $('#lightbox-caption');
  const lbClose   = $('#lightbox-close');
  const lbPrev    = $('#lightbox-prev');
  const lbNext    = $('#lightbox-next');
  const items     = $$('.portfolio-item');

  if (!lightbox || !items.length) return;

  let currentIndex = 0;
  const visibleItems = () => items.filter(i => i.style.display !== 'none');

  const open = (index) => {
    const vis = visibleItems();
    if (!vis[index]) return;
    currentIndex = index;
    const item = vis[index];
    lbImg.src = item.dataset.img || item.querySelector('img')?.src || '';
    lbImg.alt = item.querySelector('img')?.alt || '';
    lbCaption.textContent = item.dataset.title || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  };

  const close = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    // Return focus to the item that triggered open
    visibleItems()[currentIndex]?.focus();
  };

  const navigate = (dir) => {
    const vis = visibleItems();
    currentIndex = (currentIndex + dir + vis.length) % vis.length;
    const item = vis[currentIndex];
    lbImg.style.opacity = '0';
    setTimeout(() => {
      lbImg.src = item.dataset.img || item.querySelector('img')?.src || '';
      lbImg.alt = item.querySelector('img')?.alt || '';
      lbCaption.textContent = item.dataset.title || '';
      lbImg.style.opacity = '1';
    }, 150);
  };

  // Click on item or view button
  items.forEach((item, idx) => {
    const open_ = (e) => {
      if (e.target.closest('.portfolio-overlay') || e.target === item || e.target.tagName === 'IMG') {
        open(idx);
      }
    };
    item.addEventListener('click', open_);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(idx);
      }
    });
  });

  lbClose.addEventListener('click', close);
  lbPrev.addEventListener('click', () => navigate(-1));
  lbNext.addEventListener('click', () => navigate(1));

  // Click outside to close
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });
})();

/* ─── 8. TESTIMONIALS CAROUSEL ───────────────────────────────── */
(function initCarousel() {
  const track   = $('#testimonials-track');
  const dotsWrap = $('#carousel-dots');
  const prevBtn  = $('#carousel-prev');
  const nextBtn  = $('#carousel-next');
  if (!track || !dotsWrap) return;

  const cards = $$('.testimonial-card', track);
  let current = 0;
  let autoTimer;

  // Calculate cards per view based on viewport
  const getPerView = () => {
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 900) return 2;
    return 3;
  };

  let perView = getPerView();
  const totalSlides = () => Math.ceil(cards.length / perView);

  // Build dots
  const buildDots = () => {
    dotsWrap.innerHTML = '';
    const n = totalSlides();
    for (let i = 0; i < n; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === current ? ' active' : '');
      dot.setAttribute('aria-label', `Testimonial page ${i + 1}`);
      dot.setAttribute('role', 'listitem');
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  };

  const updateDots = () => {
    $$('.carousel-dot', dotsWrap).forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
    });
  };

  const goTo = (index) => {
    const n = totalSlides();
    current = Math.max(0, Math.min(index, n - 1));

    const cardW = cards[0]?.offsetWidth || 0;
    const gap = 16; // 1rem
    const offset = current * perView * (cardW + gap);
    track.style.transform = `translateX(-${offset}px)`;
    updateDots();
  };

  const next = () => goTo(current + 1 < totalSlides() ? current + 1 : 0);
  const prev = () => goTo(current - 1 >= 0 ? current - 1 : totalSlides() - 1);

  // Auto advance
  const startAuto = () => {
    clearInterval(autoTimer);
    autoTimer = setInterval(next, 5000);
  };

  const stopAuto = () => clearInterval(autoTimer);

  prevBtn?.addEventListener('click', () => { prev(); startAuto(); });
  nextBtn?.addEventListener('click', () => { next(); startAuto(); });

  // Pause on hover/focus
  track.addEventListener('mouseenter', stopAuto);
  track.addEventListener('mouseleave', startAuto);
  track.addEventListener('focusin', stopAuto);
  track.addEventListener('focusout', startAuto);

  // Touch swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
      startAuto();
    }
  });

  // Recalc on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      perView = getPerView();
      current = 0;
      buildDots();
      goTo(0);
    }, 200);
  });

  // Init
  buildDots();
  goTo(0);
  startAuto();
})();

/* ─── 9. CONTACT FORM ────────────────────────────────────────── */
(function initContactForm() {
  const form      = $('#contact-form');
  const statusEl  = $('#form-status');
  const submitBtn = $('#form-submit-btn');
  if (!form) return;

  const validate = () => {
    let valid = true;

    const nameEl = $('#cf-name');
    const emailEl = $('#cf-email');
    const msgEl = $('#cf-message');

    // Name
    const nameGroup = nameEl?.closest('.form-group');
    if (!nameEl?.value.trim()) {
      nameGroup?.classList.add('has-error');
      valid = false;
    } else {
      nameGroup?.classList.remove('has-error');
    }

    // Email
    const emailGroup = emailEl?.closest('.form-group');
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl?.value || '');
    if (!emailOk) {
      emailGroup?.classList.add('has-error');
      valid = false;
    } else {
      emailGroup?.classList.remove('has-error');
    }

    // Message
    const msgGroup = msgEl?.closest('.form-group');
    if (!msgEl?.value.trim()) {
      msgGroup?.classList.add('has-error');
      valid = false;
    } else {
      msgGroup?.classList.remove('has-error');
    }

    return valid;
  };

  // Clear errors on input
  $$('input, textarea', form).forEach((input) => {
    input.addEventListener('input', () => {
      input.closest('.form-group')?.classList.remove('has-error');
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    statusEl.className = 'form-status';
    statusEl.textContent = '';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' },
      });

      if (res.ok) {
        statusEl.className = 'form-status success';
        statusEl.textContent = '✓ Message sent! We\'ll get back to you within 24 hours.';
        form.reset();
      } else {
        throw new Error('Server error');
      }
    } catch {
      statusEl.className = 'form-status error';
      statusEl.textContent = '✗ Something went wrong. Please try again or email us directly.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Send Message <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
    }
  });
})();

/* ─── 10. NEWSLETTER FORM ────────────────────────────────────── */
(function initNewsletter() {
  const form   = $('#newsletter-form');
  const status = $('#newsletter-status');
  const btn    = $('#newsletter-submit');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('#newsletter-email')?.value.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      status.className = 'newsletter-status error';
      status.style.display = 'block';
      status.style.color = '#f87171';
      status.textContent = 'Please enter a valid email.';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Subscribing…';

    // Simulate API call (replace with real endpoint)
    await new Promise((r) => setTimeout(r, 1200));

    status.className = 'newsletter-status success';
    status.style.display = 'block';
    status.textContent = '✓ You\'re subscribed! Check your inbox.';
    form.reset();
    btn.disabled = false;
    btn.textContent = 'Subscribe';
  });
})();

/* ─── 11. BACK TO TOP ────────────────────────────────────────── */
(function initBackToTop() {
  const btn = $('#back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    if (prefersReducedMotion) {
      window.scrollTo(0, 0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
})();

/* ─── 12. COOKIE BANNER ──────────────────────────────────────── */
(function initCookieBanner() {
  const banner  = $('#cookie-banner');
  const accept  = $('#cookie-accept');
  const decline = $('#cookie-decline');
  if (!banner) return;

  const KEY = 'sks_cookie_consent';
  if (localStorage.getItem(KEY)) return;

  // Show after short delay
  setTimeout(() => {
    banner.classList.add('show');
  }, 2500);

  const dismiss = (accepted) => {
    banner.classList.remove('show');
    localStorage.setItem(KEY, accepted ? 'accepted' : 'declined');
  };

  accept?.addEventListener('click', () => dismiss(true));
  decline?.addEventListener('click', () => dismiss(false));
})();

/* ─── 13. STAT COUNTER ANIMATION ─────────────────────────────── */
(function initStatCounters() {
  if (prefersReducedMotion) return;

  const statNumbers = $$('.stat-number');
  if (!statNumbers.length) return;

  const animateCount = (el) => {
    const text = el.textContent.trim();
    const match = text.match(/^(\d+)/);
    if (!match) return;

    const target = parseInt(match[1]);
    const suffix = text.replace(/^\d+/, '');
    const duration = 1800;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  statNumbers.forEach((el) => observer.observe(el));
})();

/* ─── 14. PORTFOLIO ITEM HOVER (keyboard accessible) ─────────── */
(function initPortfolioHover() {
  $$('.portfolio-item').forEach((item) => {
    item.addEventListener('mouseenter', () => {
      item.querySelector('.portfolio-overlay')?.style && (item.querySelector('.portfolio-overlay').style.opacity = '1');
    });
    item.addEventListener('mouseleave', () => {
      item.querySelector('.portfolio-overlay')?.style && (item.querySelector('.portfolio-overlay').style.opacity = '');
    });
    item.addEventListener('focus', () => {
      item.querySelector('.portfolio-overlay')?.style && (item.querySelector('.portfolio-overlay').style.opacity = '1');
    });
    item.addEventListener('blur', () => {
      item.querySelector('.portfolio-overlay')?.style && (item.querySelector('.portfolio-overlay').style.opacity = '');
    });
  });
})();
