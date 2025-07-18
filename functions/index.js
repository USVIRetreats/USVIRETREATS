const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const {onCall, HttpsError} = require("firebase-functions/v2/https");
admin.initializeApp();
const nodemailer = require("nodemailer");

// Define the secret names your functions will use
const BREVO_SECRETS = [
  "BREVO_SMTPSERVER",
  "BREVO_SMTPLOGIN",
  "BREVO_SMTPPASSWORD",
  "BREVO_SMTPPORT",
  "APP_ADMIN_EMAIL",
];

// This function is now specifically for sending application/quote confirmations.
exports.sendApplicationConfirmationEmailWithBrevo = onDocumentCreated(
  {
    document: "orders/{orderId}",
    secrets: BREVO_SECRETS,
  }, async (event) => {
      const snap = event.data;
      if (!snap) {
        console.log("No data associated with the event for orderId:", event.params.orderId);
        return null;
      }
      const orderData = snap.data();
      const orderId = event.params.orderId;

      // Check if this is an application submission
      if (orderData.status !== "application_received") {
        console.log(`Order ${orderId} is not an application (status: ${orderData.status}). Skipping email.`);
        return null;
      }
      
      console.log(`New application received: ${orderId}`, JSON.stringify(orderData));

      // Access secrets from process.env
      const requiredConfig = {
        BREVO_SMTPSERVER: process.env.BREVO_SMTPSERVER,
        BREVO_SMTPLOGIN: process.env.BREVO_SMTPLOGIN,
        BREVO_SMTPPASSWORD: process.env.BREVO_SMTPPASSWORD,
        APP_ADMIN_EMAIL: process.env.APP_ADMIN_EMAIL,
        BREVO_SMTPPORT: process.env.BREVO_SMTPPORT,
      };
      const missingVars = Object.keys(requiredConfig).filter((key) => !requiredConfig[key]);

      if (missingVars.length > 0) {
        const errorMessage = `Required SMTP/App configuration variable(s) are missing: ${missingVars.join(", ")} for order: ${orderId}`;
        console.error(errorMessage);
        // Update status to reflect config error
        await snap.ref.update({
            status: "application_email_config_error",
            emailError: `Missing config: ${missingVars.join(", ")}`,
        });
        return null;
      }

      const userName = orderData.userName || "there";
      const adminEmail = requiredConfig.APP_ADMIN_EMAIL;

      const smtpPort = parseInt(requiredConfig.BREVO_SMTPPORT, 10);
      const transporter = nodemailer.createTransport({
        host: requiredConfig.BREVO_SMTPSERVER,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: requiredConfig.BREVO_SMTPLOGIN,
          pass: requiredConfig.BREVO_SMTPPASSWORD,
        },
      });

      const mailOptions = {
        from: `USVI Retreats <${adminEmail}>`,
        to: [orderData.userEmail],
        subject: `Your application has arrived 🌴`,
        html: `
<p>Hi ${userName},</p>
<p>Thank you for sending your application and opening to this process. I've received your answers and will take time to read through them thoughtfully—this space is cultivated with care.</p>
<p>I'll be in touch within 3 business days to let you know our next step, whether that's a brief chat or a simple confirmation.</p>
<p>In the meantime, consider this your invitation to return to your breath, your body, your creative flow.</p>
<p>Warmly,</p>
<p>Charles Markowitz<br>
USVI Retreats, CEO<br>
(970) 689-1500</p>
        `,
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Application confirmation email sent to ${orderData.userEmail} for application ${orderId}. Message ID: ${info.messageId}`);

        await snap.ref.update({
            status: "application_confirmation_sent",
            emailSentTimestamp: admin.firestore.FieldValue.serverTimestamp()
        });

      } catch (error) {
        console.error(`Error sending application confirmation email for ${orderId}:`, error);
        await snap.ref.update({
            status: "application_email_failed",
            emailError: error.message,
            emailErrorDetails: error.details
        });
      }
      return null;
    });

// Updated callable function to use secrets
exports.sendEmailWithBrevo = onCall({ secrets: BREVO_SECRETS }, async (request) => {
  const { to, subject, html, text } = request.data;

  if (!to || !subject || (!html && !text)) {
    console.error("Validation failed: Missing to, subject, or body content.");
    throw new HttpsError(
        "invalid-argument",
        "Missing required email parameters: to, subject, and html/text body.",
    );
  }

  // Access secrets from process.env
  const requiredCallableConfig = {
    BREVO_SMTPSERVER: process.env.BREVO_SMTPSERVER,
    BREVO_SMTPLOGIN: process.env.BREVO_SMTPLOGIN,
    BREVO_SMTPPASSWORD: process.env.BREVO_SMTPPASSWORD,
    APP_ADMIN_EMAIL: process.env.APP_ADMIN_EMAIL,
    BREVO_SMTPPORT: process.env.BREVO_SMTPPORT,
  };
  const missingCallableVars = Object.keys(requiredCallableConfig).filter((key) => !requiredCallableConfig[key]);

  if (missingCallableVars.length > 0) {
    const errorMessage = `Required SMTP/App configuration variable(s) are missing for callable function: ${missingCallableVars.join(", ")}`;
    console.error(errorMessage);
    throw new HttpsError(
        "internal",
        `Email service configuration error. Missing: ${missingCallableVars.join(", ")}`,
    );
  }

  const smtpPort = parseInt(requiredCallableConfig.BREVO_SMTPPORT, 10);
  const transporter = nodemailer.createTransport({
    host: requiredCallableConfig.BREVO_SMTPSERVER,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: requiredCallableConfig.BREVO_SMTPLOGIN,
      pass: requiredCallableConfig.BREVO_SMTPPASSWORD,
    },
  });

  const mailOptions = {
    from: `USVI Retreats <${requiredCallableConfig.APP_ADMIN_EMAIL}>`,
    to: to,
    subject: subject,
    text: text,
    html: html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new HttpsError("internal", "Failed to send email.", error.message);
  }
});