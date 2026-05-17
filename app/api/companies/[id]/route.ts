import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await context.params).id;
    
    const result = await pool.query(
      `SELECT id, email, name, logo, industry, location, size, description, website, linkedin, created_at
       FROM companies 
       WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }
    
    return NextResponse.json({ company: result.rows[0] });
  } catch (error) {
    console.error("Get company error:", error);
    return NextResponse.json({ error: "Failed to get company" }, { status: 500 });
  }
}