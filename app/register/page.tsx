// app/register/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth, UserRole } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import AuthModal from "@/components/AuthModal";

function RegisterForm() {
  const { user, signUp, signOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  
  const [role, setRole] = useState<UserRole>(roleParam === "employer" ? "employer" : "job_seeker");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [initialUser, setInitialUser] = useState(user);
  
  // Email təsdiqləmə mesajı üçün
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Focus states for float labels
  const [focusedFields, setFocusedFields] = useState({
    name: false,
    companyName: false,
    email: false,
    password: false,
  });

  useEffect(() => {
    setInitialUser(user);
  }, []);

  useEffect(() => {
    if (!initialUser && user) {
      router.push("/profile");
    }
  }, [user, initialUser, router]);

  const handleFocus = (field: keyof typeof focusedFields) => {
    setFocusedFields({ ...focusedFields, [field]: true });
  };

  const handleBlur = (field: keyof typeof focusedFields) => {
    setFocusedFields({ ...focusedFields, [field]: false });
  };

  // Parol validasiyası - SADƏLƏŞDİRİLMİŞ (yalnız 3 tələb)
  const validatePassword = (value: string): string => {
    if (value.length < 12) {
      return "Password must be at least 12 characters";
    }
    if (!/[A-Z]/.test(value)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[@$!%*?&]/.test(value)) {
      return "Password must contain at least one special character (@$!%*?&)";
    }
    return "";
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(validatePassword(value));
  };

  // Parol güc göstəricisi (sadələşdirilmiş)
  const getPasswordStrength = () => {
    let score = 0;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;
    return score;
  };

  const getStrengthColor = () => {
    const strength = getPasswordStrength();
    if (strength <= 1) return "bg-red-500";
    if (strength <= 2) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthLabel = () => {
    const strength = getPasswordStrength();
    if (strength <= 1) return "Weak";
    if (strength <= 2) return "Fair";
    return "Strong";
  };

  if (user && initialUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-center border border-white/20">
            <div className="text-6xl mb-4 animate-bounce">👤</div>
            <h1 className="text-2xl font-bold text-white mb-2">You're already logged in</h1>
            <p className="text-white/70 mb-6">
              You are currently logged in as <strong>{user.name}</strong> ({user.role === "employer" ? "Employer" : "Job Seeker"}).
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  signOut();
                  window.location.reload();
                }}
                className="w-full px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-200 transform hover:scale-[1.02] cursor-pointer"
              >
                Sign Out & Create New Account
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-full px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 cursor-pointer"
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
    setSuccessMessage("");
    setShowSuccess(false);
    
    // Client-side password validation
    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setError(passwordValidationError);
      return;
    }
    
    setLoading(true);

    const result = await signUp(email, password, name, role, role === "employer" ? companyName : undefined);
    
    if (result.success) {
      setSuccessMessage(result.message || "Registration successful!");
      setShowSuccess(true);
      setName("");
      setCompanyName("");
      setPassword("");
      setPasswordError("");
    } else {
      setError(result.error || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center py-12 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-md w-full mx-auto px-4 relative z-10 -mt-20 md:-mt-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20 transform transition-all duration-300 animate-in zoom-in-95 slide-in-from-bottom-4">
          
          {/* Decorative top bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-t-2xl" />
          
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg animate-bounce-slow">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-white mb-2">Create Account</h1>
          <p className="text-center text-white/60 text-sm mb-8">Join our community of remote professionals</p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm flex items-center gap-2 animate-shake">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {showSuccess ? (
            <div className="text-center py-4 animate-in fade-in">
              <div className="text-6xl mb-4 animate-bounce">📧</div>
              <p className="text-white/80 text-sm">
                We've sent a verification link to <strong className="text-white">{email}</strong>. 
                Please check your email and click the link to activate your account.
              </p>
              <button onClick={() => router.push("/")}>
                  Back to Home →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">I am a</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("job_seeker")}
                    className={`py-3 px-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                      role === "job_seeker"
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 border-blue-400 text-white shadow-lg transform scale-[1.02]"
                        : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10 hover:border-white/40"
                    }`}
                  >
                    <span className="text-xl mr-2">👤</span> Job Seeker
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("employer")}
                    className={`py-3 px-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                      role === "employer"
                        ? "bg-gradient-to-r from-purple-500 to-purple-600 border-purple-400 text-white shadow-lg transform scale-[1.02]"
                        : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10 hover:border-white/40"
                    }`}
                  >
                    <span className="text-xl mr-2">🏢</span> Employer
                  </button>
                </div>
              </div>

              {/* Name Field */}
              <div className="relative">
                <label className={`absolute left-3 transition-all duration-200 pointer-events-none ${
                  focusedFields.name || name
                    ? '-top-2 text-xs text-blue-300 bg-slate-800/80 px-1 rounded'
                    : 'top-3 text-white/50'
                }`}>
                  {role === "employer" ? "Contact Person Name" : "Full Name"} *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => handleFocus("name")}
                  onBlur={() => handleBlur("name")}
                  className="w-full px-3 py-3 bg-white/5 border border-white/20 rounded-xl focus:border-blue-400 focus:outline-none transition-all duration-200 text-white placeholder-white/30"
                  required
                />
              </div>

              {/* Company Name (Employer only) */}
              {role === "employer" && (
                <div className="relative">
                  <label className={`absolute left-3 transition-all duration-200 pointer-events-none ${
                    focusedFields.companyName || companyName
                      ? '-top-2 text-xs text-blue-300 bg-slate-800/80 px-1 rounded'
                      : 'top-3 text-white/50'
                  }`}>
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    onFocus={() => handleFocus("companyName")}
                    onBlur={() => handleBlur("companyName")}
                    className="w-full px-3 py-3 bg-white/5 border border-white/20 rounded-xl focus:border-blue-400 focus:outline-none transition-all duration-200 text-white placeholder-white/30"
                    required
                  />
                </div>
              )}

              {/* Email Field */}
              <div className="relative">
                <label className={`absolute left-3 transition-all duration-200 pointer-events-none ${
                  focusedFields.email || email
                    ? '-top-2 text-xs text-blue-300 bg-slate-800/80 px-1 rounded'
                    : 'top-3 text-white/50'
                }`}>
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => handleFocus("email")}
                  onBlur={() => handleBlur("email")}
                  className="w-full px-3 py-3 bg-white/5 border border-white/20 rounded-xl focus:border-blue-400 focus:outline-none transition-all duration-200 text-white placeholder-white/30"
                  required
                />
              </div>

              {/* Password Field with Strength Indicator */}
              <div className="relative">
                <label className={`absolute left-3 transition-all duration-200 pointer-events-none ${
                  focusedFields.password || password
                    ? '-top-2 text-xs text-blue-300 bg-slate-800/80 px-1 rounded'
                    : 'top-3 text-white/50'
                }`}>
                  Password *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  onFocus={() => handleFocus("password")}
                  onBlur={() => handleBlur("password")}
                  className="w-full px-3 py-3 bg-white/5 border border-white/20 rounded-xl focus:border-blue-400 focus:outline-none transition-all duration-200 text-white placeholder-white/30"
                  required
                />
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2">
                    <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getStrengthColor()} transition-all duration-300`}
                        style={{ width: `${(getPasswordStrength() / 3) * 100}%` }}
                      />
                    </div>
                    <p className={`text-xs mt-1 ${
                      getPasswordStrength() <= 1 ? "text-red-400" : 
                      getPasswordStrength() <= 2 ? "text-yellow-400" : "text-green-400"
                    }`}>
                      Password strength: {getStrengthLabel()}
                    </p>
                  </div>
                )}
                
                {/* Password requirements list - SADƏLƏŞDİRİLMİŞ (yalnız 3 tələb) */}
                <div className="text-xs text-white/40 mt-2 space-y-1">
                  <p className={password.length >= 12 ? "text-green-400" : ""}>
                    {password.length >= 12 ? "✓" : "•"} At least 12 characters
                  </p>
                  <p className={/[A-Z]/.test(password) ? "text-green-400" : ""}>
                    {/[A-Z]/.test(password) ? "✓" : "•"} At least one uppercase letter
                  </p>
                  <p className={/[@$!%*?&]/.test(password) ? "text-green-400" : ""}>
                    {/[@$!%*?&]/.test(password) ? "✓" : "•"} At least one special character (@$!%*?&)
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !!passwordError}
                className="relative w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer shadow-lg hover:shadow-xl mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>
          )}

          {!showSuccess && (
            <p className="text-center text-sm text-white/60 mt-6">
              Already have an account?{" "}
              <button
                onClick={() => setIsSignInModalOpen(true)}
                className="text-blue-300 hover:text-blue-200 font-semibold hover:underline transition-colors cursor-pointer"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>

      <AuthModal 
        isOpen={isSignInModalOpen} 
        onClose={() => setIsSignInModalOpen(false)} 
      />

      {/* Global styles */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoom-in-95 {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slide-in-from-bottom-4 {
          from {
            transform: translateY(1rem);
          }
          to {
            transform: translateY(0);
          }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        .animate-in {
          animation-duration: 0.3s;
          animation-fill-mode: both;
        }
        .fade-in {
          animation-name: fade-in;
        }
        .zoom-in-95 {
          animation-name: zoom-in-95;
        }
        .slide-in-from-bottom-4 {
          animation-name: slide-in-from-bottom-4;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
        .delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center"><div className="text-white/60">Loading...</div></div>}>
      <RegisterForm />
    </Suspense>
  );
}