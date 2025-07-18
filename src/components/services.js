import { CONFIG } from './config.js';

export const initializeServices = () => {
  document.querySelectorAll('.service-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const packagesSection = document.querySelector('#packages');
      packagesSection?.scrollIntoView({ behavior: 'smooth' });
      
      const targetPackage = document.querySelector(`[data-package-type="${button.dataset.service}"]`);
      if (targetPackage) {
        targetPackage.classList.add('highlighted');
        setTimeout(() => targetPackage.classList.remove('highlighted'), 2000);
      }
    });
  });
};