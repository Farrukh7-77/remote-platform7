// lib/sendEmail.ts - Gmail SMTP (real email)
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Connection test (opsional)
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('✅ SMTP ready to send emails');
  }
});

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;
  
  try {
    const info = await transporter.sendMail({
      from: `"RemoteJobs" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Verify your email address - RemoteJobs",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">RemoteJobs</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0;">Find your next remote opportunity</p>
          </div>
          <div style="padding: 30px 20px; background: white;">
            <h2 style="color: #1f2937; margin: 0 0 16px;">Verify Your Email Address</h2>
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 24px;">
              Thank you for signing up! Please verify your email address by clicking the button below:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Verify Email
              </a>
            </div>
            <p style="color: #6b7280; font-size: 12px; text-align: center;">
              Or copy this link: <span style="color: #2563eb; word-break: break-all;">${verificationUrl}</span>
            </p>
            <div style="border-top: 1px solid #e5e7eb; margin-top: 24px; padding-top: 24px;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                This link expires in <strong>24 hours</strong>.
                If you didn't create an account, please ignore this email.
              </p>
            </div>
          </div>
        </div>
      `,
    });
    
    console.log("✅ Verification email sent to:", email);
    console.log("📧 Message ID:", info.messageId);
    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}

export async function sendResetPasswordEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
  
  try {
    const info = await transporter.sendMail({
      from: `"RemoteJobs" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Reset your password - RemoteJobs",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #dc2626, #7c3aed); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">RemoteJobs</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0;">Reset your password</p>
          </div>
          <div style="padding: 30px 20px; background: white;">
            <h2 style="color: #1f2937; margin: 0 0 16px;">Reset Your Password</h2>
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 24px;">
              We received a request to reset your password. Click the button below to create a new password:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #dc2626, #7c3aed); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Reset Password
              </a>
            </div>
            <p style="color: #6b7280; font-size: 12px; text-align: center;">
              Or copy this link: <span style="color: #2563eb; word-break: break-all;">${resetUrl}</span>
            </p>
            <div style="border-top: 1px solid #e5e7eb; margin-top: 24px; padding-top: 24px;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                This link expires in <strong>1 hour</strong>.
                If you didn't request this, please ignore this email.
              </p>
            </div>
          </div>
        </div>
      `,
    });
    
    console.log("✅ Reset password email sent to:", email);
    console.log("📧 Message ID:", info.messageId);
    return true;
  } catch (error) {
    console.error("Reset email send error:", error);
    return false;
  }
}