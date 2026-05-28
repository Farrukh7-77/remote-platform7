// middleware.ts
import { NextRequest, NextResponse } from "next/server";

// Sadə in-memory rate limiter (production üçün Redis tövsiyə olunur)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = 100; // Maksimum sorğu
const WINDOW_MS = 60 * 1000; // 1 dəqiqə

// CORS konfiqurasiyası
const ALLOWED_ORIGINS = [
  "https://remote-platform7.vercel.app",
  "https://remote-platform7-git-main.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
];

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // 1. RATE LIMITING
  const ip = request.headers.get("x-forwarded-for") || 
             request.headers.get("x-real-ip") || 
             "unknown";
  
  const now = Date.now();
  const record = rateLimit.get(ip);
  
  if (record) {
    if (now > record.resetTime) {
      // Reset window
      rateLimit.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    } else if (record.count >= RATE_LIMIT) {
      // Rate limit aşıldı
      return new NextResponse(JSON.stringify({ error: "Too Many Requests" }), { 
        status: 429,
        headers: { "Content-Type": "application/json" }
      });
    } else {
      record.count++;
      rateLimit.set(ip, record);
    }
  } else {
    rateLimit.set(ip, { count: 1, resetTime: now + WINDOW_MS });
  }
  
  // 2. CORS HEADERS
  const origin = request.headers.get("origin");
  const isAllowedOrigin = origin && ALLOWED_ORIGINS.includes(origin);
  
  if (isAllowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }
  
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.set("Access-Control-Allow-Credentials", "true");
  
  // 3. SECURITY HEADERS
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  
  return response;
}

// SADƏCƏ bu route-lar üçün işləsin
export const config = {
  matcher: [
    "/api/:path*",
    "/register",
    "/signin", 
    "/post-job",
  ],
};