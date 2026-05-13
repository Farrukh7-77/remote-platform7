// app/api/reset-password/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const { email, token, newPassword } = await request.json();

    // Read reset tokens
    const resetsPath = path.join(process.cwd(), "data", "resets.json");
    if (!fs.existsSync(resetsPath)) {
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
    }
    
    const resets = JSON.parse(fs.readFileSync(resetsPath, "utf8"));
    const resetEntry = resets.find((r: any) => r.email === email && r.token === token && r.expires > Date.now());

    if (!resetEntry) {
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
    }

    // Read users
    const usersPath = path.join(process.cwd(), "data", "users.json");
    if (!fs.existsSync(usersPath)) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    let users = JSON.parse(fs.readFileSync(usersPath, "utf8"));
    const userIndex = users.findIndex((u: any) => u.email === email);

    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update password
    users[userIndex].password = newPassword;
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

    // Remove used reset token
    const updatedResets = resets.filter((r: any) => r.token !== token);
    fs.writeFileSync(resetsPath, JSON.stringify(updatedResets, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}