const express = require("express");
const router = express.Router();

const { admin, db } = require("../config/firebase");
const verifyToken = require("../middleware/auth");
const verifyAdmin = require("../middleware/admin");
const { sendApprovalEmail } = require("../config/mailer");


// ✅ SAVE USER — called AFTER email verification
router.post("/saveUser", verifyToken, async (req, res) => {
  try {
    console.log("📥 Incoming data:", JSON.stringify(req.body, null, 2));

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
      rollNo,
      semester,
      enrollmentYear,
      domain,
      interests,
      specializations,
    } = req.body;

    // 🔍 Debug log to confirm fields received
    console.log("🔍 Fields received:", { rollNo, semester, enrollmentYear, domain, dob });

    const isAdminEmail = req.user.email.endsWith("@jammuuniversity.ac.in");
    const role = isAdminEmail ? "admin" : "candidate";

    const userData = {
      uid: req.user.uid,
      email: req.user.email,
      role,

      fullName: fullName || "",
      fatherName: fatherName || "",
      school: school || "",
      dob: dob ? new Date(dob).toISOString() : "",
      phone: phone || "",
      department: department || "",

      // ✅ These fields MUST be saved
      rollNo: rollNo || "",
      semester: semester !== undefined && semester !== null && semester !== "" ? Number(semester) : null,
      enrollmentYear: enrollmentYear !== undefined && enrollmentYear !== null && enrollmentYear !== "" ? Number(enrollmentYear) : null,
      domain: domain || "",

      interests: Array.isArray(interests) ? interests : [],
      specializations: Array.isArray(specializations) ? specializations : [],

      // ✅ Approval System Fields
      isApproved: role === "admin" ? true : false,
      status: role === "admin" ? "approved" : "pending",
      approvedAt: role === "admin" ? new Date().toISOString() : null,

      createdAt: new Date().toISOString(),
    };

    console.log("💾 Saving to Firestore:", JSON.stringify(userData, null, 2));

    const collectionName = role === "admin" ? "admins" : "candidates";
    await db.collection(collectionName).doc(req.user.uid).set(userData);

    console.log("✅ Successfully saved user:", req.user.uid);

    return res.json({
      success: true,
      message: `${role} registered successfully`,
      data: userData,
    });

  } catch (error) {
    console.error("❌ ERROR in saveUser:", error);
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
    const {
      fullName,
      phone,
      dob,
      fatherName,
      school,
      department,
      interests,
      specializations,
    } = req.body;

    let collectionName = "admins";
    let doc = await db.collection("admins").doc(uid).get();

    if (!doc.exists) {
      collectionName = "candidates";
      doc = await db.collection("candidates").doc(uid).get();
    }

    if (!doc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const existing = doc.data();

    const updatedData = {
      fullName: fullName || existing.fullName,
      phone: phone || existing.phone,
      dob: dob || existing.dob,
      fatherName: fatherName || existing.fatherName,
      school: school || existing.school,
      department: department || existing.department,
      interests: Array.isArray(interests) ? interests : (existing.interests || []),
      specializations: Array.isArray(specializations) ? specializations : (existing.specializations || []),
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


// 🔐 ADMIN ONLY — get all candidates
router.get("/allCandidates", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const snapshot = await db.collection("candidates").get();
    const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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
    let interestCount = {};
    let specializationCount = {};

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.school) schoolCount[data.school] = (schoolCount[data.school] || 0) + 1;
      if (data.department) departmentCount[data.department] = (departmentCount[data.department] || 0) + 1;
      if (Array.isArray(data.interests)) {
        data.interests.forEach(i => { interestCount[i] = (interestCount[i] || 0) + 1; });
      }
      if (Array.isArray(data.specializations)) {
        data.specializations.forEach(s => { specializationCount[s] = (specializationCount[s] || 0) + 1; });
      }
    });

    return res.json({ totalCandidates, schoolCount, departmentCount, interestCount, specializationCount });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching analytics" });
  }
});


// 🔐 ADMIN ONLY — APPROVE CANDIDATE
router.patch("/candidate/:id/approve", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection("candidates").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const userData = doc.data();

    await docRef.update({
      isApproved: true,
      status: "approved",
      approvedAt: new Date().toISOString(),
    });

    // 📧 Send Notification Email
    console.log(`🚀 Sending approval email to: ${userData.email}`);
    await sendApprovalEmail(userData.email, userData.fullName);

    return res.json({ 
      success: true, 
      message: "Candidate approved successfully and email sent" 
    });
  } catch (error) {
    console.error("❌ Approval Error:", error);
    return res.status(500).json({ message: "Error approving candidate" });
  }
});


// 🔐 ADMIN ONLY — REJECT CANDIDATE
router.patch("/candidate/:id/reject", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("candidates").doc(id).update({
      isApproved: false,
      status: "rejected",
    });

    return res.json({ 
      success: true, 
      message: "Candidate rejected successfully" 
    });
  } catch (error) {
    console.error("❌ Rejection Error:", error);
    return res.status(500).json({ message: "Error rejecting candidate" });
  }
});


module.exports = router;