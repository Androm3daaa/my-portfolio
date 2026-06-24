(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ========================================
  // MOBILE MENU
  // ========================================
  const mobileMenu = document.getElementById('mobileMenu');
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  function setMenuOpen(open) {
    menuBtn.classList.toggle('active', open);
    mobileMenu.classList.toggle('active', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    mobileMenu.setAttribute('aria-hidden', String(!open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  function toggleMenu() {
    setMenuOpen(!mobileMenu.classList.contains('active'));
  }

  menuBtn.addEventListener('click', toggleMenu);

  mobileMenu.querySelector('.mobile-menu-backdrop').addEventListener('click', () => setMenuOpen(false));

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
      setMenuOpen(false);
      menuBtn.focus();
    }
  });

  // ========================================
  // COPY EMAIL
  // ========================================
  const EMAIL = 'janreybalabis23@gmail.com';

  function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = toast.querySelector('.toast-message');
    toastMessage.textContent = message;
    toast.classList.add('visible');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => toast.classList.remove('visible'), 3000);
  }

  function copyEmail() {
    const fallback = () => {
      const textarea = document.createElement('textarea');
      textarea.value = EMAIL;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast('Email copied to clipboard!');
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(EMAIL).then(
        () => showToast('Email copied to clipboard!'),
        fallback
      );
    } else {
      fallback();
    }
  }

  document.getElementById('emailBtn').addEventListener('click', copyEmail);

  // ========================================
  // PROJECT CARDS
  // ========================================
  function openProject(url) {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }

  document.querySelectorAll('.project-card').forEach(card => {
    const url = card.dataset.projectUrl;

    card.addEventListener('click', () => openProject(url));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openProject(url);
      }
    });

    if (!prefersReducedMotion) {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mouse-x', `${x}%`);
        card.style.setProperty('--mouse-y', `${y}%`);
      });
    }
  });

  // ========================================
  // SMOOTH SCROLL
  // ========================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      e.preventDefault();
      const target = document.querySelector(href);
      if (!target) return;

      const navHeight = document.querySelector('.navbar').offsetHeight;
      const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });

  // ========================================
  // INTERSECTION OBSERVER
  // ========================================
  const revealEls = document.querySelectorAll(
    '.section-header, .project-card, .philosophy-card, .contact-card'
  );

  revealEls.forEach(el => {
    el.classList.add('reveal');
  });

  document.querySelectorAll('.projects-grid, .philosophy-grid').forEach(grid => {
    grid.querySelectorAll('.project-card, .philosophy-card').forEach((card, i) => {
      card.classList.add(`reveal-delay-${(i % 4) + 1}`);
    });
  });

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach(el => observer.observe(el));

  // ========================================
  // SCROLL PROGRESS
  // ========================================
  const scrollProgress = document.querySelector('.scroll-progress');

  function updateScrollProgress() {
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0;
    scrollProgress.style.width = `${scrolled}%`;
    scrollProgress.setAttribute('aria-valuenow', Math.round(scrolled));
  }

  // ========================================
  // NAVBAR + ACTIVE SECTION
  // ========================================
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');
  const sections = ['about', 'projects', 'philosophy', 'contact'].map(id => ({
    id,
    el: document.getElementById(id)
  }));

  function onScroll() {
    updateScrollProgress();

    navbar.classList.toggle('scrolled', window.scrollY > 48);

    const scrollPos = window.scrollY + navbar.offsetHeight + 80;
    let current = 'about';

    sections.forEach(({ id, el }) => {
      if (el && el.offsetTop <= scrollPos) current = id;
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ========================================
  // TYPING ANIMATION
  // ========================================
  const text = 'Jan Rey Balabis';
  const typingText = document.querySelector('.typing-text');
  const cursor = document.querySelector('.typing-cursor');

  if (prefersReducedMotion) {
    typingText.textContent = text;
    if (cursor) cursor.style.display = 'none';
  } else {
    let index = 0;
    let deleting = false;

    function type() {
      let delay;

      if (!deleting) {
        typingText.textContent = text.substring(0, index + 1);
        index++;
        if (index === text.length) {
          deleting = true;
          delay = 2400;
        } else {
          delay = 70 + Math.random() * 50;
        }
      } else {
        typingText.textContent = text.substring(0, index - 1);
        index--;
        if (index === 0) {
          deleting = false;
          delay = 600;
        } else {
          delay = 35;
        }
      }

      setTimeout(type, delay);
    }

    setTimeout(type, 800);
  }
})();
