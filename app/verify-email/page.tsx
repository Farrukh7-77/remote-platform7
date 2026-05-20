"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found");
      return;
    }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatus("success");
          setMessage("Email verified! Redirecting to your profile...");
          
          // Save user and token to localStorage
          if (data.user && data.token) {
            localStorage.setItem("auth_user", JSON.stringify(data.user));
            localStorage.setItem("auth_token", data.token);
          }
          
          // Redirect to profile after 2 seconds
          setTimeout(() => router.push("/profile"), 2000);
        } else {
          setStatus("error");
          setMessage(data.error || "Failed to verify email");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong");
      });
  }, [token, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 text-center">
        {status === "loading" && (
          <>
            <div className="text-4xl mb-4">📧</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying your email...</h1>
            <p className="text-gray-600">Please wait while we verify your account.</p>
          </>
        )}
        
        {status === "success" && (
          <>
            <div className="text-4xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-green-600 mb-2">Email Verified!</h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirecting to your profile...</p>
          </>
        )}
        
        {status === "error" && (
          <>
            <div className="text-4xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">Verification Failed</h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <Link href="/register" className="text-blue-600 hover:underline">
              ← Back to Sign Up
            </Link>
          </>
        )}
      </div>
    </div>
  );
}