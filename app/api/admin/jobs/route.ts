import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// GET /api/admin/jobs - Bütün iş elanlarını admin üçün gətir
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let query = `
      SELECT 
        j.*,
        u.email as posted_by_email,
        u.name as posted_by_name,
        admin.email as verified_by_email,
        admin.name as verified_by_name
      FROM jobs j
      LEFT JOIN users u ON j.posted_by = u.email
      LEFT JOIN users admin ON j.verified_by = admin.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (status && status !== "all") {
      if (status === "approved") {
        query += ` AND j.is_verified = true`;
      } else if (status === "rejected") {
        query += ` AND j.status = 'rejected'`;
      } else if (status === "pending") {
        query += ` AND j.is_verified = false AND (j.status IS NULL OR j.status != 'rejected')`;
      }
    }

    if (search) {
      query += ` AND (j.title ILIKE $${paramIndex} OR j.company ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY j.created_at DESC`;

    const result = await pool.query(query, params);

    return NextResponse.json({ 
      success: true, 
      jobs: result.rows,
      total: result.rows.length 
    });
  } catch (error) {
    console.error("Admin get jobs error:", error);
    return NextResponse.json({ error: "Failed to get jobs" }, { status: 500 });
  }
}

// PUT /api/admin/jobs - İş elanını təsdiqlə və ya rədd et
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { jobId, action } = body;

    if (!jobId) {
      return NextResponse.json({ error: "Job ID required" }, { status: 400 });
    }

    if (action === "verify") {
      const result = await pool.query(
        `UPDATE jobs 
         SET is_verified = true, 
             status = 'approved', 
             verified_by = $1, 
             verified_at = NOW() 
         WHERE id = $2 
         RETURNING *`,
        [decoded.userId, jobId]
      );
      
      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }
      
      return NextResponse.json({ success: true, job: result.rows[0] });
      
    } else if (action === "reject") {
      const result = await pool.query(
        `UPDATE jobs 
         SET status = 'rejected', 
             verified_by = $1, 
             verified_at = NOW() 
         WHERE id = $2 
         RETURNING *`,
        [decoded.userId, jobId]
      );
      
      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }
      
      return NextResponse.json({ success: true, job: result.rows[0] });
      
    } else {
      return NextResponse.json({ error: "Invalid action. Use 'verify' or 'reject'" }, { status: 400 });
    }
  } catch (error) {
    console.error("Admin verify/reject job error:", error);
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
  }
}

// DELETE /api/admin/jobs - İş elanını sil
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("id");

    if (!jobId) {
      return NextResponse.json({ error: "Job ID required" }, { status: 400 });
    }

    await pool.query(`DELETE FROM applications WHERE job_id = $1`, [jobId]);
    await pool.query(`DELETE FROM saved_jobs WHERE job_id = $1`, [jobId]);
    
    const result = await pool.query(`DELETE FROM jobs WHERE id = $1 RETURNING *`, [jobId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: "Job deleted successfully" });
  } catch (error) {
    console.error("Admin delete job error:", error);
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}