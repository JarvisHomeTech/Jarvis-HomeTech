window.addEventListener("DOMContentLoaded", function() {

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
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    status.innerHTML = "გმადლობთ, თქვენი შეტყობინება გაიგზავნა!";
                    status.style.color = "green";
                    form.reset();
                } else {
                    const data = await response.json();
                    if (Object.hasOwn(data, 'errors')) {
                        status.innerHTML = data["errors"].map(error => error.message).join(", ");
                    } else {
                        status.innerHTML = "მოხდა შეცდომა, სცადეთ თავიდან.";
                    }
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
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

});
