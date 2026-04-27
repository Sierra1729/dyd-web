const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true }, // Firebase UID link
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ["candidate", "admin"], default: "candidate" },
  
  // Personal Details
  fullName: { type: String, default: "" },
  fatherName: { type: String, default: "" },
  dob: { type: Date },
  phone: { type: String, default: "" },
  photoURL: { type: String, default: "" },

  // Academic Details
  school: { type: String, default: "" },
  department: { type: String, default: "" },
  semester: { type: Number, default: 1 },
  rollNo: { type: String, default: "" },
  enrollmentYear: { type: Number },
  domain: { type: String, default: "" },
  
  // Portfolio Content
  professionalSummary: { type: String, default: "" },
  skills: [{ type: String }],
  projects: [{
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    stack: [{ type: String }],
    link: { type: String, default: "" }
  }],
  certifications: [{
    name: { type: String, default: "" },
    issuer: { type: String, default: "" },
    year: { type: String, default: "" }
  }],
  semesters: [{
    id: { type: Number },
    cgpa: { type: String, default: "" },
    marksheetUrl: { type: String, default: "" }
  }],

  // Socials
  githubUrl: { type: String, default: "" },
  linkedinUrl: { type: String, default: "" },

  // Approval System
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  isApproved: { type: Boolean, default: false },
  rejectionRemarks: { type: String, default: "" },
  approvedAt: { type: Date },
  rejectedAt: { type: Date },
  resubmittedAt: { type: Date },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware to update the updatedAt field
UserSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("User", UserSchema);
