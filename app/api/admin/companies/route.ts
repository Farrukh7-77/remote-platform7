import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// GET /api/admin/companies - Bütün şirkətləri gətir
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
    const search = searchParams.get("search");
    const isVerified = searchParams.get("is_verified");

    let query = `
      SELECT 
        c.*,
        u.name as owner_name,
        u.email as owner_email,
        admin.email as verified_by_email,
        admin.name as verified_by_name
      FROM companies c
      LEFT JOIN users u ON c.email = u.email
      LEFT JOIN users admin ON c.verified_by = admin.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (c.name ILIKE $${paramIndex} OR c.email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (isVerified === "true") {
      query += ` AND c.is_verified = true`;
    } else if (isVerified === "false") {
      query += ` AND c.is_verified = false`;
    }

    query += ` ORDER BY c.created_at DESC`;

    const result = await pool.query(query, params);

    return NextResponse.json({ 
      success: true, 
      companies: result.rows,
      total: result.rows.length 
    });
  } catch (error) {
    console.error("Admin get companies error:", error);
    return NextResponse.json({ error: "Failed to get companies" }, { status: 500 });
  }
}

// PUT /api/admin/companies - Şirkəti təsdiqlə və ya yenilə
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
    const { companyId, action, updates } = body;

    if (!companyId) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    if (action === "verify") {
      const result = await pool.query(
        `UPDATE companies 
         SET is_verified = true, 
             verified_by = $1, 
             verified_at = NOW() 
         WHERE id = $2 
         RETURNING *`,
        [decoded.userId, companyId]
      );
      
      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Company not found" }, { status: 404 });
      }
      
      return NextResponse.json({ success: true, company: result.rows[0] });
      
    } else if (action === "unverify") {
      const result = await pool.query(
        `UPDATE companies 
         SET is_verified = false, 
             verified_by = NULL, 
             verified_at = NULL 
         WHERE id = $1 
         RETURNING *`,
        [companyId]
      );
      
      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Company not found" }, { status: 404 });
      }
      
      return NextResponse.json({ success: true, company: result.rows[0] });
      
    } else if (action === "update" && updates) {
      const { name, website, description, location, size, industry, linkedin, logo } = updates;
      
      const result = await pool.query(
        `UPDATE companies 
         SET name = COALESCE($1, name),
             website = COALESCE($2, website),
             description = COALESCE($3, description),
             location = COALESCE($4, location),
             size = COALESCE($5, size),
             industry = COALESCE($6, industry),
             linkedin = COALESCE($7, linkedin),
             logo = COALESCE($8, logo)
         WHERE id = $9
         RETURNING *`,
        [name, website, description, location, size, industry, linkedin, logo, companyId]
      );
      
      return NextResponse.json({ success: true, company: result.rows[0] });
      
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Admin update company error:", error);
    return NextResponse.json({ error: "Failed to update company" }, { status: 500 });
  }
}

// DELETE /api/admin/companies - Şirkəti və əlaqəli istifadəçini sil
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
    const companyId = searchParams.get("id");

    if (!companyId) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    // Şirkəti tap (email ilə istifadəçini siləcəyik)
    const companyResult = await pool.query(
      `SELECT email, name FROM companies WHERE id = $1`,
      [companyId]
    );

    if (companyResult.rows.length === 0) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const companyEmail = companyResult.rows[0].email;
    const companyName = companyResult.rows[0].name;

    // Transaction başla
    await pool.query('BEGIN');

    try {
      // 1. Bu şirkətə aid iş elanlarını tap
      const jobsResult = await pool.query(
        `SELECT id FROM jobs WHERE company = $1`,
        [companyName]
      );
      const jobIds = jobsResult.rows.map((row: any) => row.id);

      // 2. Bu iş elanlarına aid applications sil
      if (jobIds.length > 0) {
        await pool.query(
          `DELETE FROM applications WHERE job_id = ANY($1)`,
          [jobIds]
        );

        // 3. Bu iş elanlarına aid saved_jobs sil
        await pool.query(
          `DELETE FROM saved_jobs WHERE job_id = ANY($1)`,
          [jobIds]
        );

        // 4. İş elanlarını sil
        await pool.query(
          `DELETE FROM jobs WHERE company = $1`,
          [companyName]
        );
      }

      // 5. Şirkəti sil
      await pool.query(
        `DELETE FROM companies WHERE id = $1`,
        [companyId]
      );

      // 6. Əlaqəli istifadəçini sil (email ilə)
      if (companyEmail) {
        await pool.query(
          `DELETE FROM users WHERE email = $1`,
          [companyEmail]
        );
      }

      // Transaction-u təsdiqlə
      await pool.query('COMMIT');

      return NextResponse.json({ 
        success: true, 
        message: "Company, associated jobs, and owner deleted successfully" 
      });
    } catch (error) {
      // Xəta olarsa, geri qaytar
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error("Admin delete company error:", error);
    return NextResponse.json({ error: "Failed to delete company" }, { status: 500 });
  }
}