// app/profile/page.tsx - fixed avatar upload
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvName, setCvName] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }
    setName(user.name || "");
    setEmail(user.email || "");
    setAvatar(user.avatar || "");
    const savedCv = localStorage.getItem(`cv_${user.email}`);
    if (savedCv) {
      try {
        const parsed = JSON.parse(savedCv);
        setCvName(parsed.name);
      } catch {
        setCvName(savedCv);
      }
    }
  }, [user, router]);

  if (!user) return null;

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAvatar(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCvFile(file);
      setCvName(file.name);
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    if (updateUser) {
      await updateUser({ name, avatar });
    }
    if (cvFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        localStorage.setItem(`cv_${user.email}`, JSON.stringify({
          name: cvFile.name,
          data: reader.result,
          uploadedAt: new Date().toISOString()
        }));
        setMessage("✅ Profile and CV saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      };
      reader.readAsDataURL(cvFile);
    } else {
      setMessage("✅ Profile updated!");
      setTimeout(() => setMessage(""), 3000);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
            {message}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {/* Avatar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">👤</span>
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="text-sm" />
            </div>
            <p className="text-xs text-gray-400 mt-2">Upload a profile picture (optional)</p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>

          {/* CV Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CV / Resume</label>
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleCvUpload} className="w-full text-sm" />
            {cvName && <p className="text-xs text-green-600 mt-1">📄 Current: {cvName}</p>}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveProfile}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}