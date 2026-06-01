import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new NextResponse(
        `<html><body style="font-family: system-ui; text-align: center; padding: 50px;">
          <h1>❌ Invalid Token</h1>
          <p>No token provided.</p>
          <a href="/signup">Sign Up</a>
        </body></html>`,
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    // Tokeni yoxla
    const tokenResult = await pool.query(
      `SELECT email, expires_at, user_data FROM verification_tokens WHERE token = $1`,
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return new NextResponse(
        `<html><body style="font-family: system-ui; text-align: center; padding: 50px;">
          <h1>❌ Invalid or Expired Token</h1>
          <p>The verification link is invalid or has already been used.</p>
          <a href="/signup">Sign Up Again</a>
        </body></html>`,
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    const { email, expires_at, user_data } = tokenResult.rows[0];

    // Tokenin vaxtı keçibsə
    if (new Date() > new Date(expires_at)) {
      await pool.query(`DELETE FROM verification_tokens WHERE token = $1`, [token]);
      return new NextResponse(
        `<html><body style="font-family: system-ui; text-align: center; padding: 50px;">
          <h1>❌ Token Expired</h1>
          <p>The verification link has expired (24 hours).</p>
          <a href="/signup">Sign Up Again</a>
        </body></html>`,
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    // İstifadəçi məlumatlarını JSON-dan oxu
    let userInfo;
    try {
      userInfo = JSON.parse(user_data);
    } catch (e) {
      await pool.query(`DELETE FROM verification_tokens WHERE token = $1`, [token]);
      return new NextResponse(
        `<html><body style="font-family: system-ui; text-align: center; padding: 50px;">
          <h1>❌ Invalid Data</h1>
          <p>Something went wrong. Please sign up again.</p>
          <a href="/signup">Sign Up Again</a>
        </body></html>`,
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }
    
    const { password, name, role, companyName, voen, verificationStatus } = userInfo;

    // İndi users cədvəlinə YAZ (YENİ: voen, verification_status, email_verified_at əlavə edildi)
    const userResult = await pool.query(
      `INSERT INTO users (email, password, name, role, company_name, is_verified, voen, verification_status, email_verified_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) 
       ON CONFLICT (email) DO UPDATE SET 
         password = EXCLUDED.password,
         name = EXCLUDED.name,
         role = EXCLUDED.role,
         company_name = EXCLUDED.company_name,
         voen = EXCLUDED.voen,
         verification_status = EXCLUDED.verification_status,
         is_verified = true,
         email_verified_at = NOW()
       RETURNING id, email, name, role, company_name, verification_status`,
      [email, password, name, role, companyName || null, true, voen, verificationStatus]
    );

    const user = userResult.rows[0];

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

    // YENİ: Əgər employer-dirsə və admin təsdiqi gözləyirsə, fərqli mesaj göstər
    const needsAdminApproval = role === "employer" && verificationStatus === "pending";

    if (needsAdminApproval) {
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>Email Verified - Pending Approval</title>
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
            p { color: rgba(255,255,255,0.7); margin-bottom: 24px; line-height: 1.6; }
            .warning { 
              background: rgba(251, 191, 36, 0.2); 
              border: 1px solid rgba(251, 191, 36, 0.5);
              border-radius: 12px; 
              padding: 16px; 
              margin: 20px 0;
            }
            .warning p { color: #fbbf24; margin: 0; }
            button {
              background: #3b82f6;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 12px;
              cursor: pointer;
              font-size: 16px;
            }
            button:hover { background: #2563eb; }
          </style>
        </head>
        <body>
          <div class="card">
            <div style="font-size: 64px;">📋</div>
            <h1>Email Verified Successfully!</h1>
            <p>Your account has been created and email is verified.</p>
            <div class="warning">
              <p>⏳ Your account is pending admin approval.</p>
              <p style="font-size: 14px; margin-top: 8px;">You will be notified once your company is verified. This usually takes 1-2 business days.</p>
            </div>
            <button onclick="window.location.href='/'">Back to Home →</button>
          </div>
        </body>
        </html>`,
        { status: 200, headers: { "Content-Type": "text/html" } }
      );
    }

    // Job seeker üçün normal mesaj (əvvəlki kimi)
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
          button {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 12px;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div style="font-size: 64px;">✅</div>
          <h1>Email Verified Successfully!</h1>
          <p>Your account has been activated.</p>
          <button onclick="window.location.href='/'">Back to Home →</button>
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
        <a href="/signup">Sign Up Again</a>
      </body></html>`,
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }
}