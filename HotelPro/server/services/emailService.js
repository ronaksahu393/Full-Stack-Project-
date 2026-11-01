const crypto = require("crypto");
const nodemailer = require("nodemailer");

/**
 * Generates a cryptographically secure 6-digit numeric OTP.
 */
exports.generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Creates nodemailer transport if SMTP credentials are provided,
 * otherwise returns null for development console logging.
 */
const getTransporter = () => {
  const service = (process.env.EMAIL_SERVICE || process.env.SMTP_SERVICE || "").toLowerCase().trim();
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  // 1. Direct Gmail Service
  if (service === "gmail" && user && pass) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass }
    });
  }

  // 2. Standard SMTP Host Configuration
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST;
  if (host && user && pass) {
    const port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT) || 587;
    const secure = process.env.EMAIL_SECURE === "true" || process.env.SMTP_SECURE === "true" || port === 465;
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass }
    });
  }

  return null;
};

/**
 * Core sendEmail function with production SMTP dispatch and development console fallback.
 */
exports.sendEmail = async ({ to, subject, html, text }) => {
  const from = process.env.EMAIL_FROM || (process.env.EMAIL_USER ? `"HotelPro Concierge" <${process.env.EMAIL_USER}>` : '"AtithiGo Royal Concierge" <concierge@atithigo.com>');
  const transporter = getTransporter();

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html
      });
      console.log(`[EMAIL SERVICE] Email successfully delivered to ${to}. MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId, simulated: false };
    } catch (err) {
      console.error(`[EMAIL SERVICE ERROR] Failed to send email via SMTP to ${to}:`, err.message);
    }
  }

  // Development Fallback: Clear console logging of the notification
  console.log(`\n======================================================`);
  console.log(`✉️  [HOTELPRO EMAIL SERVICE - DEVELOPMENT DISPATCH]`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Content:\n${text}`);
  console.log(`======================================================\n`);

  return { success: true, simulated: true };
};

/**
 * Sends an Email Verification OTP.
 */
exports.sendVerificationOtpEmail = async (email, name, otp) => {
  const subject = "Verify Your AtithiGo Atelier Membership (Passkey)";
  const text = `Greetings ${name},\n\nYour 6-digit verification code is: ${otp}\n\nThis verification code expires in 10 minutes.\n\nWarm regards,\nAtithiGo Concierge`;
  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #071020; color: #FAF8F3; padding: 40px 20px; text-align: center;">
      <div style="max-width: 520px; margin: 0 auto; background-color: #0A1628; border: 1px solid #D4AF6B; border-radius: 6px; padding: 35px 25px; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
        <div style="font-size: 28px; font-weight: bold; color: #D4AF6B; letter-spacing: 2px; margin-bottom: 8px;">AtithiGo</div>
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #A78BFA; margin-bottom: 25px;">Atelier of Indian Sanctuaries</div>
        <h2 style="font-size: 20px; font-weight: normal; color: #FAF8F3; margin-bottom: 15px;">Confirm Your Atelier Membership</h2>
        <p style="font-size: 14px; color: #C8D6E8; line-height: 1.6; margin-bottom: 25px;">
          Subh Prabhat, ${name}. Please use the verification passkey below to verify your email address and activate your patron privileges:
        </p>
        <div style="display: inline-block; padding: 14px 32px; background-color: rgba(212,175,107,0.15); border: 2px dashed #D4AF6B; border-radius: 4px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #F0D08A; margin-bottom: 25px;">
          ${otp}
        </div>
        <p style="font-size: 12px; color: #8A9BAE; margin-bottom: 20px;">
          This code is strictly confidential and expires in 10 minutes. If you did not initiate this request, please disregard this email.
        </p>
        <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; font-size: 11px; color: #5A6D82;">
          अतिथि देवो भव &bull; AtithiGo Luxury Hospitality Atelier Pvt Ltd
        </div>
      </div>
    </div>
  `;

  return exports.sendEmail({ to: email, subject, text, html });
};

/**
 * Sends a Password Reset OTP.
 */
exports.sendPasswordResetOtpEmail = async (email, name, otp) => {
  const subject = "AtithiGo Credential Recovery (Password Reset Passkey)";
  const text = `Greetings ${name},\n\nWe received a request to reset your AtithiGo passkey. Your 6-digit recovery code is: ${otp}\n\nThis recovery code expires in 10 minutes.\n\nWarm regards,\nAtithiGo Concierge`;
  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #071020; color: #FAF8F3; padding: 40px 20px; text-align: center;">
      <div style="max-width: 520px; margin: 0 auto; background-color: #0A1628; border: 1px solid #D4AF6B; border-radius: 6px; padding: 35px 25px; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
        <div style="font-size: 28px; font-weight: bold; color: #D4AF6B; letter-spacing: 2px; margin-bottom: 8px;">AtithiGo</div>
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #D4AF6B; margin-bottom: 25px;">Patron Security Desk</div>
        <h2 style="font-size: 20px; font-weight: normal; color: #FAF8F3; margin-bottom: 15px;">Credential Recovery Request</h2>
        <p style="font-size: 14px; color: #C8D6E8; line-height: 1.6; margin-bottom: 25px;">
          Hello ${name}, a request was received to reset your account password. Enter the one-time verification passkey below to set a new password:
        </p>
        <div style="display: inline-block; padding: 14px 32px; background-color: rgba(212,175,107,0.15); border: 2px dashed #D4AF6B; border-radius: 4px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #F0D08A; margin-bottom: 25px;">
          ${otp}
        </div>
        <p style="font-size: 12px; color: #8A9BAE; margin-bottom: 20px;">
          Valid for 10 minutes. For security, never share this code with anyone. If you did not make this request, your account remains secure.
        </p>
        <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; font-size: 11px; color: #5A6D82;">
          256-Bit SSL Encrypted &bull; AtithiGo Patron Concierge
        </div>
      </div>
    </div>
  `;

  return exports.sendEmail({ to: email, subject, text, html });
};

/**
 * Sends a Password Reset Success Confirmation.
 */
exports.sendPasswordResetSuccessEmail = async (email, name) => {
  const subject = "AtithiGo Security Notice: Your Passkey Was Successfully Updated";
  const text = `Greetings ${name},\n\nYour AtithiGo account passkey was successfully changed. If this was not done by you, please reach out to the royal concierge immediately at concierge@atithigo.com.\n\nWarm regards,\nAtithiGo Concierge`;
  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #071020; color: #FAF8F3; padding: 40px 20px; text-align: center;">
      <div style="max-width: 520px; margin: 0 auto; background-color: #0A1628; border: 1px solid #10B981; border-radius: 6px; padding: 35px 25px;">
        <div style="font-size: 28px; font-weight: bold; color: #10B981; margin-bottom: 12px;">✓ Passkey Updated</div>
        <p style="font-size: 14px; color: #C8D6E8; line-height: 1.6; margin-bottom: 20px;">
          Hello ${name}, your AtithiGo account password was successfully updated on ${new Date().toUTCString()}.
        </p>
        <p style="font-size: 12px; color: #8A9BAE;">
          If you did not make this change, please contact our 24/7 Royal Concierge Desk immediately at <strong>+91 1800 284 844</strong>.
        </p>
      </div>
    </div>
  `;

  return exports.sendEmail({ to: email, subject, text, html });
};
