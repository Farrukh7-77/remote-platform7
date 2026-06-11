import { NextResponse } from "next/server";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // BÜTÜN sahələri SELECT et
    const result = await pool.query(
      `SELECT 
        id, email, name, role, 
        avatar, company_logo,
        company_name, company_website, company_description, 
        company_location, company_size, company_industry, company_linkedin,
        voen, verification_status,
        profile_location, profile_bio, profile_linkedin, 
        profile_github, profile_portfolio, profile_job_status,
        password, is_verified, is_active, blocked_at, token_version
       FROM users 
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const user = result.rows[0];

    // İstifadəçi bloklanıbsa?
    if (!user.is_active) {
      return NextResponse.json({ error: "Your account has been blocked. Please contact support." }, { status: 403 });
    }

    // Email təsdiqlənib?
    if (!user.is_verified) {
      return NextResponse.json({ error: "Please verify your email address first" }, { status: 401 });
    }

    // Employer üçün admin təsdiqi yoxlanılır
    if (user.role === "employer") {
      if (user.verification_status === "pending") {
        return NextResponse.json({ 
          error: "Your account is pending admin approval. Please wait for verification." 
        }, { status: 403 });
      }
      
      if (user.verification_status === "rejected") {
        return NextResponse.json({ 
          error: "Your account verification was rejected. Please contact support." 
        }, { status: 403 });
      }
    }

    // Şifrəni bcrypt ilə yoxla
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Şifrəni cavabdan çıxar
    const { password: _, token_version, ...userWithoutPassword } = user;

    // JWT token yarat - token_version da daxil et
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role,
        tokenVersion: user.token_version || 0
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json({ success: true, user: userWithoutPassword, token });
  } catch (error) {
    console.error("Signin error:", error);
    return NextResponse.json({ error: "Failed to sign in" }, { status: 500 });
  }
}