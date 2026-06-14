"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function SettingsPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  
  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  
  // User status
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  
  // YENİ: Parol formunun açıq/qapalı vəziyyəti
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [jobAlerts, setJobAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
    
    if (user) {
      checkUserStatus();
    }
  }, [user, loading, router]);
  
  const checkUserStatus = async () => {
    try {
      const res = await fetch("/api/auth/user-details");
      const data = await res.json();
      
      setShowSetPassword(data.showSetPassword === true);
      setHasPassword(data.hasPassword === true);
      
    } catch (error) {
      console.error("Error checking user status:", error);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }
  
  if (!user) return null;
  
  // Set Password (Google istifadəçiləri üçün - BİR DƏFƏLİK)
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPasswordLoading(true);
    setPasswordMessage(null);
    
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Passwords do not match" });
      setIsPasswordLoading(false);
      return;
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    if (!passwordRegex.test(newPassword)) {
      setPasswordMessage({ type: "error", text: "Password must be at least 12 characters with uppercase, lowercase, number, and special character" });
      setIsPasswordLoading(false);
      return;
    }
    
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setPasswordMessage({ type: "success", text: "Password set successfully! You can now sign in with password." });
        setNewPassword("");
        setConfirmPassword("");
        setHasPassword(true);
        // Formu bağlamaq (uğurlu olduqdan sonra)
        setTimeout(() => setShowPasswordForm(false), 2000);
      } else {
        setPasswordMessage({ type: "error", text: data.error || "Failed to set password" });
      }
    } catch (error) {
      setPasswordMessage({ type: "error", text: "An error occurred. Please try again." });
    } finally {
      setIsPasswordLoading(false);
    }
  };
  
  // Change Password (Parolu OLAN istifadəçilər üçün)
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPasswordLoading(true);
    setPasswordMessage(null);
    
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Passwords do not match" });
      setIsPasswordLoading(false);
      return;
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    if (!passwordRegex.test(newPassword)) {
      setPasswordMessage({ type: "error", text: "Password must be at least 12 characters with uppercase, lowercase, number, and special character" });
      setIsPasswordLoading(false);
      return;
    }
    
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setPasswordMessage({ type: "success", text: "Password changed successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        // Formu bağlamaq (uğurlu olduqdan sonra)
        setTimeout(() => setShowPasswordForm(false), 2000);
      } else {
        setPasswordMessage({ type: "error", text: data.error || "Failed to change password" });
      }
    } catch (error) {
      setPasswordMessage({ type: "error", text: "An error occurred. Please try again." });
    } finally {
      setIsPasswordLoading(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;
    
    try {
      const res = await fetch("/api/auth/delete-account", {
        method: "DELETE",
      });
      
      if (res.ok) {
        await signOut();
        router.push("/");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete account");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    }
  };
  
  const handleSaveNotifications = async () => {
    try {
      await fetch("/api/auth/update-notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailNotifications, jobAlerts, marketingEmails }),
      });
      alert("Notification settings saved!");
    } catch (error) {
      alert("Failed to save settings");
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/profile" className="text-gray-500 hover:text-gray-700 transition-colors">
            ← Back to Profile
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>
        
        <div className="space-y-6">
          {/* Password Section - YENİ DİZAYN */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-semibold text-gray-900">Password</h2>
              <p className="text-sm text-gray-500 mt-1">
                {showSetPassword 
                  ? "Set a password to sign in with email as well"
                  : "Manage your password to keep your account secure"}
              </p>
            </div>
            
            <div className="p-6">
              {/* Əgər form gizlidirsə, buton göstər */}
              {!showPasswordForm ? (
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
                >
                  {showSetPassword ? "🔒 Set Password" : "🔑 Change Password"}
                </button>
              ) : (
                /* Form açıqdır */
                <div className="space-y-4">
                  {/* Yuxarıda bağlama butonu */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordMessage(null);
                        setNewPassword("");
                        setConfirmPassword("");
                        setCurrentPassword("");
                      }}
                      className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                    >
                      ✕ Cancel
                    </button>
                  </div>
                  
                  <form onSubmit={showSetPassword ? handleSetPassword : handleChangePassword} className="space-y-4">
                    {/* CHANGE PASSWORD üçün CURRENT PASSWORD */}
                    {!showSetPassword && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                          required
                        />
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Password must be at least 12 characters with uppercase, lowercase, number, and special character
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        required
                      />
                    </div>
                    
                    {passwordMessage && (
                      <div className={`p-3 rounded-lg ${
                        passwordMessage.type === "success" 
                          ? "bg-green-50 text-green-700 border border-green-200" 
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}>
                        {passwordMessage.text}
                      </div>
                    )}
                    
                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={isPasswordLoading}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        {isPasswordLoading ? "Processing..." : (showSetPassword ? "Set Password" : "Change Password")}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswordMessage(null);
                          setNewPassword("");
                          setConfirmPassword("");
                          setCurrentPassword("");
                        }}
                        className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
          
          {/* Notification Settings */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-semibold text-gray-900">Notifications</h2>
              <p className="text-sm text-gray-500 mt-1">Manage how you receive updates</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive email about your account activity</p>
                </div>
                <button
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    emailNotifications ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    emailNotifications ? "translate-x-6" : "translate-x-1"
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Job Alerts</p>
                  <p className="text-sm text-gray-500">Receive notifications about new matching jobs</p>
                </div>
                <button
                  onClick={() => setJobAlerts(!jobAlerts)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    jobAlerts ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    jobAlerts ? "translate-x-6" : "translate-x-1"
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Marketing Emails</p>
                  <p className="text-sm text-gray-500">Receive promotional emails and newsletters</p>
                </div>
                <button
                  onClick={() => setMarketingEmails(!marketingEmails)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    marketingEmails ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    marketingEmails ? "translate-x-6" : "translate-x-1"
                  }`} />
                </button>
              </div>
              
              <button
                onClick={handleSaveNotifications}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Save Notification Settings
              </button>
            </div>
          </div>
          
          {/* Delete Account Section */}
          <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-red-200 bg-red-50">
              <h2 className="font-semibold text-red-700">Delete Account</h2>
              <p className="text-sm text-red-600 mt-1">Permanently delete your account and all data</p>
            </div>
            
            <div className="p-6">
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete Account
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      ⚠️ Warning: This action is irreversible. All your data including profile, applications, and saved jobs will be permanently deleted.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type <span className="font-mono bg-gray-100 px-2 py-1 rounded">DELETE</span> to confirm
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                      placeholder="Type DELETE here"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmText !== "DELETE"}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Permanently Delete Account
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmText("");
                      }}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}