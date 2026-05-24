import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { sendVerificationEmail } from "@/lib/sendEmail";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { email, password, name, role, companyName } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Yalnız təsdiqlənmiş istifadəçiləri yoxla
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Köhnə token varsa sil
    await pool.query("DELETE FROM verification_tokens WHERE email = $1", [email]);

    // Token yarat
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // İstifadəçi məlumatlarını JSON string olaraq saxla
    const userData = JSON.stringify({ email, password, name, role, companyName });

    await pool.query(
      `INSERT INTO verification_tokens (email, token, expires_at, user_data) 
       VALUES ($1, $2, $3, $4)`,
      [email, token, expiresAt, userData]
    );

    // Email göndər
    await sendVerificationEmail(email, token);

    return NextResponse.json({ 
      success: true, 
      message: "Verification email sent! Please check your inbox to activate your account."
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}