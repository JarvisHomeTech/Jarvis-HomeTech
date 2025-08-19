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

    // --- ფუნქციების გაშვება ---
    if (document.querySelector('.product-details-section')) {
        loadProductDetails();
    } else {
        loadProductLists();
    }

    // --- ფასის ფორმატირების ფუნქცია ---
    const formatPrice = (product) => {
        if (product.old_price && product.old_price.trim() !== "") {
            return `<span class="old-price">${product.old_price}</span> <span class="new-price">${product.price}</span>`;
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
            if (!response.ok) throw new Error('პროდუქტების ფაილი ვერ მოიძებნა!');
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
                new Swiper('.product-slider', {
                    loop: true,
                    spaceBetween: 20,
                    pagination: { el: '.swiper-pagination', clickable: true },
                    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
                    breakpoints: {
                        640: { slidesPerView: 2 },
                        768: { slidesPerView: 3 },
                        1024: { slidesPerView: 4 }
                    }
                });
            }
            if (productsGrid) {
                productsGrid.innerHTML = products.map(createProductCard).join('');
            }
        } catch (error) {
            console.error('შეცდომა პროდუქტების სიის ჩატვირთვისას:', error);
            const container = productsGrid || featuredProductsWrapper;
            if (container) container.innerHTML = `<p>პროდუქტების ჩატვირთვისას მოხდა შეცდომა. გთხოვთ, შეამოწმოთ products.json ფაილის სინტაქსი.</p>`;
        }
    }

    // --- პროდუქტის დეტალური გვერდის ჩატვირთვის ფუნქცია ---
    async function loadProductDetails() {
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id');
        if (!productId) {
            document.querySelector('.product-details-section .container').innerHTML = '<h1>პროდუქტი არ არის მითითებული</h1>';
            return;
        }
        try {
            const response = await fetch('products.json');
            if (!response.ok) throw new Error('პროდუქტების ფაილი ვერ მოიძებნა!');
            const products = await response.json();
            const product = products.find(p => p.id === productId);
            if (product) {
                document.title = product.name;
                document.getElementById('product-name').textContent = product.name;
                document.getElementById('product-full-description').textContent = product.full_description;
                document.getElementById('product-price').innerHTML = formatPrice(product);
                document.getElementById('order-button').href = `https://m.me/61578859507900`;

                const galleryWrapper = document.getElementById('product-gallery-wrapper');
                let slidesHTML = '';
                if (product.video && product.video.trim() !== "") {
                    slidesHTML += `<div class="swiper-slide video-slide"><video controls muted loop autoplay playsinline><source src="${product.video}" type="video/mp4"></video></div>`;
                }
                product.images.forEach(img => {
                    slidesHTML += `<div class="swiper-slide"><img src="${img}" alt="${product.name}"></div>`;
                });
                galleryWrapper.innerHTML = slidesHTML;

                // --- START: შეცვლილი ნაწილი ---
                new Swiper('.product-gallery-slider', {
                    autoHeight: true,
                    loop: false,
                    pagination: { el: '.swiper-pagination', clickable: true },
                    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
                    on: {
                        // ეს ფუნქცია გამოიძახება ყოველ ჯერზე, როდესაც სლაიდი შეიცვლება
                        slideChange: function () {
                            // სლაიდერის შიგნით ვპოულობთ ყველა <video> ელემენტს
                            const videos = document.querySelectorAll('.product-gallery-slider video');
                            // ვაჩერებთ თითოეული ვიდეოს დაკვრას
                            videos.forEach(video => {
                                video.pause();
                            });
                        }
                    }
                });
                // --- END: შეცვლილი ნაწილი ---

            } else {
                document.querySelector('.product-details-section .container').innerHTML = '<h1>პროდუქტი ვერ მოიძებნა</h1>';
            }
        } catch (error) {
            console.error('შეცდომა პროდუქტის დეტალების ჩატვირთვისას:', error);
        }
    }

    // --- ფორმის და სქროლის ლოგიკა ---
    const form = document.getElementById("contact-form");
    if (form) {
        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            const data = new FormData(event.target);
            try {
                const response = await fetch(event.target.action, {
                    method: form.method,
                    body: data,
                    headers: { 'Accept': 'application/json' }
                });
                if (response.ok) {
                    document.getElementById("form-status").innerHTML = "გმადლობთ, თქვენი შეტყობინება გაიგზავნა!";
                    form.reset();
                } else {
                    document.getElementById("form-status").innerHTML = "მოხდა შეცდომა.";
                }
            } catch (error) {
                document.getElementById("form-status").innerHTML = "მოხდა შეცდომა.";
            }
        });
    }
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

