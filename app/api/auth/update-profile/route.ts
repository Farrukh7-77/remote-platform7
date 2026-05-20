import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email, updates } = await request.json();

    const allowedFields = ["name", "company_name", "company_website", "company_description", "company_location", "company_size", "company_industry", "company_linkedin", "avatar"];
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        const dbField = field;
        updateFields.push(`${dbField} = $${paramIndex}`);
        values.push(updates[field]);
        paramIndex++;
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(email);
    const query = `UPDATE users SET ${updateFields.join(", ")} WHERE email = $${paramIndex} RETURNING id, email, name, role, company_name, avatar`;

    const result = await pool.query(query, values);
    
    return NextResponse.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}