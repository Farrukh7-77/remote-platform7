import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import pool from "@/lib/db";

// Fayl upload direktoriyası
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "cvs");

// İstifadəçini tokendən tap
async function getUserIdFromToken(req: NextRequest): Promise<number | null> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];
  
  if (!token) return null;
  
  try {
    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
    return payload.userId || payload.id;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("cv") as File;
    const email = formData.get("email") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Fayl tipini yoxla
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only PDF, DOC, and DOCX files are allowed" }, { status: 400 });
    }

    // Fayl ölçüsünü yoxla (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 });
    }

    // Direktoriyanı yarat (əgər yoxdursa)
    await mkdir(UPLOAD_DIR, { recursive: true });

    // Unikal fayl adı yarat
    const timestamp = Date.now();
    const extension = file.name.split(".").pop();
    const fileName = `${userId}_${timestamp}.${extension}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    const fileUrl = `/uploads/cvs/${fileName}`;

    // Faylı diskə yaz
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // CV URL-ni database-də yenilə
    await pool.query(
      `UPDATE users SET cv_url = $1 WHERE id = $2`,
      [fileUrl, userId]
    );

    return NextResponse.json({ 
      success: true, 
      url: fileUrl,
      message: "CV uploaded successfully" 
    });
  } catch (error) {
    console.error("CV upload error:", error);
    return NextResponse.json({ error: "Failed to upload CV" }, { status: 500 });
  }
}