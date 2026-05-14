// app/api/send-email/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const to = formData.get("to") as string;
    const subject = formData.get("subject") as string;
    const html = formData.get("html") as string;
    const attachment = formData.get("attachment") as File | null;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const attachments = [];
    if (attachment) {
      const buffer = Buffer.from(await attachment.arrayBuffer());
      attachments.push({
        filename: attachment.name,
        content: buffer,
      });
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: html,
      attachments: attachments,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}