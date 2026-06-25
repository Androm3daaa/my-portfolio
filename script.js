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
      columns = Array.from({ length: colCount }, () => ({
        y: Math.random() * h / fontSize,
        speed: 0.4 + Math.random() * 0.8,
        depth: 0.3 + Math.random() * 0.7,
      }));
    }

    function edgeFade(x, y) {
      const cx = w * 0.5;
      const cy = h * 0.45;
      const dx = (x - cx) / (w * 0.5);
      const dy = (y - cy) / (h * 0.5);
      const dist = Math.sqrt(dx * dx + dy * dy);
      const edge = Math.max(0, 1 - Math.pow(dist, 1.8));
      const vertical = 1 - Math.abs(y - h * 0.15) / (h * 0.85);
      return Math.min(edge, 0.35 + vertical * 0.65);
    }

    function drawMatrix() {
      ctx.fillStyle = 'rgba(5, 6, 8, 0.1)';
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = col.y * fontSize;
        const fade = edgeFade(x, y) * col.depth;

        if (fade < 0.05) {
          col.y += col.speed;
          if (y > h && Math.random() > 0.975) col.y = 0;
          continue;
        }

        const size = fontSize * (0.85 + col.depth * 0.3);
        ctx.font = `${size}px JetBrains Mono, monospace`;

        const roll = Math.random();
        let r, g, b, a;
        if (roll > 0.97) {
          r = 255; g = 255; b = 255; a = fade * 0.9;
        } else if (roll > 0.82) {
          r = 0; g = 232; b = 255; a = fade * 0.75;
        } else {
          r = 0; g = 255; b = 65; a = fade * (0.35 + col.depth * 0.45);
        }

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
        ctx.fillText(char, x, y);

        col.y += col.speed;
        if (y > h && Math.random() > 0.975) {
          col.y = 0;
          col.depth = 0.3 + Math.random() * 0.7;
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
      { text: '[ OK ] Initializing janrey.dev v1.0.0...', cls: 'boot-ok' },
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
    const emailBtn = document.getElementById('emailBtn');
    const hint = emailBtn?.querySelector('.email-hint');

    const onCopied = () => {
      showToast('Email copied to clipboard!');
      if (emailBtn) {
        emailBtn.classList.add('copied');
        if (hint) hint.textContent = '// copied to clipboard';
        clearTimeout(copyEmail._resetTimer);
        copyEmail._resetTimer = setTimeout(() => {
          emailBtn.classList.remove('copied');
          if (hint) hint.textContent = '// click to copy';
        }, 2500);
      }
    };

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
      onCopied();
    };

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(EMAIL).then(onCopied, fallback);
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

  // Hero is above the fold — reveal immediately when visible
  const heroWindow = document.querySelector('.term-window--hero.reveal');
  if (heroWindow) {
    requestAnimationFrame(() => {
      if (heroWindow.getBoundingClientRect().top < window.innerHeight) {
        heroWindow.classList.add('in-view');
        observer.unobserve(heroWindow);
      }
    });
  }

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
