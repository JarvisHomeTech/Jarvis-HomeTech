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

    // --- პროდუქტების ჩატვირთვის ფუნქცია ---
    async function loadProducts() {
        // შევამოწმოთ, რომელ გვერდზე ვართ და შესაბამისი კონტეინერი ავირჩიოთ
        const productsGrid = document.querySelector('.products-grid'); // products.html-სთვის
        const featuredProductsWrapper = document.querySelector('#featured-products-wrapper'); // index.html-სთვის

        if (!productsGrid && !featuredProductsWrapper) {
            return; // თუ არცერთი კონტეინერი არ არის, გავჩერდეთ
        }

        try {
            const response = await fetch('products.json');
            if (!response.ok) throw new Error('პროდუქტების ფაილი ვერ მოიძებნა!');
            
            const products = await response.json();

            // ფუნქცია, რომელიც ქმნის ერთი პროდუქტის HTML-ს
            const createProductCard = (product) => {
                return `
                    <div class="product-card">
                        <img src="${product.image}" alt="${product.name}">
                        <div class="product-card-content">
                            <div>
                                <div class="product-icon-wrapper">
                                    <i class="${product.icon}"></i>
                                </div>
                                <h3 class="product-name">${product.name}</h3>
                                <p class="product-description">${product.description}</p>
                                <div class="product-price">${product.price}</div>
                            </div>
                            <a href="products.html" class="btn product-btn">დეტალურად</a>
                        </div>
                    </div>
                `;
            };

            // თუ products.html გვერდზე ვართ, ჩავტვირთოთ ყველა პროდუქტი
            if (productsGrid) {
                productsGrid.innerHTML = products.map(createProductCard).join('');
            }

            // თუ index.html გვერდზე ვართ, ჩავტვირთოთ პროდუქტები სლაიდერისთვის
            if (featuredProductsWrapper) {
                featuredProductsWrapper.innerHTML = products.map(product => {
                    return `<div class="swiper-slide">${createProductCard(product)}</div>`;
                }).join('');
                
                // სლაიდერის ინიციალიზაცია მხოლოდ პროდუქტების ჩატვირთვის შემდეგ
                new Swiper('.product-slider', {
                    loop: true,
                    spaceBetween: 30,
                    pagination: {
                        el: '.swiper-pagination',
                        clickable: true,
                    },
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    },
                    breakpoints: {
                        640: { slidesPerView: 1 },
                        768: { slidesPerView: 2 },
                        1024: { slidesPerView: 3 },
                    }
                });
            }

        } catch (error) {
            console.error('შეცდომა პროდუქტების ჩატვირთვისას:', error);
            if (productsGrid) productsGrid.innerHTML = '<p>პროდუქტების ჩატვირთვისას მოხდა შეცდომა.</p>';
            if (featuredProductsWrapper) featuredProductsWrapper.innerHTML = '<p>პროდუქტების ჩატვირთვისას მოხდა შეცდომა.</p>';
        }
    }

    // გამოვიძახოთ პროდუქტების ჩატვირთვის ფუნქცია
    loadProducts();

});
