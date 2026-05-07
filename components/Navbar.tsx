// components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/companies", label: "Companies" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                Remote<span className="text-blue-600">Jobs</span>
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                    pathname === link.href ? "text-blue-600 dark:text-blue-400 font-medium" : ""
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              <Link
                href="/post-job"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Post a Job
              </Link>
              
              <ThemeToggle />
              
              {user ? (
                <div className="flex items-center gap-4">
                  <Link
                    href="/saved-jobs"
                    className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors"
                  >
                    Saved Jobs
                  </Link>
                  <Link
                    href="/applications"
                    className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors"
                  >
                    My Applications
                  </Link>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    👤 {user.name}
                  </span>
                  <button
                    onClick={signOut}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 dark:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/post-job"
                className="block py-2 text-blue-600 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Post a Job
              </Link>
              {user ? (
                <>
                  <Link
                    href="/saved-jobs"
                    className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Saved Jobs
                  </Link>
                  <Link
                    href="/applications"
                    className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Applications
                  </Link>
                  <span className="block py-2 text-gray-700 dark:text-gray-300">👤 {user.name}</span>
                  <button
                    onClick={() => { signOut(); setIsMobileMenuOpen(false); }}
                    className="block py-2 text-red-600"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }}
                  className="block py-2 text-gray-700 dark:text-gray-300"
                >
                  Sign In
                </button>
              )}
            </div>
          )}
        </div>
      </nav>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}