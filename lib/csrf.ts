// lib/csrf.ts
import Tokens from "csrf";

const tokens = new Tokens();

const secret = process.env.CSRF_SECRET || "your-csrf-secret-key-change-this";

export function generateCSRFToken(): string {
  return tokens.create(secret);
}

export function verifyCSRFToken(token: string): boolean {
  try {
    return tokens.verify(secret, token);
  } catch {
    return false;
  }
}