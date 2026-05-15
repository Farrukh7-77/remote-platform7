// app/api/jobs/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { title, company, companyLogo, companyLogoBgColor, location, type, salaryMin, salaryMax, description, requirements, postedBy, applyType, applyUrl } = await request.json();

    const result = await pool.query(
      `INSERT INTO jobs (title, company, company_logo, company_logo_bg_color, location, type, salary_min, salary_max, description, requirements, posted_by, apply_type, apply_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [title, company, companyLogo, companyLogoBgColor, location, type, salaryMin, salaryMax, description, requirements, postedBy, applyType, applyUrl]
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
      `SELECT id, title, company, company_logo, company_logo_bg_color, location, type, 
              salary_min, salary_max, description, requirements, posted_at, featured, 
              posted_by, apply_type, apply_url 
       FROM jobs ORDER BY posted_at DESC`
    );
    return NextResponse.json({ jobs: result.rows });
  } catch (error) {
    console.error("Get jobs error:", error);
    return NextResponse.json({ error: "Failed to get jobs" }, { status: 500 });
  }
}