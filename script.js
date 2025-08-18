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

    // --- პროდუქტების ჩატვირთვის ლოგიკა (სლაიდერისთვის და ცხრილისთვის) ---
    async function loadProducts() {
        const featuredProductsWrapper = document.querySelector('#featured-products-wrapper'); // index.html-სთვის
        const tableContainer = document.querySelector('.table-container'); // products.html-სთვის

        if (!featuredProductsWrapper && !tableContainer) {
            return; // თუ არცერთი კონტეინერი არ არის, ფუნქცია გაჩერდება
        }

        try {
            const response = await fetch('products.json');
            if (!response.ok) throw new Error('პროდუქტების ფაილი ვერ მოიძებნა!');
            
            const products = await response.json();

            // --- ფუნქცია პროდუქტის ბარათის შესაქმნელად (index.html-სთვის) ---
            const createProductCard = (product) => {
                return `
                    <div class="product-card">
                        <img src="${product.image}" alt="${product.name}">
                        <div class="product-card-content">
                            <div>
                                <div class="product-icon-wrapper"><i class="${product.icon}"></i></div>
                                <h3 class="product-name">${product.name}</h3>
                                <p class="product-description">${product.description}</p>
                                <div class="product-price">${product.price}</div>
                            </div>
                            <a href="products.html" class="btn product-btn">დეტალურად</a>
                        </div>
                    </div>
                `;
            };

            // --- ფუნქცია პროდუქტის ცხრილის რიგის შესაქმნელად (products.html-სთვის) ---
            const createProductRow = (product) => {
                return `
                    <tr>
                        <td><img src="${product.image}" alt="${product.name}" class="table-product-image"></td>
                        <td>${product.name}</td>
                        <td>${product.description}</td>
                        <td>${product.price}</td>
                        <td><a href="#" class="btn btn-table">დეტალურად</a></td>
                    </tr>
                `;
            };

            // თუ მთავარ გვერდზე ვართ, ჩავტვირთოთ სლაიდერი
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
                        640: { slidesPerView: 1 },
                        768: { slidesPerView: 2 },
                        1024: { slidesPerView: 3 },
                    }
                });
            }

            // თუ პროდუქტების გვერდზე ვართ, ავაწყოთ ცხრილი
            if (tableContainer) {
                const tableRows = products.map(createProductRow).join('');
                tableContainer.innerHTML = `
                    <table class="product-table">
                        <thead>
                            <tr>
                                <th>სურათი</th>
                                <th>დასახელება</th>
                                <th>აღწერა</th>
                                <th>ფასი</th>
                                <th>ბმული</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                `;
            }

        } catch (error) {
            console.error('შეცდომა პროდუქტების ჩატვირთვისას:', error);
            if (tableContainer) tableContainer.innerHTML = '<p>პროდუქტების ჩატვირთვისას მოხდა შეცდომა.</p>';
            if (featuredProductsWrapper) featuredProductsWrapper.innerHTML = '<p>პროდუქტების ჩატვირთვისას მოხდა შეცდომა.</p>';
        }
    }

    // პროდუქტების ჩატვირთვა
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

    // --- მენიუს ლინკებზე რბილი გადასვლის (Smooth Scroll) ლოგიკა ---
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
