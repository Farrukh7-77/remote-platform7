// app/api/applications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// İstifadəçini token-dan tap
async function getUserIdFromToken(req: NextRequest): Promise<number | null> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];
  
  if (!token) return null;
  
  try {
    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
    return payload.userId || payload.id;
  } catch {
    return null;
  }
}

// GET - İstifadəçinin bütün applications-larını qaytar
export async function GET(req: NextRequest) {
  const userId = await getUserIdFromToken(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await pool.query(
      `SELECT a.*, j.title, j.company, j.location, j.type, j.category 
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE a.user_id = $1
       ORDER BY a.applied_at DESC`,
      [userId]
    );
    
    return NextResponse.json({ applications: result.rows });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// POST - Yeni application yarat
export async function POST(req: NextRequest) {
  const userId = await getUserIdFromToken(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { jobId, fullName, email, phone, coverLetter, resumeUrl, portfolioUrl, linkedinUrl } = body;

    // Əvvəlcə bu işə artıq müraciət edilibmi yoxla
    const existing = await pool.query(
      "SELECT id FROM applications WHERE user_id = $1 AND job_id = $2",
      [userId, jobId]
    );
    
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "You have already applied to this job" }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO applications (user_id, job_id, full_name, email, phone, cover_letter, resume_url, portfolio_url, linkedin_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [userId, jobId, fullName, email, phone, coverLetter, resumeUrl, portfolioUrl, linkedinUrl]
    );
    
    return NextResponse.json({ application: result.rows[0], success: true });
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}