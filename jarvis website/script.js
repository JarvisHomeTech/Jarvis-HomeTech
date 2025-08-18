window.addEventListener("DOMContentLoaded", function() {

    // ვიღებთ ფორმას
    var form = document.getElementById("contact-form");
    var status = document.getElementById("form-status");

    // ფუნქცია, რომელიც ამუშავებს ფორმის გაგზავნას
    async function handleSubmit(event) {
        event.preventDefault();
        var data = new FormData(event.target);
        
        fetch(event.target.action, {
            method: form.method,
            body: data,
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                status.innerHTML = "გმადლობთ, თქვენი შეტყობინება გაიგზავნა!";
                status.style.color = "green";
                form.reset();
            } else {
                response.json().then(data => {
                    if (Object.hasOwn(data, 'errors')) {
                        status.innerHTML = data["errors"].map(error => error["message"]).join(", ");
                    } else {
                        status.innerHTML = "მოხდა შეცდომა, სცადეთ თავიდან.";
                        status.style.color = "red";
                    }
                })
            }
        }).catch(error => {
            status.innerHTML = "მოხდა შეცდომა, სცადეთ თავიდან.";
            status.style.color = "red";
        });
    }

    form.addEventListener("submit", handleSubmit);
});