// components/AvatarUpload.tsx
"use client";

import { useState, useRef } from "react";

interface AvatarUploadProps {
  email: string;
  currentAvatar?: string;
  onAvatarChange: (avatarUrl: string) => void;
}

export default function AvatarUpload({ email, currentAvatar, onAvatarChange }: AvatarUploadProps) {
  const [avatar, setAvatar] = useState(currentAvatar || "");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be less than 2MB");
      return;
    }

    setUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAvatar(base64);
      onAvatarChange(base64);
      alert("Avatar updated successfully!");
      setUploading(false);
    };
    reader.onerror = () => {
      alert("Failed to upload");
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
          {avatar ? (
            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl text-white">👤</span>
          )}
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center text-xs disabled:opacity-50 cursor-pointer"
        >
          {uploading ? "⏳" : "📷"}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
      </div>
      <div>
        <p className="text-sm text-gray-600">Click the camera icon to change your profile picture</p>
        <p className="text-xs text-gray-400">JPG, PNG or GIF. Max 2MB.</p>
      </div>
    </div>
  );
}