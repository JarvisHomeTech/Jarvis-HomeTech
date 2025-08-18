document.addEventListener('DOMContentLoaded', () => {
    // --- მობილურის მენიუს ლოგიკა ---
    const navMenu = document.querySelector('.nav__links');
    const navToggle = document.getElementById('nav-toggle');
    const navClose = document.getElementById('nav-close');
    if (navToggle) { navToggle.addEventListener('click', () => navMenu.classList.add('show-menu')); }
    if (navClose) { navClose.addEventListener('click', () => navMenu.classList.remove('show-menu')); }

    // --- ფუნქციების გაშვება ---
    if (document.querySelector('.product-details-section')) {
        loadProductDetails();
    } else {
        loadProductLists();
    }

    // --- პროდუქტების სიების ჩატვირთვის ფუნქცია ---
    async function loadProductLists() {
        // ... (ეს ფუნქცია უცვლელია) ...
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
                // ... (დანარჩენი კოდი უცვლელია) ...
                
                // --- სლაიდერის ინიციალიზაცია ---
                new Swiper('.product-gallery-slider', {
                    autoHeight: true, // <<-- ეს არის მთავარი ცვლილება
                    loop: false,
                    pagination: { el: '.swiper-pagination', clickable: true },
                    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }
                });

                // ... (ვიდეოს ჩვენების ლოგიკა უცვლელია) ...
            }
        } catch (error) { console.error('შეცდომა პროდუქტის დეტალების ჩატვირთვისას:', error); }
    }
    
    // ... (ფორმის და სქროლის ლოგიკა) ...
});
