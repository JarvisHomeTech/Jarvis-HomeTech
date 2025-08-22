document.addEventListener('DOMContentLoaded', () => {

    // --- მობილურის მენიუს ლოგიკა ---
    const navMenu = document.querySelector('.nav__links');
    const navToggle = document.getElementById('nav-toggle');
    const navClose = document.getElementById('nav-close');
    if (navToggle) { navToggle.addEventListener('click', () => navMenu.classList.add('show-menu')); }
    if (navClose) { navClose.addEventListener('click', () => navMenu.classList.remove('show-menu')); }

    // ======================= START: CART LOGIC ======================= //

    let cart = JSON.parse(localStorage.getItem('jarvisCartV6')) || [];
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsContainer = document.getElementById('cart-body');
    const cartTotalElement = document.getElementById('cart-total');
    const navCartBtn = document.getElementById('nav-cart-btn');
    const navCartCounterMain = document.getElementById('nav-cart-counter-main');
    const navCartCounterMobile = document.getElementById('nav-cart-counter-mobile');

    const toggleCart = () => {
        if(cartSidebar) cartSidebar.classList.toggle('open');
        if(cartOverlay) cartOverlay.classList.toggle('open');
    };
    
    if (navCartBtn) navCartBtn.addEventListener('click', (e) => { e.preventDefault(); toggleCart(); });
    document.getElementById('cart-close-btn')?.addEventListener('click', toggleCart);
    if(cartOverlay) cartOverlay.addEventListener('click', toggleCart);

    const updateCart = () => {
        renderCartItems();
        updateAllCounters();
        localStorage.setItem('jarvisCartV6', JSON.stringify(cart));
    };
    
    const updateAllCounters = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const counters = [navCartCounterMain, navCartCounterMobile];
        counters.forEach(counter => {
            if(counter) {
                counter.textContent = totalItems;
                counter.style.display = totalItems > 0 ? 'inline-flex' : 'none';
            }
        });
    };

    const renderCartItems = () => {
        if (!cartItemsContainer) return;
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
            const priceString = item.price || '0 ₾';
            const price = parseFloat(priceString.replace(' ₾', ''));
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

    const generateOrderMessage = (items) => { /* ... (same as before) ... */ };
    document.getElementById('checkout-messenger-btn')?.addEventListener('click', (e) => { /* ... (same as before) ... */ });
    document.getElementById('checkout-whatsapp-btn')?.addEventListener('click', (e) => { /* ... (same as before) ... */ });
    // ======================= END: CART LOGIC ======================= //

    if (document.querySelector('.product-details-section')) {
        loadProductDetails();
    } else {
        loadProductLists();
    }
    updateCart();

    const formatPrice = (product) => { /* ... (same as before) ... */ };

    async function loadProductLists() { /* ... (same logic as the one you provided in the last turn, with the corrected createProductCard) ... */ }
    async function loadProductDetails() { /* ... (same logic as the one you provided in the last turn, with the corrected button creation and dynamic link) ... */ }
    
    // ... (Your original form and scroll logic) ...
});
