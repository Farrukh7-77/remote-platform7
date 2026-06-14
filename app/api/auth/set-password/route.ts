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
    
    // Parol yoxlaması
    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }
    
    if (password.length < 12) {
      return NextResponse.json(
        { error: "Password must be at least 12 characters" },
        { status: 400 }
      );
    }
    
    // Parol regex yoxlaması
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: "Password must contain uppercase, lowercase, number, and special character" },
        { status: 400 }
      );
    }
    
    // İstifadəçinin mövcud parolunu yoxla
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
    
    // Əgər istifadəçinin artıq parolu varsa
    if (user.password !== null && user.password !== undefined && user.password !== "") {
      return NextResponse.json(
        { error: "User already has a password. Use change-password instead." },
        { status: 400 }
      );
    }
    
    // Parolu hash et
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Parolu yenilə
    await pool.query(
      "UPDATE users SET password = $1 WHERE email = $2",
      [hashedPassword, session.user.email]
    );
    
    return NextResponse.json({ 
      success: true, 
      message: "Password set successfully" 
    });
  } catch (error) {
    console.error("Error setting password:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}