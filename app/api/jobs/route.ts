// app/api/jobs/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { title, company, companyLogo, companyLogoBgColor, location, type, category, experience_level, salaryMin, salaryMax, description, requirements, postedBy, applyType, applyUrl, is_featured } = await request.json();

    const result = await pool.query(
      `INSERT INTO jobs (title, company, company_logo, company_logo_bg_color, location, type, category, experience_level, salary_min, salary_max, description, requirements, posted_by, apply_type, apply_url, is_featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
      [title, company, companyLogo, companyLogoBgColor, location, type, category, experience_level, salaryMin, salaryMax, description, requirements, postedBy, applyType, applyUrl, is_featured || false]
    );

    return NextResponse.json({ success: true, job: result.rows[0] });
  } catch (error) {
    console.error("Create job error:", error);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT 
        j.*,
        c.logo as company_logo_from_companies
       FROM jobs j
       LEFT JOIN companies c ON j.posted_by = c.email
       ORDER BY j.posted_at DESC`
    );
    
    // API-dən gələn məlumatlarda company_logo_from_companies varsa, onu istifadə edin
    const jobs = result.rows.map((job: any) => ({
      ...job,
      company_logo: job.company_logo_from_companies || job.company_logo
    }));
    
    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Get jobs error:", error);
    return NextResponse.json({ error: "Failed to get jobs" }, { status: 500 });
  }
}