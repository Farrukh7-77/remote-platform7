// lib/sendEmail.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Müvəqqəti göndərici ünvan (domain təsdiq olunana qədər)
const FROM_EMAIL = 'onboarding@resend.dev';

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;
  
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
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
              <a href="${verificationUrl}" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                Verify Email
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; text-align: center; margin-bottom: 16px;">
              Or copy this link: <br/>
              <span style="color: #2563eb; word-break: break-all;">${verificationUrl}</span>
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

    if (error) {
      console.error("Resend email error:", error);
      return false;
    }
    
    console.log("Email sent successfully:", data);
    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}

export async function sendResetPasswordEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
  
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
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
              <a href="${resetUrl}" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #dc2626, #7c3aed); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                Reset Password
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; text-align: center; margin-bottom: 16px;">
              Or copy this link: <br/>
              <span style="color: #2563eb; word-break: break-all;">${resetUrl}</span>
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

    if (error) {
      console.error("Resend email error:", error);
      return false;
    }
    
    console.log("Reset email sent successfully:", data);
    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}