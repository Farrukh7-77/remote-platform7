// app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email, password, name, role, companyName } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Create user
    const userResult = await pool.query(
      `INSERT INTO users (email, password, name, role, company_name) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, role, company_name`,
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

    return NextResponse.json({ success: true, user: userResult.rows[0] });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}