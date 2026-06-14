// app/api/auth/set-password/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { password } = await req.json();
    
    if (!password || password.length < 12) {
      return NextResponse.json(
        { error: "Password must be at least 12 characters" },
        { status: 400 }
      );
    }
    
    // Check if user already has a password
    const result = await pool.query(
      "SELECT password FROM users WHERE email = $1",
      [session.user.email]
    );
    
    if (result.rows[0]?.password) {
      return NextResponse.json(
        { error: "User already has a password. Use change-password instead." },
        { status: 400 }
      );
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update user with password
    await pool.query(
      "UPDATE users SET password = $1 WHERE email = $2",
      [hashedPassword, session.user.email]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error setting password:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}