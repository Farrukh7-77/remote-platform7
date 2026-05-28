// lib/validators.ts
import { z } from "zod";

// Parol validasiyası - SADƏLƏŞDİRİLMİŞ
// Tələblər: minimum 12 simvol, 1 böyük hərf, 1 xüsusi simvol
export const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(12, "Password must be at least 12 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[@$!%*?&]/, "Password must contain at least one special character (@$!%*?&)"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["job_seeker", "employer"]),
  companyName: z.string().optional(),
});

// İş elanı validasiyası
export const jobPostSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  company: z.string().min(2, "Company name is required"),
  location: z.string().min(2, "Location is required"),
  type: z.string().min(2, "Job type is required"),
  salary_min: z.number().positive().optional(),
  salary_max: z.number().positive().optional(),
  description: z.string().min(20, "Description must be at least 20 characters"),
  requirements: z.array(z.string()).min(1, "At least one requirement is needed"),
  category: z.string().optional(),
  apply_type: z.enum(["internal", "external"]),
  apply_url: z.string().url().optional(),
});

// Application validasiyası
export const applicationSchema = z.object({
  jobId: z.number().positive(),
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  coverLetter: z.string().optional(),
  resumeUrl: z.string().url().optional(),
});

// Login validasiyası
export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});