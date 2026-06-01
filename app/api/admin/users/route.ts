import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// GET /api/admin/users - Bütün istifadəçiləri gətir
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
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    let query = `
      SELECT 
        id, email, name, role, avatar, 
        is_active, created_at, updated_at, blocked_at,
        company_name, company_website
      FROM users
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (role && role !== "all") {
      query += ` AND role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }

    if (search) {
      query += ` AND (email ILIKE $${paramIndex} OR name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, params);

    return NextResponse.json({ 
      success: true, 
      users: result.rows,
      total: result.rows.length 
    });
  } catch (error) {
    console.error("Admin get users error:", error);
    return NextResponse.json({ error: "Failed to get users" }, { status: 500 });
  }
}

// PUT /api/admin/users - İstifadəçini yenilə (blokla/aktiv et, rol dəyiş)
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
    const { userId, action, role: newRole } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Öz hesabını bloklamağa və ya silməyə çalışma
    if (userId === decoded.userId) {
      return NextResponse.json({ error: "Cannot modify your own account" }, { status: 400 });
    }

    if (action === "block") {
      const result = await pool.query(
        `UPDATE users 
         SET is_active = NOT is_active,
             blocked_at = CASE WHEN is_active = true THEN NOW() ELSE NULL END
         WHERE id = $1 
         RETURNING *`,
        [userId]
      );
      
      if (result.rows.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      
      return NextResponse.json({ success: true, user: result.rows[0] });
      
    } else if (action === "changeRole") {
      if (!newRole || !["user", "employer", "admin"].includes(newRole)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
      
      const result = await pool.query(
        `UPDATE users SET role = $1 WHERE id = $2 RETURNING *`,
        [newRole, userId]
      );
      
      if (result.rows.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      
      return NextResponse.json({ success: true, user: result.rows[0] });
      
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Admin update user error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// DELETE /api/admin/users - İstifadəçini sil
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
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    if (parseInt(userId) === decoded.userId) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    // İstifadəçiyə aid işləri, müraciətləri, şirkətləri yoxla
    const checkJobs = await pool.query(`SELECT COUNT(*) FROM jobs WHERE posted_by = (SELECT email FROM users WHERE id = $1)`, [userId]);
    const checkApplications = await pool.query(`SELECT COUNT(*) FROM applications WHERE user_id = $1`, [userId]);
    const checkCompanies = await pool.query(`SELECT COUNT(*) FROM companies WHERE email = (SELECT email FROM users WHERE id = $1)`, [userId]);

    if (parseInt(checkJobs.rows[0].count) > 0) {
      return NextResponse.json({ error: "User has jobs. Delete jobs first." }, { status: 400 });
    }
    if (parseInt(checkApplications.rows[0].count) > 0) {
      return NextResponse.json({ error: "User has applications. Delete applications first." }, { status: 400 });
    }
    if (parseInt(checkCompanies.rows[0].count) > 0) {
      return NextResponse.json({ error: "User has companies. Delete companies first." }, { status: 400 });
    }

    // İstifadəçini sil
    const result = await pool.query(`DELETE FROM users WHERE id = $1 RETURNING *`, [userId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Admin delete user error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}