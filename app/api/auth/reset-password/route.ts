import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email, token, newPassword } = await request.json();

    const tokenResult = await pool.query(
      "SELECT * FROM reset_tokens WHERE email = $1 AND token = $2 AND expires_at > NOW()",
      [email, token]
    );

    if (tokenResult.rows.length === 0) {
      return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 });
    }

    await pool.query("UPDATE users SET password = $1 WHERE email = $2", [newPassword, email]);
    await pool.query("DELETE FROM reset_tokens WHERE email = $1 AND token = $2", [email, token]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}