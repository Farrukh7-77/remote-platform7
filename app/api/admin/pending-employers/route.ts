import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// GET - Gözləyən employer-ləri gətir
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

    const result = await pool.query(
      `SELECT 
        u.id, u.email, u.name, u.role, u.company_name, u.voen, 
        u.verification_status, u.created_at, u.email_verified_at,
        c.industry, c.size as company_size, c.location, c.website, c.linkedin
       FROM users u
       LEFT JOIN companies c ON u.email = c.email
       WHERE u.role = 'employer' AND u.verification_status = 'pending' AND u.is_verified = true
       ORDER BY u.created_at ASC`
    );

    return NextResponse.json({ success: true, employers: result.rows });
  } catch (error) {
    console.error("Get pending employers error:", error);
    return NextResponse.json({ error: "Failed to get pending employers" }, { status: 500 });
  }
}

// PUT - Employer-i təsdiqlə və ya rədd et
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
    const { userId, action, rejectionReason } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: "User ID and action required" }, { status: 400 });
    }

    if (action === "approve") {
      await pool.query(
        `UPDATE users 
         SET verification_status = 'approved', 
             verified_by = $1, 
             verified_at = NOW() 
         WHERE id = $2`,
        [decoded.userId, userId]
      );
      return NextResponse.json({ success: true, message: "Employer approved" });
      
    } else if (action === "reject") {
      // İstifadəçinin email-i tap
      const userResult = await pool.query(
        `SELECT email FROM users WHERE id = $1`,
        [userId]
      );

      if (userResult.rows.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const userEmail = userResult.rows[0].email;

      // Transaction başla
      await pool.query('BEGIN');

      try {
        // Şirkəti sil (əgər varsa)
        await pool.query(
          `DELETE FROM companies WHERE email = $1`,
          [userEmail]
        );

        // İstifadəçini sil
        await pool.query(
          `DELETE FROM users WHERE id = $1`,
          [userId]
        );

        await pool.query('COMMIT');
        return NextResponse.json({ success: true, message: "Employer rejected and removed from database" });
      } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
      }
      
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Update employer verification error:", error);
    return NextResponse.json({ error: "Failed to update employer" }, { status: 500 });
  }
}