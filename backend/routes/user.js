const express = require("express");
const router = express.Router();
const User = require("../models/User");
const verifyToken = require("../middleware/auth");
const verifyAdmin = require("../middleware/admin");
const { 
  sendApprovalEmail, 
  sendRejectionEmail, 
  sendAdminNewUserAuthNotification 
} = require("../config/mailer");

// ✅ SAVE USER — called AFTER email verification
router.post("/saveUser", verifyToken, async (req, res) => {
  try {
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

    const isAdminEmail = req.user.email.endsWith("@jammuuniversity.ac.in");
    const role = isAdminEmail ? "admin" : "candidate";

    const userData = {
      uid: req.user.uid,
      email: req.user.email,
      role,
      fullName: fullName || "",
      fatherName: fatherName || "",
      dob: dob ? new Date(dob) : null,
      phone: phone || "",
      school: school || "",
      department: department || "",
      rollNo: rollNo || "",
      semester: semester ? Number(semester) : 1,
      enrollmentYear: enrollmentYear ? Number(enrollmentYear) : null,
      domain: domain || "",
      interests: Array.isArray(interests) ? interests : [],
      specializations: Array.isArray(specializations) ? specializations : [],
      status: role === "admin" ? "approved" : "pending",
      isApproved: role === "admin",
      approvedAt: role === "admin" ? new Date() : null,
    };

    // Save to MongoDB
    const newUser = await User.findOneAndUpdate(
      { uid: req.user.uid },
      userData,
      { upsert: true, new: true }
    );

    if (role === "candidate") {
      sendAdminNewUserAuthNotification(userData).catch(err => console.error("❌ Notification error:", err));
    }

    return res.json({
      success: true,
      message: `${role} registered successfully in MongoDB`,
      data: newUser,
    });

  } catch (error) {
    console.error("❌ ERROR in saveUser:", error);
    return res.status(500).json({ success: false, message: "Error saving user to MongoDB", error: error.message });
  }
});

// ✅ GET USER — fetch profile after login
router.get("/getUser", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      return res.status(404).json({ message: "User not found in MongoDB" });
    }
    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching user from MongoDB" });
  }
});

// 🔄 UPDATE PROFILE
router.put("/updateProfile", verifyToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const updateData = { ...req.body };
    delete updateData.uid; // Security
    delete updateData.role; // Security
    
    const existing = await User.findOne({ uid });
    if (!existing) {
      return res.status(404).json({ message: "User not found" });
    }

    const wasRejected = existing.status === "rejected";
    if (wasRejected) {
      updateData.status = "pending";
      updateData.isApproved = false;
      updateData.resubmittedAt = new Date();
      
      sendAdminNewUserAuthNotification({ ...existing.toObject(), ...updateData })
        .catch(err => console.error("❌ Notification error:", err));
    }

    const updatedUser = await User.findOneAndUpdate(
      { uid },
      { $set: updateData },
      { new: true }
    );

    return res.json({ success: true, message: "Profile updated in MongoDB", data: updatedUser });
  } catch (error) {
    console.error("❌ Profile Update Error:", error);
    return res.status(500).json({ message: "Error updating MongoDB profile" });
  }
});

// 🔐 ADMIN ONLY — get all candidates
router.get("/allCandidates", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: "candidate" });
    return res.json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching candidates" });
  }
});

// 🔐 ADMIN ONLY — delete candidate
router.delete("/candidate/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    return res.json({ message: "Candidate deleted from MongoDB" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error deleting candidate" });
  }
});

// 🔐 ADMIN ONLY — update candidate
router.put("/candidate/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, req.body);
    return res.json({ message: "Candidate updated in MongoDB" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating candidate" });
  }
});

// 🔐 ADMIN ONLY — analytics
router.get("/analytics", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const totalCandidates = await User.countDocuments({ role: "candidate" });
    const candidates = await User.find({ role: "candidate" });

    let schoolCount = {};
    let departmentCount = {};
    let interestCount = {};
    let specializationCount = {};

    candidates.forEach((user) => {
      if (user.school) schoolCount[user.school] = (schoolCount[user.school] || 0) + 1;
      if (user.department) departmentCount[user.department] = (departmentCount[user.department] || 0) + 1;
      if (user.interests) user.interests.forEach(i => interestCount[i] = (interestCount[i] || 0) + 1);
      if (user.specializations) user.specializations.forEach(s => specializationCount[s] = (specializationCount[s] || 0) + 1);
    });

    return res.json({ totalCandidates, schoolCount, departmentCount, interestCount, specializationCount });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error generating MongoDB analytics" });
  }
});

// 🔐 ADMIN ONLY — APPROVE CANDIDATE
router.patch("/candidate/:id/approve", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, {
      isApproved: true,
      status: "approved",
      approvedAt: new Date()
    }, { new: true });

    if (!user) return res.status(404).json({ message: "Candidate not found" });

    await sendApprovalEmail(user.email, user.fullName);
    return res.json({ success: true, message: "Approved in MongoDB" });
  } catch (error) {
    console.error("❌ Approval Error:", error);
    return res.status(500).json({ message: "Error approving candidate" });
  }
});

// 🔐 ADMIN ONLY — REJECT CANDIDATE
router.patch("/candidate/:id/reject", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, {
      isApproved: false,
      status: "rejected",
      rejectionRemarks: req.body.remarks || "",
      rejectedAt: new Date()
    }, { new: true });

    if (!user) return res.status(404).json({ message: "Candidate not found" });

    sendRejectionEmail(user.email, user.fullName, req.body.remarks).catch(e => console.error(e));
    return res.json({ success: true, message: "Rejected in MongoDB" });
  } catch (error) {
    console.error("❌ Rejection Error:", error);
    return res.status(500).json({ message: "Error rejecting candidate" });
  }
});

module.exports = router;