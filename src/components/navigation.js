import { CONFIG } from './config.js';
import { debounce } from './utils.js';

export const initializeNavigation = () => {
  const hamburger = document.querySelector(CONFIG.UI.hamburger);
  const navMenu = document.querySelector(CONFIG.UI.navMenu);

  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu?.classList.toggle('active');
  });

  document.addEventListener('click', (e) => {
    if (!hamburger?.contains(e.target) && !navMenu?.contains(e.target)) {
      hamburger?.classList.remove('active');
      navMenu?.classList.remove('active');
    }
  });

  setupBackToTopButton(); // Initialize the back to top button here
};

function setupBackToTopButton() {
  const backToTopButton = document.querySelector(CONFIG.UI.backToTop);

  if (backToTopButton) {
    const scrollHandler = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
      backToTopButton.classList.toggle('active', scrollTop > 300); // Use class for visibility
    };

    // Debounced scroll listener
    window.addEventListener('scroll', debounce(scrollHandler, 100));

    // Click listener for smooth scroll
    backToTopButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Set initial visibility based on current scroll position
    scrollHandler(); // Call once to set initial state
  } else {
    console.warn(`Back to Top button with selector '${CONFIG.UI.backToTop}' not found in the DOM.`);
  }
}