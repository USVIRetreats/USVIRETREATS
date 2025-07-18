import { CONFIG } from "./config.js";
import { validateEmail, validatePhone } from "./utils.js";

export const initializeForms = () => {
  const newsletterForm = document.querySelector(CONFIG.UI.newsletterForm);
  const retreatForm = document.querySelector(CONFIG.UI.retreatForm);

  const creativeRetreatApplicationForm = document.getElementById(
    "creativeRetreatForm"
  );

  // Store API for each multi-step form instance
  const multiStepInstances = new Map();

  // Helper to insert an error message after/near a field
  const insertErrorMessage = (fieldElement, message) => {
    // Remove existing error message for this field first
    clearErrorMessage(fieldElement);

    const errorElement = document.createElement('span');
    errorElement.className = 'error-message';
    errorElement.textContent = message;

    // Try to insert within the form-group if it exists and the field is part of it
    const formGroup = fieldElement.closest('.form-group');
    if (formGroup && formGroup.contains(fieldElement)) {
      // Append to form group, making it appear after all elements in the group or as per CSS flow
      formGroup.appendChild(errorElement);
    } else {
      // Fallback: insert directly after the fieldElement
      fieldElement.parentNode.insertBefore(errorElement, fieldElement.nextSibling);
    }
    fieldElement.classList.add('error'); // Add error class to the field or group container
  };

  // Helper to clear an error message for a field
  const clearErrorMessage = (fieldElement) => {
    const formGroup = fieldElement.closest('.form-group');
    let errorNode = formGroup ? formGroup.querySelector('.error-message') : null;

    if (!errorNode && fieldElement.nextSibling && fieldElement.nextSibling.classList && fieldElement.nextSibling.classList.contains('error-message')) {
      errorNode = fieldElement.nextSibling;
    }
    errorNode?.remove();
    fieldElement.classList.remove('error');
  };

  const clearAllFormErrors = (formElement) => {
    formElement.querySelectorAll('.error-message').forEach(el => el.remove());
    formElement.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  };

  newsletterForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    // Use specific IDs for newsletter form inputs
    const emailInput = newsletterForm.querySelector("#newsletter-email");
    const phoneInput = newsletterForm.querySelector("#newsletter-phone");
    const firstNameInput = newsletterForm.querySelector("#firstName");
    const lastNameInput = newsletterForm.querySelector("#lastName");

    clearAllFormErrors(newsletterForm);
    let isValid = true;

    if (!firstNameInput || !firstNameInput.value.trim()) {
      isValid = false;
      insertErrorMessage(firstNameInput, "First name is required.");
    }
    if (!lastNameInput || !lastNameInput.value.trim()) {
      isValid = false;
      insertErrorMessage(lastNameInput, "Last name is required.");
    }

    if (!emailInput || !validateEmail(emailInput.value)) {
      isValid = false;
      insertErrorMessage(emailInput, "Please enter a valid email address.");
    }
    if (!phoneInput || !validatePhone(phoneInput.value)) {
      isValid = false;
      insertErrorMessage(phoneInput, "Please enter a valid 10-digit phone number.");
    }

    if (!isValid) {
      const firstErrorField = newsletterForm.querySelector('.error');
      firstErrorField?.focus();
      return;
    }

    alert("Thank you for subscribing!");
    newsletterForm.reset();
    clearAllFormErrors(newsletterForm);
  });

  retreatForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const inquiryDetails = {
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      specialRequests: formData.get("specialRequests"),
      // You would also include bookingSummary details here, passed from booking.js or retrieved
    };

    console.log("Retreat Inquiry Submitted:", inquiryDetails);
    alert("Thank you for your inquiry! We will get back to you soon.");
    // TODO: Replace mailto with an actual backend submission (e.g., to a Firebase Cloud Function)
    // Example: sendInquiryToBackend(inquiryDetails);
    retreatForm.reset(); // Optionally reset the form
  });

  // Define initializeMultiStepForm before it's used by event listeners that might need its API
  const initializeMultiStepForm = (formElement) => {
    if (!formElement) return;

    const steps = Array.from(formElement.querySelectorAll(".form-step"));
    const nextButtons = formElement.querySelectorAll(".btn-next");
    const prevButtons = formElement.querySelectorAll(".btn-prev");
    // let currentStep = 0; // Replaced by dataset property

    // Initialize current step on the form element itself
    formElement.dataset.currentStep = "0";

    const getCurrentStepIndex = () => parseInt(formElement.dataset.currentStep || "0");

    const showStep = (stepIndex, scroll = true) => {
      steps.forEach((step, index) => {
        step.classList.toggle("active-step", index === stepIndex);
      });
      formElement.dataset.currentStep = stepIndex;
      if (scroll) {
        // Optional: Scroll to the top of the form when changing steps
        formElement.scrollIntoView({ behavior: "smooth" });
      }
    };

    const validateStep = (stepIndex) => {
      const currentStepElement = steps[stepIndex];
      const currentStepFields = currentStepElement.querySelectorAll("[required]");
      let stepIsValid = true;
      let firstErrorFieldInStep = null;

      // Clear previous errors in this step before re-validating
      currentStepFields.forEach(field => clearErrorMessage(field));
      // Also clear errors from potential group containers if they got the .error class
      currentStepElement.querySelectorAll('.form-group.error .error-message').forEach(em => em.remove());
      currentStepElement.querySelectorAll('.form-group.error').forEach(fg => fg.classList.remove('error'));
      
      for (const field of currentStepFields) {
        if ((field.type === "radio" || field.type === "checkbox")) {
          const groupName = field.name;
          // Check if any radio/checkbox in the group (within the form) is checked
          if (!formElement.querySelector(`input[name="${groupName}"]:checked`)) {
            const groupLabelElement = field.closest('.form-group')?.querySelector('label');
            const fieldDisplayName = groupLabelElement ? groupLabelElement.textContent.replace('(Required)','').trim() : groupName;
            // Attach error to the form-group or the first field of the group
            const errorTarget = field.closest('.form-group') || field;
            insertErrorMessage(errorTarget, `Please make a selection for ${fieldDisplayName}.`);            
            if (!firstErrorFieldInStep) firstErrorFieldInStep = formElement.querySelector(`input[name="${groupName}"]`) || field;
            stepIsValid = false;
          }
        } else if (!field.value.trim()) {
          let fieldDisplayName = field.name;
          const labelElement = field.closest('.form-group')?.querySelector(`label[for="${field.id}"]`) || field.previousElementSibling;
          if (labelElement) {
            fieldDisplayName = labelElement.textContent.replace('(Required)','').trim();
          }
          insertErrorMessage(field, `${fieldDisplayName} is required.`);
          if (!firstErrorFieldInStep) firstErrorFieldInStep = field;
          stepIsValid = false;
        }
        // If we want to stop at the first error within the step:
        if (!stepIsValid && firstErrorFieldInStep) break; 
      }

      if (!stepIsValid && firstErrorFieldInStep) {
        // Only focus if this step (stepIndex) is the one currently displayed (active)
        // This is primarily for "Next" button clicks.
        if (stepIndex === getCurrentStepIndex()) {
            firstErrorFieldInStep.focus();
        }
      }
      return stepIsValid;
    };

    nextButtons.forEach(button => {
      button.addEventListener("click", () => {
        const activeStepIndex = getCurrentStepIndex();
        if (validateStep(activeStepIndex)) { // Validate current active step
          if (activeStepIndex < steps.length - 1) {
            showStep(activeStepIndex + 1);
          }
        }
      });
    });

    prevButtons.forEach(button => {
      button.addEventListener("click", () => {
        const activeStepIndex = getCurrentStepIndex();
        if (activeStepIndex > 0) {
          showStep(activeStepIndex - 1);
        }
      });
    });

    showStep(0, false); // Show the first step initially, without scrolling
  };

  // Initialize the multi-step functionality for the creative retreat form
  // Do this before setting up the submit listener that might depend on multiStepInstances
  if (creativeRetreatApplicationForm) {
    initializeMultiStepForm(creativeRetreatApplicationForm);
    // Store the API for the creativeRetreatApplicationForm specifically if needed elsewhere,
    // though the submit handler below will retrieve it via multiStepInstances.get()
    multiStepInstances.set(creativeRetreatApplicationForm, {
        showStep: (idx) => steps.forEach((s, i) => s.classList.toggle("active-step", i === idx)), // Simplified showStep for direct use
        getSteps: () => Array.from(creativeRetreatApplicationForm.querySelectorAll(".form-step")),
        getCurrentStepIndex: () => parseInt(creativeRetreatApplicationForm.dataset.currentStep || "0")
    });
  }

  creativeRetreatApplicationForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    clearAllFormErrors(creativeRetreatApplicationForm);
    const currentUser = firebase.auth().currentUser;
    if (!currentUser) {
      alert("You must be logged in to submit an application. Please log in and try again.");
      // Optionally, trigger login UI or redirect
      return;
    }

    const formData = new FormData(e.target);
    const applicationDetails = {
      fullName: formData.get("fullName")?.trim(),
      email: formData.get("email")?.trim(),
      phone: formData.get("phone")?.trim(),
      location: formData.get("location")?.trim(),
      retreatDates: formData.get("retreatDates"),
      whatYouCreate: formData.get("whatYouCreate")?.trim(),
      craft: formData.get("craft")?.trim(),
      mostAlive: formData.get("mostAlive")?.trim(),
      whyDrawn: formData.get("whyDrawn")?.trim(),
      connection: formData.get("connection")?.trim(),
      hopeToReturn: formData.get("hopeToReturn")?.trim(),
      accessibility: formData.get("accessibility")?.trim(),
      paymentPreference: formData.get("paymentPreference"),
      anythingElse: formData.get("anythingElse")?.trim(),
      userId: currentUser.uid, // Added for Firestore rules
      userEmail: currentUser.email // Added for Firestore rules and consistency
    };

    let overallIsValid = true;
    let fieldToFocus = null;

    // Helper for unified validation within submit handler
    const checkField = (value, validatorFn, element, message, isRadioOrCheckboxGroup = false, groupName = null) => {
        let currentFieldIsValid = true;
        if (isRadioOrCheckboxGroup) {
            // For radio/checkbox, 'value' is not used directly; check formData
            if (!formData.get(groupName)) {
                currentFieldIsValid = false;
            }
        } else if (validatorFn && (value === null || value === undefined || !validatorFn(value))) { // Validator fails or value is null/undefined for validators
            currentFieldIsValid = false;
        } else if (!validatorFn && (value === null || value === undefined || value.trim() === "")) { // No validator, check for empty trim
            currentFieldIsValid = false;
        }

        if (!currentFieldIsValid) {
            if (element) insertErrorMessage(element, message);
            if (!fieldToFocus && element) {
                // For groups, focus on the first input of the group
                fieldToFocus = isRadioOrCheckboxGroup ? formElement.querySelector(`input[name="${groupName}"]`) : element;
            }
            overallIsValid = false;
        } else if (element) {
            clearErrorMessage(element); // Clear error if field is now valid
        }
    };

    // --- Field Validations ---
    // Define required fields and their user-friendly names
    const requiredFieldsMap = {
      fullName: { name: "Full Name", id: "crFullName" },
      location: { name: "Location", id: "crLocation" },
      // retreatDates is handled specially below
      whatYouCreate: { name: 'Response for "What do you create, build or lead?"', id: "crWhatYouCreate" },
      craft: { name: 'Response for "What do you consider your craft?"', id: "crCraft" },
      mostAlive: { name: 'Response for "Where do you feel most alive?"', id: "crMostAlive" },
      whyDrawn: { name: 'Response for "Why are you drawn to this retreat?"', id: "crWhyDrawn" },
      connection: { name: 'Response for "What kind of connection are you craving?"', id: "crConnection" },
      hopeToReturn: { name: 'Response for "What do you hope to return with?"', id: "crHopeToReturn" },
      // paymentPreference is handled specially below
    };

    // Validate fields from requiredFieldsMap (mostly text inputs/textareas)
    for (const fieldKey in requiredFieldsMap) {
      const fieldDetail = requiredFieldsMap[fieldKey];
      const formFieldElement = document.getElementById(fieldDetail.id);
      checkField(applicationDetails[fieldKey], null, formFieldElement, `${fieldDetail.name} is required.`);
    }

    // Special handling for retreatDates
    const retreatDatesValue = formData.get("retreatDates") || formData.get("crHiddenRetreatDates");
    const crRetreatDatesSelect = document.getElementById('crRetreatDates');
    const crSelectedDatesFromCartDiv = document.getElementById('crSelectedDatesFromCart');
    let retreatDatesErrorTargetElement = crRetreatDatesSelect.style.display !== 'none' ?
                                   crRetreatDatesSelect :
                                   crSelectedDatesFromCartDiv;
    // Target the form-group for error message if possible
    retreatDatesErrorTargetElement = retreatDatesErrorTargetElement?.closest('.form-group') || retreatDatesErrorTargetElement;
    checkField(retreatDatesValue, (val) => !!val, retreatDatesErrorTargetElement, "Retreat dates selection is required.");


    // Special handling for paymentPreference radio group
    const paymentGroupElement = document.getElementById('paymentPreferenceGroup') || 
                              creativeRetreatApplicationForm.querySelector('input[name="paymentPreference"]')?.closest('.form-group');
    checkField(null, null, paymentGroupElement, "Payment preference is required.", true, "paymentPreference");

    // Email validation (required and format)
    const emailField = document.getElementById("crEmail");
    if (!applicationDetails.email) {
        checkField(applicationDetails.email, null, emailField, "Email is required.");
    } else { // Email is present, check format
        checkField(applicationDetails.email, validateEmail, emailField, "Please enter a valid email format.");
    }

    // Phone validation (optional, but format if present)
    const phoneField = document.getElementById("crPhone");
    if (applicationDetails.phone && !validatePhone(applicationDetails.phone)) {
      // This will mark overallIsValid = false and set fieldToFocus if not already set.
      checkField(applicationDetails.phone, validatePhone, phoneField, "Please enter a valid 10-digit phone number.");
    } else if (phoneField && applicationDetails.phone) { // If phone is present and valid, ensure no error message
        clearErrorMessage(phoneField);
    }


    if (!overallIsValid) {
      if (fieldToFocus) {
        const formApi = multiStepInstances.get(creativeRetreatApplicationForm);
        if (formApi) {
            const stepElement = fieldToFocus.closest(".form-step");
            const allSteps = formApi.getSteps();
            if (stepElement && allSteps) {
              const stepIndex = allSteps.indexOf(stepElement);
              if (stepIndex !== -1 && stepIndex !== formApi.getCurrentStepIndex()) {
                // Manually call the showStep from the form's specific API instance
                const stepsNodeList = creativeRetreatApplicationForm.querySelectorAll(".form-step");
                stepsNodeList.forEach((step, idx) => {
                    step.classList.toggle("active-step", idx === stepIndex);
                });
                creativeRetreatApplicationForm.dataset.currentStep = stepIndex;
                creativeRetreatApplicationForm.scrollIntoView({ behavior: "smooth" });
              }
            }
        }
        // Ensure the field is visible before focusing. The step change should handle this.
        fieldToFocus.focus();
      }
      return;
    }

    // Submit to Firestore
    const db = firebase.firestore();
    db.collection("orders").add({
      ...applicationDetails,
      status: "application_received",
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      // Assuming userName is part of applicationDetails or can be derived
      userName: applicationDetails.fullName,
      userEmail: applicationDetails.userEmail // Use the email from the authenticated user
    }).then(() => {
      console.log("Creative Retreat Application Submitted to Firestore:", applicationDetails);
      alert(
        "Thank you for your application! We will review it and get back to you soon."
      );
      creativeRetreatApplicationForm.reset();
      clearAllFormErrors(creativeRetreatApplicationForm);
      const formApi = multiStepInstances.get(creativeRetreatApplicationForm);
      if (formApi) { // Reset to the first step
          const stepsNodeList = creativeRetreatApplicationForm.querySelectorAll(".form-step");
          stepsNodeList.forEach((step, idx) => step.classList.toggle("active-step", idx === 0));
          creativeRetreatApplicationForm.dataset.currentStep = "0";
      }
    }).catch(error => {
      console.error("Error submitting application to Firestore:", error);
      alert("There was an error submitting your application. Please try again.");
    });
  });

  // Pre-fill form data if available
  if (creativeRetreatApplicationForm) {
    // Attempt to pre-fill Email from Auth (assuming auth module exposes currentUser)
    if (window.currentUser && window.currentUser.email) {
      const emailInput =
        creativeRetreatApplicationForm.querySelector("#crEmail");
      if (emailInput) emailInput.value = window.currentUser.email;
    }

    // Attempt to pre-fill Retreat Dates from Cart (conceptual)
    // This requires window.shoppingCart and a getCartItems method,
    // and cart items for retreats to have specific date information.
    if (
      window.shoppingCart &&
      typeof window.shoppingCart.getCartItems === "function"
    ) {
      const cartItems = window.shoppingCart.getCartItems();
      // Example: Find an "Artist Retreat" item and try to match its dates
      const artistRetreatInCart = cartItems.find(
        (item) =>
          item.name?.toLowerCase().includes("artist retreat") &&
          item.bookingDetails?.checkIn
      );

      if (artistRetreatInCart) {
        const retreatDatesDropdown =
          creativeRetreatApplicationForm.querySelector("#crRetreatDates");
        // This is a placeholder. Actual logic to match cart dates to dropdown options would be complex.
        // It depends on the format of dates in cart and option values.
        // For now, we'll just log that we found it.
        console.log(
          `Artist retreat found in cart with check-in: ${artistRetreatInCart.bookingDetails.checkIn}. Consider pre-selecting in dropdown if a match exists.`
        );
        // Example: If dropdown option values are like "YYYY-MM-DD_YYYY-MM-DD"
        // const cartDateValue = `${new Date(artistRetreatInCart.bookingDetails.checkIn).toISOString().split('T')[0]}_${new Date(artistRetreatInCart.bookingDetails.checkOut).toISOString().split('T')[0]}`;
        // if (retreatDatesDropdown.querySelector(`option[value="${cartDateValue}"]`)) {
        //   retreatDatesDropdown.value = cartDateValue;
        // }
      }
    }
  }
};
