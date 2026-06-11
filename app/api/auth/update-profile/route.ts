import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email, updates } = await request.json();

    // İcazə verilən bütün sütunlar (həm job seeker, həm employer)
    const allowedFields = [
      "name", "avatar", "company_logo",
      "company_name", "company_industry", "company_location",
      "company_size", "company_website", "company_linkedin", "company_description",
      // YENİ: Job seeker üçün profile sütunları
      "profile_location", "profile_bio", "profile_linkedin", 
      "profile_github", "profile_portfolio", "profile_job_status"
    ];
    
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = $${paramIndex}`);
        values.push(updates[field]);
        paramIndex++;
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(email);
    const query = `UPDATE users SET ${updateFields.join(", ")} WHERE email = $${paramIndex} RETURNING *`;

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = result.rows[0];

    // İşəgötürəndirsə, companies cədvəlini də yenilə
    if (user.role === "employer") {
      const companyUpdates: string[] = [];
      const companyValues: any[] = [];
      let companyIndex = 1;

      const logoValue = updates.company_logo || updates.avatar;
      if (logoValue !== undefined) {
        companyUpdates.push(`logo = $${companyIndex}`);
        companyValues.push(logoValue);
        companyIndex++;
      }
      if (updates.company_name !== undefined) {
        companyUpdates.push(`name = $${companyIndex}`);
        companyValues.push(updates.company_name);
        companyIndex++;
      }
      if (updates.company_industry !== undefined) {
        companyUpdates.push(`industry = $${companyIndex}`);
        companyValues.push(updates.company_industry);
        companyIndex++;
      }
      if (updates.company_location !== undefined) {
        companyUpdates.push(`location = $${companyIndex}`);
        companyValues.push(updates.company_location);
        companyIndex++;
      }
      if (updates.company_size !== undefined) {
        companyUpdates.push(`size = $${companyIndex}`);
        companyValues.push(updates.company_size);
        companyIndex++;
      }
      if (updates.company_description !== undefined) {
        companyUpdates.push(`description = $${companyIndex}`);
        companyValues.push(updates.company_description);
        companyIndex++;
      }
      if (updates.company_website !== undefined) {
        companyUpdates.push(`website = $${companyIndex}`);
        companyValues.push(updates.company_website);
        companyIndex++;
      }
      if (updates.company_linkedin !== undefined) {
        companyUpdates.push(`linkedin = $${companyIndex}`);
        companyValues.push(updates.company_linkedin);
        companyIndex++;
      }

      if (companyUpdates.length > 0) {
        companyValues.push(email);
        const companyQuery = `UPDATE companies SET ${companyUpdates.join(", ")} WHERE email = $${companyIndex}`;
        await pool.query(companyQuery, companyValues);
      }
    }
    
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}