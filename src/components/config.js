// src/components/config.js - Fixed version
export const CONFIG = {
  UI: {
    hamburger: '.hamburger',
    navMenu: 'nav ul',
    moreInfoBtns: '.btn-info',
    authToggle: '#auth-toggle',
    authForm: '#auth-form',
    authFormContent: '#auth-form-content',
    backToTop: '#backToTop',
    header: 'header',
    newsletterForm: '.newsletter-form',
    retreatForm: '#inquiryForm' // Assuming 'inquiryForm' is the ID of the retreat/inquiry form
  },
  CUSTOM_CART: {
    storageKey: 'usviRetreatCart'
  },
  FIREBASE: {
    apiKey: "AIzaSyA0V65oTOEKeJRZ79H9lG5OjORSXyW4YlY",
    authDomain: "usviretreats.firebaseapp.com",
    projectId: "usviretreats",
    storageBucket: "usviretreats.firebasestorage.app",
    messagingSenderId: "375476265003",
    appId: "1:375476265003:web:a8106b1e7b7ac3b391ca6e",
    measurementId: "G-DJ5ZGP92C3"
  },
  BREVO: {
    // WARNING: Storing sensitive credentials like API keys and SMTP passwords
    // directly in client-side JavaScript is a MAJOR security risk.
    // These have been moved to Firebase Functions environment configuration.
    // Client-side code should call a Firebase Function to send emails.
    SMTP_SERVER: "smtp-relay.brevo.com",
    SMTP_PORT: 587,
    // SMTP_LOGIN: "MOVED_TO_SERVER_SIDE_CONFIG",
    // SMTP_PASSWORD: "MOVED_TO_SERVER_SIDE_CONFIG", // Highly sensitive
    // API_KEY: "MOVED_TO_SERVER_SIDE_CONFIG" // Highly sensitive
  }
};