// app/api/jobs/[id]/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const jobId = parseInt(id);

    const result = await pool.query(
      `SELECT id, title, company, company_logo, company_logo_bg_color, 
              location, type, salary_min, salary_max, description, requirements, 
              posted_at, featured, posted_by, apply_type, apply_url 
       FROM jobs 
       WHERE id = $1`,
      [jobId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ job: result.rows[0] });
  } catch (error) {
    console.error("Get job error:", error);
    return NextResponse.json({ error: "Failed to get job" }, { status: 500 });
  }
}