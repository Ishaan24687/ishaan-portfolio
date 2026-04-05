document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollAnimations();
  initProjectToggles();
  initStatsCounter();
  initTypingEffect();
  initScrollToTop();
  initContactForm();
  initParallax();
});

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function debounce(fn, wait = 15) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  };
}

// ---------------------------------------------------------------------------
// 1 & 2. Navigation — smooth scroll, mobile menu, scroll effect, active link
// ---------------------------------------------------------------------------

function initNavigation() {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileOverlay = document.getElementById('mobile-overlay');
  const navbarLinks = document.querySelectorAll('.navbar-links a');
  const mobileLinks = document.querySelectorAll('.mobile-menu a');
  const NAVBAR_HEIGHT = 70;
  const SCROLL_THRESHOLD = 50;

  if (!navbar) return;

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT;
      window.scrollTo({ top, behavior: 'smooth' });

      closeMenu();
    });
  });

  function closeMenu() {
    mobileMenu?.classList.remove('open');
    hamburger?.classList.remove('active');
    mobileOverlay?.classList.remove('show');
    document.body.style.overflow = '';
  }

  function openMenu() {
    mobileMenu?.classList.add('open');
    hamburger?.classList.add('active');
    mobileOverlay?.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  hamburger?.addEventListener('click', () => {
    const isOpen = mobileMenu?.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  mobileOverlay?.addEventListener('click', closeMenu);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  const handleNavbarScroll = () => {
    if (window.scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  const sections = document.querySelectorAll('section[id]');
  const allNavLinks = [...navbarLinks, ...mobileLinks];

  const activateLink = debounce(() => {
    const scrollPos = window.scrollY + NAVBAR_HEIGHT + 40;

    let currentId = '';
    sections.forEach(section => {
      if (section.offsetTop <= scrollPos) {
        currentId = section.getAttribute('id');
      }
    });

    allNavLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }, 50);

  window.addEventListener('scroll', activateLink, { passive: true });
  activateLink();
}

// ---------------------------------------------------------------------------
// 3. Scroll-Based Animations (Intersection Observer)
// ---------------------------------------------------------------------------

function initScrollAnimations() {
  const elements = document.querySelectorAll('[data-animate]');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const delay = el.dataset.delay;
        if (delay) {
          el.style.transitionDelay = delay;
        }

        el.classList.add('visible');
        observer.unobserve(el);
      });
    },
    { threshold: 0.15 }
  );

  elements.forEach(el => observer.observe(el));
}

// ---------------------------------------------------------------------------
// 6. Project Card "How It Works" Toggle
// ---------------------------------------------------------------------------

function initProjectToggles() {
  const toggleButtons = document.querySelectorAll('.project-toggle');
  if (!toggleButtons.length) return;

  toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
      const card = button.closest('.project-card');
      if (!card) return;

      const isActive = card.classList.toggle('active');
      button.setAttribute('aria-expanded', isActive);
    });
  });
}

// ---------------------------------------------------------------------------
// 7. Stats Counter Animation
// ---------------------------------------------------------------------------

function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (!statNumbers.length) return;

  let animated = false;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateCounter(el) {
    const target = parseFloat(el.dataset.target) || 0;
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const isFloat = String(target).includes('.');
    const duration = 2000;
    let start = null;

    function tick(timestamp) {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const current = easedProgress * target;

      el.textContent = `${prefix}${isFloat ? current.toFixed(1) : Math.floor(current)}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = `${prefix}${isFloat ? target.toFixed(1) : target}${suffix}`;
      }
    }

    requestAnimationFrame(tick);
  }

  const statsSection =
    statNumbers[0].closest('section') || statNumbers[0].closest('[class*="stats"]');

  if (!statsSection) {
    statNumbers.forEach(animateCounter);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animated) {
          animated = true;
          statNumbers.forEach(animateCounter);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  observer.observe(statsSection);
}

// ---------------------------------------------------------------------------
// 8. Typing Effect (Hero Section)
// ---------------------------------------------------------------------------

function initTypingEffect() {
  const tagline = document.querySelector('.hero-tagline');
  if (!tagline) return;

  const fullText = tagline.textContent.trim();
  tagline.textContent = '';
  tagline.style.visibility = 'visible';

  let index = 0;

  function type() {
    if (index < fullText.length) {
      tagline.textContent += fullText.charAt(index);
      index++;
      setTimeout(type, 50);
    }
  }

  setTimeout(type, 500);
}

// ---------------------------------------------------------------------------
// 9. Scroll-to-Top Button
// ---------------------------------------------------------------------------

function initScrollToTop() {
  const btn = document.querySelector('.scroll-top');
  if (!btn) return;

  const VISIBLE_AFTER = 500;

  const handleVisibility = () => {
    if (window.scrollY > VISIBLE_AFTER) {
      btn.classList.add('scroll-top--visible');
    } else {
      btn.classList.remove('scroll-top--visible');
    }
  };

  window.addEventListener('scroll', handleVisibility, { passive: true });
  handleVisibility();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ---------------------------------------------------------------------------
// 10. Contact Form Handling
// ---------------------------------------------------------------------------

function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function showError(field, message) {
    clearError(field);
    const errorEl = document.createElement('span');
    errorEl.className = 'form-error';
    errorEl.style.cssText = 'color:#ef4444;font-size:0.8rem;margin-top:0.25rem;display:block';
    errorEl.textContent = message;
    field.parentElement.appendChild(errorEl);
    field.style.borderColor = '#ef4444';
  }

  function clearError(field) {
    const existing = field.parentElement?.querySelector('.form-error');
    existing?.remove();
    field.style.borderColor = '';
  }

  function clearAllErrors() {
    form.querySelectorAll('.form-error').forEach(el => el.remove());
    form.querySelectorAll('input, textarea').forEach(el => el.style.borderColor = '');
  }

  form.addEventListener('submit', (e) => {
    clearAllErrors();

    const name = form.querySelector('[name="name"]');
    const email = form.querySelector('[name="email"]');
    const message = form.querySelector('[name="message"]');
    let valid = true;

    if (name && !name.value.trim()) {
      showError(name, 'Name is required.');
      valid = false;
    }

    if (email) {
      if (!email.value.trim()) {
        showError(email, 'Email is required.');
        valid = false;
      } else if (!EMAIL_RE.test(email.value.trim())) {
        showError(email, 'Please enter a valid email address.');
        valid = false;
      }
    }

    if (message && !message.value.trim()) {
      showError(message, 'Message is required.');
      valid = false;
    }

    if (!valid) {
      e.preventDefault();
    }
  });

  form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('input', () => clearError(field));
  });
}

// ---------------------------------------------------------------------------
// 11. Parallax-like Effect (Hero)
// ---------------------------------------------------------------------------

function initParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  let ticking = false;

  function applyParallax() {
    if (window.innerWidth <= 768) {
      hero.style.backgroundPositionY = '';
      return;
    }
    hero.style.backgroundPositionY = `${window.scrollY * 0.5}px`;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(applyParallax);
      ticking = true;
    }
  }, { passive: true });
}
