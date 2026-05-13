// app/api/auth/update-profile/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email, updates } = await request.json();

    const allowedFields = ["name", "avatar", "company_name", "company_website", "company_description", "company_location", "company_size", "company_industry", "company_linkedin"];
    const setClauses = [];
    const values = [];
    let i = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClauses.push(`${key} = $${i}`);
        values.push(value);
        i++;
      }
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    values.push(email);
    const query = `UPDATE users SET ${setClauses.join(", ")} WHERE email = $${i} RETURNING id, email, name, role, company_name, avatar, company_website, company_description, company_location, company_size, company_industry, company_linkedin`;
    const result = await pool.query(query, values);

    return NextResponse.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}