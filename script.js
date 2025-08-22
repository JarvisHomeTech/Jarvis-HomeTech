document.addEventListener('DOMContentLoaded', () => {

    // --- მობილურის მენიუს ლოგიკა ---
    const navMenu = document.querySelector('.nav__links');
    const navToggle = document.getElementById('nav-toggle');
    const navClose = document.getElementById('nav-close');
    if (navToggle) { navToggle.addEventListener('click', () => navMenu.classList.add('show-menu')); }
    if (navClose) { navClose.addEventListener('click', () => navMenu.classList.remove('show-menu')); }

    // ======================= START: CART LOGIC ======================= //
    let cart = JSON.parse(localStorage.getItem('jarvisCartV5')) || [];
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsContainer = document.getElementById('cart-body');
    const cartTotalElement = document.getElementById('cart-total');
    const navCartBtn = document.getElementById('nav-cart-btn');

    const toggleCart = () => {
        cartSidebar.classList.toggle('open');
        cartOverlay.classList.toggle('open');
    };
    
    if (navCartBtn) navCartBtn.addEventListener('click', (e) => { e.preventDefault(); toggleCart(); });
    document.getElementById('cart-close-btn').addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);

    const updateCart = () => {
        renderCartItems();
        localStorage.setItem('jarvisCartV5', JSON.stringify(cart));
    };

    const renderCartItems = () => {
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="cart-empty-message">თქვენი კალათა ცარიელია.</p>';
            if(cartTotalElement) cartTotalElement.textContent = '0.00 ₾';
            return;
        }
        
        const ul = document.createElement('ul');
        ul.id = 'cart-items';
        let total = 0;
        cart.forEach(item => {
            const price = parseFloat(item.price.replace(' ₾', ''));
            total += price * item.quantity;
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
                <button class="cart-item-remove-btn" data-id="${item.id}">&times;</button>
            `;
            ul.appendChild(li);
        });
        cartItemsContainer.appendChild(ul);
        if(cartTotalElement) cartTotalElement.textContent = `${total.toFixed(2)} ₾`;
    };

    const addToCart = (product) => {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCart();
    };

    if(cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;
            const id = target.dataset.id;
            if (!id) return;
            
            const itemInCart = cart.find(item => item.id === id);
            if (!itemInCart) return;

            if (target.classList.contains('quantity-change')) {
                const change = parseInt(target.dataset.change);
                itemInCart.quantity += change;
                if (itemInCart.quantity <= 0) cart = cart.filter(item => item.id !== id);
            } else if (target.classList.contains('cart-item-remove-btn')) {
                cart = cart.filter(item => item.id !== id);
            }
            updateCart();
        });
    }

    const generateOrderMessage = (items) => {
        if (items.length === 0) return 'კალათა ცარიელია.';
        let message = 'გამარჯობა, მინდა შევუკვეთო:\n\n';
        let total = 0;
        items.forEach(item => {
            const price = parseFloat(item.price.replace(' ₾', ''));
            total += price * item.quantity;
            message += `- ${item.name} (რაოდენობა: ${item.quantity})\n`;
        });
        message += `\nსულ ჯამი: ${total.toFixed(2)} ₾`;
        return message;
    };

    const checkoutMessengerBtn = document.getElementById('checkout-messenger-btn');
    if(checkoutMessengerBtn) {
        checkoutMessengerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (cart.length === 0) return alert('კალათა ცარიელია!');
            const link = `https://m.me/61578859507900?text=${encodeURIComponent(generateOrderMessage(cart))}`;
            window.open(link, '_blank');
        });
    }

    const checkoutWhatsappBtn = document.getElementById('checkout-whatsapp-btn');
    if(checkoutWhatsappBtn) {
        checkoutWhatsappBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (cart.length === 0) return alert('კალათა ცარიელია!');
            const link = `https://wa.me/995599608105?text=${encodeURIComponent(generateOrderMessage(cart))}`;
            window.open(link, '_blank');
        });
    }
    // ======================= END: CART LOGIC ======================= //

    if (document.querySelector('.product-details-section')) {
        loadProductDetails();
    } else {
        loadProductLists();
    }
    updateCart();

    const formatPrice = (product) => {
        if (product.old_price && product.old_price.trim() !== "") {
            return `<span class="old-price">${product.old_price}</span> <span class="new-price">${product.price}</span>`;
        }
        return `<span class="new-price">${product.price}</span>`;
    };

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
                const addToCartBtn = document.createElement('button');
                addToCartBtn.className = 'btn btn-add-to-cart';
                addToCartBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> კალათაში დამატება';
                addToCartBtn.addEventListener('click', () => addToCart(product));
                actionsContainer.prepend(addToCartBtn);

                const orderButton = document.getElementById('order-button');
                const orderMessage = `გამარჯობა, ამ პროდუქტის შეძენა მსურს: ${product.name} - ${product.price}`;
                if (orderButton) orderButton.href = `https://m.me/61578859507900?text=${encodeURIComponent(orderMessage)}`;

                const galleryWrapper = document.getElementById('product-gallery-wrapper');
                let slidesHTML = '';
                if (product.video && product.video.trim() !== "") {
                    slidesHTML += `<div class="swiper-slide video-slide"><video controls muted loop autoplay playsinline><source src="${product.video}" type="video/mp4"></video></div>`;
                }
                product.images.forEach(img => slidesHTML += `<div class="swiper-slide"><img src="${img}" alt="${product.name}"></div>`);
                galleryWrapper.innerHTML = slidesHTML;

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

    const form = document.getElementById("contact-form");
    if (form) { /* Form logic... */ }

    // Scroll Logic
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
        if(anchor.id === 'nav-cart-btn') return;
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (navMenu.classList.contains('show-menu')) {
                navMenu.classList.remove('show-menu');
            }
            scrollToSection(targetId);
        });
    });
    window.addEventListener("load", () => {
        if (window.location.hash) {
            setTimeout(() => {
                scrollToSection(window.location.hash);
            }, 100);
        }
    });
});
