// app/api/send-reset-email/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Read users from localStorage simulation (since we can't access localStorage in API)
    // We'll read from data/users.json file
    const usersPath = path.join(process.cwd(), "data", "users.json");
    let users = [];
    if (fs.existsSync(usersPath)) {
      users = JSON.parse(fs.readFileSync(usersPath, "utf8"));
    }

    const user = users.find((u: any) => u.email === email);

    if (!user) {
      return NextResponse.json({ error: "No account found with this email" }, { status: 404 });
    }

    // Generate reset token
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetExpires = Date.now() + 3600000; // 1 hour

    // Save reset token
    const resetsPath = path.join(process.cwd(), "data", "resets.json");
    let resets = [];
    if (fs.existsSync(resetsPath)) {
      resets = JSON.parse(fs.readFileSync(resetsPath, "utf8"));
    }
    
    // Remove old resets for this email
    const filteredResets = resets.filter((r: any) => r.email !== email);
    filteredResets.push({ email, token: resetToken, expires: resetExpires });
    fs.writeFileSync(resetsPath, JSON.stringify(filteredResets, null, 2));

    const baseUrl = process.env.NEXTAUTH_URL || "https://remote-platform7.vercel.app";
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Your Password - RemoteJobs",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #1f2937;">Reset Your Password</h2>
          <p style="color: #4b5563;">You requested to reset your password for your RemoteJobs account.</p>
          <p>Click the button below to create a new password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; margin: 10px 0;">Reset Password</a>
          <p style="color: #6b7280; font-size: 12px;">This link will expire in 1 hour.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #9ca3af; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset email error:", error);
    return NextResponse.json({ error: "Failed to send reset email" }, { status: 500 });
  }
}