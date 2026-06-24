// ========================================
// MOBILE MENU TOGGLE
// ========================================
function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  const btn = document.querySelector('.mobile-menu-btn');
  menu.classList.toggle('active');
  btn.classList.toggle('active');
}

document.querySelectorAll('.mobile-menu a').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('mobileMenu').classList.remove('active');
    document.querySelector('.mobile-menu-btn').classList.remove('active');
  });
});

// ========================================
// COPY EMAIL TO CLIPBOARD
// ========================================
function copyEmail() {
  const email = 'janreybalabis23@gmail.com';
  navigator.clipboard.writeText(email).then(() => {
    showToast('Email copied to clipboard!');
  }).catch(() => {
    const textarea = document.createElement('textarea');
    textarea.value = email;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('Email copied to clipboard!');
  });
}

// ========================================
// TOAST NOTIFICATION
// ========================================
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMessage = toast.querySelector('.toast-message');
  toastMessage.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => {
    toast.classList.remove('visible');
  }, 3000);
}

// ========================================
// PROJECT LINKS & HOVER EFFECTS
// ========================================
function openProject(url) {
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

document.querySelectorAll('.project-card-mac').forEach(card => {
  const url = card.dataset.projectUrl;

  card.addEventListener('click', () => openProject(url));
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openProject(url);
    }
  });

  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mouse-x', `${x}%`);
    card.style.setProperty('--mouse-y', `${y}%`);
  });
});

// ========================================
// SMOOTH SCROLL
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const navHeight = document.querySelector('.navbar').offsetHeight;
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// ========================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ========================================
const observerOptions = {
  threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
    }
  });
}, observerOptions);

document.querySelectorAll('.project-card-mac, .philosophy-item, .section-header').forEach(el => {
  observer.observe(el);
});

// ========================================
// SCROLL PROGRESS BAR
// ========================================
const scrollProgress = document.querySelector('.scroll-progress');

window.addEventListener('scroll', () => {
  const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = (window.scrollY / windowHeight) * 100;
  scrollProgress.style.width = scrolled + '%';
});

// ========================================
// NAVBAR SCROLL EFFECT
// ========================================
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 100) {
    navbar.style.background = 'rgba(6, 6, 12, 0.95)';
  } else {
    navbar.style.background = 'rgba(13, 13, 23, 0.85)';
  }
});

// ========================================
// TYPING ANIMATION
// ========================================
(function() {
  const text = 'Jan Rey Balabis';
  const typingText = document.querySelector('.typing-text');
  const cursor = document.querySelector('.typing-cursor');
  let index = 0;
  let deleting = false;
  let delay = 80;
  
  function type() {
    if (!deleting) {
      typingText.textContent = text.substring(0, index + 1);
      index++;
      
      if (index === text.length) {
        deleting = true;
        delay = 2000; // Pause at end
      } else {
        delay = 80 + Math.random() * 40; // Vary speed
      }
    } else {
      typingText.textContent = text.substring(0, index - 1);
      index--;
      
      if (index === 0) {
        deleting = false;
        delay = 500; // Pause before retyping
      } else {
        delay = 40;
      }
    }
    
    setTimeout(type, delay);
  }
  
  // Start typing after a short delay
  setTimeout(type, 500);
})();
