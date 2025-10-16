document.addEventListener("DOMContentLoaded", function () {
  const FRAMESET_PRICE = 2800;
  const form = document.getElementById("kit-builder");
  const totalPriceEl = document.getElementById("total-price");
  const componentsPriceEl = document.getElementById("components-price");

  function updateTotal() {
    let componentsTotal = 0;

    // 1. Loop through all components to calculate the grand total
    form.querySelectorAll(".kit-builder__group").forEach((fieldset) => {
      const checkedRadio = fieldset.querySelector("input[type=radio]:checked");

      // Get the price of the *currently selected* item in this category
      const newReferencePrice = parseFloat(checkedRadio.dataset.price || 0);
      componentsTotal += newReferencePrice;

      // 2. Loop through all options in this category to update relative prices
      const options = fieldset.querySelectorAll("input[type=radio]");

      options.forEach((option) => {
        const optionPrice = parseFloat(option.dataset.price || 0);

        // Calculate the difference relative to the SELECTED item (the new reference)
        let relativeDiff = optionPrice - newReferencePrice;

        // Get the price display element (p.kit-builder__price)
        const label = option.closest("label");
        const priceDisplay = label.querySelector(".kit-builder__price");

        if (priceDisplay) {
          let displayText;

          if (relativeDiff === 0) {
            // The selected item is the reference point
            displayText = "+ $0";
          } else if (relativeDiff > 0) {
            // This option is an UPGRADE
            displayText = `+ $${relativeDiff.toFixed(0)}`;
          } else {
            // This option is a DOWNGRADE (cheaper)
            // Use Math.abs() and a minus sign
            displayText = `- $${Math.abs(relativeDiff).toFixed(0)}`;
          }

          priceDisplay.textContent = displayText;
        }
      });
    });

    // 3. Update the overall price display elements
    // Using .toFixed(0) and toLocaleString() for currency formatting
    componentsPriceEl.textContent = componentsTotal.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    });
    totalPriceEl.textContent = (
      FRAMESET_PRICE + componentsTotal
    ).toLocaleString(undefined, { maximumFractionDigits: 0 });
  }

  updateTotal();
  form.addEventListener("change", updateTotal);
});
