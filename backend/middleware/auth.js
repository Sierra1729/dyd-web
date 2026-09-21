const { admin } = require("../config/firebase");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // ✅ Must have "Bearer <token>" format
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  // ✅ Strip "Bearer " prefix before verifying
  const token = authHeader.split(" ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);

    // 🔒 Block unverified emails at middleware level
    if (!decoded.email_verified) {
      return res.status(403).json({
        message: "Email not verified. Please verify your email first.",
      });
    }

    req.user = decoded;
    next();

  } catch (error) {
    console.error("Token verification failed:", error);
    // ✅ Always return JSON, never plain text
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = verifyToken;