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

    // Check if email already EXISTS and ALREADY VERIFIED
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND is_verified = true", 
      [email]
    );
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Check if there's a pending verification token
    const existingToken = await pool.query(
      "SELECT * FROM verification_tokens WHERE email = $1",
      [email]
    );
    
    if (existingToken.rows.length > 0) {
      // Delete old token
      await pool.query("DELETE FROM verification_tokens WHERE email = $1", [email]);
    }

    // Create verification token (expires in 24 hours)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Store verification data (NOT in users table yet!)
    await pool.query(
      `INSERT INTO verification_tokens (email, token, expires_at, user_data) 
       VALUES ($1, $2, $3, $4)`,
      [email, token, expiresAt, JSON.stringify({ password, name, role, companyName })]
    );

    // Send verification email
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