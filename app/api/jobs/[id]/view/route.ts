import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const jobId = parseInt(id);
    
    if (isNaN(jobId)) {
      return NextResponse.json({ error: "Invalid job ID" }, { status: 400 });
    }

    const body = await request.json();
    const { userEmail, sessionId } = body;

    // Heç bir identifikator yoxdursa, rədd et
    if (!userEmail && !sessionId) {
      return NextResponse.json({ error: "No identifier provided" }, { status: 400 });
    }

    // Yoxla ki, bu istifadəçi/session bu elana əvvəl baxıbmı
    let alreadyViewed = false;
    
    if (userEmail) {
      const result = await pool.query(
        `SELECT 1 FROM job_views WHERE job_id = $1 AND user_email = $2 LIMIT 1`,
        [jobId, userEmail]
      );
      alreadyViewed = result.rows.length > 0;
    } else if (sessionId) {
      const result = await pool.query(
        `SELECT 1 FROM job_views WHERE job_id = $1 AND session_id = $2 LIMIT 1`,
        [jobId, sessionId]
      );
      alreadyViewed = result.rows.length > 0;
    }

    // Əgər əvvəl baxıbsa, heç nə etmə
    if (alreadyViewed) {
      return NextResponse.json({ success: true, alreadyViewed: true });
    }

    // Yeni baxış əlavə et
    await pool.query(
      `INSERT INTO job_views (user_email, session_id, job_id) VALUES ($1, $2, $3)`,
      [userEmail || null, sessionId || null, jobId]
    );

    // jobs.views sütununu 1 artır
    await pool.query(
      `UPDATE jobs SET views = COALESCE(views, 0) + 1 WHERE id = $1`,
      [jobId]
    );

    return NextResponse.json({ success: true, alreadyViewed: false });
  } catch (error) {
    console.error("Record view error:", error);
    return NextResponse.json({ error: "Failed to record view" }, { status: 500 });
  }
}