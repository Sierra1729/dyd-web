const express = require("express");
const router = express.Router();

const { admin, db } = require("../config/firebase");
const verifyToken = require("../middleware/auth");
const verifyAdmin = require("../middleware/admin");
const {
  sendApprovalEmail,
  sendRejectionEmail,
  sendAdminNewUserAuthNotification
} = require("../config/mailer");
const cloudinary = require("../config/cloudinary");
const multer = require("multer");

// 📁 Simple Memory Storage for uploads (we'll stream to Cloudinary)
const memoryStorage = multer.memoryStorage();
const upload = multer({ storage: memoryStorage });

// 🔐 Upload Marksheet
router.post("/upload/marksheet", verifyToken, upload.single("marksheet"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Stream upload to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "marksheets",
        resource_type: "raw", // Let Cloudinary decide, but handle manually if needed
        flags: "attachment", // Optional: allows direct download
      },
      (error, result) => {
        if (error) return res.status(500).json({ message: "Cloudinary upload failed", error });
        res.json({
          success: true,
          url: result.secure_url,
          public_id: result.public_id
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
});

// 🔐 Upload Profile Photo
router.post("/upload/profile-photo", verifyToken, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No photo uploaded" });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "avatars",
        resource_type: "image",
      },
      (error, result) => {
        if (error) return res.status(500).json({ message: "Cloudinary upload failed", error });
        res.json({
          success: true,
          url: result.secure_url,
          public_id: result.public_id
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    console.error("❌ Photo upload error:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
});

// 🔐 Upload Resume
router.post("/upload/resume", verifyToken, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No resume uploaded" });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "resumes",
        resource_type: "raw", // ✅ Changed from "auto" to "raw"
      },
      (error, result) => {
        if (error) return res.status(500).json({ message: "Cloudinary upload failed", error });
        res.json({
          success: true,
          url: result.secure_url,
          public_id: result.public_id
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    console.error("❌ Resume upload error:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
});


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

    // 📧 Notify Admin (Async)
    if (role === "candidate") {
      sendAdminNewUserAuthNotification(userData).catch(err => console.error("❌ Notification error:", err));
    }


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

    // ⚡️ FALLBACK: Check legacy 'users' collection (for older approved accounts)
    if (!doc.exists) {
      doc = await db.collection("users").doc(uid).get();
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
      professionalSummary,
      projects,
      skills,
      certifications,
      semesters,
      semester,
      photoURL,
      resumeURL,
      githubUrl,
      linkedinUrl,
      rollNo,
      enrollmentYear,
      domain,
    } = req.body;

    console.log("📥 updateProfile incoming semester:", semester);
    console.log("📥 updateProfile full body:", JSON.stringify(req.body, null, 2));

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
    const wasRejected = existing.status === "rejected";

    const updatedData = {
      fullName: fullName !== undefined ? fullName : existing.fullName,
      phone: phone !== undefined ? phone : existing.phone,
      dob: dob !== undefined ? dob : existing.dob,
      fatherName: fatherName !== undefined ? fatherName : existing.fatherName,
      school: school !== undefined ? school : existing.school,
      department: department !== undefined ? department : existing.department,
      interests: Array.isArray(interests) ? interests : (existing.interests || []),
      specializations: Array.isArray(specializations) ? specializations : (existing.specializations || []),

      // ✅ New Portfolio Fields (Explicit checks for precision)
      professionalSummary: professionalSummary !== undefined ? professionalSummary : (existing.professionalSummary || ""),
      projects: Array.isArray(projects) ? projects : (existing.projects || []),
      skills: Array.isArray(skills) ? skills : (existing.skills || []),
      certifications: Array.isArray(certifications) ? certifications : (existing.certifications || []),
      semesters: Array.isArray(semesters) ? semesters : (existing.semesters || []),
      semester: semester !== undefined ? Number(semester) : existing.semester,
      photoURL: photoURL !== undefined ? photoURL : existing.photoURL,
      resumeURL: resumeURL !== undefined ? resumeURL : existing.resumeURL,
      githubUrl: githubUrl !== undefined ? githubUrl : (existing.githubUrl || ""),
      linkedinUrl: linkedinUrl !== undefined ? linkedinUrl : (existing.linkedinUrl || ""),
      rollNo: rollNo !== undefined ? rollNo : (existing.rollNo || ""),
      enrollmentYear: enrollmentYear !== undefined ? enrollmentYear : (existing.enrollmentYear || ""),
      domain: domain !== undefined ? domain : (existing.domain || ""),

      updatedAt: new Date().toISOString(),
    };

    // 🔄 If user was rejected, reset to pending for re-approval
    if (wasRejected) {
      updatedData.status = "pending";
      updatedData.isApproved = false;
      updatedData.resubmittedAt = new Date().toISOString();

      // 📧 Notify Admin (Reuse notification logic)
      sendAdminNewUserAuthNotification({
        ...existing,
        ...updatedData,
        fullName: updatedData.fullName || existing.fullName,
        email: existing.email
      }).catch(err => console.error("❌ Notification error:", err));
    }

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
    const { remarks } = req.body;

    const docRef = db.collection("candidates").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const userData = doc.data();

    await docRef.update({
      isApproved: false,
      status: "rejected",
      rejectionRemarks: remarks || "",
      rejectedAt: new Date().toISOString(),
    });

    // 📧 Send Rejection Email (Async)
    sendRejectionEmail(userData.email, userData.fullName, remarks)
      .catch(err => console.error("❌ Rejection Email Error:", err));


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