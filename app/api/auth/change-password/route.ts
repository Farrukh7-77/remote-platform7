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
    
    const { currentPassword, newPassword } = await req.json();
    
    // Input yoxlaması
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }
    
    if (newPassword.length < 12) {
      return NextResponse.json(
        { error: "New password must be at least 12 characters" },
        { status: 400 }
      );
    }
    
    // Yeni parol regex yoxlaması
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json(
        { error: "New password must contain uppercase, lowercase, number, and special character" },
        { status: 400 }
      );
    }
    
    // İstifadəçinin mövcud parolunu al
    const result = await pool.query(
      "SELECT password FROM users WHERE email = $1",
      [session.user.email]
    );
    
    const user = result.rows[0];
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Əgər istifadəçinin parolu yoxdursa
    if (user.password === null || user.password === undefined || user.password === "") {
      return NextResponse.json(
        { error: "User doesn't have a password set. Use set-password instead." },
        { status: 400 }
      );
    }
    
    // Mövcud parolu yoxla
    const isValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }
    
    // Yeni parolu hash et
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Parolu yenilə
    await pool.query(
      "UPDATE users SET password = $1 WHERE email = $2",
      [hashedPassword, session.user.email]
    );
    
    return NextResponse.json({ 
      success: true, 
      message: "Password changed successfully" 
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}