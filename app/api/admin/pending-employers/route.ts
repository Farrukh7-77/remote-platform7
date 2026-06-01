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
      `SELECT id, email, name, role, company_name, voen, verification_status, created_at, email_verified_at
       FROM users 
       WHERE role = 'employer' AND verification_status = 'pending' AND is_verified = true
       ORDER BY created_at ASC`
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
      await pool.query(
        `UPDATE users 
         SET verification_status = 'rejected', 
             verified_by = $1, 
             verified_at = NOW(),
             rejection_reason = $2
         WHERE id = $3`,
        [decoded.userId, rejectionReason || "No reason provided", userId]
      );
      return NextResponse.json({ success: true, message: "Employer rejected" });
      
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Update employer verification error:", error);
    return NextResponse.json({ error: "Failed to update employer" }, { status: 500 });
  }
}