document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("frameFitCalc");
    const clearButton = form.querySelector(".button--clear");
    const submitButton = form.querySelector("button[type='submit']");
    const resultModal = document.getElementById("frameFitCalc__modal");
    const closeModalButton = resultModal.querySelector(".close-btn");

    submitButton.disabled = true;

    // Frame calculator data
    const frameSizeData = {
        2: { reach: 364, stack: 540, headTubeAngle: 69 },
        3: { reach: 376, stack: 553, headTubeAngle: 70 },
        4: { reach: 388, stack: 572, headTubeAngle: 70 },
        5: { reach: 400, stack: 593, headTubeAngle: 70.5 },
        6: { reach: 412, stack: 612, headTubeAngle: 70.5 },
        7: { reach: 424, stack: 631, headTubeAngle: 70.5 }
    };

    const stemAngles = [-17, -6, 0, 6, 17];
    const stemLengths = [50, 60, 70, 80, 90];
    const spacerStackOptions = Array.from({ length: 20 }, (_, i) => i); // 0–19 mm

    const stackInput = document.getElementById("user_handlebar_stack");
    const reachInput = document.getElementById("user_handlebar_reach");
    const stackError = stackInput.nextElementSibling;
    const reachError = reachInput.nextElementSibling;

    // Update submit button state
    function toggleSubmitState() {
        if (validateField(stackInput) && validateField(reachInput)) {
            submitButton.disabled = false;
        } else {
            submitButton.disabled = true;
        }
    }

    // Blur and input events
    [stackInput, reachInput].forEach(input => {
        const errorSpan = input.nextElementSibling;

        input.addEventListener("blur", () => {
            if (!validateField(input)) {
                input.classList.add("error");
                errorSpan.style.display = "block";
            } else {
                input.classList.remove("error");
                errorSpan.style.display = "none";
            }
            toggleSubmitState();
        });

        input.addEventListener("input", () => {
            input.classList.remove("error");
            errorSpan.style.display = "none";
            toggleSubmitState();
        });
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        if (validateField(stackInput) && validateField(reachInput)) {
            calculateAndDisplayResults();
        } else {
            if (!validateField(stackInput)) {
                stackInput.classList.add("error");
                stackError.style.display = "block";
            }
            if (!validateField(reachInput)) {
                reachInput.classList.add("error");
                reachError.style.display = "block";
            }
        }
    });

    clearButton.addEventListener("click", function () {
        form.reset();
        [stackInput, reachInput].forEach(input => input.classList.remove("error"));
        [stackError, reachError].forEach(span => span.style.display = "none");
        toggleSubmitState();
    });

    // Close modal with the close button
    closeModalButton.addEventListener("click", () => {
        resultModal.close();
    });

    // Close modal when clicking outside of it
    resultModal.addEventListener("click", (e) => {
        const dialogDimensions = resultModal.getBoundingClientRect();
        if (
            e.clientX < dialogDimensions.left ||
            e.clientX > dialogDimensions.right ||
            e.clientY < dialogDimensions.top ||
            e.clientY > dialogDimensions.bottom
        ) {
            resultModal.close();
        }
    });

    function validateField(input) {
        const val = parseFloat(input.value.trim());
        if (input === stackInput) return !isNaN(val) && val >= 540 && val <= 775;
        if (input === reachInput) return !isNaN(val) && val >= 375 && val <= 520;
        return true;
    }

    function calculateAndDisplayResults() {
        const userStack = parseFloat(stackInput.value.trim());
        const userReach = parseFloat(reachInput.value.trim());

        let closestMatch = null;
        let closestDiff = Infinity;
        let closestNegStemMatch = null;
        let closestNegStemDiff = Infinity;

        for (let frameSize = 2; frameSize <= 7; frameSize++) {
            const frameData = frameSizeData[frameSize];

            for (let stemAngle of stemAngles) {
                for (let stemLength of stemLengths) {
                    for (let spacerStack of spacerStackOptions) {
                        const { handlebarStack, handlebarReach } =
                            calculateHandlebarGeometry(frameData, stemAngle, stemLength, spacerStack);

                        const totalDiff =
                            Math.abs(handlebarStack - userStack) +
                            Math.abs(handlebarReach - userReach);

                        if (totalDiff < closestDiff) {
                            closestDiff = totalDiff;
                            closestMatch = { frameSize, stemAngle, stemLength, spacerStack, handlebarStack, handlebarReach };
                        }

                        if (stemAngle < 0 && totalDiff < closestNegStemDiff) {
                            closestNegStemDiff = totalDiff;
                            closestNegStemMatch = { frameSize, stemAngle, stemLength, spacerStack, handlebarStack, handlebarReach };
                        }
                    }
                }
            }
        }

        // Display results in the modal
        document.getElementById("best-frame-size").textContent = `M${closestMatch.frameSize}`;
        document.getElementById("best-stem-angle").textContent = `${closestMatch.stemAngle}°`;
        document.getElementById("best-stem-length").textContent = `${closestMatch.stemLength}mm`;
        document.getElementById("best-spacer-stack").textContent = `${closestMatch.spacerStack}mm`;

        if (closestNegStemMatch) {
            document.getElementById("neg-stem-frame-size").textContent = `M${closestNegStemMatch.frameSize}`;
            document.getElementById("neg-stem-angle").textContent = `${closestNegStemMatch.stemAngle}°`;
            document.getElementById("neg-stem-length").textContent = `${closestNegStemMatch.stemLength}mm`;
            document.getElementById("neg-stem-spacer-stack").textContent = `${closestNegStemMatch.spacerStack}mm`;
        } else {
            ["neg-stem-frame-size", "neg-stem-angle", "neg-stem-length", "neg-stem-spacer-stack"].forEach(id => {
                document.getElementById(id).textContent = 'N/A';
            });
        }

        resultModal.showModal();
    }

    function calculateHandlebarGeometry(frameData, stemAngle, stemLength, spacerStack) {
        const headTubeAngle = frameData.headTubeAngle;
        const headsetStack = 16;
        const stemStackHeight = 40;

        const handlebarStack = Math.round(
            Math.sin(toRadians(90 + headTubeAngle - stemAngle)) * stemLength +
            Math.cos(toRadians(90 - headTubeAngle)) *
            (headsetStack + spacerStack + (stemStackHeight / 2)) +
            frameData.stack
        );

        const handlebarReach = Math.round(
            frameData.reach -
            Math.sin(toRadians(90 - headTubeAngle)) *
            (headsetStack + spacerStack + (stemStackHeight / 2)) +
            Math.cos(toRadians(90 - headTubeAngle + stemAngle)) * stemLength
        );

        return { handlebarStack, handlebarReach };
    }

    function toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
});