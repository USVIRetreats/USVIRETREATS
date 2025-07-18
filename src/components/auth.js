// src/components/auth.js - Fixed version
import { CONFIG } from "./config.js";

// Global firebase app and auth references
let firebaseApp;
let firebaseAuth;


// Module-level helper function to handle sending the sign-in link
async function sendSignInLinkToEmailHandler(formElement, emailInputElement, submitButtonElement) {
  if (!firebaseAuth) {
    console.error("Firebase Auth not initialized. Cannot send email link.");
    alert("Authentication service is not ready. Please try again later.");
    if (submitButtonElement) submitButtonElement.disabled = false; // Re-enable button
    return;
  }

  const email = emailInputElement.value.trim();

  if (!email) {
    alert("Please enter your email address.");
    emailInputElement.focus();
    return;
  }

  if (submitButtonElement) submitButtonElement.disabled = true;

  // Dynamically construct the URL for actionCodeSettings to ensure it works
  // correctly with GitHub Pages (or any hosting where the site might be in a subdirectory).
  const currentPath = window.location.pathname; // e.g., /Travel-site/index.html or /index.html
  // Get the base directory path. e.g., /Travel-site/ or /
  const basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
  const loginCompleteUrl = window.location.origin + basePath + 'login-complete.html';

  const actionCodeSettings = {
    url: loginCompleteUrl,
    handleCodeInApp: true,
  };

  try {
    console.log(`Attempting to send sign-in link to ${email} with redirect to ${actionCodeSettings.url}`);
    await firebaseAuth.sendSignInLinkToEmail(email, actionCodeSettings);
    window.localStorage.setItem("emailForSignIn", email);

    alert("A login link has been sent to your email. Please check your inbox (and spam folder) to complete sign-in.");

    emailInputElement.value = ""; // Clear the input
    
    // Hide the header form's container if it was the one submitted
    if (formElement.id === "auth-form-content") {
      const headerAuthFormContainer = document.getElementById("auth-form");
      if (headerAuthFormContainer) headerAuthFormContainer.classList.remove("active");
    }
    // Hide the modal if it was the one submitted
    if (formElement.id === "modal-auth-form-content") {
      const authModal = document.getElementById('auth-modal'); // Assuming 'auth-modal' is the ID of your modal container
      if (authModal) {
        // Prefer style.display = 'none' if that's how it's primarily controlled (see modal's own close button)
        authModal.style.display = 'none'; 
      }
    }
  } catch (error) {
    console.error("Error sending sign-in link:", error);
    let errorMessage = "Failed to send login link.";
    if (error.code === 'auth/invalid-email') errorMessage = "The email address is not valid. Please enter a valid email.";
    // Note: auth/missing-action-code is less common for sending the link, more for completing sign-in.
    alert(`${errorMessage} Please check the console for more details. Details: ${error.message}`);
  } finally {
    if (submitButtonElement) submitButtonElement.disabled = false;
  }
}

// Helper function to generate the user greeting string
function getUserGreeting(user) {
  let greetingName = "User"; // Default fallback
  if (user) {
    if (user.email) {
      const atIndex = user.email.indexOf('@');
      if (atIndex > 0) { // Ensure '@' exists and is not the first character
        greetingName = user.email.substring(0, atIndex);
      } else if (user.displayName) { // Fallback to displayName if email is malformed but displayName exists
        greetingName = user.displayName;
      } else { // Fallback to full email if email is malformed and no displayName
        greetingName = user.email;
      }
    } else if (user.displayName) { // If no email, use displayName
      greetingName = user.displayName;
    }
  }
  return `Hi, ${greetingName}`;
}

// Handler for Google Sign-In
async function signInWithGoogleHandler() {
  if (!firebaseAuth) {
    console.error("Firebase Auth not initialized for Google Sign-In.");
    alert("Authentication service is not ready. Please try again later.");
    return;
  }
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    console.log("Attempting Google Sign-In...");
    const result = await firebaseAuth.signInWithPopup(provider);
    // This will trigger onAuthStateChanged, which will update the UI.
    console.log("Google Sign-In successful:", result.user.email);
    // Hide any open auth forms/modals
    document.getElementById("auth-form")?.classList.remove("active");
    const authModal = document.getElementById("auth-modal");
    if (authModal) {
        authModal.style.display = 'none'; // Consistent with other modal hiding
    }
  } catch (error) {
    console.error("Error during Google Sign-In:", error);
    alert(`Google Sign-In failed: ${error.message}`);
  }
}
export const initializeAuth = (firebaseAlreadyInitialized = false) => {
  console.log("Starting authentication initialization...");

  // Check if Firebase is already initialized
  if (typeof firebase === "undefined") {
    console.error(
      "Firebase SDK not loaded. Make sure Firebase scripts are included in your HTML."
    );
    return;
  }

  try {
    // Initialize Firebase app if not already done
    if (!firebase.apps.length) {
      console.log("Initializing new Firebase app");
      // Use the config directly
      firebaseApp = firebase.initializeApp(CONFIG.FIREBASE);
    } else {
      console.log("Using existing Firebase app");
      firebaseApp = firebase.app();
    }

    // Initialize auth
    firebaseAuth = firebase.auth();
    console.log("Firebase Auth initialized successfully");

    // Set up the authentication UI and state listener
    setupAuthUI();

    // Attach event listeners once on initialization
    attachAuthListeners();

    // NOTE: The logic for handling the email sign-in link is now exclusively in login-handler.js,
    // which runs on the login-complete.html page.
  } catch (error) {
    console.error("Error during auth initialization:", error);
  }
};

function setupAuthUI() {
  // Get references to ALL potential auth elements upfront
  const authStatusElement = document.getElementById("auth-status");
  const authForm = document.getElementById("auth-form");
  const userEmailSpan = authStatusElement?.querySelector(".user-email"); // Assume you add this span
  const loginButton = document.getElementById("auth-toggle"); // The initial "Login" button in nav
  const userMenu = document.getElementById("user-menu"); // Container for user info and logout
  const userDisplay = document.getElementById('user-display'); // Displays user email
  const logoutButton = document.getElementById("logout-btn"); // The logout button inside user-menu
  const authFormContent = document.getElementById("auth-form-content"); // The form itself
  const modalAuthFormContent = document.getElementById("modal-auth-form-content"); // The modal form
  const googleLoginButtonHeader = document.getElementById("google-login-btn-header");
  const googleLoginButtonModal = document.getElementById("google-login-btn-modal");

  // Set up auth state listener
  firebaseAuth.onAuthStateChanged((user) => {
    if (user) {
      // User is logged in
      console.log("Auth State Changed: User is signed in:", user.email);
      if (loginButton) loginButton.style.display = "none"; // Hide the 'Login' button
      if (authForm) authForm.classList.remove("active"); // Hide the login form dropdown
      const authModal = document.getElementById('auth-modal');
      if (authModal) {
        authModal.style.display = 'none'; // Hide auth modal consistently
      }

      if (userMenu) userMenu.style.display = "flex"; // Show user menu
      if (userDisplay) {
        userDisplay.textContent = getUserGreeting(user);
      }
      if (logoutButton) {
        logoutButton.style.display = "inline-block"; // Ensure it's in layout for CSS animation
      }
    } else {
      // User is logged out
      console.log("Auth State Changed: No user is signed in");
      if (loginButton) loginButton.style.display = "block"; // Show the 'Login' button
      if (authForm) authForm.classList.remove("active"); // Ensure form dropdown is hidden
      
      if (userMenu) userMenu.style.display = "none"; // Hide user menu
      if (userDisplay) userDisplay.textContent = ''; // Clear user display
      if (logoutButton) logoutButton.style.display = "none";
    }
  });
   // Listener for the modal form submission
  if (modalAuthFormContent) {
    modalAuthFormContent.addEventListener("submit", async (e) => {
      e.preventDefault();
      const emailInput = modalAuthFormContent.querySelector('input[type="email"]');
      const submitButton = modalAuthFormContent.querySelector('button[type="submit"]');
      if (emailInput && submitButton) { // Ensure both elements exist
        await sendSignInLinkToEmailHandler(modalAuthFormContent, emailInput, submitButton);
      } else {
        console.error("Email input or submit button not found in #modal-auth-form-content.");
      }
    });
  }

  // Listener for Google Login button in header
  if (googleLoginButtonHeader) {
    googleLoginButtonHeader.addEventListener("click", signInWithGoogleHandler);
  }
  // Listener for Google Login button in modal
  if (googleLoginButtonModal) {
    googleLoginButtonModal.addEventListener("click", signInWithGoogleHandler);
  }

  // Initial check to set UI state correctly on page load
  const initialUser = firebaseAuth.currentUser;
  if (initialUser) {
    console.log("Initial Auth State: User is signed in:", initialUser.email);
    if (loginButton) loginButton.style.display = "none";
    if (userMenu) userMenu.style.display = "flex";
    if (userDisplay) {
      userDisplay.textContent = getUserGreeting(initialUser);
    }
    if (logoutButton) {
      logoutButton.style.display = "inline-block"; // Ensure it's in layout for CSS animation
    }
  } else {
    console.log("Initial Auth State: No user is signed in");
    if (loginButton) loginButton.style.display = "block";
    if (userMenu) userMenu.style.display = "none";
    if (logoutButton) logoutButton.style.display = "none"; // Ensure it's hidden if no user
  }
}

function attachAuthListeners() {
  const authForm = document.getElementById("auth-form"); // The dropdown container
  const loginButton = document.getElementById("auth-toggle"); // The initial login button
  const logoutButton = document.getElementById("logout-btn"); // The logout button
  const authFormContent = document.getElementById("auth-form-content"); // The form itself
  const userMenu = document.getElementById("user-menu");
  
  console.log("attachAuthListeners: loginButton =", loginButton, ", authForm =", authForm); // For debugging

  // Listener for the Login button click to toggle form visibility
  if (loginButton) {
    loginButton.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("#auth-toggle clicked. Current authForm element:", authForm); // For debugging
      if (authForm && loginButton.style.display !== "none") {
        authForm.classList.toggle("active");
        console.log("#auth-form classList after toggle:", authForm.classList.toString()); // For debugging
      } else {
        if (!authForm) {
          console.error("Cannot toggle #auth-form: The '#auth-form' element was not found in the DOM. Check HTML ID and script loading order.");
        } else if (loginButton.style.display === "none") {
          // This case implies the login button was somehow clicked while its style.display was 'none',
          // or the check is happening when the user is considered logged in.
          console.warn("Attempted to toggle #auth-form, but the login button is hidden (e.g., user might be logged in or UI state is inconsistent). Form toggle prevented.");
        }
      }
    });
  } else {
    console.error("#auth-toggle button not found. Cannot attach click listener for form toggle.");
  }

  // Listener for the form submission (sending email link)
  if (authFormContent) {
    authFormContent.addEventListener("submit", async (e) => {
      e.preventDefault();
      const emailInput = authFormContent.querySelector('input[type="email"]');
      const submitButton = authFormContent.querySelector('button[type="submit"]');

      if (emailInput && submitButton) { // Ensure both elements exist
        await sendSignInLinkToEmailHandler(authFormContent, emailInput, submitButton);
      } else {
        console.error("Email input or submit button not found in #auth-form-content.");
        alert("An error occurred. Email field or submit button is missing from the header form.");
      }
    });
  }

  // Listener for the Logout button click
  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      try {
        await signOut();
        console.log("User signed out successfully");
        if (userMenu) userMenu.style.display = "none"; // Explicitly hide user menu on logout click
        if (loginButton) loginButton.style.display = "block"; // Explicitly show login button
        // UI will be updated by the onAuthStateChanged listener
      } catch (error) {
        console.error("Error signing out:", error);
        alert("Failed to sign out. Please try again.");
      }
    });
  }

  // Add initial listener for clicking outside the form (if applicable)
  document.addEventListener("click", (e) => {
    // Ensure authForm was found initially
    if (authForm) { 
      if (
        authForm.classList.contains("active") &&
        !e.target.closest(".auth-container") && // Click is NOT inside .auth-container
        !e.target.closest("#auth-toggle")      // And click is NOT on the auth-toggle button itself
      ) {
        authForm.classList.remove("active");
      }
    }
  });
}

export const signOut = () => {
  if (!firebaseAuth) {
    console.error("Firebase Auth not initialized");
    return Promise.reject(new Error("Firebase Auth not initialized"));
  }
  return firebaseAuth.signOut();
};
