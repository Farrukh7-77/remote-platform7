// components/Navbar.tsx - with animated mobile menu
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { useState } from "react";
import UserMenu from "./UserMenu";
import JobAlertModal from "./JobAlertModal";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isJobAlertModalOpen, setIsJobAlertModalOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/companies", label: "Companies" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const currentFilters = {
    searchTerm: "",
    selectedTypes: [],
    salaryRange: [2000, 15000] as [number, number],
    selectedLocation: "all",
    experienceLevel: "all",
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 cursor-pointer">
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
                  className={`cursor-pointer text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                    pathname === link.href ? "text-blue-600 dark:text-blue-400 font-medium" : ""
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              <Link
                href="/post-job"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Post a Job
              </Link>
              
              <button
                onClick={() => setIsJobAlertModalOpen(true)}
                className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <span>🔔</span> Alerts
              </button>
              
              <ThemeToggle />
              
              {/* Sign Up Button - only show when user is NOT logged in */}
              {!user && (
                <Link
                  href="/register"
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  Sign Up
                </Link>
              )}
              
              {user && <UserMenu />}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-3">
              <button
                onClick={() => setIsJobAlertModalOpen(true)}
                className="text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                <span className="text-xl">🔔</span>
              </button>
              <ThemeToggle />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 dark:text-gray-300 cursor-pointer p-2"
                aria-label="Menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu - with smooth animation */}
          <div
            className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
              isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="py-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 cursor-pointer"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/post-job"
                className="block py-2 text-blue-600 font-medium cursor-pointer"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Post a Job
              </Link>
              {!user && (
                <Link
                  href="/register"
                  className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 cursor-pointer"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              )}
              {user && (
                <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-800">
                  <UserMenu />
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <JobAlertModal 
        isOpen={isJobAlertModalOpen} 
        onClose={() => setIsJobAlertModalOpen(false)}
        filters={currentFilters}
      />
    </>
  );
}