// app/api/auth/signin/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Əvvəlcə istifadəçini email ilə tap (şifrəni də götür)
    const result = await pool.query(
      `SELECT id, email, name, role, company_name, avatar, company_logo, password, is_verified 
       FROM users 
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const user = result.rows[0];

    // Email təsdiqlənib?
    if (!user.is_verified) {
      return NextResponse.json({ error: "Please verify your email address first" }, { status: 401 });
    }

    // Şifrəni bcrypt ilə yoxla
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Şifrəni cavabdan çıxar
    const { password: _, ...userWithoutPassword } = user;

    // JWT token yarat
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json({ success: true, user: userWithoutPassword, token });
  } catch (error) {
    console.error("Signin error:", error);
    return NextResponse.json({ error: "Failed to sign in" }, { status: 500 });
  }
}