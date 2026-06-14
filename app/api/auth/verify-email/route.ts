import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcrypt";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new NextResponse(
        `<html><body style="font-family: system-ui; text-align: center; padding: 50px;">
          <h1>❌ Invalid Token</h1>
          <p>No token provided.</p>
          <a href="/register">Sign Up Again</a>
        </body></html>`,
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    const tokenResult = await pool.query(
      `SELECT email, expires_at, user_data FROM verification_tokens WHERE token = $1`,
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return new NextResponse(
        `<html><body style="font-family: system-ui; text-align: center; padding: 50px;">
          <h1>❌ Invalid or Expired Token</h1>
          <p>The verification link is invalid or has already been used.</p>
          <a href="/register">Sign Up Again</a>
        </body></html>`,
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    const { email, expires_at, user_data } = tokenResult.rows[0];

    if (new Date() > new Date(expires_at)) {
      await pool.query(`DELETE FROM verification_tokens WHERE token = $1`, [token]);
      return new NextResponse(
        `<html><body style="font-family: system-ui; text-align: center; padding: 50px;">
          <h1>⏰ Token Expired</h1>
          <p>The verification link has expired (24 hours).</p>
          <a href="/register">Sign Up Again</a>
        </body></html>`,
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    let userInfo;
    try {
      userInfo = JSON.parse(user_data);
    } catch (e) {
      await pool.query(`DELETE FROM verification_tokens WHERE token = $1`, [token]);
      return new NextResponse(
        `<html><body style="font-family: system-ui; text-align: center; padding: 50px;">
          <h1>❌ Invalid Data</h1>
          <p>Something went wrong. Please sign up again.</p>
          <a href="/register">Sign Up Again</a>
        </body></html>`,
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    const { password, name, role, companyName, voen, industry, companySize, location, website, linkedin, verificationStatus, googleId, provider } = userInfo;

    if (provider === 'google') {
      const existingUser = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      );

      if (existingUser.rows.length > 0) {
        await pool.query(
          `UPDATE users 
           SET is_verified = true, email_verified_at = NOW(), google_id = $1, provider = 'google'
           WHERE email = $2`,
          [googleId, email]
        );
      } else {
        await pool.query(
          `INSERT INTO users (email, password, name, role, google_id, provider, is_verified, email_verified_at)
           VALUES ($1, NULL, $2, 'jobseeker', $3, 'google', true, NOW())`,
          [email, name, googleId]
        );
      }
    } else {
      const hashedPassword = password;

      const existingUser = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      );

      let userId;

      if (existingUser.rows.length > 0) {
        userId = existingUser.rows[0].id;
        await pool.query(
          `UPDATE users 
           SET password = $1, name = $2, role = $3, company_name = $4, voen = $5, 
               company_industry = $6, company_size = $7, company_location = $8, company_website = $9, company_linkedin = $10,
               verification_status = $11, is_verified = true, email_verified_at = NOW()
           WHERE email = $12`,
          [hashedPassword, name, role, companyName, voen, industry, companySize, location, website, linkedin, verificationStatus, email]
        );
      } else {
        const result = await pool.query(
          `INSERT INTO users (email, password, name, role, company_name, voen, company_industry, company_size, company_location, company_website, company_linkedin, verification_status, is_verified, email_verified_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true, NOW())
           RETURNING id`,
          [email, hashedPassword, name, role, companyName, voen, industry, companySize, location, website, linkedin, verificationStatus]
        );
        userId = result.rows[0].id;
      }

      // ✅ YENİ: Employer üçün companies cədvəlinə əlavə et
      if (role === 'employer') {
        await pool.query(
          `INSERT INTO companies (email, name, industry, location, size, description, website, linkedin, is_verified, verified_by, verified_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false, NULL, NULL)`,
          [email, companyName, industry, location, companySize, '', website, linkedin]
        );
      }
    }

    await pool.query(`DELETE FROM verification_tokens WHERE token = $1`, [token]);

    return new NextResponse(
      `<!DOCTYPE html>
      <html>
      <head>
        <title>Email Verified</title>
        <meta charset="utf-8">
        <style>
          body {
            font-family: system-ui;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
          }
          .card {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border-radius: 24px;
            padding: 48px;
            text-align: center;
            max-width: 500px;
          }
          h1 { color: white; margin-bottom: 16px; }
          p { color: rgba(255,255,255,0.7); margin-bottom: 24px; }
          .info {
            background: rgba(59, 130, 246, 0.2);
            border: 1px solid rgba(59, 130, 246, 0.5);
            border-radius: 12px;
            padding: 16px;
            margin: 20px 0;
            color: #93c5fd;
            font-size: 14px;
          }
          .warning {
            background: rgba(251, 191, 36, 0.2);
            border: 1px solid rgba(251, 191, 36, 0.5);
            border-radius: 12px;
            padding: 16px;
            margin: 20px 0;
            color: #fcd34d;
            font-size: 14px;
          }
          button {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 12px;
            cursor: pointer;
            font-size: 16px;
            margin: 8px;
          }
          button:hover { background: #2563eb; }
          .secondary {
            background: rgba(255,255,255,0.1);
          }
          .secondary:hover { background: rgba(255,255,255,0.2); }
        </style>
      </head>
      <body>
        <div class="card">
          <div style="font-size: 64px;">✅</div>
          <h1>Email Verified Successfully!</h1>
          <p>Your account has been activated.</p>
          ${provider === 'google' ? `
            <div class="info">
              💡 You can sign in with Google or set a password for email/password login.
            </div>
            <button onclick="window.location.href='/set-password?email=${email}'">Set Password</button>
            <button class="secondary" onclick="window.location.href='/'">Continue to Home</button>
          ` : role === 'employer' ? `
            <div class="warning">
              ⏳ Your employer account is pending admin approval. You will be notified once approved.
            </div>
            <button onclick="window.location.href='/signin'">Sign In</button>
          ` : `
            <button onclick="window.location.href='/signin'">Sign In</button>
          `}
        </div>
      </body>
      </html>`,
      { status: 200, headers: { "Content-Type": "text/html" } }
    );
  } catch (error) {
    console.error("Verification error:", error);
    return new NextResponse(
      `<html><body style="font-family: system-ui; text-align: center; padding: 50px;">
        <h1>❌ Verification Failed</h1>
        <p>Something went wrong.</p>
        <a href="/register">Sign Up Again</a>
      </body></html>`,
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }
}