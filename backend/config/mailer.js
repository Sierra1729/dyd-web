const nodemailer = require("nodemailer");
require("dotenv").config();

console.log("ENV CHECK:", process.env.SMTP_USER);

const SMTP_USER = process.env.SMTP_USER || "pawandeep15dyd23@jammuuniversity.ac.in";
const SMTP_PASS = process.env.SMTP_PASS || "ppvb jdtn clfk iqjs";

// 📧 Create transporter
// Note: You can provide your own SMTP credentials in .env (SMTP_USER, SMTP_PASS)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

// 🔍 Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log("❌ SMTP Connection Error:", error);
  } else {
    console.log("✅ SMTP Server is ready to take our messages");
  }
});

/**
 * Send approval email to candidate
 * @param {string} to - Candidate email
 * @param {string} name - Candidate name
 */
const sendApprovalEmail = async (to, name) => {
  try {
    console.log(`📡 Attempting to send approval email to: ${to}`);
    const info = await transporter.sendMail({
      from: `"Team Design Your Degree" <${SMTP_USER}>`,
      to,
      subject: "Profile Approved 🎉",

      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #6366f1;">Welcome to Design Your Degree!</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>We are excited to inform you that your profile has been <strong>approved</strong> by our administration team.</p>
          <p>You can now log in to access your dashboard and explore all the features of academic portal.</p>
          <div style="margin: 30px 0;">
            <a href="${process.env.CLIENT_URL || "http://localhost:8081"}/login" 
               style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
               Login to Dashboard
            </a>
          </div>
          <p>Best regards,<br>Team Design Your Degree</p>
        </div>
      `,
    });
    console.log("📧 Approval email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return false;
  }
};

/**
 * Send rejection email to candidate
 * @param {string} to - Candidate email
 * @param {string} name - Candidate name
 * @param {string} remarks - Admin feedback
 */
const sendRejectionEmail = async (to, name, remarks) => {
  try {
    console.log(`📡 Attempting to send rejection email to: ${to}`);
    const info = await transporter.sendMail({
      from: `"Team Design Your Degree" <${SMTP_USER}>`,
      to,
      subject: "Action Required: Profile Status Update ⚠️",

      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #ef4444;">Status Update Regarding Your Profile</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Thank you for your interest in the Design Your Degree academic portal.</p>
          <p>After reviewing your profile, our administration team has decided not to approve it at this time.</p>
          
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #ef4444;">Feedback from Admin:</p>
            <p style="margin: 10px 0 0 0; font-style: italic;">"${remarks || "No specific remarks provided."}"</p>
          </div>

          <p>You can log in to your dashboard to review the feedback and update your profile details for re-submission.</p>
          
          <div style="margin: 30px 0;">
            <a href="${process.env.CLIENT_URL || "http://localhost:8081"}/login" 
               style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
               Go to Dashboard
            </a>
          </div>
          <p>If you have any questions, please reply to this email.</p>
          <p>Best regards,<br>Team Design Your Degree</p>
        </div>
      `,
    });
    console.log("📧 Rejection email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Error sending rejection email:", error);
    return false;
  }
};

/**
 * Notify admin of new user signup
 * @param {object} userData - New user details
 */
const sendAdminNewUserAuthNotification = async (userData) => {
  try {
    const adminEmail = process.env.ADMIN_ALERT_EMAIL || "pawandeep15dyd23@jammuuniversity.ac.in";
    console.log(`📡 Attempting to send ADMIN ALERT to: ${adminEmail} for user: ${userData.email}`);
    const info = await transporter.sendMail({
      from: `"Team Design Your Degree" <${SMTP_USER}>`,
      to: adminEmail,
      subject: "New User Registration Alert 🚨",

      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #6366f1;">New User Waiting for Approval</h2>
          <p>A new user has just completed their profile and is awaiting admin review.</p>
          
          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 15px; margin: 20px 0; border-radius: 8px;">
            <p style="margin: 0;"><strong>Name:</strong> ${userData.fullName}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${userData.email}</p>
            <p style="margin: 5px 0;"><strong>Roll No:</strong> ${userData.rollNo || "N/A"}</p>
            <p style="margin: 5px 0;"><strong>Role:</strong> ${userData.role}</p>
            <p style="margin: 5px 0;"><strong>Registered At:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <div style="margin: 30px 0;">
            <a href="${process.env.CLIENT_URL || "http://localhost:8081"}/login" 
               style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
               Go to Admin Panel
            </a>
          </div>
          <p>This is an automated notification from Team Design Your Degree.</p>
        </div>
      `,
    });
    console.log("📧 Admin notification sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Error sending admin notification:", error);
    return false;
  }
};

/**
 * Send welcome & credentials email to newly created account
 * @param {string} to - Candidate email
 * @param {string} name - Candidate name
 * @param {string} password - Generated password
 * @param {string} customLoginUrl - Optional custom URL
 */
const sendAccountCreatedEmail = async (to, name, password, customPortalUrl) => {
  try {
    const baseUrl = (process.env.CLIENT_URL || "https://dyd-web.vercel.app").replace(/\/+$/, "");
    const portalUrl = customPortalUrl || baseUrl;
    console.log(`📡 Sending account credentials email to: ${to}`);
    const info = await transporter.sendMail({
      from: `"Team Design Your Degree" <${SMTP_USER}>`,
      to,
      subject: "Your Account Credentials - Design Your Degree 🎓",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e7ff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #6366f1; padding: 24px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">Welcome to Design Your Degree</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">Your student account is now active</p>
          </div>
          
          <div style="padding: 24px 28px;">
            <p style="font-size: 16px;">Hi <strong>${name}</strong>,</p>
            <p style="color: #4b5563;">Your account on the <strong>Design Your Degree</strong> academic portal has been successfully created. You can use the credentials below to log in, access your dashboard, and update your profile information.</p>
            
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0;">
              <h3 style="margin: 0 0 12px 0; color: #1e293b; font-size: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">🔑 Your Login Credentials</h3>
              <p style="margin: 6px 0; font-size: 14px;"><strong>Portal URL:</strong> <a href="${portalUrl}" style="color: #6366f1;">${portalUrl}</a></p>
              <p style="margin: 6px 0; font-size: 14px;"><strong>Login Email:</strong> <span style="font-family: monospace; background: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${to}</span></p>
              <p style="margin: 6px 0; font-size: 14px;"><strong>Password:</strong> <span style="font-family: monospace; background: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${password}</span></p>
            </div>

            <div style="text-align: center; margin: 28px 0;">
              <a href="${portalUrl}" 
                 style="background-color: #6366f1; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">
                 Open DYD Portal
              </a>
            </div>

            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 13px; color: #1e40af;">
                📌 <strong>Next Steps:</strong> Once you visit the portal, please log in and review/update your academic records, contact info, and skills from your dashboard.
              </p>
            </div>

            <p style="margin-top: 24px; font-size: 14px; color: #6b7280;">Best regards,<br><strong>Team Design Your Degree</strong><br>University of Jammu</p>
          </div>
        </div>
      `,
    });
    console.log("📧 Account credentials email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Error sending account credentials email:", error);
    return false;
  }
};

module.exports = { 
  sendApprovalEmail, 
  sendRejectionEmail, 
  sendAdminNewUserAuthNotification,
  sendAccountCreatedEmail
};
