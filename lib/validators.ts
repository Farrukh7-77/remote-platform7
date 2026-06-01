import { z } from "zod";

// Parol validasiyası - SADƏLƏŞDİRİLMİŞ
// Tələblər: minimum 12 simvol, 1 böyük hərf, 1 xüsusi simvol

// Şifrə gücü validasiyası üçün regex
const passwordRegex = /^(?=.*[A-Z])(?=.*[@$!%*?&]).{12,}$/;

export const signUpSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string()
      .min(12, "Password must be at least 12 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[@$!%*?&]/, "Password must contain at least one special character (@$!%*?&)"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    role: z.enum(["jobseeker", "employer"]),
    companyName: z.string().optional(),
    // VÖEN (yalnız employer üçün tələb olunur)
    voen: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Employer üçün VÖEN tələb olunur
    if (data.role === "employer" && (!data.voen || data.voen.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "VAT number is required for employers",
        path: ["voen"],
      });
    }
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

// Şifrə sıfırlama validasiyası
export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Şifrə yeniləmə validasiyası
export const updatePasswordSchema = z
  .object({
    password: z.string()
      .min(12, "Password must be at least 12 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[@$!%*?&]/, "Password must contain at least one special character (@$!%*?&)"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Profil yeniləmə validasiyası
export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  companyName: z.string().optional(),
  companyWebsite: z.string().url("Invalid website URL").optional().or(z.literal("")),
  companyDescription: z.string().optional(),
  companyLocation: z.string().optional(),
  companySize: z.string().optional(),
  companyIndustry: z.string().optional(),
  companyLinkedin: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
});