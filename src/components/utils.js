export const debounce = (fn, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  };
  
  export const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  export const validatePhone = phone => /^\d{10}$/.test(phone);
  
  export const scrollToElement = (elementId) => {
    document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth' });
  };