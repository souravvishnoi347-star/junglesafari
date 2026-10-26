/* ============================================================
   JUNGLE SAFARI — Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Preloader ---------- */
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => preloader.classList.add('hidden'), 400);
    });
    // Fallback: hide after 3s even if load event already fired
    setTimeout(() => preloader.classList.add('hidden'), 3000);
  }

  /* ---------- Navbar Scroll Effect ---------- */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Mobile Menu ---------- */
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });
    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- FAQ Accordion ---------- */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const answer = item.querySelector('.faq-answer');
      const isActive = item.classList.contains('active');

      // Close all
      document.querySelectorAll('.faq-item').forEach(el => {
        el.classList.remove('active');
        el.querySelector('.faq-answer').style.maxHeight = null;
      });

      // Open clicked one (if it was closed)
      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* ---------- Scroll Reveal Animation ---------- */
  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length) {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.02, rootMargin: '0px 0px 60px 0px' });

      revealElements.forEach(el => observer.observe(el));

      // Immediate check for elements already in or near viewport on initial render
      revealElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight + 80) {
          el.classList.add('visible');
        }
      });
    } else {
      // Fallback: reveal all immediately if observer is unsupported
      revealElements.forEach(el => el.classList.add('visible'));
    }
  }

  /* ---------- Counter Animation ---------- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const raw = el.getAttribute('data-count');
          const isFloat = raw.includes('.');
          const target = isFloat ? parseFloat(raw) : parseInt(raw, 10);
          const suffix = el.getAttribute('data-suffix') || '';
          const duration = 2000;
          const step = target / (duration / 16);
          let current = 0;

          const update = () => {
            current += step;
            if (current >= target) {
              el.textContent = (isFloat ? target.toFixed(1) : target.toLocaleString()) + suffix;
            } else {
              el.textContent = (isFloat ? current.toFixed(1) : Math.floor(current).toLocaleString()) + suffix;
              requestAnimationFrame(update);
            }
          };
          requestAnimationFrame(update);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => counterObserver.observe(el));
  }

  /* ---------- Smooth scroll for anchor links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ---------- Trust Bar Mobile Carousel ---------- */
  const trustCarousel = document.getElementById('trustCarousel');
  const trustDots = document.querySelectorAll('.trust-dot');
  if (trustCarousel && trustDots.length) {
    let currentIndex = 0;
    const totalItems = trustDots.length;
    let autoPlayTimer = null;
    let isInteracting = false;

    const updateDots = (index) => {
      trustDots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === index);
      });
    };

    const scrollToItem = (index) => {
      if (window.innerWidth > 768) return;
      const items = trustCarousel.querySelectorAll('.trust-item');
      if (items[index]) {
        trustCarousel.scrollTo({
          left: items[index].offsetLeft - trustCarousel.offsetLeft,
          behavior: 'smooth'
        });
        currentIndex = index;
        updateDots(currentIndex);
      }
    };

    const startAutoPlay = () => {
      stopAutoPlay();
      if (window.innerWidth <= 768) {
        autoPlayTimer = setInterval(() => {
          if (!isInteracting) {
            currentIndex = (currentIndex + 1) % totalItems;
            scrollToItem(currentIndex);
          }
        }, 3000);
      }
    };

    const stopAutoPlay = () => {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    };

    // Dot click
    trustDots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        currentIndex = idx;
        scrollToItem(idx);
      });
    });

    // Detect manual scroll/swipe
    let scrollDebounce;
    trustCarousel.addEventListener('scroll', () => {
      clearTimeout(scrollDebounce);
      scrollDebounce = setTimeout(() => {
        if (window.innerWidth <= 768) {
          const scrollLeft = trustCarousel.scrollLeft;
          const width = trustCarousel.clientWidth;
          const newIdx = Math.round(scrollLeft / width);
          if (newIdx >= 0 && newIdx < totalItems && newIdx !== currentIndex) {
            currentIndex = newIdx;
            updateDots(currentIndex);
          }
        }
      }, 60);
    }, { passive: true });

    // Pause while touching
    trustCarousel.addEventListener('touchstart', () => { isInteracting = true; }, { passive: true });
    trustCarousel.addEventListener('touchend', () => {
      setTimeout(() => { isInteracting = false; }, 2500);
    }, { passive: true });

    window.addEventListener('resize', () => {
      if (window.innerWidth <= 768) {
        startAutoPlay();
      } else {
        stopAutoPlay();
      }
    });

    startAutoPlay();
  }

});
