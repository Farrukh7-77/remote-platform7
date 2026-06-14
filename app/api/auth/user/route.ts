import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const result = await pool.query(
      `SELECT id, email, name, role, avatar, company_name, company_website, 
              company_description, company_location, company_size, company_industry, 
              company_linkedin, voen, verification_status, is_verified,
              profile_location, profile_bio, profile_linkedin, profile_github, 
              profile_portfolio, profile_job_status
       FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: result.rows[0] });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json({ error: "Failed to get user" }, { status: 500 });
  }
}