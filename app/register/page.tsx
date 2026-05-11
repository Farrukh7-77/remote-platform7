// app/register/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth, UserRole } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import AuthModal from "@/components/AuthModal";

export default function RegisterPage() {
  const { user, signUp, signOut } = useAuth(); // signUp buradan gəlir
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  
  const [role, setRole] = useState<UserRole>(roleParam === "employer" ? "employer" : "job_seeker");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [initialUser, setInitialUser] = useState(user);

  useEffect(() => {
    setInitialUser(user);
  }, []);

  // Only redirect if user was NOT logged in and now IS logged in (new registration)
  useEffect(() => {
    if (!initialUser && user) {
      if (user.role === "employer") {
        router.push("/employer/dashboard");
      } else {
        router.push("/");
      }
    }
  }, [user, initialUser, router]);

  // If user is already logged in, show a message
  if (user && initialUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="text-6xl mb-4">👤</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">You're already logged in</h1>
            <p className="text-gray-600 mb-6">
              You are currently logged in as <strong>{user.name}</strong> ({user.role === "employer" ? "Employer" : "Job Seeker"}).
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  signOut();
                  window.location.reload();
                }}
                className="w-full px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition cursor-pointer"
              >
                Sign Out & Create New Account
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-full px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition cursor-pointer"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signUp(email, password, name, role, role === "employer" ? companyName : undefined);
    
    if (result.success) {
      // Redirect will happen via useEffect
    } else {
      setError(result.error || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md p-8">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">Create Account</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("job_seeker")}
                  className={`py-2 px-4 rounded-lg border transition cursor-pointer ${
                    role === "job_seeker"
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  👤 Job Seeker
                </button>
                <button
                  type="button"
                  onClick={() => setRole("employer")}
                  className={`py-2 px-4 rounded-lg border transition cursor-pointer ${
                    role === "employer"
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  🏢 Employer
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {role === "employer" ? "Contact Person Name" : "Full Name"} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                required
              />
            </div>

            {/* Company Name (only for employers) */}
            {role === "employer" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                  required
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <button
              onClick={() => setIsSignInModalOpen(true)}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>

      <AuthModal 
        isOpen={isSignInModalOpen} 
        onClose={() => setIsSignInModalOpen(false)} 
      />
    </div>
  );
}