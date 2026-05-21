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

    // Check if user exists
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Create user (is_verified = false)
    const userResult = await pool.query(
      `INSERT INTO users (email, password, name, role, company_name, is_verified) 
       VALUES ($1, $2, $3, $4, $5, false) RETURNING id, email, name, role, company_name`,
      [email, password, name, role, companyName || null]
    );

    // If employer, add to companies table
    if (role === "employer" && companyName) {
      await pool.query(
        `INSERT INTO companies (email, name) 
         VALUES ($1, $2)
         ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name`,
        [email, companyName]
      );
    }

    // Create verification token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await pool.query(
      `INSERT INTO verification_tokens (email, token, expires_at) VALUES ($1, $2, $3)`,
      [email, token, expiresAt]
    );

    // Send verification email
    await sendVerificationEmail(email, token);

    return NextResponse.json({ 
      success: true, 
      user: userResult.rows[0],
      message: "Verification email sent! Please check your inbox."
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}