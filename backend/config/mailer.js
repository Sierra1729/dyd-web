const nodemailer = require("nodemailer");
require("dotenv").config();

console.log("ENV CHECK:", process.env.SMTP_USER);
// 📧 Create transporter
// Note: You must provide your own SMTP credentials in .env
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "alpha.bravo0796@gmail.com",
    pass: "hsxq smgq pget kdmf",
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
      from: `"Cosmic Gateway Admins" <alpha.bravo0796@gmail.com>`,
      to,
      subject: "Profile Approved 🎉",

      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #6366f1;">Welcome to Cosmic Gateway!</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>We are excited to inform you that your profile has been <strong>approved</strong> by our administration team.</p>
          <p>You can now log in to access your dashboard and explore all the features of academic portal.</p>
          <div style="margin: 30px 0;">
            <a href="${process.env.CLIENT_URL || "http://localhost:8081"}/login" 
               style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
               Login to Dashboard
            </a>
          </div>
          <p>Best regards,<br>The Cosmic Gateway Team</p>
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
      from: `"Cosmic Gateway Admins" <alpha.bravo0796@gmail.com>`,
      to,
      subject: "Action Required: Profile Status Update ⚠️",

      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #ef4444;">Status Update Regarding Your Profile</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Thank you for your interest in the Cosmic Gateway academic portal.</p>
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
          <p>Best regards,<br>The Cosmic Gateway Team</p>
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
    const adminEmail = "alpha.bravo1729@gmail.com";
    console.log(`📡 Attempting to send ADMIN ALERT to: ${adminEmail} for user: ${userData.email}`);
    const info = await transporter.sendMail({
      from: `"Cosmic Gateway System" <alpha.bravo0796@gmail.com>`,
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
          <p>This is an automated system notification.</p>
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


module.exports = { 
  sendApprovalEmail, 
  sendRejectionEmail, 
  sendAdminNewUserAuthNotification 
};

