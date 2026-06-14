"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 12 || !/[A-Z]/.test(password) || !/[@$!%*?&]/.test(password)) {
      setError("Password must be 12+ chars, 1 uppercase, 1 special char (@$!%*?&)");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/signin"), 2000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to set password");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 text-center max-w-md w-full">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-white mb-2">Password Set!</h1>
          <p className="text-white/70">You can now sign in with email and password.</p>
          <p className="text-white/50 text-sm mt-4">Redirecting to Sign In...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Set Your Password</h1>
          <p className="text-white/60 text-sm mt-2">Create a password for {email}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-3 bg-white/5 border border-white/20 rounded-xl focus:border-blue-400 focus:outline-none text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-3 bg-white/5 border border-white/20 rounded-xl focus:border-blue-400 focus:outline-none text-white"
              required
            />
          </div>

          <div className="text-xs text-white/40 space-y-1">
            <p className={password.length >= 12 ? "text-green-400" : ""}>
              {password.length >= 12 ? "✓" : "•"} At least 12 characters
            </p>
            <p className={/[A-Z]/.test(password) ? "text-green-400" : ""}>
              {/[A-Z]/.test(password) ? "✓" : "•"} At least one uppercase letter
            </p>
            <p className={/[@$!%*?&]/.test(password) ? "text-green-400" : ""}>
              {/[@$!%*?&]/.test(password) ? "✓" : "•"} At least one special character
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Setting password..." : "Set Password"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/signin")}
            className="w-full bg-white/5 hover:bg-white/10 text-white/70 font-medium py-3 rounded-xl transition-all duration-200 cursor-pointer"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white/60">Loading...</div>}>
      <SetPasswordContent />
    </Suspense>
  );
}