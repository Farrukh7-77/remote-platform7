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

// GET - İstifadəçinin bütün saved job id-lərini qaytar
export async function GET(req: NextRequest) {
  const userId = await getUserIdFromToken(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await pool.query(
      "SELECT job_id FROM saved_jobs WHERE user_id = $1",
      [userId]
    );
    const savedJobIds = result.rows.map(row => row.job_id);
    return NextResponse.json({ savedJobIds });
  } catch (error) {
    console.error("Error fetching saved jobs:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// POST - Job-u save et
export async function POST(req: NextRequest) {
  const userId = await getUserIdFromToken(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { jobId } = await req.json();
    
    await pool.query(
      "INSERT INTO saved_jobs (user_id, job_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [userId, jobId]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving job:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// DELETE - Job-u unsave et
export async function DELETE(req: NextRequest) {
  const userId = await getUserIdFromToken(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { jobId } = await req.json();
    
    await pool.query(
      "DELETE FROM saved_jobs WHERE user_id = $1 AND job_id = $2",
      [userId, jobId]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unsaving job:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}