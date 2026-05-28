// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcrypt";
import { signUpSchema } from "@/lib/validators";
import { sendVerificationEmail } from "@/lib/sendEmail";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    console.log("🔵 Step 1: Parsing request body...");
    const body = await req.json();
    console.log("📧 Email:", body.email);
    
    // Validasiya
    console.log("🔵 Step 2: Validating input...");
    const validation = signUpSchema.safeParse(body);
    if (!validation.success) {
  const firstError = validation.error.issues?.[0]?.message || "Validation failed";
  console.log("❌ Validation failed:", firstError);
  return NextResponse.json(
    { error: firstError },
    { status: 400 }
  );
}
    
    const { email, password, name, role, companyName } = body;
    
    // Email artıq verification_tokens cədvəlində gözləyir? 
    console.log("🔵 Step 3: Checking existing tokens...");
    const existingToken = await pool.query(
      "SELECT * FROM verification_tokens WHERE email = $1",
      [email]
    );
    
    if (existingToken.rows.length > 0) {
      console.log("🗑️ Deleting old token for:", email);
      await pool.query("DELETE FROM verification_tokens WHERE email = $1", [email]);
    }
    
    // Email artıq users cədvəlində var?
    console.log("🔵 Step 4: Checking existing users...");
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      console.log("❌ User already exists:", email);
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }
    
    // Şifrəni hash et
    console.log("🔵 Step 5: Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("✅ Password hashed");
    
    // Verification token yarat
    console.log("🔵 Step 6: Creating verification token...");
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24);
    console.log("✅ Token created:", verificationToken.substring(0, 10) + "...");
    
    // İstifadəçi məlumatlarını JSON olaraq saxla
    const userData = JSON.stringify({
      email,
      password: hashedPassword,
      name,
      role,
      companyName: companyName || null
    });
    
    // Tokeni verification_tokens cədvəlinə yaz
    console.log("🔵 Step 7: Saving to database...");
    await pool.query(
      `INSERT INTO verification_tokens (token, email, expires_at, user_data)
       VALUES ($1, $2, $3, $4)`,
      [verificationToken, email, tokenExpiry, userData]
    );
    console.log("✅ Token saved to database");
    
    // Email göndər
    console.log("🔵 Step 8: Sending verification email...");
    await sendVerificationEmail(email, verificationToken);
    console.log("✅ Email sent successfully!");
    
    return NextResponse.json(
      { message: "Verification email sent. Please check your inbox." },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Signup error DETAILS:", error);
    return NextResponse.json(
      { error: "Internal server error: " + (error as Error).message },
      { status: 500 }
    );
  }
}