document.addEventListener('DOMContentLoaded', () => {

    // --- მობილურის მენიუს ლოგიკა ---
    const navMenu = document.querySelector('.nav__links');
    const navToggle = document.getElementById('nav-toggle');
    const navClose = document.getElementById('nav-close');

    if (navToggle) {
        navToggle.addEventListener('click', () => navMenu.classList.add('show-menu'));
    }
    if (navClose) {
        navClose.addEventListener('click', () => navMenu.classList.remove('show-menu'));
    }

    // --- ფუნქციების გაშვება იმის მიხედვით, რომელ გვერდზე ვართ ---
    if (document.querySelector('.product-details-section')) {
        loadProductDetails();
    } else {
        loadProductLists();
    }

    // --- პროდუქტების სიების ჩატვირთვის ფუნქცია (index.html და products.html) ---
    async function loadProductLists() {
        const featuredProductsWrapper = document.querySelector('#featured-products-wrapper');
        const productsGrid = document.querySelector('.products-grid');

        if (!featuredProductsWrapper && !productsGrid) return;

        try {
            const response = await fetch('products.json');
            if (!response.ok) throw new Error('პროდუქტების ფაილი ვერ მოიძებნა!');
            const products = await response.json();

            const createProductCard = (product) => `
                <div class="product-card">
                    <a href="product-details.html?id=${product.id}" class="product-card-link">
                        <div class="product-image-container"><img src="${product.image}" alt="${product.name}"></div>
                        <div class="product-info">
                            <h3 class="product-name">${product.name}</h3>
                            <div class="product-price">${product.price}</div>
                        </div>
                    </a>
                </div>`;
            
            if (featuredProductsWrapper) {
                featuredProductsWrapper.innerHTML = products.map(p => `<div class="swiper-slide">${createProductCard(p)}</div>`).join('');
                new Swiper('.product-slider', {
                    loop: true, spaceBetween: 20,
                    pagination: { el: '.swiper-pagination', clickable: true },
                    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
                    breakpoints: { 640: { slidesPerView: 2 }, 768: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } }
                });
            }

            if (productsGrid) {
                productsGrid.innerHTML = products.map(createProductCard).join('');
            }
        } catch (error) {
            console.error('შეცდომა პროდუქტების სიის ჩატვირთვისას:', error);
        }
    }

    // --- პროდუქტის დეტალური გვერდის ჩატვირთვის ფუნქცია (product-details.html) ---
    async function loadProductDetails() {
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id');
        if (!productId) return;

        try {
            const response = await fetch('products.json');
            if (!response.ok) throw new Error('პროდუქტების ფაილი ვერ მოიძებნა!');
            const products = await response.json();
            const product = products.find(p => p.id === productId);

            if (product) {
                document.title = product.name;
                document.getElementById('product-name').textContent = product.name;
                document.getElementById('product-full-description').textContent = product.full_description;
                document.getElementById('product-price').textContent = product.price;

                const imagesWrapper = document.getElementById('product-images-wrapper');
                imagesWrapper.innerHTML = product.images.map(img => `<div class="swiper-slide"><img src="${img}" alt="${product.name}"></div>`).join('');
                
                new Swiper('.product-gallery-slider', {
                    loop: true,
                    pagination: { el: '.swiper-pagination', clickable: true },
                    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }
                });

                const videoContainer = document.getElementById('product-video-container');
                if (product.video_url) {
                    videoContainer.style.display = 'block';
                    videoContainer.innerHTML += `<iframe src="${product.video_url}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
                }
            } else {
                document.querySelector('.product-details-section .container').innerHTML = '<h1>პროდუქტი ვერ მოიძებნა</h1>';
            }
        } catch (error) {
            console.error('შეცდომა პროდუქტის დეტალების ჩატვირთვისას:', error);
        }
    }

    // --- ფორმის და სქროლის ლოგიკა ---
    const form = document.getElementById("contact-form");
    if (form) { /* ... (თქვენი ფორმის კოდი აქ) ... */ }
    document.querySelectorAll('a[href^="#"]').forEach(anchor => { /* ... (თქვენი სქროლის კოდი აქ) ... */ });
});
