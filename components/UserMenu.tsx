// components/UserMenu.tsx - WITH SETTINGS ADDED
"use client";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const handleSignOut = () => {
    signOut();
    router.push("/");
    setIsOpen(false);
  };

  const isEmployer = user.role === "employer";
  const isLightMode = theme === "light";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
      >
        <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-semibold">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            user.name?.charAt(0).toUpperCase() || "U"
          )}
        </div>
        <span className="text-sm font-medium" style={{ color: isLightMode ? "#000000" : "#ffffff" }}>
          {user.name?.split(" ")[0]}
        </span>
        <svg className="w-3 h-3 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium" style={{ color: isLightMode ? "#000000" : "#ffffff" }}>
              {user.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
          </div>
          
          <div className="py-1">
            <Link
              href="/profile"
              style={{ 
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                fontSize: "14px",
                color: isLightMode ? "#000000" : "#ffffff",
                backgroundColor: "transparent"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#000000";
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = isLightMode ? "#000000" : "#ffffff";
              }}
              onClick={() => setIsOpen(false)}
            >
              👤 My Profile
            </Link>
            
            {/* SETTINGS LINK */}
            <Link
              href="/profile/settings"
              style={{ 
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                fontSize: "14px",
                color: isLightMode ? "#000000" : "#ffffff",
                backgroundColor: "transparent"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#000000";
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = isLightMode ? "#000000" : "#ffffff";
              }}
              onClick={() => setIsOpen(false)}
            >
              ⚙️ Settings
            </Link>
            
            {isEmployer ? (
              <>
                <Link
                  href="/employer/dashboard"
                  style={{ 
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    fontSize: "14px",
                    color: isLightMode ? "#000000" : "#ffffff",
                    backgroundColor: "transparent"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#000000";
                    e.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = isLightMode ? "#000000" : "#ffffff";
                  }}
                  onClick={() => setIsOpen(false)}
                >
                  📊 Dashboard
                </Link>
                <Link
                  href="/employer/analytics"
                  style={{ 
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    fontSize: "14px",
                    color: isLightMode ? "#000000" : "#ffffff",
                    backgroundColor: "transparent"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#000000";
                    e.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = isLightMode ? "#000000" : "#ffffff";
                  }}
                  onClick={() => setIsOpen(false)}
                >
                  📈 Analytics
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/saved-jobs"
                  style={{ 
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    fontSize: "14px",
                    color: isLightMode ? "#000000" : "#ffffff",
                    backgroundColor: "transparent"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#000000";
                    e.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = isLightMode ? "#000000" : "#ffffff";
                  }}
                  onClick={() => setIsOpen(false)}
                >
                  📌 Saved Jobs
                </Link>
                <Link
                  href="/applications"
                  style={{ 
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    fontSize: "14px",
                    color: isLightMode ? "#000000" : "#ffffff",
                    backgroundColor: "transparent"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#000000";
                    e.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = isLightMode ? "#000000" : "#ffffff";
                  }}
                  onClick={() => setIsOpen(false)}
                >
                  📋 My Applications
                </Link>
              </>
            )}
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 py-1">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
            >
              🚪 Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}