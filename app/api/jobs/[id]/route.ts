// app/api/jobs/[id]/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET - İş elanını ID ilə tap
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const result = await pool.query(
      `SELECT id, title, company, company_logo, company_logo_bg_color, location, type, 
              salary_min, salary_max, description, requirements, posted_at, is_featured, 
              posted_by, apply_type, apply_url 
       FROM jobs WHERE id = $1`,
      [id]
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

// PATCH - İş elanını yenilə (is_featured dəyişdirmək üçün)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { is_featured } = await request.json();

    const result = await pool.query(
      `UPDATE jobs SET is_featured = $1 WHERE id = $2 RETURNING *`,
      [is_featured, id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, job: result.rows[0] });
  } catch (error) {
    console.error("PATCH job error:", error);
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
  }
}

// DELETE - İş elanını sil
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const result = await pool.query(`DELETE FROM jobs WHERE id = $1 RETURNING id`, [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE job error:", error);
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}