(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EMAIL = 'janreybalabis23@gmail.com';

  // ========================================
  // MATRIX RAIN
  // ========================================
  const matrixCanvas = document.getElementById('matrix-canvas');

  if (matrixCanvas && !prefersReducedMotion) {
    const ctx = matrixCanvas.getContext('2d');
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン01';
    let columns = [];
    let animId;
    let w = 0;
    let h = 0;
    const fontSize = 14;

    function resizeMatrix() {
      w = matrixCanvas.width = window.innerWidth;
      h = matrixCanvas.height = window.innerHeight;
      const colCount = Math.floor(w / fontSize);
      columns = Array.from({ length: colCount }, () => Math.random() * h / fontSize);
    }

    function drawMatrix() {
      ctx.fillStyle = 'rgba(3, 3, 3, 0.08)';
      ctx.fillRect(0, 0, w, h);

      ctx.font = `${fontSize}px JetBrains Mono, monospace`;

      for (let i = 0; i < columns.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = columns[i] * fontSize;

        const brightness = Math.random();
        ctx.fillStyle = brightness > 0.95
          ? '#ffffff'
          : brightness > 0.8
            ? '#00ffff'
            : '#00ff41';

        ctx.fillText(char, x, y);

        if (y > h && Math.random() > 0.975) {
          columns[i] = 0;
        } else {
          columns[i]++;
        }
      }

      animId = requestAnimationFrame(drawMatrix);
    }

    window.addEventListener('resize', resizeMatrix);
    resizeMatrix();
    drawMatrix();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animId);
      } else {
        drawMatrix();
      }
    });
  } else if (matrixCanvas) {
    matrixCanvas.style.display = 'none';
  }

  // ========================================
  // BOOT SEQUENCE
  // ========================================
  const bootLines = document.getElementById('bootLines');

  if (bootLines && !prefersReducedMotion) {
    const lines = [
      { text: '[ OK ] Initializing janrey.dev v2.0.26...', cls: 'boot-ok' },
      { text: '[ OK ] Loading kernel modules: html css js python', cls: 'boot-ok' },
      { text: '[INFO] Location: Philippines (UTC+8)', cls: 'boot-info' },
      { text: '[ OK ] Status: AVAILABLE', cls: 'boot-ok' },
    ];

    let delay = 200;
    lines.forEach(({ text, cls }) => {
      setTimeout(() => {
        const line = document.createElement('div');
        line.className = cls;
        line.textContent = text;
        bootLines.appendChild(line);
      }, delay);
      delay += 280 + Math.random() * 120;
    });
  }

  // ========================================
  // FRAME CLOCK
  // ========================================
  const frameClock = document.getElementById('frameClock');

  function updateClock() {
    if (!frameClock) return;
    const now = new Date();
    frameClock.textContent = now.toTimeString().slice(0, 8);
  }

  updateClock();
  setInterval(updateClock, 1000);

  // ========================================
  // MOBILE MENU
  // ========================================
  const mobileMenu = document.getElementById('mobileMenu');
  const menuBtn = document.querySelector('.menu-toggle');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  function setMenuOpen(open) {
    menuBtn.classList.toggle('active', open);
    mobileMenu.classList.toggle('active', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    mobileMenu.setAttribute('aria-hidden', String(!open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  menuBtn.addEventListener('click', () => setMenuOpen(!mobileMenu.classList.contains('active')));
  mobileMenu.querySelector('.mobile-menu-backdrop').addEventListener('click', () => setMenuOpen(false));
  mobileLinks.forEach(link => link.addEventListener('click', () => setMenuOpen(false)));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
      setMenuOpen(false);
      menuBtn.focus();
    }
  });

  // ========================================
  // COPY EMAIL
  // ========================================
  function showToast(message) {
    const toast = document.getElementById('toast');
    toast.querySelector('.toast-message').textContent = message;
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

    if (navigator.clipboard?.writeText) {
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
  document.querySelectorAll('.project-entry').forEach(card => {
    const url = card.dataset.projectUrl;

    card.addEventListener('click', () => {
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    });

    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (url) window.open(url, '_blank', 'noopener,noreferrer');
      }
    });
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

      const navHeight = document.querySelector('.term-bar').offsetHeight;
      const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 16;

      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });

  // ========================================
  // REVEAL ON SCROLL
  // ========================================
  const revealEls = document.querySelectorAll('.reveal');

  document.querySelectorAll('.projects-grid, .philosophy-grid').forEach(grid => {
    grid.querySelectorAll('.reveal').forEach((el, i) => {
      el.classList.add(`reveal-delay-${(i % 4) + 1}`);
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
    { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
  );

  revealEls.forEach(el => observer.observe(el));

  // ========================================
  // SCROLL PROGRESS + ACTIVE NAV
  // ========================================
  const termBar = document.querySelector('.term-bar');
  const navLinks = document.querySelectorAll('.term-nav-link[data-section]');
  const scrollProgress = document.querySelector('.scroll-progress');
  const sections = ['about', 'projects', 'philosophy', 'contact'].map(id => ({
    id,
    el: document.getElementById(id),
  }));

  function onScroll() {
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0;
    scrollProgress.style.width = `${scrolled}%`;
    scrollProgress.setAttribute('aria-valuenow', Math.round(scrolled));

    termBar.classList.toggle('scrolled', window.scrollY > 32);

    const scrollPos = window.scrollY + termBar.offsetHeight + 64;
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
  const nameText = 'Jan Rey Balabis';
  const typingText = document.querySelector('.typing-text');
  const cursor = document.querySelector('.typing-cursor');

  if (prefersReducedMotion) {
    typingText.textContent = nameText;
    if (cursor) cursor.style.display = 'none';
  } else {
    let index = 0;

    function type() {
      typingText.textContent = nameText.substring(0, index + 1);
      index++;

      if (index < nameText.length) {
        setTimeout(type, 55 + Math.random() * 35);
      }
    }

    setTimeout(type, 1400);
  }
})();
