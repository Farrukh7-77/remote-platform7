// app/api/companies/email/[email]/route.ts - NEW API endpoint
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const { email } = await params;
    
    const result = await pool.query(
      `SELECT id, email, name, logo, industry, location, size, description, website, linkedin
       FROM companies 
       WHERE email = $1`,
      [email]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Get company by email error:", error);
    return NextResponse.json({ error: "Failed to get company" }, { status: 500 });
  }
}