// script.js - unified cart, nav, product loaders
document.addEventListener('DOMContentLoaded', () => {
  // NAV DRAWER
  const navToggle = document.getElementById('nav-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerClose = document.getElementById('drawer-close');
  const drawerCartBtn = document.getElementById('drawer-cart-btn');

  navToggle?.addEventListener('click', () => {
    mobileDrawer?.classList.add('open');
    mobileDrawer?.setAttribute('aria-hidden', 'false');
  });
  drawerClose?.addEventListener('click', () => {
    mobileDrawer?.classList.remove('open');
    mobileDrawer?.setAttribute('aria-hidden', 'true');
  });

  // CART data + UI elements
  let cart = JSON.parse(localStorage.getItem('jarvisCartV7') || '[]');
  const cartSidebar = document.getElementById('cart-sidebar');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartBody = document.getElementById('cart-body');
  const cartTotalEl = document.getElementById('cart-total');
  const cartOpenBtns = document.querySelectorAll('#cart-open-btn');
  const cartCountBadges = document.querySelectorAll('#cart-count-badge');
  const drawerCartCount = document.getElementById('drawer-cart-count');
  const cartBadgeTop = document.getElementById('cart-count-badge');

  // CART toggle
  function toggleCart() {
    if (!cartSidebar || !cartOverlay) return;
    const open = cartSidebar.classList.toggle('open');
    cartOverlay.classList.toggle('open', open);
    cartSidebar.setAttribute('aria-hidden', open ? 'false' : 'true');
    cartOverlay.setAttribute('aria-hidden', open ? 'false' : 'true');
  }

  // wire open buttons (header and drawer)
  document.querySelectorAll('#cart-open-btn').forEach(b => b.addEventListener('click', (e) => { e.preventDefault(); toggleCart(); }));
  drawerCartBtn?.addEventListener('click', (e) => { e.preventDefault(); toggleCart(); mobileDrawer?.classList.remove('open'); });

  document.querySelectorAll('.cart-close-btn').forEach(b => b.addEventListener('click', toggleCart));
  cartOverlay?.addEventListener('click', toggleCart);

  // UTIL: save and update
  const persist = () => localStorage.setItem('jarvisCartV7', JSON.stringify(cart));
  const getTotalItems = () => cart.reduce((s, it) => s + (it.quantity || 0), 0);

  function updateBadges() {
    const n = getTotalItems();
    cartCountBadges.forEach(b => { if (b) { b.textContent = n; b.style.display = n ? 'inline-block' : 'none'; } });
    if (drawerCartCount) drawerCartCount.textContent = n;
    if (cartBadgeTop) cartBadgeTop.textContent = n;
  }

  function renderCart() {
    if (!cartBody) return;
    cartBody.innerHTML = '';
    if (!cart.length) {
      cartBody.innerHTML = '<p class="cart-empty-message">თქვენი კალათა ცარიელია.</p>';
      if (cartTotalEl) cartTotalEl.textContent = '0.00 ₾';
      updateBadges();
      return;
    }
    const ul = document.createElement('ul'); ul.id = 'cart-items';
    let total = 0;
    cart.forEach(item => {
      const price = parseFloat(String(item.price || '0').replace(' ₾','')) || 0;
      total += price * (item.quantity || 1);
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = `
        <img src="${item.image || 'photos/favicon.png'}" alt="${item.name}" class="cart-item-image" />
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${item.price}</div>
          <div class="cart-item-actions">
            <button class="quantity-change" data-id="${item.id}" data-change="-1">-</button>
            <span class="cart-item-qty">${item.quantity}</span>
            <button class="quantity-change" data-id="${item.id}" data-change="1">+</button>
          </div>
        </div>
        <button class="cart-item-remove-btn" data-id="${item.id}">&times;</button>
      `;
      ul.appendChild(li);
    });
    cartBody.appendChild(ul);
    if (cartTotalEl) cartTotalEl.textContent = `${total.toFixed(2)} ₾`;
    updateBadges();
  }

  function saveAndRender() { persist(); renderCart(); }

  // add to cart
  function addToCart(product) {
    if (!product || !product.id) return;
    const found = cart.find(i => i.id === product.id);
    if (found) found.quantity = (found.quantity || 0) + 1;
    else cart.push({ id: product.id, name: product.name, price: product.price || '0 ₾', image: product.image || '', quantity: 1 });
    saveAndRender();
  }

  // handle quantity/change/remove in cart
  cartBody?.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    if (!id) return;
    if (btn.classList.contains('quantity-change')) {
      const change = parseInt(btn.dataset.change, 10) || 0;
      const it = cart.find(c => c.id === id);
      if (!it) return;
      it.quantity = (it.quantity || 0) + change;
      if (it.quantity <= 0) cart = cart.filter(c => c.id !== id);
      saveAndRender();
    } else if (btn.classList.contains('cart-item-remove-btn')) {
      cart = cart.filter(c => c.id !== id);
      saveAndRender();
    }
  });

  // generate order message
  function generateOrderMessage(items) {
    if (!items || !items.length) return 'კალათა ცარიელია.';
    let total = 0;
    let msg = 'გამარჯობა, მინდა შევუკვეთო:\n\n';
    items.forEach(it => {
      const price = parseFloat(String(it.price || '0').replace(' ₾','')) || 0;
      total += price * (it.quantity || 1);
      msg += `- ${it.name} (რაოდენობა: ${it.quantity})\n`;
    });
    msg += `\nსულ ჯამი: ${total.toFixed(2)} ₾`;
    return msg;
  }

  // checkout buttons
  document.querySelectorAll('#checkout-messenger-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!cart.length) return alert('კალათა ცარიელია!');
      const link = `https://m.me/61578859507900?text=${encodeURIComponent(generateOrderMessage(cart))}`;
      window.open(link, '_blank');
    });
  });
  document.querySelectorAll('#checkout-whatsapp-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!cart.length) return alert('კალათა ცარიელია!');
      const link = `https://wa.me/995599608105?text=${encodeURIComponent(generateOrderMessage(cart))}`;
      window.open(link, '_blank');
    });
  });

  // INITIAL render
  renderCart();
  updateBadges();

  // PRODUCT list & detail loaders
  const formatPriceHtml = (p) => {
    if (p.old_price && String(p.old_price).trim()) {
      return `<span class="old-price">${p.old_price}</span> <span class="new-price">${p.price}</span>`;
    }
    return `<span class="new-price">${p.price}</span>`;
  };

  async function loadProductsList() {
    const featuredContainer = document.getElementById('featured-products-wrapper');
    const gridContainer = document.getElementById('products-grid') || document.querySelector('.products-grid');
    const container = featuredContainer || gridContainer;
    if (!container) return;
    try {
      const res = await fetch('products.json');
      const products = await res.json();

      // delegation for add-to-cart buttons
      document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-add-to-cart-small, .btn-add-to-cart');
        if (!btn) return;
        e.preventDefault();
        const id = btn.dataset.id;
        const product = products.find(p => p.id === id);
        if (product) addToCart(product);
      });

      const cardHtml = (product) => `
        <div class="product-card">
          <a href="product-details.html?id=${product.id}" class="product-card-link">
            <div class="product-image-container"><img src="${product.image}" alt="${product.name}"></div>
            <div class="product-info">
              <h3 class="product-name">${product.name}</h3>
              <div class="product-price-and-cart">
                <div class="product-price">${formatPriceHtml(product)}</div>
                <button class="btn-add-to-cart-small" data-id="${product.id}" title="კალათაში დამატება"><i class="fas fa-cart-plus"></i></button>
              </div>
            </div>
          </a>
        </div>
      `;

      if (featuredContainer) {
        featuredContainer.innerHTML = products.map(p => `<div class="swiper-slide">${cardHtml(p)}</div>`).join('');
        new Swiper('.product-slider', {
          loop: true, spaceBetween: 20,
          pagination: { el: '.swiper-pagination', clickable: true },
          navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
          breakpoints: { 640: { slidesPerView: 2 }, 768: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } }
        });
      } else {
        gridContainer.innerHTML = products.map(cardHtml).join('');
      }
    } catch (err) {
      console.error('products.json load failed', err);
    }
  }

  async function loadProductDetails() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;
    try {
      const res = await fetch('products.json');
      const products = await res.json();
      const product = products.find(p => p.id === id);
      if (!product) return;

      document.title = product.name || 'პროდუქტი';
      const nameEl = document.getElementById('product-name');
      if (nameEl) nameEl.textContent = product.name;

      document.getElementById('product-full-description').textContent = product.full_description || '';
      document.getElementById('product-price').innerHTML = formatPriceHtml(product);

      // add "add to cart" button
      const actions = document.getElementById('product-actions');
      if (actions) {
        const btn = document.createElement('button');
        btn.className = 'btn btn-add-to-cart';
        btn.innerHTML = '<i class="fas fa-shopping-cart"></i> კალათაში დამატება';
        btn.addEventListener('click', () => addToCart(product));
        actions.prepend(btn);
      }

      // order button sets messenger message
      const orderBtn = document.getElementById('order-button');
      if (orderBtn) {
        const msg = `გამარჯობა, ამ პროდუქტის შეძენა მსურს: ${product.name} - ${product.price || ''}`;
        orderBtn.href = `https://m.me/61578859507900?text=${encodeURIComponent(msg)}`;
      }

      // gallery
      const gallery = document.getElementById('product-gallery-wrapper');
      let slides = '';
      if (product.video) slides += `<div class="swiper-slide video-slide"><video controls muted playsinline loop><source src="${product.video}" type="video/mp4"></video></div>`;
      (product.images || []).forEach(img => slides += `<div class="swiper-slide"><img src="${img}" alt="${product.name}"></div>`);
      if (gallery) gallery.innerHTML = slides;

      new Swiper('.product-gallery-slider', {
        autoHeight: true, loop: false,
        pagination: { el: '.swiper-pagination', clickable: true },
        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }
      });

    } catch (err) {
      console.error('product details load failed', err);
    }
  }

  // decide which to run
  if (document.querySelector('.product-details-section')) loadProductDetails();
  else loadProductsList();

  // anchor smooth scroll but don't override other link behaviors
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (!target) return;
      const header = document.querySelector('.header');
      const offset = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      // close drawer if open
      if (mobileDrawer?.classList.contains('open')) {
        mobileDrawer.classList.remove('open');
        mobileDrawer.setAttribute('aria-hidden', 'true');
      }
    });
  });

  // update badges when storage changed by others (optional)
  window.addEventListener('storage', (e) => {
    if (e.key === 'jarvisCartV7') {
      cart = JSON.parse(localStorage.getItem('jarvisCartV7') || '[]');
      renderCart();
      updateBadges();
    }
  });

  // run initial UI update
  renderCart();
  updateBadges();

  // Expose addToCart globally for debugging/testing in console if needed
  window.__addToCart = addToCart;
});
