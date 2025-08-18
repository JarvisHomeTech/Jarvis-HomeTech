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
                    spaceBetween: 20, // დაპატარავებული დაშორება
                    pagination: { el: '.swiper-pagination', clickable: true },
                    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
                    breakpoints: {
                        640: { slidesPerView: 2 },
                        768: { slidesPerView: 3 },
                        1024: { slidesPerView: 4 } // დაპატარავებული სლაიდერი
                    }
                });
            }

            if (productsGrid) {
                productsGrid.innerHTML = products.map(createProductCard).join('');
            }

        } catch (error) {
            console.error('შეცდომა პროდუქტების ჩატვირთვისას:', error);
            const container = productsGrid || featuredProductsWrapper;
            if (container) container.innerHTML = '<p>პროდუქტების ჩატვირთვისას მოხდა შეცდომა.</p>';
        }
    }

    loadProducts();

    // --- ფორმის გაგზავნის ლოგიკა ---
    const form = document.getElementById("contact-form");
    const status = document.getElementById("form-status");

    if (form) {
        form.addEventListener("submit", async function(event) {
            event.preventDefault();
            const data = new FormData(event.target);
            try {
                const response = await fetch(event.target.action, {
                    method: form.method,
                    body: data,
                    headers: { 'Accept': 'application/json' }
                });
                if (response.ok) {
                    status.innerHTML = "გმადლობთ, თქვენი შეტყობინება გაიგზავნა!";
                    status.style.color = "green";
                    form.reset();
                } else {
                    status.innerHTML = "მოხდა შეცდომა, სცადეთ თავიდან.";
                    status.style.color = "red";
                }
            } catch (error) {
                status.innerHTML = "მოხდა შეცდომა, სცადეთ თავიდან.";
                status.style.color = "red";
            }
        });
    }

    // --- Smooth Scroll ლოგიკა ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});
