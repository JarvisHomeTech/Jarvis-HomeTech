document.addEventListener('DOMContentLoaded', () => {
    // --- მობილურის მენიუს ლოგიკა ---
    // ... (ეს ნაწილი უცვლელია) ...

    // --- ფუნქციების გაშვება ---
    if (document.querySelector('.product-details-section')) {
        loadProductDetails();
    } else {
        loadProductLists();
    }

    // --- ფასის ფორმატირების ფუნქცია ---
    const formatPrice = (product) => {
        if (product.old_price && product.old_price.trim() !== "") {
            return `
                <span class="old-price">${product.old_price}</span>
                <span class="new-price">${product.price}</span>
            `;
        }
        return `<span class="new-price">${product.price}</span>`;
    };

    // --- პროდუქტების სიების ჩატვირთვის ფუნქცია ---
    async function loadProductLists() {
        const featuredProductsWrapper = document.querySelector('#featured-products-wrapper');
        const productsGrid = document.querySelector('.products-grid');
        if (!featuredProductsWrapper && !productsGrid) return;
        try {
            const response = await fetch('products.json');
            const products = await response.json();
            const createProductCard = (product) => `
                <div class="product-card">
                    <a href="product-details.html?id=${product.id}" class="product-card-link">
                        <div class="product-image-container"><img src="${product.image}" alt="${product.name}"></div>
                        <div class="product-info">
                            <h3 class="product-name">${product.name}</h3>
                            <div class="product-price">${formatPrice(product)}</div>
                        </div>
                    </a>
                </div>`;
            if (featuredProductsWrapper) {
                featuredProductsWrapper.innerHTML = products.map(p => `<div class="swiper-slide">${createProductCard(p)}</div>`).join('');
                new Swiper('.product-slider', { /* ... სლაიდერის პარამეტრები ... */ });
            }
            if (productsGrid) {
                productsGrid.innerHTML = products.map(createProductCard).join('');
            }
        } catch (error) { console.error('შეცდომა პროდუქტების სიის ჩატვირთვისას:', error); }
    }

    // --- პროდუქტის დეტალური გვერდის ჩატვირთვის ფუნქცია ---
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
                document.getElementById('product-name').textContent = product.name;
                document.getElementById('product-full-description').textContent = product.full_description;
                document.getElementById('product-price').innerHTML = formatPrice(product); // ვიყენებთ ახალ ფუნქციას

                // ... დანარჩენი კოდი სლაიდერისთვის და ვიდეოსთვის ...
                 const galleryWrapper = document.getElementById('product-gallery-wrapper');
                let slidesHTML = '';
                if (product.video && product.video.trim() !== "") {
                    slidesHTML += `<div class="swiper-slide video-slide"><video controls muted loop autoplay playsinline><source src="${product.video}" type="video/mp4"></video></div>`;
                }
                product.images.forEach(img => {
                    slidesHTML += `<div class="swiper-slide"><img src="${img}" alt="${product.name}"></div>`;
                });
                galleryWrapper.innerHTML = slidesHTML;
                new Swiper('.product-gallery-slider', { loop: false, pagination: { el: '.swiper-pagination', clickable: true }, navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' } });
            }
        } catch (error) { console.error('შეცდომა პროდუქტის დეტალების ჩატვირთვისას:', error); }
    }
    
    // --- ფორმის და სქროლის ლოგიკა ---
    // ... (ეს ნაწილი უცვლელია) ...
});
