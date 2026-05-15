// app/api/companies/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id, email, name, logo, industry, location, size, description, website, linkedin
       FROM companies 
       ORDER BY name ASC`
    );

    return NextResponse.json({ companies: result.rows });
  } catch (error) {
    console.error("Get companies error:", error);
    return NextResponse.json({ error: "Failed to get companies" }, { status: 500 });
  }
}