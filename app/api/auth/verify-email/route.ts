import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Tokeni yoxla
    const tokenResult = await pool.query(
      `SELECT email, expires_at, user_data FROM verification_tokens WHERE token = $1`,
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    const { email, expires_at, user_data } = tokenResult.rows[0];

    // Tokenin vaxtı keçibsə
    if (new Date() > new Date(expires_at)) {
      await pool.query(`DELETE FROM verification_tokens WHERE token = $1`, [token]);
      return NextResponse.json({ error: "Token has expired. Please sign up again." }, { status: 400 });
    }

    // İstifadəçi məlumatlarını JSON-dan oxu
    let userInfo;
    try {
      userInfo = JSON.parse(user_data);
    } catch (e) {
      console.error("Failed to parse user_data:", user_data);
      return NextResponse.json({ error: "Invalid user data" }, { status: 500 });
    }
    
    const { password, name, role, companyName } = userInfo;

    // YALNIZ İNDİ users cədvəlinə yaz!
    const userResult = await pool.query(
      `INSERT INTO users (email, password, name, role, company_name) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, role, company_name`,
      [email, password, name, role, companyName || null]
    );

    // Employer-dirsə companies cədvəlinə də yaz
    if (role === "employer" && companyName) {
      await pool.query(
        `INSERT INTO companies (email, name) 
         VALUES ($1, $2)
         ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name`,
        [email, companyName]
      );
    }

    // İstifadə olunmuş tokeni sil
    await pool.query(`DELETE FROM verification_tokens WHERE token = $1`, [token]);

    return NextResponse.json({ 
      success: true, 
      user: userResult.rows[0],
      message: "Email verified successfully! You can now log in."
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json({ error: "Failed to verify email" }, { status: 500 });
  }
}