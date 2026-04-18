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



/**
 * Send approval email to candidate
 * @param {string} to - Candidate email
 * @param {string} name - Candidate name
 */
const sendApprovalEmail = async (to, name) => {
  try {
    const info = await transporter.sendMail({
      from: `"Cosmic Gateway Admins" <${process.env.SMTP_USER}>`,
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

module.exports = { sendApprovalEmail };
