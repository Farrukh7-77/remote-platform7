import jwt from "jsonwebtoken";
import pool from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export function generateToken(userId: number, email: string, role: string, tokenVersion: number = 0) {
  return jwt.sign({ userId, email, role, tokenVersion }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      email: string;
      role: string;
      tokenVersion: number;
      iat: number;
      exp: number;
    };
    return decoded;
  } catch (error) {
    return null;
  }
}

// Token versiyasını yoxla (rol dəyişdikdən sonra token etibarsız olsun)
export async function verifyTokenWithVersion(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      email: string;
      role: string;
      tokenVersion: number;
      iat: number;
      exp: number;
    };
    
    // Token versiyasını database-də yoxla
    const result = await pool.query(
      `SELECT token_version, role, is_active, is_verified FROM users WHERE id = $1`,
      [decoded.userId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const user = result.rows[0];
    const currentTokenVersion = user.token_version || 0;
    
    // Token versiyası uyğun gəlmirsə və ya rol dəyişibsə, token etibarsızdır
    if (decoded.tokenVersion !== currentTokenVersion) {
      return null;
    }
    
    // İstifadəçi aktiv deyilsə
    if (!user.is_active) {
      return null;
    }
    
    // Rol dəyişibsə
    if (decoded.role !== user.role) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    return null;
  }
}

// MIDDLEWARE üçün sadə token yoxlaması
export async function validateToken(token: string) {
  const decoded = await verifyTokenWithVersion(token);
  return decoded !== null;
}