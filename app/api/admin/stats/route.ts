// app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(request: Request) {
  try {
    // Token-i headers-dən al
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Token-i yoxla
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as {
        id: number;
        email: string;
        name: string;
        role: string;
      };
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Admin yoxlaması
    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    // Statistikaları yığ
    const [jobsResult, usersResult, companiesResult, applicationsResult] = await Promise.all([
      pool.query("SELECT COUNT(*) as count FROM jobs"),
      pool.query("SELECT COUNT(*) as count FROM users"),
      pool.query("SELECT COUNT(*) as count FROM companies"),
      pool.query("SELECT COUNT(*) as count FROM applications"),
    ]);

    return NextResponse.json({
      totalJobs: parseInt(jobsResult.rows[0]?.count || "0"),
      totalUsers: parseInt(usersResult.rows[0]?.count || "0"),
      totalCompanies: parseInt(companiesResult.rows[0]?.count || "0"),
      totalApplications: parseInt(applicationsResult.rows[0]?.count || "0"),
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}