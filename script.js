/* PART 7 / script.js (start) */
document.addEventListener('DOMContentLoaded', () => {

    // --- მობილურის მენიუს ლოგიკა ---
    const navMenu = document.querySelector('.nav__links');
    const navToggle = document.getElementById('nav-toggle');
    const navClose = document.getElementById('nav-close');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('show-menu');
        });
    }
    if (navClose) {
        navClose.addEventListener('click', (e) => { e.preventDefault(); navMenu.classList.remove('show-menu'); });
    }

    // Close mobile menu when clicking any link
    document.querySelectorAll('.nav__links a').forEach(a => {
        a.addEventListener('click', () => navMenu.classList.remove('show-menu'));
    });

    // ======================= START: CART LOGIC =======================
    let cart = JSON.parse(localStorage.getItem('jarvisCartV6')) || [];
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsContainer = document.getElementById('cart-body');
    const cartTotalElement = document.getElementById('cart-total');
    const navCartBtn = document.getElementById('nav-cart-btn');
    const cartCountEls = document.querySelectorAll('#cart-count, #hamburger-cart-count');

    const toggleCart = () => {
        if (cartSidebar) cartSidebar.classList.toggle('open');
        if (cartOverlay) cartOverlay.classList.toggle('open');
    };

    // Attach cart toggles (desktop text and header icon both map to same id in markup)
    document.querySelectorAll('#nav-cart-btn, #nav-cart-btn-desktop').forEach(el => {
        if (el) el.addEventListener('click', (e) => { e.preventDefault(); toggleCart(); });
    });

    document.getElementById('cart-close-btn')?.addEventListener('click', toggleCart);
    if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);

    const updateCart = () => {
        renderCartItems();
        localStorage.setItem('jarvisCartV6', JSON.stringify(cart));
        updateCartCountBadges();
    };

    const updateCartCountBadges = () => {
        const totalCount = cart.reduce((s, it) => s + (it.quantity || 0), 0);
        cartCountEls.forEach(el => { if (el) el.textContent = totalCount; });
        // also show/hide styling
        cartCountEls.forEach(el => { if (!el) return; el.style.display = totalCount > 0 ? 'inline-block' : 'none'; });
    };
/* PART 8 / script.js (cart render + handlers + product lists) */
    const renderCartItems = () => {
        if (!cartItemsContainer) return;
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="cart-empty-message">თქვენი კალათა ცარიელია.</p>';
            if (cartTotalElement) cartTotalElement.textContent = '0.00 ₾';
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
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${item.price}</div>
                    <div class="cart-item-actions">
                        <button class="quantity-change" data-id="${item.id}" data-change="-1">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-change" data-id="${item.id}" data-change="1">+</button>
                    </div>
                </div>
                <button class="cart-item-remove-btn" data-id="${item.id}" aria-label="remove">&times;</button>
            `;
            ul.appendChild(li);
        });
        cartItemsContainer.appendChild(ul);
        if (cartTotalElement) cartTotalElement.textContent = `${total.toFixed(2)} ₾`;
    };

    const addToCart = (product) => {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 0) + 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCart();
    };

    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;
            const id = target.dataset.id;
            if (!id) return;
            const itemInCart = cart.find(item => item.id === id);
            if (!itemInCart) return;

            if (target.classList.contains('quantity-change')) {
                const change = parseInt(target.dataset.change, 10);
                itemInCart.quantity = (itemInCart.quantity || 0) + change;
                if (itemInCart.quantity <= 0) cart = cart.filter(item => item.id !== id);
            } else if (target.classList.contains('cart-item-remove-btn')) {
                cart = cart.filter(item => item.id !== id);
            }
            updateCart();
        });
    }

    const generateOrderMessage = (items) => {
        if (items.length === 0) return 'კალათა ცარიელია.';
        let message = 'გამარჯობა, მინდა შევუკვეთო:\\n\\n';
        let total = 0;
        items.forEach(item => {
            const priceString = item.price || '0 ₾';
            const price = parseFloat(priceString.replace(' ₾', '')) || 0;
            total += price * (item.quantity || 0);
            message += `- ${item.name} (რაოდენობა: ${item.quantity})\\n`;
        });
        message += `\\nსულ ჯამი: ${total.toFixed(2)} ₾`;
        return message;
    };

    document.getElementById('checkout-messenger-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (cart.length === 0) return alert('კალათა ცარიელია!');
        const link = `https://m.me/61578859507900?text=${encodeURIComponent(generateOrderMessage(cart))}`;
        window.open(link, '_blank');
    });

    document.getElementById('checkout-whatsapp-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (cart.length === 0) return alert('კალათა ცარიელია!');
        const link = `https://wa.me/995599608105?text=${encodeURIComponent(generateOrderMessage(cart))}`;
        window.open(link, '_blank');
    });
    // ======================= END: CART LOGIC ======================= //

    // --- Main Functions Runner ---
    if (document.querySelector('.product-details-section')) {
        loadProductDetails();
    } else {
        loadProductLists();
    }

    updateCart(); // Render cart on every page load

    const formatPrice = (product) => {
        if (product.old_price && product.old_price.trim() !== "") {
            return `<span class="old-price">${product.old_price}</span> <span class="new-price">${product.price}</span>`;
        }
        return `<span class="new-price">${product.price}</span>`;
    };
/* PART 9 / script.js (product lists, product details, form & scroll) */
    async function loadProductLists() {
        const container = document.querySelector('#featured-products-wrapper') || document.querySelector('.products-grid');
        if (!container) return;
        try {
            const response = await fetch('products.json');
            const products = await response.json();

            document.body.addEventListener('click', (e) => {
                const button = e.target.closest('.btn-add-to-cart-small');
                if (button) {
                    e.preventDefault();
                    e.stopPropagation();
                    const productId = button.dataset.id;
                    const product = products.find(p => p.id === productId);
                    if (product) addToCart(product);
                }
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
        } catch (error) { console.error('Products load error:', error); }
    }

    async function loadProductDetails() {
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id');
        if (!productId) return;
        try {
            const response = await fetch('products.json');
            const products = await response.json();
            const product = products.find(p => p.id === productId);
            if (product) {
                document.title = product.name;
                const productNameH1 = document.getElementById('product-name');
                if (productNameH1) productNameH1.textContent = product.name;

                document.getElementById('product-full-description').textContent = product.full_description;
                document.getElementById('product-price').innerHTML = formatPrice(product);

                const actionsContainer = document.getElementById('product-actions');
                if(actionsContainer){
                    const addToCartBtn = document.createElement('button');
                    addToCartBtn.className = 'btn btn-add-to-cart';
                    addToCartBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> კალათაში დამატება';
                    addToCartBtn.addEventListener('click', () => addToCart(product));
                    actionsContainer.prepend(addToCartBtn);

                    const orderButton = document.getElementById('order-button');
                    if(orderButton){
                        const orderMessage = `გამარჯობა, ამ პროდუქტის შეძენა მსურს: ${product.name} - ${product.price}`;
                        orderButton.href = `https://m.me/61578859507900?text=${encodeURIComponent(orderMessage)}`;
                    }
                }

                const galleryWrapper = document.getElementById('product-gallery-wrapper');
                let slidesHTML = '';
                if (product.video && product.video.trim() !== "") {
                    slidesHTML += `<div class="swiper-slide video-slide"><video controls muted loop autoplay playsinline><source src="${product.video}" type="video/mp4"></video></div>`;
                }
                product.images.forEach(img => slidesHTML += `<div class="swiper-slide"><img src="${img}" alt="${product.name}"></div>`);
                if(galleryWrapper) galleryWrapper.innerHTML = slidesHTML;

                new Swiper('.product-gallery-slider', {
                    autoHeight: true, loop: false,
                    pagination: { el: '.swiper-pagination', clickable: true },
                    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
                    on: {
                        slideChange: function () {
                            document.querySelectorAll('.product-gallery-slider video').forEach(video => video.pause());
                        }
                    }
                });
            }
        } catch (error) { console.error('Product details load error:', error); }
    }

    // --- FORM AND SCROLL LOGIC ---
    const form = document.getElementById("contact-form");
    if (form) { /* you can keep your existing form handling here */ }

    function scrollToSection(targetId) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const header = document.querySelector('.header');
            const headerHeight = header ? header.offsetHeight : 0;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = targetPosition - headerHeight;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        // if it's the cart text button - handled globally
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (navMenu && navMenu.classList.contains('show-menu')) {
                navMenu.classList.remove('show-menu');
            }
            if (targetId && targetId.startsWith('#')) scrollToSection(targetId);
        });
    });

    window.addEventListener("load", () => {
        if (window.location.hash) {
            setTimeout(() => { scrollToSection(window.location.hash); }, 100);
        }
    });

}); // end DOMContentLoaded
