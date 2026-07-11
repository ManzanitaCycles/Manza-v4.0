/**
 * Kit builder price calculator.
 *
 * Reads the base component price and frameset price from data attributes
 * on the form (set server-side from the same source data as the category
 * markup), then sums whichever radio button is currently checked in each
 * category. Category names/counts are discovered from the markup itself,
 * so this works unchanged if categories are added, removed, or renamed
 * upstream in the Eleventy data file.
 */
(function () {
	const form = document.querySelector(".kit-builder");
	if (!form) return;

	const basePrice = parseInt(form.dataset.basePrice, 10) || 0;
	const framesetPrice = parseInt(form.dataset.framesetPrice, 10) || 0;

	const framesetOutput = form.elements.frameset;
	const totalOutput = form.elements.total;
	const bikeTotalOutput = form.elements.bike_total;

	const formatCurrency = (amount) => amount.toLocaleString();

	function getCategoryNames() {
		const names = new Set();
		form.querySelectorAll('input[type="radio"]').forEach((input) => {
			names.add(input.name);
		});
		return [...names];
	}

	function getUpgradeTotal() {
		return getCategoryNames().reduce((sum, name) => {
			const checked = form.querySelector(`input[name="${name}"]:checked`);
			return sum + (parseInt(checked?.value, 10) || 0);
		}, 0);
	}

	function updateTotals() {
		const componentsTotal = basePrice + getUpgradeTotal();
		const bikeTotal = framesetPrice + componentsTotal;

		if (framesetOutput) framesetOutput.value = formatCurrency(framesetPrice);
		totalOutput.value = formatCurrency(componentsTotal);
		bikeTotalOutput.value = formatCurrency(bikeTotal);
	}

	form.addEventListener("input", updateTotals);

	// Run once on load in case the browser restores non-default
	// selections (e.g. after a back-navigation or page refresh).
	updateTotals();
})();
