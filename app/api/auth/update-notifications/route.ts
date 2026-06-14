// app/api/auth/update-notifications/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { emailNotifications, jobAlerts } = await req.json();
    
    // Note: You may need to add these columns to the users table
    // For now, we'll store in a separate settings table or add columns
    
    // Example: Store in a new 'user_settings' table
    await db.query(
      `INSERT INTO user_settings (user_id, email_notifications, job_alerts) 
       VALUES ((SELECT id FROM users WHERE email = $1), $2, $3)
       ON CONFLICT (user_id) DO UPDATE SET 
         email_notifications = $2, 
         job_alerts = $3,
         updated_at = NOW()`,
      [session.user.email, emailNotifications, jobAlerts]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}