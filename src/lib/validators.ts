import { z } from "zod";

export const candidateSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email"),
  fatherName: z.string().trim().min(2, "Father's name is required").max(100),
  institution: z.string().trim().min(2, "Institution is required").max(200),
  dateOfBirth: z.date({ required_error: "Date of birth is required" }),
  phone: z.string().trim().regex(/^\+?[0-9]{10,15}$/, "Enter a valid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
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
