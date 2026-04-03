const { admin, db } = require("../config/firebase");

const verifyAdmin = async (req, res, next) => {
  try {
    const doc = await db.collection("admins").doc(req.user.uid).get();

    if (!doc.exists) {
      return res.status(403).send("Access denied: Admin only");
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).send("Error verifying admin");
  }
};

module.exports = verifyAdmin;