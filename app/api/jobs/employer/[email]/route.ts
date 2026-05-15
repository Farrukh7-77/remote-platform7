// app/api/jobs/employer/[email]/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const { email } = await params;
    const decodedEmail = decodeURIComponent(email);

    const result = await pool.query(
      `SELECT id, title, company, location, type, salary_min, salary_max, 
              description, posted_at, featured 
       FROM jobs 
       WHERE posted_by = $1 
       ORDER BY posted_at DESC`,
      [decodedEmail]
    );

    return NextResponse.json({ jobs: result.rows });
  } catch (error) {
    console.error("Get employer jobs error:", error);
    return NextResponse.json({ error: "Failed to get jobs" }, { status: 500 });
  }
}