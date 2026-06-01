import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";

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

    // 1. Ümumi statistika
    const totalJobs = await pool.query(`SELECT COUNT(*) FROM jobs`);
    const totalUsers = await pool.query(`SELECT COUNT(*) FROM users WHERE role != 'admin'`);
    const totalCompanies = await pool.query(`SELECT COUNT(*) FROM companies`);
    const totalApplications = await pool.query(`SELECT COUNT(*) FROM applications`);
    const pendingJobs = await pool.query(`SELECT COUNT(*) FROM jobs WHERE is_verified = false OR status = 'pending'`);
    const pendingEmployers = await pool.query(`SELECT COUNT(*) FROM users WHERE role = 'employer' AND verification_status = 'pending' AND is_verified = true`);
    const pendingCompanies = await pool.query(`SELECT COUNT(*) FROM companies WHERE is_verified = false`);

    // 2. Son 7 günün activity (müraciətlər)
    const weeklyApplications = await pool.query(`
      SELECT DATE(applied_at) as date, COUNT(*) as count
      FROM applications
      WHERE applied_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(applied_at)
      ORDER BY date ASC
    `);

    // 3. Son 7 günün activity (iş elanları)
    const weeklyJobs = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM jobs
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // 4. Müraciət statusları
    const applicationStatus = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM applications
      GROUP BY status
    `);

    // 5. İş elanları kateqoriyaları (top 5)
    const topCategories = await pool.query(`
      SELECT category, COUNT(*) as count
      FROM jobs
      WHERE category IS NOT NULL AND category != ''
      GROUP BY category
      ORDER BY count DESC
      LIMIT 5
    `);

    // 6. Son 5 iş elanı
    const recentJobs = await pool.query(`
      SELECT id, title, company, type, location, is_verified, status, created_at
      FROM jobs
      ORDER BY created_at DESC
      LIMIT 5
    `);

    // 7. Son 5 müraciət
    const recentApplications = await pool.query(`
      SELECT a.id, a.full_name, a.email, a.status, a.applied_at, j.title as job_title, j.company as company_name
      FROM applications a
      LEFT JOIN jobs j ON a.job_id = j.id
      ORDER BY a.applied_at DESC
      LIMIT 5
    `);

    // 8. Aylıq statistikalar (cari ay)
    const monthlyJobs = await pool.query(`
      SELECT COUNT(*) as count
      FROM jobs
      WHERE EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM NOW())
        AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())
    `);
    
    const monthlyApplications = await pool.query(`
      SELECT COUNT(*) as count
      FROM applications
      WHERE EXTRACT(MONTH FROM applied_at) = EXTRACT(MONTH FROM NOW())
        AND EXTRACT(YEAR FROM applied_at) = EXTRACT(YEAR FROM NOW())
    `);

    return NextResponse.json({
      success: true,
      stats: {
        totalJobs: parseInt(totalJobs.rows[0].count),
        totalUsers: parseInt(totalUsers.rows[0].count),
        totalCompanies: parseInt(totalCompanies.rows[0].count),
        totalApplications: parseInt(totalApplications.rows[0].count),
        pendingJobs: parseInt(pendingJobs.rows[0].count),
        pendingEmployers: parseInt(pendingEmployers.rows[0].count),
        pendingCompanies: parseInt(pendingCompanies.rows[0].count),
        monthlyJobs: parseInt(monthlyJobs.rows[0].count),
        monthlyApplications: parseInt(monthlyApplications.rows[0].count),
      },
      weeklyApplications: weeklyApplications.rows,
      weeklyJobs: weeklyJobs.rows,
      applicationStatus: applicationStatus.rows,
      topCategories: topCategories.rows,
      recentJobs: recentJobs.rows,
      recentApplications: recentApplications.rows,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Failed to get dashboard stats" }, { status: 500 });
  }
}