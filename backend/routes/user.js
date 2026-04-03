const express = require("express");
const router = express.Router();


const { admin, db } = require("../config/firebase");
const verifyToken = require("../middleware/auth");
const verifyAdmin = require("../middleware/admin");


// ✅ SAVE USER — called AFTER email verification
router.post("/saveUser", verifyToken, async (req, res) => {
  try {
    console.log("📥 Incoming data:", req.body);

    if (!req.user.email_verified) {
      return res.status(403).json({
        success: false,
        message: "Email not verified. Please verify your email before registering.",
      });
    }

    const {
      fullName,
      fatherName,
      school,
      dob,
      phone,
      department,
    } = req.body;

    const isAdminEmail = req.user.email.endsWith("@jammuuniversity.ac.in");
    const role = isAdminEmail ? "admin" : "candidate";

    const userData = {
      uid: req.user.uid,
      email: req.user.email,
      role,

      fullName,
      fatherName: fatherName || "",
      school: school || "",
      dob: dob ? new Date(dob).toISOString() : "",
      phone: phone || "",
      department: department || "",

      createdAt: new Date().toISOString(),
    };

    const collectionName = role === "admin" ? "admins" : "candidates";

    await db.collection(collectionName).doc(req.user.uid).set(userData);

    console.log("✅ Saved:", userData);

    return res.json({
      success: true,
      message: `${role} registered successfully`,
      data: userData,
    });

  } catch (error) {
    console.error("❌ ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Error saving user",
      error: error.message,
    });
  }
});


// ✅ GET USER — fetch profile after login
router.get("/getUser", verifyToken, async (req, res) => {
  try {
    const uid = req.user.uid;

    let doc = await db.collection("admins").doc(uid).get();

    if (!doc.exists) {
      doc = await db.collection("candidates").doc(uid).get();
    }

    if (!doc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(doc.data());

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching user" });
  }
});


// 🔄 UPDATE PROFILE — allows user to update their own profile
router.put("/updateProfile", verifyToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { fullName, phone, dob, fatherName, school, department } = req.body;

    // Check if user is admin or candidate
    let collectionName = "admins";
    let doc = await db.collection("admins").doc(uid).get();

    if (!doc.exists) {
      collectionName = "candidates";
      doc = await db.collection("candidates").doc(uid).get();
    }

    if (!doc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedData = {
      fullName: fullName || doc.data().fullName,
      phone: phone || doc.data().phone,
      dob: dob || doc.data().dob,
      fatherName: fatherName || doc.data().fatherName,
      school: school || doc.data().school,
      department: department || doc.data().department,
      updatedAt: new Date().toISOString(),
    };

    await db.collection(collectionName).doc(uid).update(updatedData);

    return res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedData,
    });

  } catch (error) {
    console.error("❌ Profile Update Error:", error);
    return res.status(500).json({ message: "Error updating profile" });
  }
});


// 🔐 ADMIN ONLY — get all candidates (FIXED with ID)
router.get("/allCandidates", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const snapshot = await db.collection("candidates").get();

    const users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json(users);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching candidates" });
  }
});


// 🔐 ADMIN ONLY — delete candidate
router.delete("/candidate/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection("candidates").doc(id).delete();

    return res.json({ message: "Candidate deleted successfully" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error deleting candidate" });
  }
});


// 🔐 ADMIN ONLY — update candidate
router.put("/candidate/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection("candidates").doc(id).update(req.body);

    return res.json({ message: "Candidate updated successfully" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating candidate" });
  }
});


// 🔐 ADMIN ONLY — analytics
router.get("/analytics", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const snapshot = await db.collection("candidates").get();

    const totalCandidates = snapshot.size;

    let schoolCount = {};
    let departmentCount = {};

    snapshot.forEach((doc) => {
      const data = doc.data();

      if (data.school) {
        schoolCount[data.school] = (schoolCount[data.school] || 0) + 1;
      }

      if (data.department) {
        departmentCount[data.department] =
          (departmentCount[data.department] || 0) + 1;
      }
    });

    return res.json({
      totalCandidates,
      schoolCount,
      departmentCount,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching analytics" });
  }
});


module.exports = router;