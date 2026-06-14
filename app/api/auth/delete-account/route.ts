// app/api/auth/delete-account/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from "@/lib/db";

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const email = session.user.email;
    
    const userResult = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    const userId = userResult.rows[0]?.id;
    
    if (userId) {
      await pool.query("DELETE FROM applications WHERE user_id = $1", [userId]);
      await pool.query("DELETE FROM saved_jobs WHERE user_id = $1", [userId]);
      
      const roleResult = await pool.query("SELECT role FROM users WHERE id = $1", [userId]);
      if (roleResult.rows[0]?.role === "employer") {
        await pool.query("DELETE FROM jobs WHERE posted_by = $1", [userId]);
      }
    }
    
    await pool.query("DELETE FROM job_views WHERE user_email = $1", [email]);
    await pool.query("DELETE FROM reset_tokens WHERE email = $1", [email]);
    await pool.query("DELETE FROM verification_tokens WHERE email = $1", [email]);
    await pool.query("DELETE FROM users WHERE email = $1", [email]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}