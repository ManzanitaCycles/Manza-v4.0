document.addEventListener("DOMContentLoaded", function () {
    const FRAMESET_PRICE = 2800;
    const form = document.getElementById("kit-builder");
    const totalPriceEl = document.getElementById("total-price");
    const componentsPriceEl = document.getElementById("components-price");

    function updateTotal() {
        let componentsTotal = 0;
        form.querySelectorAll("input[type=radio]:checked").forEach(radio => {
            componentsTotal += parseFloat(radio.dataset.price || 0);
        });

        componentsPriceEl.textContent = componentsTotal.toLocaleString();
        totalPriceEl.textContent = (FRAMESET_PRICE + componentsTotal).toLocaleString();
    }

    updateTotal();
    form.addEventListener("change", updateTotal);
});