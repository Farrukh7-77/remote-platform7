"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function PasswordSettings() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const isGoogleUser = user?.provider === "google";

  const validatePassword = (password: string): string => {
    if (password.length < 12) return "Password must be at least 12 characters";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/[@$!%*?&]/.test(password)) return "Password must contain at least one special character (@$!%*?&)";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Yeni parol validasiyası
    const validationError = validatePassword(newPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Google istifadəçiləri üçün current password tələb olunmur
    if (!isGoogleUser && !currentPassword) {
      setError("Current password is required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user?.email,
          currentPassword: isGoogleUser ? null : currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setShowModal(false), 2000);
      } else {
        setError(data.error || "Failed to update password");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0f172a] rounded-xl p-6 border border-white/10">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Password Settings</h3>
          <p className="text-white/60 text-sm mt-1">
            {isGoogleUser 
              ? "You signed up with Google. Set a password to enable email/password login."
              : "Update your password to keep your account secure."}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 cursor-pointer"
        >
          {isGoogleUser ? "Set Password" : "Change Password"}
        </button>
      </div>

      {isGoogleUser && (
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-blue-200 text-sm flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              After setting a password, you can sign in with either Google or email/password.
            </span>
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-[#0f172a] rounded-xl max-w-md w-full border border-white/10 p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4">
              {isGoogleUser ? "Set Password" : "Change Password"}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Current Password - yalnız Google olmayanlar üçün */}
              {!isGoogleUser && (
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    required={!isGoogleUser}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="text-xs text-white/40 space-y-1">
                <p className={newPassword.length >= 12 ? "text-green-400" : ""}>
                  {newPassword.length >= 12 ? "✓" : "•"} At least 12 characters
                </p>
                <p className={/[A-Z]/.test(newPassword) ? "text-green-400" : ""}>
                  {/[A-Z]/.test(newPassword) ? "✓" : "•"} At least one uppercase letter
                </p>
                <p className={/[@$!%*?&]/.test(newPassword) ? "text-green-400" : ""}>
                  {/[@$!%*?&]/.test(newPassword) ? "✓" : "•"} At least one special character (@$!%*?&)
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium transition-all duration-200 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Saving..." : isGoogleUser ? "Set Password" : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}