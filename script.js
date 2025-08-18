document.addEventListener('DOMContentLoaded', () => {

    // --- მობილურის მენიუს ლოგიკა ---
    const navMenu = document.querySelector('.nav__links');
    const navToggle = document.getElementById('nav-toggle');
    const navClose = document.getElementById('nav-close');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.add('show-menu');
        });
    }

    if (navClose) {
        navClose.addEventListener('click', () => {
            navMenu.classList.remove('show-menu');
        });
    }

    // --- პროდუქტების ჩატვირთვის ლოგიკა ---
    async function loadProducts() {
        const featuredProductsWrapper = document.querySelector('#featured-products-wrapper');
        const productsGrid = document.querySelector('.products-grid');

        if (!featuredProductsWrapper && !productsGrid) {
            return; 
        }

        try {
            const response = await fetch('products.json');
            if (!response.ok) throw new Error('პროდუქტების ფაილი ვერ მოიძებნა!');
            
            const products = await response.json();

            const createProductCard = (product) => {
                return `
                    <div class="product-card">
                        <a href="#" class="product-card-link">
                            <div class="product-image-container">
                                <img src="${product.image}" alt="${product.name}">
                            </div>
                            <div class="product-info">
                                <h3 class="product-name">${product.name}</h3>
                                <div class="product-price">${product.price}</div>
                            </div>
                        </a>
                    </div>
                `;
            };
            
            if (featuredProductsWrapper) {
                featuredProductsWrapper.innerHTML = products.map(product => {
                    return `<div class="swiper-slide">${createProductCard(product)}</div>`;
                }).join('');
                
                new Swiper('.product-slider', {
                    loop: true,
                    spaceBetween: 30,
                    pagination: { el: '.swiper-pagination', clickable: true },
                    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
                    breakpoints: {
                        640: { slidesPerView: 2, spaceBetween: 20 },
                        768: { slidesPerView: 3, spaceBetween: 30 },
                        1024: { slidesPerView: 4, spaceBetween: 30 } // <-- შეიცვალა 3-დან 4-მდე
                    }
                });
            }

            if (productsGrid) {
                productsGrid.innerHTML = products.map(createProductCard).join('');
            }

        } catch (error) {
            console.error('შეცდომა პროდუქტების ჩატვირთვისას:', error);
        }
    }

    loadProducts();

    // --- ფორმის გაგზავნის ლოგიკა (თუ გაქვთ) ---
    // ... აქ შეგიძლიათ ჩასვათ ფორმის კოდი ...

    // --- Smooth Scroll ლოგიკა ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // ... აქ შეგიძლიათ ჩასვათ smooth scroll-ის კოდი ...
        });
    });

});
