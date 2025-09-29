// Bakery data
const bakeryData = {
  bakery: {
    name: "BAKE TO CHERRIISH",
    tagline: "Classic Cakes, Premium Joy",
    description: "Celebrating with cake, cherishing each treat"
  },
  menu: {
    classic_cakes: [
      {name: "Vanilla", price_half: "₹499", price_full: "₹899"},
      {name: "Pineapple", price_half: "₹549", price_full: "₹949"},
      {name: "Strawberry", price_half: "₹549", price_full: "₹949"},
      {name: "Blueberry", price_half: "₹549", price_full: "₹949"},
      {name: "Raspberry", price_half: "₹549", price_full: "₹949"},
      {name: "Butterscotch", price_half: "₹599", price_full: "₹999"},
      {name: "Chocolate", price_half: "₹599", price_full: "₹999"},
      {name: "White Forest", price_half: "₹649", price_full: "₹1049"},
      {name: "Black Forest", price_half: "₹649", price_full: "₹1049"}
    ],
    premium_cakes: [
      {name: "Lychee", price_half: "₹699", price_full: "₹1199"},
      {name: "Rich Tres Leches", price_half: "₹749", price_full: "₹1249"},
      {name: "Caramel Delight", price_half: "₹749", price_full: "₹1249"},
      {name: "Fresh Fruit", price_half: "₹749", price_full: "₹1249"},
      {name: "Very Berry Infused", price_half: "₹749", price_full: "₹1249"},
      {name: "Belgium Chocolate", price_half: "₹799", price_full: "₹1299"},
      {name: "Red Velvet Cream Cheese", price_half: "₹799", price_full: "₹1299"}
    ],
    chef_speciality: [
      {name: "Mocha Fudge Fantasy", price: "₹1599", badge: "Chef Special"},
      {name: "Choco Berry Burst", price: "₹1599", badge: "Chef Special"},
      {name: "Dreamy Tiramisu", price: "₹1599", badge: "Chef Special"},
      {name: "Rasmalai Magic", price: "₹1599", badge: "Chef Special"},
      {name: "Banana Bliss", price: "₹1599", badge: "Chef Special"},
      {name: "Creamy Carrot Indulgence", price: "₹1599", badge: "Chef Special"},
      {name: "Golden Honey Charm", price: "₹1599", badge: "Chef Special"},
      {name: "Apricot Passion", price: "₹1599", badge: "Chef Special"},
      {name: "Sugar Cloud Cheesecake", price: "₹1649", badge: "Chef Special"},
      {name: "Guilt-Free Goodness", price: "₹1699", badge: "Healthy, Sugar-Free", special: true}
    ],
    brownies: [
      {name: "Classic Brownie", price: "₹99"},
      {name: "Nutella", price: "₹129"},
      {name: "Walnut", price: "₹129"},
      {name: "Biscoff", price: "₹149"},
      {name: "Pistachio", price: "₹149"},
      {name: "Peanut Butter", price: "₹149"},
      {name: "Double Chocolate", price: "₹149"}
    ],
    cookies: [
      {name: "Chocochip", price: "₹359", pack: "Pack of 6"},
      {name: "Hazelnut Fudge", price: "₹359", pack: "Pack of 6"},
      {name: "Peanut Butter", price: "₹359", pack: "Pack of 6"},
      {name: "Milk Chocolate", price: "₹359", pack: "Pack of 6"},
      {name: "Salted Butter", price: "₹359", pack: "Pack of 6"},
      {name: "Almond", price: "₹359", pack: "Pack of 6"}
    ],
    muffins_cupcakes: [
      {name: "Vanilla", muffin_price: "₹309", cupcake_price: "₹389", pack: "Pack of 6"},
      {name: "Nutella", muffin_price: "₹309", cupcake_price: "₹389", pack: "Pack of 6"},
      {name: "Chocolate", muffin_price: "₹309", cupcake_price: "₹389", pack: "Pack of 6"},
      {name: "Strawberry", muffin_price: "₹309", cupcake_price: "₹389", pack: "Pack of 6"},
      {name: "Mix Berry", muffin_price: "₹309", cupcake_price: "₹389", pack: "Pack of 6"}
    ]
  }
};

// DOM Elements
let navToggle, navMenu, heroCta;
let isMenuOpen = false;

// Mobile Navigation Functions
function initializeMobileNav() {
  navToggle = document.getElementById('navToggle');
  navMenu = document.getElementById('navMenu');
  
  if (!navToggle || !navMenu) return;

  // Enhanced mobile navigation toggle
  navToggle.addEventListener('click', toggleMobileNav);
  
  // Handle keyboard navigation for hamburger menu
  navToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleMobileNav();
    }
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (isMenuOpen && !navMenu.contains(e.target) && !navToggle.contains(e.target)) {
      closeMobileNav();
    }
  });

  // Handle escape key to close menu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMenuOpen) {
      closeMobileNav();
      navToggle.focus(); // Return focus to toggle button
    }
  });

  // Enhanced mobile menu link handling
  const navLinks = navMenu.querySelectorAll('.nav-link');
  navLinks.forEach((link, index) => {
    link.addEventListener('click', (e) => {
      // Smooth scroll to section
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        // Close mobile menu first
        closeMobileNav();
        
        // Then scroll to target with delay for smooth transition
        setTimeout(() => {
          scrollToTarget(target);
        }, 300);
      }
    });

    // Keyboard navigation within menu
    link.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextLink = navLinks[index + 1] || navLinks[0];
        nextLink.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevLink = navLinks[index - 1] || navLinks[navLinks.length - 1];
        prevLink.focus();
      }
    });
  });
}

function toggleMobileNav() {
  isMenuOpen = !isMenuOpen;
  navMenu.classList.toggle('active');
  
  // Update ARIA attributes
  navToggle.setAttribute('aria-expanded', isMenuOpen);
  
  // Animate hamburger menu
  animateHamburger(isMenuOpen);
  
  // Prevent body scroll when menu is open
  document.body.style.overflow = isMenuOpen ? 'hidden' : '';
  
  // Focus management
  if (isMenuOpen) {
    const firstLink = navMenu.querySelector('.nav-link');
    if (firstLink) {
      setTimeout(() => firstLink.focus(), 100);
    }
  }
}

function closeMobileNav() {
  if (!isMenuOpen) return;
  
  isMenuOpen = false;
  navMenu.classList.remove('active');
  navToggle.setAttribute('aria-expanded', 'false');
  animateHamburger(false);
  document.body.style.overflow = '';
}

function animateHamburger(isOpen) {
  const spans = navToggle.querySelectorAll('span');
  if (isOpen) {
    spans[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
  } else {
    spans.forEach(span => {
      span.style.transform = '';
      span.style.opacity = '';
    });
  }
}

// Enhanced smooth scrolling function
function scrollToTarget(target) {
  const headerHeight = window.innerWidth >= 768 ? 80 : 60;
  const elementPosition = target.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
  
  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
}

// Create product card for cakes with two sizes
function createCakeCard(item, isSpeciality = false) {
  const card = document.createElement('div');
  card.className = 'product-card';
  
  let badgeHtml = '';
  if (isSpeciality) {
    const badgeClass = item.special ? 'product-card__badge--special' : 'product-card__badge';
    badgeHtml = `<div class="${badgeClass}">${item.badge}</div>`;
  }
  
  let pricingHtml = '';
  if (item.price_half && item.price_full) {
    pricingHtml = `
      <div class="product-card__pricing">
        <div class="price-option">
          <span class="price-option__size">1/2 kg</span>
          <span class="price-option__price">${item.price_half}</span>
        </div>
        <div class="price-option">
          <span class="price-option__size">1 kg</span>
          <span class="price-option__price">${item.price_full}</span>
        </div>
      </div>
    `;
  } else if (item.price) {
    pricingHtml = `
      <div class="single-price">
        <span>1 kg - ${item.price}</span>
      </div>
    `;
  }
  
  card.innerHTML = `
    ${badgeHtml}
    <h4 class="product-card__name">${item.name}</h4>
    ${pricingHtml}
  `;
  
  // Add touch-friendly interactions
  card.addEventListener('touchstart', function() {
    this.style.transform = 'translateY(-2px) scale(1.01)';
  });
  
  card.addEventListener('touchend', function() {
    this.style.transform = '';
  });
  
  return card;
}

// Create product card for treats (brownies, cookies, muffins)
function createTreatCard(item, type) {
  const card = document.createElement('div');
  card.className = 'product-card';
  
  let pricingHtml = '';
  let descriptionHtml = '';
  
  if (type === 'muffins') {
    descriptionHtml = `<p class="product-card__description">${item.pack}</p>`;
    pricingHtml = `
      <div class="product-card__pricing">
        <div class="price-option">
          <span class="price-option__size">Muffins</span>
          <span class="price-option__price">${item.muffin_price}</span>
        </div>
        <div class="price-option">
          <span class="price-option__size">Cupcakes</span>
          <span class="price-option__price">${item.cupcake_price}</span>
        </div>
      </div>
    `;
  } else {
    if (item.pack) {
      descriptionHtml = `<p class="product-card__description">${item.pack}</p>`;
    }
    pricingHtml = `
      <div class="single-price">
        ${item.price}
      </div>
    `;
  }
  
  card.innerHTML = `
    <h4 class="product-card__name">${item.name}</h4>
    ${descriptionHtml}
    ${pricingHtml}
  `;
  
  // Add touch-friendly interactions
  card.addEventListener('touchstart', function() {
    this.style.transform = 'translateY(-2px) scale(1.01)';
  });
  
  card.addEventListener('touchend', function() {
    this.style.transform = '';
  });
  
  return card;
}

// Populate menu sections
function populateMenu() {
  // Classic Cakes
  const classicGrid = document.getElementById('classicGrid');
  if (classicGrid) {
    bakeryData.menu.classic_cakes.forEach(cake => {
      const card = createCakeCard(cake);
      classicGrid.appendChild(card);
    });
  }
  
  // Premium Cakes
  const premiumGrid = document.getElementById('premiumGrid');
  if (premiumGrid) {
    bakeryData.menu.premium_cakes.forEach(cake => {
      const card = createCakeCard(cake);
      premiumGrid.appendChild(card);
    });
  }
  
  // Chef's Speciality
  const specialityGrid = document.getElementById('specialityGrid');
  if (specialityGrid) {
    bakeryData.menu.chef_speciality.forEach(cake => {
      const card = createCakeCard(cake, true);
      specialityGrid.appendChild(card);
    });
  }
  
  // Brownies
  const browniesGrid = document.getElementById('browniesGrid');
  if (browniesGrid) {
    bakeryData.menu.brownies.forEach(brownie => {
      const card = createTreatCard(brownie, 'brownies');
      browniesGrid.appendChild(card);
    });
  }
  
  // Cookies
  const cookiesGrid = document.getElementById('cookiesGrid');
  if (cookiesGrid) {
    bakeryData.menu.cookies.forEach(cookie => {
      const card = createTreatCard(cookie, 'cookies');
      cookiesGrid.appendChild(card);
    });
  }
  
  // Muffins & Cupcakes
  const muffinsGrid = document.getElementById('muffinsGrid');
  if (muffinsGrid) {
    bakeryData.menu.muffins_cupcakes.forEach(item => {
      const card = createTreatCard(item, 'muffins');
      muffinsGrid.appendChild(card);
    });
  }
}

// Setup smooth scrolling for all navigation
function setupSmoothScrolling() {
  // Hero CTA button functionality
  heroCta = document.querySelector('.hero__cta');
  if (heroCta) {
    heroCta.addEventListener('click', () => {
      const target = document.getElementById('classic');
      if (target) {
        scrollToTarget(target);
      }
    });
  }

  // Handle all internal navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    // Skip if already handled by mobile nav
    if (anchor.classList.contains('nav-link')) return;
    
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        scrollToTarget(target);
      }
    });
  });
}

// Enhanced scroll effects
function setupScrollEffects() {
  const header = document.querySelector('.header');
  let lastScrollTop = 0;
  let ticking = false;
  
  function updateHeader() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 100) {
      header.style.background = 'rgba(255, 247, 224, 0.95)';
      header.style.backdropFilter = 'blur(10px)';
      header.style.webkitBackdropFilter = 'blur(10px)';
    } else {
      header.style.background = 'var(--bakery-vanilla-cream)';
      header.style.backdropFilter = 'none';
      header.style.webkitBackdropFilter = 'none';
    }
    
    lastScrollTop = scrollTop;
    ticking = false;
  }
  
  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }
  
  window.addEventListener('scroll', requestTick, { passive: true });
}

// Enhanced entrance animations
function setupAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -30px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        // Unobserve after animation to improve performance
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe all product cards and sections with a stagger
  setTimeout(() => {
    document.querySelectorAll('.product-card').forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
      observer.observe(card);
    });
  }, 100);
}

// Handle window resize for responsive adjustments
function setupResponsiveHandlers() {
  let resizeTimer;
  
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Close mobile menu on resize to desktop
      if (window.innerWidth >= 768 && isMenuOpen) {
        closeMobileNav();
      }
      
      // Reset body overflow on resize
      if (window.innerWidth >= 768) {
        document.body.style.overflow = '';
      }
    }, 250);
  });
}

// Improved loading sequence
function initializeApp() {
  // Show loading state
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease-in-out';
  
  // Initialize mobile navigation
  initializeMobileNav();
  
  // Populate menu content
  populateMenu();
  
  // Setup interactions
  setupSmoothScrolling();
  setupScrollEffects();
  setupResponsiveHandlers();
  
  // Setup animations with a slight delay
  setTimeout(setupAnimations, 200);
  
  // Reveal page with fade-in effect
  setTimeout(() => {
    document.body.style.opacity = '1';
  }, 100);
  
  // Preload critical interactive elements
  setTimeout(() => {
    document.querySelectorAll('.product-card').forEach(card => {
      // Pre-setup hover states for better performance
      card.addEventListener('mouseenter', function() {
        if (window.innerWidth >= 1024) {
          this.style.willChange = 'transform';
        }
      });
      
      card.addEventListener('mouseleave', function() {
        this.style.willChange = 'auto';
      });
    });
  }, 500);
}

// Performance optimized touch handling
function setupTouchOptimizations() {
  // Improve scroll performance on mobile
  let isScrolling = false;
  
  window.addEventListener('scroll', () => {
    if (!isScrolling) {
      window.requestAnimationFrame(() => {
        // Optimize scroll-based effects
        isScrolling = false;
      });
    }
    isScrolling = true;
  }, { passive: true });

  // Optimize touch interactions
  document.addEventListener('touchstart', function(e) {
    // Enable hardware acceleration for touched elements
    if (e.target.closest('.product-card')) {
      e.target.closest('.product-card').style.willChange = 'transform';
    }
  }, { passive: true });

  document.addEventListener('touchend', function(e) {
    // Disable hardware acceleration after touch
    if (e.target.closest('.product-card')) {
      setTimeout(() => {
        e.target.closest('.product-card').style.willChange = 'auto';
      }, 300);
    }
  }, { passive: true });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
  setupTouchOptimizations();
});

// Handle page visibility for performance optimization
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    // Pause animations when page is hidden
    document.body.style.animationPlayState = 'paused';
  } else {
    // Resume animations when page is visible
    document.body.style.animationPlayState = 'running';
  }
});