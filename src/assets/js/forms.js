document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("#contact-form, #signup-form").forEach(form => {
        const submitBtn = form.querySelector("button[type='submit']");
        const honeypot = form.querySelector("input[name='honeypot']");
        const formStart = form.querySelector("input[name='formStart']");
        const modalId = form.id === "contact-form" ? "contact-modal" : "signup-modal";
        const modal = document.getElementById(modalId);
        const closeBtn = modal.querySelector(".close-btn");

        // Determine the correct Basin endpoint based on the form's ID
        const basinEndpoint = form.id === "contact-form" ? "https://usebasin.com/f/319261c18814" : "https://usebasin.com/f/89b25adb96c4";

        const toggleSubmitState = () => {
            const isValid = form.checkValidity();
            submitBtn.disabled = !isValid;
            submitBtn.classList.toggle("ready", isValid);
        };

        if (formStart) {
            formStart.value = Date.now();
        }
        toggleSubmitState();

        form.querySelectorAll("input, textarea").forEach((input) => {
            const parentDiv = input.closest('div');
            const errorMsg = parentDiv ? parentDiv.querySelector('.error-message') : null;

            input.addEventListener("blur", () => {
                if (!input.checkValidity()) {
                    input.classList.add("error");
                    if (errorMsg) errorMsg.style.display = "block";
                }
            });
            input.addEventListener("input", () => {
                input.classList.remove("error");
                if (errorMsg) errorMsg.style.display = "none";
                toggleSubmitState();
            });
        });

        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const formInputs = form.querySelectorAll("input, textarea");
            let isFormValid = true;
            formInputs.forEach(input => {
                const parentDiv = input.closest('div');
                const errorMsg = parentDiv ? parentDiv.querySelector('.error-message') : null;

                if (!input.checkValidity()) {
                    input.classList.add("error");
                    if (errorMsg) errorMsg.style.display = "block";
                    isFormValid = false;
                }
            });

            if (!isFormValid) {
                return;
            }

            if (honeypot && honeypot.value) {
                console.warn("Spam detected (honeypot filled).");
                return;
            }

            if (formStart && Date.now() - parseInt(formStart.value, 10) < 3000) {
                console.warn("Spam detected (submitted too quickly).");
                return;
            }

            const formData = new FormData(form);

            fetch(basinEndpoint, {
                method: "POST",
                body: formData,
                headers: {
                    "Accept": "application/json"
                }
            })
                .then(response => {
                    if (response.ok) {
                        modal.showModal();
                        form.reset();
                        toggleSubmitState();
                        form.querySelectorAll("input, textarea").forEach(input => input.classList.remove("error"));
                        form.querySelectorAll(".error-message").forEach(span => span.style.display = "none");
                    } else {
                        console.error("Form submission failed.");
                    }
                })
                .catch(error => {
                    console.error("Network error:", error);
                });
        });

        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                modal.close();
            });
        }
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.close();
            }
        });
    });
});