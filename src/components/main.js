// src/components/main.js
import { CONFIG } from './config.js';
import { debounce } from './utils.js';

let lastScrollTop = 0;

const initializeUI = () => {
  const header = document.querySelector(CONFIG.UI.header); // Keep header logic here
  window.addEventListener('scroll', debounce(() => {
    const scrollTop = window.pageYOffset;
    if (header) { // Header hide/show logic
 header.style.transform = scrollTop > lastScrollTop && scrollTop > 200 ? 'translateY(-100%)' : 'translateY(0)';
    }
    lastScrollTop = scrollTop;
  }, 100));
};

export { initializeUI };