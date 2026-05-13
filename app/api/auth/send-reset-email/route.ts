import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import pool from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "No account found" }, { status: 404 });
    }

    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 3600000);
    await pool.query("INSERT INTO reset_tokens (email, token, expires_at) VALUES ($1, $2, $3)", [email, resetToken, expiresAt]);

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Your Password - RemoteJobs",
      html: `<a href="${resetUrl}">Click here to reset your password</a>`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset email error:", error);
    return NextResponse.json({ error: "Failed to send reset email" }, { status: 500 });
  }
}