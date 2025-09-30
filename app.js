/* ================================================
   Aggressive performance-first app.js
   - Minimal initial synchronous DOM
   - Chunked append (very small batches)
   - Image lazy-loading via IntersectionObserver
   - Skeleton placeholders for immediate perceived performance
   - Sentinel to prioritize finishing only when user scrolls near bottom
   ================================================ */

/* ----------------- sample bakery data (use your real data if you already have it) ----------------- */
const bakeryData = {
  bakery: { name: "BAKE TO CHERRIISH" },
  menu: {
    classic_cakes: [ /* ... your items ... */ ],
    premium_cakes: [],
    chef_speciality: [],
    brownies: [],
    cookies: [],
    muffins_cupcakes: []
  }
};
/* NOTE: If your app already sets bakeryData elsewhere, remove the sample or keep real data source. */

/* ----------------- utilities ----------------- */
function nowMs() { return performance && performance.now ? performance.now() : Date.now(); }
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"'`=\/]/g, function(s) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    })[s];
  });
}

/* ===========================
   Skeleton + Card factories
   =========================== */
function createSkeletonCard() {
  const s = document.createElement('div');
  s.className = 'product-card skeleton';
  s.innerHTML = `
    <div class="product-thumb skeleton-thumb"></div>
    <div class="product-info">
      <div class="skele-line skele-title"></div>
      <div class="skele-line skele-sub"></div>
      <div class="skele-line skele-btn"></div>
    </div>
  `;
  // immediate low-cost styles to avoid layout thrash
  s.style.minHeight = '220px';
  s.style.contain = 'paint layout size';
  return s;
}

function makeImgPath(name, folder='') {
  if (!name) return '';
  const fname = name.toLowerCase().replace(/\s+/g, '-');
  return folder ? `images/${folder}/${fname}.jpg` : `images/${fname}.jpg`;
}

function createCakeCard(cake, isSpecial=false) {
  const card = document.createElement('div');
  card.className = 'product-card';
  if (isSpecial) card.classList.add('special');
  const placeholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
  const imgPath = makeImgPath(cake.name || 'cake');

  card.innerHTML = `
    <div class="product-thumb">
      <img class="lazy-img" alt="${escapeHtml(cake.name)}"
           data-src="${imgPath}"
           src="${placeholder}"
           loading="lazy"
           width="320" height="200" />
    </div>
    <div class="product-info">
      <h3 class="product-title">${escapeHtml(cake.name)}</h3>
      <div class="product-prices">
        ${cake.price_half ? `<span class="half">Half: ${escapeHtml(cake.price_half)}</span>` : ''}
        ${cake.price_full ? `<span class="full">Full: ${escapeHtml(cake.price_full)}</span>` : (cake.price ? `<span class="full">${escapeHtml(cake.price)}</span>` : '')}
      </div>
      <button class="add-btn" aria-label="Add ${escapeHtml(cake.name)}">Add</button>
    </div>
  `;
  card.tabIndex = 0;
  // cheap paint/layout isolation
  card.style.contain = 'paint layout size';
  card.style.willChange = 'transform, opacity';
  card.style.opacity = '0';
  card.style.transform = 'translateY(8px)';
  return card;
}

function createTreatCard(item, type) {
  const card = document.createElement('div');
  card.className = 'product-card treat';
  const placeholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
  const imgPath = makeImgPath(item.name || 'treat', type);

  card.innerHTML = `
    <div class="product-thumb">
      <img class="lazy-img" alt="${escapeHtml(item.name)}"
           data-src="${imgPath}"
           src="${placeholder}"
           loading="lazy"
           width="320" height="200" />
    </div>
    <div class="product-info">
      <h3 class="product-title">${escapeHtml(item.name)}</h3>
      <div class="product-prices">${item.price ? escapeHtml(item.price) : ''}</div>
      <button class="add-btn" aria-label="Add ${escapeHtml(item.name)}">Add</button>
    </div>
  `;
  card.tabIndex = 0;
  card.style.contain = 'paint layout size';
  card.style.willChange = 'transform, opacity';
  card.style.opacity = '0';
  card.style.transform = 'translateY(8px)';
  return card;
}

/* ===========================
   Chunked appending scheduler
   =========================== */
function scheduleTask(fn) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(fn, { timeout: 300 });
  } else {
    requestAnimationFrame(() => setTimeout(fn, 32));
  }
}

function chunkedAppend(container, items, createFn, opts = {}) {
  const chunkSize = opts.chunkSize || 3; // very small chunk
  const idleTimeout = opts.idleTimeout || 30;
  let i = 0;
  const total = items.length;

  function step() {
    const frag = document.createDocumentFragment();
    const end = Math.min(i + chunkSize, total);
    for (; i < end; i++) {
      const el = createFn(items[i]);
      frag.appendChild(el);
    }
    container.appendChild(frag);

    // observe lazy images added
    if (typeof imgObserverReady === 'function') imgObserverReady();

    if (i < total) {
      scheduleTask(step);
    } else {
      // final cleanup callback
      if (opts.onComplete) opts.onComplete();
      console.log(`chunkedAppend -> finished appending ${total} items to #${container.id || container.className}`);
    }
  }

  // start the first chunk with a tiny delay so browser paints initial UI
  setTimeout(step, 50);
}

/* ===========================
   Sentinel & minimal initial render
   =========================== */
let sentinelObserver = null;
function ensureSentinel() {
  if (document.getElementById('load-sentinel')) return;
  const sentinel = document.createElement('div');
  sentinel.id = 'load-sentinel';
  sentinel.style.height = '1px';
  sentinel.style.width = '1px';
  document.body.appendChild(sentinel);

  if ('IntersectionObserver' in window) {
    sentinelObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // user scrolled near end — prioritize finishing render for all grids
          finishAllGridsFast();
          sentinelObserver.disconnect();
        }
      });
    }, { rootMargin: '400px' });
    sentinelObserver.observe(sentinel);
  }
}

/* finish remaining quickly but in micro-batches */
function finishAllGridsFast() {
  console.log('Sentinel: prioritizing finish of remaining items');
  document.querySelectorAll('.product-grid').forEach(grid => {
    const expected = parseInt(grid.dataset.expectedCount || '0', 10);
    const mapping = {
      'classicGrid': bakeryData.menu.classic_cakes,
      'premiumGrid': bakeryData.menu.premium_cakes,
      'specialityGrid': bakeryData.menu.chef_speciality,
      'browniesGrid': bakeryData.menu.brownies,
      'cookiesGrid': bakeryData.menu.cookies,
      'muffinsGrid': bakeryData.menu.muffins_cupcakes
    };
    const items = mapping[grid.id] || [];
    const already = grid.children.length;
    if (expected && already < expected) {
      const remaining = items.slice(already);
      // append with slightly larger chunk for quicker finish
      chunkedAppend(grid, remaining, chooseFactoryForGrid(grid.id), { chunkSize: 12, idleTimeout: 16 });
    }
  });
}

function chooseFactoryForGrid(id) {
  if (id === 'specialityGrid') return (it) => createCakeCard(it, true);
  if (id === 'browniesGrid') return (it) => createTreatCard(it, 'brownies');
  if (id === 'cookiesGrid') return (it) => createTreatCard(it, 'cookies');
  if (id === 'muffinsGrid') return (it) => createTreatCard(it, 'muffins');
  if (id === 'premiumGrid') return (it) => createCakeCard(it, false);
  return (it) => createCakeCard(it, false);
}

/* ===========================
   Image lazy loader (IntersectionObserver)
   =========================== */
let imgObserver = null;
function setupImageLazyLoading() {
  const selector = 'img.lazy-img';
  if ('IntersectionObserver' in window) {
    imgObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const real = img.dataset.src;
          if (real) {
            img.src = real;
            img.removeAttribute('data-src');
          }
          obs.unobserve(img);
          // animate reveal on load
          img.addEventListener('load', () => {
            const card = img.closest('.product-card');
            if (card) {
              card.style.transition = 'opacity 260ms ease-out, transform 260ms ease-out';
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }
          }, { once: true });
        }
      });
    }, { rootMargin: '400px 0px 400px 0px', threshold: 0.01 });

    // Observe existing lazy images
    document.querySelectorAll(selector).forEach(img => imgObserver.observe(img));
  } else {
    // fallback: progressively set images after small delays
    document.querySelectorAll(selector).forEach((img, idx) => {
      setTimeout(() => {
        if (img.dataset && img.dataset.src) img.src = img.dataset.src;
      }, 400 + idx * 80);
    });
  }

  // MutationObserver: observe DOM additions to start observing new lazy images
  const mo = new MutationObserver(muts => {
    muts.forEach(m => {
      m.addedNodes && m.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          if (node.matches && node.matches(selector) && imgObserver) imgObserver.observe(node);
          node.querySelectorAll && node.querySelectorAll(selector).forEach(i => imgObserver && imgObserver.observe(i));
        }
      });
    });
  });
  mo.observe(document.body, { childList: true, subtree: true });

  // helper for other functions to re-scan quickly
  window.imgObserverReady = function() {
    document.querySelectorAll(selector).forEach(img => {
      if (imgObserver && img.dataset && img.dataset.src) imgObserver.observe(img);
    });
  };
}

/* ===========================
   Populate Menu: minimal initial paint, then chunked append
   =========================== */
function markExpectedCounts() {
  const map = {
    'classicGrid': bakeryData.menu.classic_cakes ? bakeryData.menu.classic_cakes.length : 0,
    'premiumGrid': bakeryData.menu.premium_cakes ? bakeryData.menu.premium_cakes.length : 0,
    'specialityGrid': bakeryData.menu.chef_speciality ? bakeryData.menu.chef_speciality.length : 0,
    'browniesGrid': bakeryData.menu.brownies ? bakeryData.menu.brownies.length : 0,
    'cookiesGrid': bakeryData.menu.cookies ? bakeryData.menu.cookies.length : 0,
    'muffinsGrid': bakeryData.menu.muffins_cupcakes ? bakeryData.menu.muffins_cupcakes.length : 0
  };
  Object.keys(map).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.dataset.expectedCount = String(map[id]);
  });
}

function populateMenuAggressive() {
  const t0 = nowMs();
  const sections = [
    { id: 'classicGrid', items: bakeryData.menu.classic_cakes || [], factory: (it) => createCakeCard(it, false) },
    { id: 'premiumGrid', items: bakeryData.menu.premium_cakes || [], factory: (it) => createCakeCard(it, false) },
    { id: 'specialityGrid', items: bakeryData.menu.chef_speciality || [], factory: (it) => createCakeCard(it, true) },
    { id: 'browniesGrid', items: bakeryData.menu.brownies || [], factory: (it) => createTreatCard(it, 'brownies') },
    { id: 'cookiesGrid', items: bakeryData.menu.cookies || [], factory: (it) => createTreatCard(it, 'cookies') },
    { id: 'muffinsGrid', items: bakeryData.menu.muffins_cupcakes || [], factory: (it) => createTreatCard(it, 'muffins') }
  ];

  sections.forEach(section => {
    const container = document.getElementById(section.id);
    if (!container) return;

    // Clear existing children and put a skeleton placeholder for perceived performance
    container.innerHTML = '';
    // put 1 skeleton (so user sees card shell immediately)
    const skeleton = createSkeletonCard();
    container.appendChild(skeleton);

    // Synchronously add 1 real item (very small)
    if (section.items.length > 0) {
      const first = section.factory(section.items[0]);
      // replace skeleton with first item quickly
      setTimeout(() => {
        container.replaceChild(first, skeleton);
        // ensure lazy images observed
        if (window.imgObserverReady) window.imgObserverReady();
      }, 30);
    } else {
      // No items: keep skeleton then remove fast
      setTimeout(() => container.innerHTML = '<div class="empty-note">No items</div>', 80);
    }

    // Append remaining items in chunks (very small micro-batches)
    if (section.items.length > 1) {
      const remaining = section.items.slice(1);
      chunkedAppend(container, remaining, section.factory, {
        chunkSize: 3,
        idleTimeout: 50,
        onComplete() {
          // after each section finishes, ensure images are observed
          if (window.imgObserverReady) window.imgObserverReady();
        }
      });
    }
  });

  ensureSentinel();
  const t1 = nowMs();
  console.log('Initial paint time (ms):', Math.round(t1 - t0));
}

/* ===========================
   Animations setup (lightweight)
   =========================== */
function setupEntryAnimations() {
  // IntersectionObserver already reveals card opacity/transform on image load; this is just a fallback
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        el.style.transition = 'opacity 260ms ease-out, transform 260ms ease-out';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.02, rootMargin: '0px 0px -12px 0px' });

  document.querySelectorAll('.product-card').forEach(card => {
    // if card already visible, force show
    if (card.getBoundingClientRect().top < window.innerHeight) {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    } else {
      observer.observe(card);
    }
  });
}

/* ===========================
   Initialize app
   =========================== */
function initializeAppAggressive() {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.35s ease-in-out';

  // mark expected counts for sentinel
  markExpectedCounts();

  // setup lazy loading & observers
  setupImageLazyLoading();

  // populate minimal UI then chunked remainder
  populateMenuAggressive();

  // setup final anims
  setTimeout(() => {
    setupEntryAnimations();
    document.body.style.opacity = '1';
  }, 120);

  // small perf watchers (optional)
  window.addEventListener('load', () => {
    console.log('window load event at', nowMs());
  });
}

/* Kick off when DOM is ready */
document.addEventListener('DOMContentLoaded', () => {
  try {
    initializeAppAggressive();
  } catch (e) {
    console.error('init error', e);
  }
});

/* Expose a helper if you want to run manual profiling from console */
window._perfHelpers = {
  finishAllGridsFast,
  populateMenuAggressive
};

