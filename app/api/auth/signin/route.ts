// app/api/auth/signin/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. Əsas yoxlama
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email və şifrə tələb olunur" },
        { status: 400 }
      );
    }

    // 2. İstifadəçini axtar (yalnız mövcud sütunlar)
    const query = `
      SELECT id, email, name, role, company_name, avatar
      FROM users 
      WHERE email = $1 AND password = $2
    `;
    const result = await pool.query(query, [email, password]);

    // 3. Heç bir istifadəçi tapılmadı
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Email və ya şifrə yanlışdır" },
        { status: 401 }
      );
    }

    const user = result.rows[0];
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Giriş xətası:", error);
    return NextResponse.json(
      { error: "Giriş zamanı xəta baş verdi" },
      { status: 500 }
    );
  }
}