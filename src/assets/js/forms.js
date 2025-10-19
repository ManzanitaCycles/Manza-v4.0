document.addEventListener("DOMContentLoaded", () => {
	// Iterate over both contact and signup forms
	document.querySelectorAll("#contact-form, #signup-form").forEach((form) => {
		const submitBtn = form.querySelector("button[type='submit']");
		const honeypot = form.querySelector("input[name='honeypot']");
		const formStart = form.querySelector("input[name='formStart']");

		const modalId = form.id === "contact-form" ? "contact-modal" : "signup-modal";
		const modal = document.getElementById(modalId);
		const closeBtn = modal ? modal.querySelector(".close-btn") : null;

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

		// Attach event listeners to input and textarea fields
		form.querySelectorAll("input, textarea").forEach((input) => {
			let errorMsg = null;

			// Conditional logic for error message lookup
			if (form.id === "contact-form") {
				// Logic for contact form: Error is inside the parent div
				const parentDiv = input.closest("div");
				errorMsg = parentDiv ? parentDiv.querySelector(".error-message") : null;
			} else if (form.id === "signup-form") {
				// Logic for signup form: Error is a direct child of the form (one general message)
				errorMsg = form.querySelector(".error-message");
			}

			// Validation logic
			input.addEventListener("blur", () => {
				if (!input.checkValidity()) {
					input.classList.add("error");
					// ⚠️ CHANGE: Show error by removing the 'hidden' attribute
					if (errorMsg) errorMsg.removeAttribute("hidden");
				}
			});
			input.addEventListener("input", () => {
				input.classList.remove("error");
				// ⚠️ CHANGE: Hide error by setting the 'hidden' attribute
				if (errorMsg) errorMsg.setAttribute("hidden", "");
				toggleSubmitState();
			});
		});

		// Handle form submission
		form.addEventListener("submit", (e) => {
			e.preventDefault();

			const formInputs = form.querySelectorAll("input, textarea");
			let isFormValid = true;

			// Manual validation and error display
			formInputs.forEach((input) => {
				let errorMsg = null;

				// Conditional logic for error message lookup (repeated for submit)
				if (form.id === "contact-form") {
					const parentDiv = input.closest("div");
					errorMsg = parentDiv ? parentDiv.querySelector(".error-message") : null;
				} else if (form.id === "signup-form") {
					errorMsg = form.querySelector(".error-message");
				}

				if (!input.checkValidity()) {
					input.classList.add("error");
					// ⚠️ CHANGE: Show error
					if (errorMsg) errorMsg.removeAttribute("hidden");
					isFormValid = false;
				} else {
					// ⚠️ CHANGE: Hide error
					if (errorMsg) errorMsg.setAttribute("hidden", "");
				}
			});

			if (!isFormValid) {
				return;
			}

			// ... (Spam and Fetch logic remains unchanged)
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
					Accept: "application/json",
				},
			})
				.then((response) => {
					if (response.ok) {
						if (modal) {
							modal.showModal();
						}
						form.reset();
						toggleSubmitState();
						form.querySelectorAll("input, textarea").forEach((input) => input.classList.remove("error"));
						// ⚠️ CHANGE: Hide all error messages on successful submission
						form.querySelectorAll(".error-message").forEach((span) => span.setAttribute("hidden", ""));
					} else {
						console.error("Form submission failed.");
					}
				})
				.catch((error) => {
					console.error("Network error:", error);
				});
		});

		if (modal) {
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
		}
	});
});
