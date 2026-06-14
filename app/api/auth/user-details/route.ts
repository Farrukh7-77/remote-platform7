import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // DİQQƏT: password IS NULL yoxlanışını birbaşa SQL-də edirik
    const result = await pool.query(
      "SELECT provider, (password IS NULL) as has_no_password FROM users WHERE email = $1",
      [session.user.email]
    );

    const user = result.rows[0];

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isGoogleUser = user.provider === "google";
    const hasPassword = !user.has_no_password; // SQL-dən gələn boolean dəyər (əgər null-dırsa false olacaq)
    const showSetPassword = isGoogleUser && !hasPassword;

    // === DEBUG LOG (Bunu Terminalda görəcəksiniz) ===
    console.log("=== USER DETAILS API DEBUG ===");
    console.log("User Email:", session.user.email);
    console.log("Provider:", user.provider);
    console.log("Has Password:", hasPassword);
    console.log("Show Set Password:", showSetPassword);
    console.log("==============================");

    return NextResponse.json({
      isGoogleUser,
      hasPassword,
      showSetPassword
    });
  } catch (error) {
    console.error("Error in user-details API:", error);
    return NextResponse.json({ error: "Server error", details: String(error) }, { status: 500 });
  }
}