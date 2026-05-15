// app/api/auth/update-profile/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email, updates } = await request.json();

    // Allowed fields for users table
    const allowedFields = ["name", "avatar", "company_name", "company_website", "company_description", "company_location", "company_size", "company_industry", "company_linkedin", "company_logo"];
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

    // Update users table
    if (setClauses.length > 0) {
      values.push(email);
      const query = `UPDATE users SET ${setClauses.join(", ")} WHERE email = $${i} RETURNING id, email, name, role, company_name, avatar, company_website, company_description, company_location, company_size, company_industry, company_linkedin, company_logo`;
      const result = await pool.query(query, values);
      
      // Update companies table if employer data changed
      const user = result.rows[0];
      if (user.role === "employer") {
        const companyFields = [];
        const companyValues = [];
        let j = 1;
        
        if (updates.company_name) { companyFields.push(`name = $${j}`); companyValues.push(updates.company_name); j++; }
        if (updates.company_industry) { companyFields.push(`industry = $${j}`); companyValues.push(updates.company_industry); j++; }
        if (updates.company_location) { companyFields.push(`location = $${j}`); companyValues.push(updates.company_location); j++; }
        if (updates.company_size) { companyFields.push(`size = $${j}`); companyValues.push(updates.company_size); j++; }
        if (updates.company_description) { companyFields.push(`description = $${j}`); companyValues.push(updates.company_description); j++; }
        if (updates.company_website) { companyFields.push(`website = $${j}`); companyValues.push(updates.company_website); j++; }
        if (updates.company_linkedin) { companyFields.push(`linkedin = $${j}`); companyValues.push(updates.company_linkedin); j++; }
        if (updates.company_logo) { companyFields.push(`logo = $${j}`); companyValues.push(updates.company_logo); j++; }
        
        if (companyFields.length > 0) {
          companyValues.push(email);
          const companyQuery = `UPDATE companies SET ${companyFields.join(", ")} WHERE email = $${j}`;
          await pool.query(companyQuery, companyValues);
        }
      }
      
      return NextResponse.json({ success: true, user });
    } else {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}