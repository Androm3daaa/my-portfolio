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

        const tiltX = ((y - 50) / 50) * -6;
        const tiltY = ((x - 50) / 50) * 6;
        card.style.setProperty('--tilt-x', `${tiltX}deg`);
        card.style.setProperty('--tilt-y', `${tiltY}deg`);
      });

      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
      });
    }
  });

  // ========================================
  // 3D TILT — PHILOSOPHY + CONTACT
  // ========================================
  function bindTilt(selector, maxDeg) {
    if (prefersReducedMotion) return;

    document.querySelectorAll(selector).forEach(el => {
      el.addEventListener('mousemove', e => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const tiltX = (0.5 - y) * maxDeg;
        const tiltY = (x - 0.5) * maxDeg;
        el.style.setProperty('--tilt-x', `${tiltX}deg`);
        el.style.setProperty('--tilt-y', `${tiltY}deg`);
      });

      el.addEventListener('mouseleave', () => {
        el.style.setProperty('--tilt-x', '0deg');
        el.style.setProperty('--tilt-y', '0deg');
      });
    });
  }

  bindTilt('.philosophy-card', 8);
  bindTilt('.contact-card', 5);

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

    const hero = document.getElementById('about');
    if (hero && window.HeroScene3D) {
      const heroBottom = hero.offsetTop + hero.offsetHeight;
      const progress = Math.min(1, Math.max(0, window.scrollY / (heroBottom * 0.65)));
      window.HeroScene3D.setScrollProgress(progress);
    }

    const heroContent = document.querySelector('.hero-content');
    if (heroContent && !prefersReducedMotion) {
      const offset = Math.min(window.scrollY * 0.12, 80);
      heroContent.style.transform = `translateY(${offset}px)`;
    }
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

    function type() {
      typingText.textContent = text.substring(0, index + 1);
      index++;

      if (index < text.length) {
        setTimeout(type, 65 + Math.random() * 40);
      } else if (cursor) {
        setTimeout(() => {
          cursor.style.opacity = '0';
        }, 2000);
      }
    }

    setTimeout(type, 800);
  }

  // ========================================
  // AMBIENT PARTICLE FIELD (2D CANVAS)
  // ========================================
  const ambientCanvas = document.getElementById('ambient-canvas');

  if (ambientCanvas && !prefersReducedMotion) {
    const ctx = ambientCanvas.getContext('2d');
    let particles = [];
    let animId;
    let width = 0;
    let height = 0;
    let pointer = { x: 0.5, y: 0.5 };

    function resizeAmbient() {
      width = ambientCanvas.width = window.innerWidth;
      height = ambientCanvas.height = window.innerHeight;
      const count = width < 768 ? 28 : 45;
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random(),
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
      }));
    }

    function drawAmbient() {
      ctx.clearRect(0, 0, width, height);
      const scrollFade = 1 - Math.min(1, window.scrollY / (height * 0.8)) * 0.6;

      particles.forEach((p, i) => {
        p.x += p.vx + (pointer.x - 0.5) * p.z * 0.08;
        p.y += p.vy + (pointer.y - 0.5) * p.z * 0.08;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const size = 1 + p.z * 2;
        const alpha = (0.1 + p.z * 0.22) * scrollFade;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = i % 5 === 0
          ? `rgba(94, 234, 212, ${alpha})`
          : i % 7 === 0
            ? `rgba(232, 184, 74, ${alpha})`
            : `rgba(244, 244, 245, ${alpha * 0.5})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const other = particles[j];
          const dx = p.x - other.x;
          const dy = p.y - other.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(232, 184, 74, ${(1 - dist / 120) * 0.06 * scrollFade})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animId = requestAnimationFrame(drawAmbient);
    }

    window.addEventListener('pointermove', e => {
      pointer.x = e.clientX / width;
      pointer.y = e.clientY / height;
    }, { passive: true });

    window.addEventListener('resize', resizeAmbient);
    resizeAmbient();
    drawAmbient();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animId);
      } else {
        drawAmbient();
      }
    });
  } else if (ambientCanvas) {
    ambientCanvas.style.display = 'none';
  }
})();
