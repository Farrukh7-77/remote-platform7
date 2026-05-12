// components/UserMenu.tsx - Sign Out has cursor-pointer
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "./AuthModal";

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
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

  if (!user) {
    return (
      <>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap"
        >
          Sign In
        </button>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </>
    );
  }

  const isBase64Avatar = user.avatar && user.avatar.startsWith("data:image");
  const isEmployer = user.role === "employer";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer min-w-[100px]"
      >
        {isBase64Avatar ? (
          <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
        ) : (
          <span className="text-lg">👤</span>
        )}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[100px]">
          {user.name}
        </span>
        <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          {/* Profile - always visible */}
          <Link
            href="/profile"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <span>👤</span> My Profile
          </Link>

          {/* Dashboard - only for employers */}
          {isEmployer && (
            <Link
              href="/employer/dashboard"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <span>📊</span> Dashboard
            </Link>
          )}

          {/* Saved Jobs & Applications - only for job seekers */}
          {!isEmployer && (
            <>
              <Link
                href="/saved-jobs"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                onClick={() => setIsOpen(false)}
              >
                <span>📌</span> Saved Jobs
              </Link>
              <Link
                href="/applications"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                onClick={() => setIsOpen(false)}
              >
                <span>📋</span> My Applications
              </Link>
            </>
          )}

          <hr className="my-1 border-gray-200 dark:border-gray-700" />

          {/* Sign Out - with cursor-pointer */}
          <button
            onClick={() => {
              signOut();
              setIsOpen(false);
            }}
            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      )}
    </div>
  );
}