// lib/cors.ts
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGINS = [
  "https://remote-platform7.vercel.app",
  "https://remote-platform7-git-main.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
];

export function corsMiddleware(request: NextRequest) {
  const origin = request.headers.get("origin");
  
  const isAllowedOrigin = origin && ALLOWED_ORIGINS.includes(origin);
  
  const response = NextResponse.next();
  
  if (isAllowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }
  
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.set("Access-Control-Allow-Credentials", "true");
  
  return response;
}