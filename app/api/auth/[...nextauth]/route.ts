import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import pool from "@/lib/db";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/sendEmail";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }: any) {
      if (account?.provider === "google" && user.email) {
        try {
          const existingUser = await pool.query(
            "SELECT id, google_id, provider, is_verified, verification_status, role FROM users WHERE email = $1",
            [user.email]
          );

          if (existingUser.rows.length > 0) {
            const dbUser = existingUser.rows[0];
            
            if (!dbUser.google_id) {
              await pool.query(
                `UPDATE users SET google_id = $1, provider = 'google' WHERE id = $2`,
                [user.id, dbUser.id]
              );
            }
            
            // Email təsdiqlənməyibsə
            if (!dbUser.is_verified) {
              // Mövcud səhifəyə yönəlt
              return "/signin?error=EmailNotVerified"; 
            }
            
            // YALNIZ Employer üçün admin təsdiqi yoxla
            if (dbUser.role === 'employer' && dbUser.verification_status === "pending") {
              return "/signin?error=AdminApprovalRequired";
            }
            
            return true;
          } else {
            // Yeni istifadəçi - yalnız token yarat, DB-yə yazma
            const verificationToken = crypto.randomBytes(32).toString("hex");
            const tokenExpiry = new Date();
            tokenExpiry.setHours(tokenExpiry.getHours() + 24);
            
            await pool.query(
              `INSERT INTO verification_tokens (token, email, expires_at, user_data)
               VALUES ($1, $2, $3, $4)`,
              [
                verificationToken, 
                user.email, 
                tokenExpiry, 
                JSON.stringify({
                  email: user.email,
                  name: user.name,
                  googleId: user.id,
                  provider: 'google'
                })
              ]
            );

            await sendVerificationEmail(user.email, verificationToken);
            return "/verify-email-required?email=" + encodeURIComponent(user.email);
          }
        } catch (error) {
          console.error("Google sign in error:", error);
          return "/signin?error=GoogleSignInFailed";
        }
      }
      return true;
    },
    async session({ session, token }: any) {
      if (session.user && token.sub) {
        try {
          const result = await pool.query(
            `SELECT id, email, name, role, avatar, company_name, verification_status, is_verified
             FROM users WHERE email = $1`,
            [session.user.email]
          );
          
          if (result.rows.length > 0) {
            const dbUser = result.rows[0];
            (session.user as any).id = dbUser.id;
            (session.user as any).role = dbUser.role;
            (session.user as any).company_name = dbUser.company_name;
            (session.user as any).verification_status = dbUser.verification_status;
            (session.user as any).is_verified = dbUser.is_verified;
          }
        } catch (error) {
          console.error("Session callback error:", error);
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
    error: "/signin", // Xətaları mövcud səhifəyə yönəlt
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };