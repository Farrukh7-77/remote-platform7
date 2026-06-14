import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("cv") as File;
    const email = formData.get("email") as string;

    if (!file || !email) {
      return NextResponse.json({ error: "Missing file or email" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    // File-i Base64-ə çevir
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Database-də saxla
    await pool.query(
      "UPDATE users SET cv_url = $1 WHERE email = $2",
      [base64, email]
    );

    return NextResponse.json({ success: true, cvUrl: base64 });
  } catch (error) {
    console.error("CV upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}