import { NextResponse } from "next/server";
import pool from "@/lib/db";

// POST metodu (iş elanı yaratmaq)
export async function POST(request: Request) {
  try {
    const { 
      title, company, companyLogo, companyLogoBgColor, location, type, 
      category, experience_level, salaryMin, salaryMax, description, 
      requirements, postedBy, applyType, applyUrl, is_featured 
    } = await request.json();

    const result = await pool.query(
      `INSERT INTO jobs (
        title, company, company_logo, company_logo_bg_color, location, type, 
        category, experience_level, salary_min, salary_max, description, 
        requirements, posted_by, apply_type, apply_url, is_featured,
        is_verified, status, created_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW())
       RETURNING *`,
      [
        title, company, companyLogo, companyLogoBgColor, location, type, 
        category, experience_level, salaryMin, salaryMax, description, 
        requirements, postedBy, applyType, applyUrl, is_featured || false,
        false,        // is_verified = false
        'pending'     // status = 'pending'
      ]
    );

    return NextResponse.json({ success: true, job: result.rows[0] });
  } catch (error) {
    console.error("Create job error:", error);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}

// GET metodu (iş elanlarını qaytarır - filtrasiya ilə)
// GET metodu (iş elanlarını qaytarır - filtrasiya ilə)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    
    let query = `
      SELECT 
        j.id, j.title, j.company, j.company_logo, j.company_logo_bg_color, 
        j.location, j.type, j.category, j.experience_level, 
        j.salary_min, j.salary_max, j.description, j.requirements,
        j.posted_at, j.is_featured, j.posted_by, j.apply_type, j.apply_url,
        j.views, j.is_verified, j.status,
        c.logo as company_logo_from_companies
      FROM jobs j
      LEFT JOIN companies c ON j.posted_by = c.email
      WHERE j.is_verified = true AND j.status = 'approved'
    `;
    
    const params: any[] = [];
    
    if (companyId) {
      query += ` AND j.posted_by = (SELECT email FROM companies WHERE id = $1)`;
      params.push(companyId);
    }
    
    query += ` ORDER BY j.posted_at DESC`;
    
    const result = await pool.query(query, params);
    
    const jobs = result.rows.map((job: any) => ({
      ...job,
      company_logo: job.company_logo_from_companies || job.company_logo,
      views_count: job.views || 0,
      applicants_count: job.applicants_count || 0
    }));
    
    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Get jobs error:", error);
    return NextResponse.json({ error: "Failed to get jobs" }, { status: 500 });
  }
}