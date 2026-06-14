import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { emailNotifications, jobAlerts, marketingEmails } = await req.json();

    // user_settings cədvəlində yazını tap və ya yarat
    const existingSettings = await pool.query(
      "SELECT id FROM user_settings WHERE user_id = (SELECT id FROM users WHERE email = $1)",
      [session.user.email]
    );

    if (existingSettings.rows.length > 0) {
      await pool.query(
        `UPDATE user_settings 
         SET email_notifications = $1, job_alerts = $2, updated_at = NOW()
         WHERE user_id = (SELECT id FROM users WHERE email = $3)`,
        [emailNotifications, jobAlerts, session.user.email]
      );
    } else {
      await pool.query(
        `INSERT INTO user_settings (user_id, email_notifications, job_alerts)
         VALUES ((SELECT id FROM users WHERE email = $1), $2, $3)`,
        [session.user.email, emailNotifications, jobAlerts]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update notifications error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}