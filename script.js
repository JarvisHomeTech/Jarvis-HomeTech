document.addEventListener('DOMContentLoaded', () => {

  // NAV show/hide
  const navMenu = document.getElementById('nav-links');
  const navToggle = document.getElementById('nav-toggle');
  const navClose = document.getElementById('nav-close');

  if (navToggle) navToggle.addEventListener('click', () => navMenu.classList.add('show-menu'));
  if (navClose) navClose.addEventListener('click', () => navMenu.classList.remove('show-menu'));

  // CART logic
  let cart = JSON.parse(localStorage.getItem('jarvisCartV6')) || [];
  const cartSidebar = document.getElementById('cart-sidebar');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartItemsContainer = document.getElementById('cart-body');
  const cartTotalElement = document.getElementById('cart-total');
  const cartCountElement = document.querySelectorAll('#cart-count'); // maybe multiple in multiple headers
  const navCartOpenBtn = document.getElementById('cart-open-btn');

  const toggleCart = () => {
    if (cartSidebar) cartSidebar.classList.toggle('open');
    if (cartOverlay) cartOverlay.classList.toggle('open');
  };

  if (navCartOpenBtn) navCartOpenBtn.addEventListener('click', (e) => { e.preventDefault(); toggleCart(); });
  document.querySelectorAll('.cart-close-btn').forEach(btn => btn.addEventListener('click', toggleCart));
  if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);

  const updateCartCountUI = () => {
    const totalItems = cart.reduce((s, it) => s + (it.quantity || 0), 0);
    cartCountElement.forEach(el => {
      if (el) {
        el.textContent = totalItems;
        // hide zero
        if (totalItems === 0) el.style.display = 'none'; else el.style.display = 'inline-block';
      }
    });
  };

  const renderCartItems = () => {
    if (!cartItemsContainer) return;
    cartItemsContainer.innerHTML = '';
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p class="cart-empty-message">თქვენი კალათა ცარიელია.</p>';
      if (cartTotalElement) cartTotalElement.textContent = '0.00 ₾';
      updateCartCountUI();
      return;
    }

    const ul = document.createElement('ul');
    ul.id = 'cart-items';
    let total = 0;
    cart.forEach(item => {
      const priceString = item.price || '0 ₾';
      const price = parseFloat(priceString.replace(' ₾', '')) || 0;
      total += price * (item.quantity || 1);

      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = `
        <img src="${item.image || 'photos/favicon.png'}" alt="${item.name}" class="cart-item-image">
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${item.price}</div>
          <div class="cart-item-actions">
            <button class="quantity-change" data-id="${item.id}" data-change="-1">-</button>
            <span>${item.quantity}</span>
            <button class="quantity-change" data-id="${item.id}" data-change="1">+</button>
          </div>
        </div>
        <button class="cart-item-remove-btn" data-id="${item.id}">&times;</button>
      `;
      ul.appendChild(li);
    });

    cartItemsContainer.appendChild(ul);
    if (cartTotalElement) cartTotalElement.textContent = `${total.toFixed(2)} ₾`;
    updateCartCountUI();
  };

  const persistCart = () => {
    localStorage.setItem('jarvisCartV6', JSON.stringify(cart));
  };

  const updateCart = () => {
    renderCartItems();
    persistCart();
  };

  const addToCart = (product) => {
    const existing = cart.find(i => i.id === product.id);
    if (existing) existing.quantity = (existing.quantity || 1) + 1;
    else cart.push({ id: product.id, name: product.name, price: product.price || '0 ₾', image: product.image || '', quantity: 1 });
    updateCart();
  };

  // event delegation for cart item quantity/remove
  if (cartItemsContainer) {
    cartItemsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const id = btn.dataset.id;
      if (!id) return;
      const inCart = cart.find(it => it.id === id);
      if (!inCart) return;

      if (btn.classList.contains('quantity-change')) {
        const change = parseInt(btn.dataset.change, 10) || 0;
        inCart.quantity += change;
        if (inCart.quantity <= 0) cart = cart.filter(i => i.id !== id);
      } else if (btn.classList.contains('cart-item-remove-btn')) {
        cart = cart.filter(i => i.id !== id);
      }
      updateCart();
    });
  }

  const generateOrderMessage = (items) => {
    if (!items || items.length === 0) return 'კალათა ცარიელია.';
    let msg = 'გამარჯობა, მინდა შევუკვეთო:\n\n';
    let total = 0;
    items.forEach(item => {
      const price = parseFloat((item.price || '0').replace(' ₾', '')) || 0;
      total += price * (item.quantity || 1);
      msg += `- ${item.name} (რაოდენობა: ${item.quantity})\n`;
    });
    msg += `\nსულ ჯამი: ${total.toFixed(2)} ₾`;
    return msg;
  };

  document.querySelectorAll('#checkout-messenger-btn').forEach(btn => {
    btn?.addEventListener('click', (e) => {
      e.preventDefault();
      if (cart.length === 0) return alert('კალათა ცარიელია!');
      const link = `https://m.me/61578859507900?text=${encodeURIComponent(generateOrderMessage(cart))}`;
      window.open(link, '_blank');
    });
  });

  document.querySelectorAll('#checkout-whatsapp-btn').forEach(btn => {
    btn?.addEventListener('click', (e) => {
      e.preventDefault();
      if (cart.length === 0) return alert('კალათა ცარიელია!');
      const link = `https://wa.me/995599608105?text=${encodeURIComponent(generateOrderMessage(cart))}`;
      window.open(link, '_blank');
    });
  });

  // update cart UI on load
  updateCart();

  // PRODUCTS listing and add-to-cart
  const formatPrice = (product) => {
    if (product.old_price && product.old_price.trim() !== "") {
      return `<span class="old-price">${product.old_price}</span> <span class="new-price">${product.price}</span>`;
    }
    return `<span class="new-price">${product.price}</span>`;
  };

  async function loadProductLists() {
    const container = document.querySelector('#featured-products-wrapper') || document.querySelector('.products-grid') || document.getElementById('products-grid');
    if (!container) return;
    try {
      const response = await fetch('products.json');
      const products = await response.json();

      // handle add-to-cart clicks using delegation
      document.body.addEventListener('click', (e) => {
        const button = e.target.closest('.btn-add-to-cart-small, .btn-add-to-cart');
        if (!button) return;
        e.preventDefault();
        const productId = button.dataset.id;
        const product = products.find(p => p.id === productId);
        if (product) addToCart(product);
      });

      const createProductCard = (product) => `
        <div class="product-card">
          <a href="product-details.html?id=${product.id}" class="product-card-link">
            <div class="product-image-container"><img src="${product.image}" alt="${product.name}"></div>
            <div class="product-info">
              <h3 class="product-name">${product.name}</h3>
              <div class="product-price-and-cart">
                <div class="product-price">${formatPrice(product)}</div>
                <button class="btn-add-to-cart-small" data-id="${product.id}" title="კალათაში დამატება"><i class="fas fa-cart-plus"></i></button>
              </div>
            </div>
          </a>
        </div>`;

      if (container.id === 'featured-products-wrapper') {
        container.innerHTML = products.map(p => `<div class="swiper-slide">${createProductCard(p)}</div>`).join('');
        new Swiper('.product-slider', {
          loop: true, spaceBetween: 20,
          pagination: { el: '.swiper-pagination', clickable: true },
          navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
          breakpoints: { 640: { slidesPerView: 2 }, 768: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } }
        });
      } else {
        container.innerHTML = products.map(createProductCard).join('');
      }
    } catch (err) {
      console.error('Products load error:', err);
    }
  }

  async function loadProductDetails() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    if (!productId) return;
    try {
      const response = await fetch('products.json');
      const products = await response.json();
      const product = products.find(p => p.id === productId);
      if (!product) return;

      document.title = product.name;
      const productNameH1 = document.getElementById('product-name');
      if (productNameH1) productNameH1.textContent = product.name;

      document.getElementById('product-full-description').textContent = product.full_description || '';
      document.getElementById('product-price').innerHTML = formatPrice(product);

      const actionsContainer = document.getElementById('product-actions');
      if (actionsContainer) {
        const addToCartBtn = document.createElement('button');
        addToCartBtn.className = 'btn btn-add-to-cart';
        addToCartBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> კალათაში დამატება';
        addToCartBtn.addEventListener('click', () => addToCart(product));
        actionsContainer.prepend(addToCartBtn);

        const orderButton = document.getElementById('order-button');
        if (orderButton) {
          const orderMessage = `გამარჯობა, ამ პროდუქტის შეძენა მსურს: ${product.name} - ${product.price || ''}`;
          orderButton.href = `https://m.me/61578859507900?text=${encodeURIComponent(orderMessage)}`;
        }
      }

      const galleryWrapper = document.getElementById('product-gallery-wrapper');
      let slidesHTML = '';
      if (product.video && product.video.trim() !== '') {
        slidesHTML += `<div class="swiper-slide video-slide"><video controls muted loop playsinline><source src="${product.video}" type="video/mp4"></video></div>`;
      }
      (product.images || []).forEach(img => slidesHTML += `<div class="swiper-slide"><img src="${img}" alt="${product.name}"></div>`);
      if (galleryWrapper) galleryWrapper.innerHTML = slidesHTML;

      new Swiper('.product-gallery-slider', {
        autoHeight: true, loop: false,
        pagination: { el: '.swiper-pagination', clickable: true },
        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        on: {
          slideChange: function () {
            document.querySelectorAll('.product-gallery-slider video').forEach(v => v.pause());
          }
        }
      });

    } catch (err) {
      console.error('Product details load error:', err);
    }
  }

  // run appropriate loader
  if (document.querySelector('.product-details-section')) loadProductDetails();
  else loadProductLists();

  // simple anchor smooth scroll (skip cart button anchors)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      if (this.id === 'cart-open-btn') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (!target) return;
      const header = document.querySelector('.header');
      const headerHeight = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
      window.scrollTo({ top, behavior: 'smooth' });
      if (navMenu && navMenu.classList.contains('show-menu')) navMenu.classList.remove('show-menu');
    });
  });

  // keep cart UI updated on load (in case other pages changed)
  updateCart();

});
