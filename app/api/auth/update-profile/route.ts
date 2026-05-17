// app/api/auth/update-profile/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email, updates } = await request.json();

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

    if (setClauses.length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    values.push(email);
    const query = `UPDATE users SET ${setClauses.join(", ")} WHERE email = $${i} RETURNING id, email, name, role, company_name, avatar, company_website, company_description, company_location, company_size, company_industry, company_linkedin, company_logo`;
    const result = await pool.query(query, values);
    const user = result.rows[0];

    if (user.role === "employer") {
      // Parametrli şəkildə companies cədvəlini yenilə
      const companyValues: any[] = [
        email,
        updates.company_name || user.company_name || "",
        updates.company_industry || null,
        updates.company_location || null,
        updates.company_size || null,
        updates.company_description || null,
        updates.company_website || null,
        updates.company_linkedin || null,
        updates.company_logo || null,
      ];

      await pool.query(
        `INSERT INTO companies (email, name, industry, location, size, description, website, linkedin, logo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (email) DO UPDATE SET
           name = EXCLUDED.name,
           industry = COALESCE(EXCLUDED.industry, companies.industry),
           location = COALESCE(EXCLUDED.location, companies.location),
           size = COALESCE(EXCLUDED.size, companies.size),
           description = COALESCE(EXCLUDED.description, companies.description),
           website = COALESCE(EXCLUDED.website, companies.website),
           linkedin = COALESCE(EXCLUDED.linkedin, companies.linkedin),
           logo = COALESCE(EXCLUDED.logo, companies.logo)`,
        companyValues
      );
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}