document.addEventListener('DOMContentLoaded', () => {
    const dropdownButton = document.querySelector('.nav__button');
    const dropdownMenu = document.querySelector('.nav__dropdown');

    dropdownButton.addEventListener('click', () => {
        dropdownMenu.toggleAttribute('hidden');
        dropdownButton.classList.toggle('nav__button--expanded');
    });

    // Close the dropdown when clicking outside
    document.addEventListener('click', (event) => {
        const isClickInside = dropdownButton.contains(event.target) || dropdownMenu.contains(event.target);
        if (!isClickInside && !dropdownMenu.hasAttribute('hidden')) {
            dropdownMenu.setAttribute('hidden', '');
            dropdownButton.classList.remove('nav__button--expanded');
        }
    });

    // Close dropdown with Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !dropdownMenu.hasAttribute('hidden')) {
            dropdownMenu.setAttribute('hidden', '');
            dropdownButton.classList.remove('nav__button--expanded');
        }
    });
});