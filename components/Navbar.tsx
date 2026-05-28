// components/Navbar.tsx - Sliding indicator with blue icons on hover
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "./AuthModal";
import JobAlertModal from "./JobAlertModal";
import UserMenu from "./UserMenu";

// SVG Icons - with group-hover blue color
const HomeIcon = () => (
  <svg className="w-4 h-4 transition-colors duration-200 group-hover:text-[#4D9EFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const CompaniesIcon = () => (
  <svg className="w-4 h-4 transition-colors duration-200 group-hover:text-[#4D9EFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const AboutIcon = () => (
  <svg className="w-4 h-4 transition-colors duration-200 group-hover:text-[#4D9EFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ContactIcon = () => (
  <svg className="w-4 h-4 transition-colors duration-200 group-hover:text-[#4D9EFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

export default function Navbar() {
  const pathname = usePathname();
  const { user, signOut, showAuthModal, closeAuthModal, openAuthModal } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isJobAlertModalOpen, setIsJobAlertModalOpen] = useState(false);
  const [isMobileUserMenuOpen, setIsMobileUserMenuOpen] = useState(false);
  
  // Sliding indicator state
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [currentHovered, setCurrentHovered] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

  const links = [
    { href: "/", label: "Home", icon: HomeIcon },
    { href: "/companies", label: "Companies", icon: CompaniesIcon },
    { href: "/about", label: "About", icon: AboutIcon },
    { href: "/contact", label: "Contact", icon: ContactIcon },
  ];

  const currentFilters = {
    searchTerm: "",
    selectedTypes: [],
    salaryRange: [2000, 15000] as [number, number],
    selectedLocation: "all",
    experienceLevel: "all",
  };

  const isEmployer = user?.role === "employer";

  // Update indicator position for a given href
  const updateIndicator = (href: string) => {
    const link = linkRefs.current.get(href);
    const container = containerRef.current;
    if (link && container) {
      const linkRect = link.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      setIndicatorStyle({
        left: linkRect.left - containerRect.left,
        width: linkRect.width,
      });
    }
  };

  // Mouse enter handler - xətti hover olunan linkə apar
  const handleMouseEnter = (href: string) => {
    setCurrentHovered(href);
    updateIndicator(href);
  };

  // Mouse leave handler - heç nə etmirik, xətt son hover olunan yerdə qalır
  const handleMouseLeave = () => {
    // Xətt olduğu yerdə qalır - geri qayıtmır
  };

  // Səhifə dəyişdikdə xətti aktiv linkə apar
  useEffect(() => {
    const activeLink = links.find(link => pathname === link.href);
    if (activeLink) {
      setCurrentHovered(activeLink.href);
      updateIndicator(activeLink.href);
    }
  }, [pathname]);

  // Komponent ilk yükləndikdə aktiv linkə görə indicator qoy
  useEffect(() => {
    const activeLink = links.find(link => pathname === link.href);
    if (activeLink) {
      setTimeout(() => {
        updateIndicator(activeLink.href);
      }, 100);
    }
  }, []);

  // Set ref for links
  const setLinkRef = (href: string, el: HTMLAnchorElement | null) => {
    if (el) {
      linkRefs.current.set(href, el);
    } else {
      linkRefs.current.delete(href);
    }
  };

  const isActive = (href: string) => pathname === href;

  // Hansı link üçün xətt göstəriləcək? (hover olunan varsa onun üçün, yoxsa aktiv link üçün)
  const activeIndicatorHref = currentHovered || links.find(l => pathname === l.href)?.href || null;

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#0D1117] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 cursor-pointer ml-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-xl font-bold">
                <span className="text-[#4D9EFF]">Remote</span>
                <span className="text-white">Jobs</span>
              </span>
            </Link>

            {/* Desktop Menu with Sliding Indicator */}
            <div className="hidden md:flex items-center justify-end flex-1 mr-8">
              <div ref={containerRef} className="relative flex items-center space-x-6">
                {links.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  const isHovered = currentHovered === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      ref={(el) => setLinkRef(link.href, el)}
                      onMouseEnter={() => handleMouseEnter(link.href)}
                      onMouseLeave={handleMouseLeave}
                      className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                        active || isHovered
                          ? "text-white bg-[#1E3A5F]/40"
                          : "text-[#C9D1D9] hover:bg-[#1E3A5F]/20"
                      }`}
                    >
                      <Icon />
                      <span className="text-sm font-medium transition-colors duration-200 group-hover:text-white">
                        {link.label}
                      </span>
                    </Link>
                  );
                })}
                {/* Sliding Indicator */}
                {activeIndicatorHref && (
                  <span
                    className="absolute bottom-0 h-0.5 bg-[#4D9EFF] rounded-full transition-all duration-300 ease-out"
                    style={{
                      left: indicatorStyle.left,
                      width: indicatorStyle.width,
                    }}
                  />
                )}
              </div>
            </div>

            {/* Right section */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/post-job"
                className="bg-gradient-to-r from-blue-700 to-blue-500 text-white font-semibold text-sm py-2 px-5 rounded-lg shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 inline-flex items-center gap-1 cursor-pointer"
              >
                <span className="text-xl leading-none">+</span>
                <span>Post a Job</span>
              </Link>

              <button
                onClick={() => setIsJobAlertModalOpen(true)}
                className="relative p-2 text-[#C9D1D9] hover:text-white hover:bg-[#1E3A5F]/20 rounded-lg transition-all duration-200 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              
              {!user ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openAuthModal}
                    className="px-3 py-2 text-[#C9D1D9] hover:text-white hover:bg-[#1E3A5F]/20 rounded-lg transition-all duration-200 text-sm font-medium cursor-pointer"
                  >
                    Sign In
                  </button>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold text-sm rounded-lg hover:opacity-90 hover:scale-105 transition-all duration-200 cursor-pointer"
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <UserMenu />
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-3">
              <button
                onClick={() => setIsJobAlertModalOpen(true)}
                className="relative text-[#C9D1D9]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-[#C9D1D9] cursor-pointer p-2"
                aria-label="Menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div
            className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
              isMobileMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="py-4 border-t border-gray-800 space-y-2 bg-[#0D1117]">
              {links.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                      active
                        ? "text-white bg-[#1E3A5F]/40"
                        : "text-[#C9D1D9] hover:bg-[#1E3A5F]/20"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              <Link
                href="/post-job"
                className="block px-3 py-2 text-[#4D9EFF] font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                + Post a Job
              </Link>
              
              {!user ? (
                <>
                  <button
                    onClick={() => {
                      openAuthModal();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-[#C9D1D9] hover:bg-[#1E3A5F]/20 rounded-lg"
                  >
                    Sign In
                  </button>
                  <Link
                    href="/register"
                    className="block px-3 py-2 text-[#4D9EFF] font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsMobileUserMenuOpen(!isMobileUserMenuOpen)}
                    className="w-full flex justify-between items-center px-3 py-2 text-[#C9D1D9] hover:bg-[#1E3A5F]/20 rounded-lg"
                  >
                    <span className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-xs">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      {user.name}
                    </span>
                    <svg className={`w-4 h-4 transition-transform ${isMobileUserMenuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isMobileUserMenuOpen && (
                    <div className="pl-6 space-y-2">
                      <Link href="/profile" className="block py-2 text-[#C9D1D9] hover:text-white">👤 My Profile</Link>
                      {isEmployer ? (
                        <>
                          <Link href="/employer/dashboard" className="block py-2 text-[#C9D1D9] hover:text-white">📊 Dashboard</Link>
                          <Link href="/employer/analytics" className="block py-2 text-[#C9D1D9] hover:text-white">📈 Analytics</Link>
                        </>
                      ) : (
                        <>
                          <Link href="/saved-jobs" className="block py-2 text-[#C9D1D9] hover:text-white">📌 Saved Jobs</Link>
                          <Link href="/applications" className="block py-2 text-[#C9D1D9] hover:text-white">📋 My Applications</Link>
                        </>
                      )}
                      <button onClick={() => { signOut(); setIsMobileMenuOpen(false); }} className="block w-full text-left py-2 text-red-400">🚪 Sign Out</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <JobAlertModal isOpen={isJobAlertModalOpen} onClose={() => setIsJobAlertModalOpen(false)} filters={currentFilters} />
      <AuthModal isOpen={showAuthModal} onClose={closeAuthModal} />
    </>
  );
}