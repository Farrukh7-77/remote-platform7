import { NextResponse } from "next/server";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Find token
    const tokenResult = await pool.query(
      `SELECT email, expires_at, user_data FROM verification_tokens WHERE token = $1`,
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    const { email, expires_at, user_data } = tokenResult.rows[0];

    // Check if token expired
    if (new Date() > new Date(expires_at)) {
      await pool.query(`DELETE FROM verification_tokens WHERE token = $1`, [token]);
      return NextResponse.json({ error: "Token has expired. Please sign up again." }, { status: 400 });
    }

    const userInfo = typeof user_data === 'string' ? JSON.parse(user_data) : user_data;
    const { password, name, role, companyName } = userInfo;

    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    let userId;

    if (existingUser.rows.length === 0) {
      // Create user
      const newUser = await pool.query(
        `INSERT INTO users (email, password, name, role, company_name, is_verified) 
         VALUES ($1, $2, $3, $4, $5, true) RETURNING id, email, name, role, company_name`,
        [email, password, name, role, companyName || null]
      );
      userId = newUser.rows[0].id;

      // If employer, add to companies table
      if (role === "employer" && companyName) {
        const existingCompany = await pool.query(
          "SELECT id FROM companies WHERE email = $1",
          [email]
        );
        if (existingCompany.rows.length === 0) {
          await pool.query(
            `INSERT INTO companies (email, name) VALUES ($1, $2)`,
            [email, companyName]
          );
        }
      }
    } else {
      // Just mark as verified
      await pool.query(`UPDATE users SET is_verified = true WHERE email = $1`, [email]);
      userId = existingUser.rows[0].id;
    }

    // Delete used token
    await pool.query(`DELETE FROM verification_tokens WHERE token = $1`, [token]);

    // Create JWT token for auto-login
    const authToken = jwt.sign(
      { id: userId, email, name, role, companyName },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return user data with token
    return NextResponse.json({ 
      success: true, 
      message: "Email verified successfully!",
      user: { id: userId, email, name, role, companyName },
      token: authToken
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json({ error: "Failed to verify email: " + (error as Error).message }, { status: 500 });
  }
}