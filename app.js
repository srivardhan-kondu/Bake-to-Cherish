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
      {name: "Black Forest", price_half: "₹649", price_full: "₹1099"},
      {name: "Red Velvet", price_half: "₹699", price_full: "₹1199"},
      {name: "Coffee", price_half: "₹649", price_full: "₹1099"}
    ],
    premium_cakes: [
      {name: "Ferrero Rocher", price_half: "₹799", price_full: "₹1499"},
      {name: "Oreo Delight", price_half: "₹749", price_full: "₹1399"},
      {name: "Salted Caramel", price_half: "₹799", price_full: "₹1499"},
      {name: "Hazelnut", price_half: "₹899", price_full: "₹1699"}
    ],
    chef_speciality: [
      {name: "Signature Truffle", price_half: "₹999", price_full: "₹1799"},
      {name: "Lemon Meringue", price_half: "₹849", price_full: "₹1599"}
    ],
    brownies: [
      {name: "Classic Brownie", price: "₹149"},
      {name: "Nutty Brownie", price: "₹179"},
      {name: "Salted Caramel Brownie", price: "₹199"}
    ],
    cookies: [
      {name: "Chocolate Chip", price: "₹39"},
      {name: "Oatmeal Raisin", price: "₹49"},
      {name: "Butter Cookies", price: "₹29"}
    ],
    muffins_cupcakes: [
      {name: "Blueberry Muffin", price: "₹79"},
      {name: "Chocolate Cupcake", price: "₹69"},
      {name: "Banana Muffin", price: "₹69"}
    ]
  }
};

/* ----------------- helpers to build product cards (assumed similar to previous code) ------------------- */
function createCakeCard(cake, isSpecial = false) {
  const card = document.createElement('div');
  card.className = 'product-card';
  if (isSpecial) card.classList.add('special');
  const inner = `
    <div class="product-thumb">
      <img alt="${cake.name}" src="images/${(cake.name || 'cake').toLowerCase().replace(/\s+/g, '-')}.jpg" onerror="this.style.visibility='hidden'"/>
    </div>
    <div class="product-info">
      <h3 class="product-title">${cake.name}</h3>
      <div class="product-prices">
        ${cake.price_half ? `<span class="half">Half: ${cake.price_half}</span>` : ''}
        ${cake.price_full ? `<span class="full">Full: ${cake.price_full}</span>` : (cake.price ? `<span class="full">${cake.price}</span>` : '')}
      </div>
      <button class="add-btn" aria-label="Add ${cake.name}">Add</button>
    </div>
  `;
  card.innerHTML = inner;
  // Lightweight accessible attributes
  card.tabIndex = 0;
  return card;
}

function createTreatCard(item, type) {
  const card = document.createElement('div');
  card.className = 'product-card treat';
  card.innerHTML = `
    <div class="product-thumb">
      <img alt="${item.name}" src="images/${type}/${(item.name || '').toLowerCase().replace(/\s+/g, '-')}.jpg" onerror="this.style.visibility='hidden'"/>
    </div>
    <div class="product-info">
      <h3 class="product-title">${item.name}</h3>
      <div class="product-prices">${item.price ? item.price : ''}</div>
      <button class="add-btn" aria-label="Add ${item.name}">Add</button>
    </div>
  `;
  card.tabIndex = 0;
  return card;
}

/* ---------- Chunked + lazy rendering to avoid jank when rendering many product cards ---------- */
function chunkedAppend(container, items, createFn, options = {}) {
  const chunkSize = options.chunkSize || 6;
  const idleTimeout = options.idleTimeout || 30;
  const total = items.length;
  let index = 0;

  function appendChunk() {
    const frag = document.createDocumentFragment();
    const end = Math.min(index + chunkSize, total);
    for (; index < end; index++) {
      const el = createFn(items[index]);
      // start hidden for intersection animation
      el.style.opacity = '0';
      el.style.transform = 'translateY(15px)';
      frag.appendChild(el);
    }
    container.appendChild(frag);

    if (index < total) {
      if (window.requestIdleCallback) {
        requestIdleCallback(appendChunk, { timeout: 200 });
      } else {
        requestAnimationFrame(() => setTimeout(appendChunk, idleTimeout));
      }
    } else {
      if (typeof setupAnimations === 'function') {
        setTimeout(() => setupAnimations(), 60);
      }
    }
  }

  // kick off
  appendChunk();
}

/* sentinel to prioritize finishing render when user scrolls to bottom */
let loadSentinelObserver = null;
function ensureLoadSentinel() {
  if (document.getElementById('load-sentinel')) return;
  const sentinel = document.createElement('div');
  sentinel.id = 'load-sentinel';
  sentinel.style.width = '1px';
  sentinel.style.height = '1px';
  sentinel.style.position = 'relative';
  document.body.appendChild(sentinel);

  if ('IntersectionObserver' in window) {
    loadSentinelObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // For each grid, finish outstanding items quickly but in micro-batches
          document.querySelectorAll('.product-grid').forEach(grid => {
            const expected = parseInt(grid.dataset.expectedCount || '0', 10);
            if (expected && grid.children.length < expected) {
              const id = grid.id;
              const mapping = {
                'classicGrid': bakeryData.menu.classic_cakes,
                'premiumGrid': bakeryData.menu.premium_cakes,
                'specialityGrid': bakeryData.menu.chef_speciality,
                'browniesGrid': bakeryData.menu.brownies,
                'cookiesGrid': bakeryData.menu.cookies,
                'muffinsGrid': bakeryData.menu.muffins_cupcakes
              };
              const items = mapping[id] || [];
              const already = grid.children.length;
              const remainingItems = items.slice(already);
              if (remainingItems.length) {
                chunkedAppend(grid, remainingItems, (it) => {
                  if (id === 'specialityGrid') return createCakeCard(it, true);
                  if (id === 'browniesGrid') return createTreatCard(it, 'brownies');
                  if (id === 'cookiesGrid') return createTreatCard(it, 'cookies');
                  if (id === 'muffinsGrid') return createTreatCard(it, 'muffins');
                  return createCakeCard(it, false);
                }, { chunkSize: 12, idleTimeout: 20 });
              }
            }
          });

          if (loadSentinelObserver) {
            loadSentinelObserver.disconnect();
            loadSentinelObserver = null;
          }
        }
      });
    }, { rootMargin: '200px' });

    loadSentinelObserver.observe(sentinel);
  }
}

/* mark expected counts on grids to know how many items should be there */
function markExpectedCounts() {
  const map = {
    'classicGrid': bakeryData.menu.classic_cakes.length,
    'premiumGrid': bakeryData.menu.premium_cakes.length,
    'specialityGrid': bakeryData.menu.chef_speciality.length,
    'browniesGrid': bakeryData.menu.brownies.length,
    'cookiesGrid': bakeryData.menu.cookies.length,
    'muffinsGrid': bakeryData.menu.muffins_cupcakes.length
  };
  Object.keys(map).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.dataset.expectedCount = String(map[id]);
  });
}

/* progressive population with small initial sync chunk and async remainder */
function populateMenu() {
  const sections = [
    { id: 'classicGrid', items: bakeryData.menu.classic_cakes, factory: (it) => createCakeCard(it, false) },
    { id: 'premiumGrid', items: bakeryData.menu.premium_cakes, factory: (it) => createCakeCard(it, false) },
    { id: 'specialityGrid', items: bakeryData.menu.chef_speciality, factory: (it) => createCakeCard(it, true) },
    { id: 'browniesGrid', items: bakeryData.menu.brownies, factory: (it) => createTreatCard(it, 'brownies') },
    { id: 'cookiesGrid', items: bakeryData.menu.cookies, factory: (it) => createTreatCard(it, 'cookies') },
    { id: 'muffinsGrid', items: bakeryData.menu.muffins_cupcakes, factory: (it) => createTreatCard(it, 'muffins') }
  ];

  sections.forEach(section => {
    const container = document.getElementById(section.id);
    if (!container) return;

    const initialCount = Math.min(4, section.items.length);
    const initialFrag = document.createDocumentFragment();
    for (let i = 0; i < initialCount; i++) {
      const el = section.factory(section.items[i]);
      el.style.opacity = '0';
      el.style.transform = 'translateY(15px)';
      initialFrag.appendChild(el);
    }
    container.appendChild(initialFrag);

    const remaining = section.items.slice(initialCount);
    if (remaining.length) {
      chunkedAppend(container, remaining, section.factory, { chunkSize: 6, idleTimeout: 40 });
    }
  });

  ensureLoadSentinel();
}

/* wrapper to mark expected counts then populate */
function populateMenuWrapper() {
  markExpectedCounts();
  populateMenu();
}

/* ---------- previous animation setup (keeps intersection-driven entry animations) ---------- */
function setupAnimations() {
  const observerOptions = {
    threshold: 0.05,
    rootMargin: '0px 0px -20px 0px'
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

  // Observe all product cards and sections with faster stagger
  setTimeout(() => {
    document.querySelectorAll('.product-card').forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(15px)';
      // Reduced duration and stagger delay for faster animation
      card.style.transition = 'opacity 260ms ease-out, transform 260ms ease-out';
      observer.observe(card);
    });
  }, 80);
}

/* ---------- other UI helpers (nav, filters, search, touch optimizations) ---------- */
/* Keep your existing implementations. The code below assumes your existing file already
   contains functions like initializeMobileNav(), setupSmoothScrolling(), setupFilters(), etc.
   If they aren't present, re-add or merge them from your old file. */

function initializeMobileNav() {
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (!navToggle || !navMenu) return;
  function toggleMobileNav() {
    navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', navMenu.classList.contains('open'));
  }
  navToggle.addEventListener('click', toggleMobileNav);
  navToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleMobileNav();
    }
  });
}

/* Example: quick touch optimization for mobile */
function setupTouchOptimizations() {
  document.addEventListener('touchstart', function onTouch(e) {
    // lightweight - helps avoid 300ms delay on some older devices/browsers
    document.removeEventListener('touchstart', onTouch);
  }, { passive: true });
}

/* Keep rest of your original helpers and logic here... 
   (filters, search, modal behavior, lazy image loading if any) */

/* ---------- Improved loading sequence ---------- */
function initializeApp() {
  // Show loading state
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease-in-out';

  // Initialize mobile navigation
  initializeMobileNav();

  // Populate menu content
  populateMenuWrapper();

  // Setup interactions (you probably have these implemented)
  if (typeof setupAnimations === 'function') setupAnimations();
  setupTouchOptimizations();

  // finish loading
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });
}

/* Initialize everything when DOM is loaded */
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
/* ---------- Additional CSS animations for product cards ---------- */
