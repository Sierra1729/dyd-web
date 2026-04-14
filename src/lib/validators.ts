import { z } from "zod";

export const candidateSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email"),
  fatherName: z.string().trim().min(2, "Father's name is required").max(100),
  rollNo: z.string().trim().regex(/^DYD-(23|24|25|26)-\d+$/, "Format: DYD-YY-NN (e.g., DYD-24-123)"),
  enrollmentYear: z.coerce.number().min(23).max(26),
  semester: z.coerce.number().min(1).max(8),
  domain: z.string().trim().optional(),
  dateOfBirth: z.date({ required_error: "Date of birth is required" }),
  phone: z.string().trim().regex(/^\+?[0-9]{10,15}$/, "Enter a valid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => {
  if (data.enrollmentYear === 23 && data.semester >= 5) {
    return !!data.domain && data.domain.length >= 2;
  }
  return true;
}, {
  message: "Major Domain is required for your Year/Semester",
  path: ["domain"],
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const adminSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email").refine(
    (val) => val.endsWith("@jammuuniversity.ac.in"),
    "Only @jammuuniversity.ac.in emails allowed"
  ),
  phone: z.string().trim().regex(/^\+?[0-9]{10,15}$/, "Enter a valid phone number"),
  department: z.enum(["CS", "Math", "Physics", "Chemistry", "Biology", "English", "Economics"], {
    required_error: "Please select a department",
  }),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Please enter a valid email"),
});

export type CandidateData = z.infer<typeof candidateSchema>;
export type AdminData = z.infer<typeof adminSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
