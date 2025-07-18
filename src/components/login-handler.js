import { CONFIG } from './config.js'; 

document.addEventListener('DOMContentLoaded', () => {
    console.log('login-complete.html DOM loaded, starting handler...');
    const statusElement = document.getElementById('status-message');

    function updateStatus(message) {
        console.log(message);
        if (statusElement) {
            statusElement.textContent = message;
        }
    }
    
    updateStatus("DOM loaded, starting authentication process...");
    
    
    try {
        // Initialize Firebase
        updateStatus("Checking Firebase initialization...");
        if (!firebase.apps.length) {
            updateStatus("Initializing Firebase...");
            firebase.initializeApp(CONFIG.FIREBASE);
        }
        
        const auth = firebase.auth();
        
        // Check if this is a sign-in link
        if (auth.isSignInWithEmailLink(window.location.href)) {
            updateStatus("Valid sign-in link detected!");
            
            // Get email from localStorage
            let email = localStorage.getItem('emailForSignIn');
            if (!email) {
                // If no email in localStorage, prompt the user
                updateStatus("Email not found in local storage, requesting input...");
                email = window.prompt('Please provide your email for confirmation');
            } else {
                updateStatus(`Email found in storage: ${email}`);
            }
            
            if (email) {
                updateStatus("Attempting to sign in...");
                // Sign in
                auth.signInWithEmailLink(email, window.location.href)
                    .then(() => {
                        updateStatus("Sign-in successful! Redirecting...");
                        localStorage.removeItem('emailForSignIn');
                        setTimeout(() => {
                            // Determine the correct base path for redirection
                            // e.g., if current URL is https://nickysimps.github.io/Travel-site/login-complete.html
                            // we want to redirect to https://nickysimps.github.io/Travel-site/index.html
                            const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
                            const redirectUrl = window.location.origin + currentDir + 'index.html';
                            window.location.href = redirectUrl;
                        }, 1500);
                    })
                    .catch((error) => {
                        let errorMessage = `Error signing in: ${error.message}`;
                        if (error.code === 'auth/invalid-action-code') {
                            errorMessage = 'Invalid or expired login link. Please request a new one.';
                        } else if (error.code === 'auth/user-disabled') {
                             errorMessage = 'Your account has been disabled.';
                        }
                        updateStatus(errorMessage);
                        console.error('SignIn Error:', error);
                    });
            } else {
                updateStatus("No email provided, cannot complete sign-in");
            }
        } else {
            updateStatus("This link is not valid for signing in, or it may have expired. Please request a new login link from the main site.");
            // Optionally, provide a link back to the homepage or login page
            // statusElement.innerHTML += '<br><a href="/">Go to Homepage</a>';
        } // No else needed here, the page is specifically for the link
    } catch (error) {
        updateStatus(`Initialization error: ${error.message}`);
        console.error('Overall Error:', error);
    }
});