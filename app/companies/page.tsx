// app/companies/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

type Company = {
  id: number;
  email: string;
  name: string;
  logo?: string;
  industry?: string;
  location?: string;
  size?: string;
  description?: string;
  website?: string;
  linkedin?: string;
};

// SVG Icon
const SearchIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

export default function CompaniesPage() {
  const { theme } = useTheme();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/companies")
      .then(res => res.json())
      .then(data => {
        setCompanies(data.companies || []);
        setLoading(false);
        setTimeout(() => setPageLoaded(true), 100);
      })
      .catch(err => {
        console.error("Failed to load companies:", err);
        setLoading(false);
      });
  }, []);

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className={`min-h-screen ${theme === "light" ? "bg-gray-50" : "bg-[#050816]"} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className={`${theme === "light" ? "text-gray-500" : "text-gray-400"} animate-pulse`}>Loading companies...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-opacity duration-700 ${pageLoaded ? 'opacity-100' : 'opacity-0'} ${theme === "light" ? "bg-gray-50" : "bg-[#050816]"}`}>
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 px-4">
        <div className="hero-gradient absolute inset-0 pointer-events-none"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3">
            <span className={theme === "light" ? "text-gray-900" : "text-white"}>Top</span>{' '}
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Remote</span>{' '}
            <span className={theme === "light" ? "text-gray-900" : "text-white"}>Companies</span>
          </h1>
          <p className={`text-sm md:text-base mb-6 ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>
            Discover companies hiring remote talent worldwide
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <div className="relative group">
              <div className={`relative flex items-center rounded-lg overflow-hidden focus-within:border-blue-500/40 transition-all duration-300 ${
                theme === "light" 
                  ? "bg-white border border-gray-300 shadow-sm" 
                  : "bg-[#0f172a]/80 backdrop-blur-sm border border-white/15"
              }`}>
                <div className="pl-3">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  placeholder="Search companies by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`flex-1 px-3 py-2.5 bg-transparent focus:outline-none text-sm ${
                    theme === "light" ? "text-gray-900 placeholder-gray-400" : "text-white placeholder-gray-500"
                  }`}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors cursor-pointer ${
                      theme === "light" ? "text-gray-400 hover:text-gray-600" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Companies Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredCompanies.length === 0 ? (
          <div className={`text-center py-16 rounded-xl ${
            theme === "light" 
              ? "bg-white border border-gray-200 shadow-sm" 
              : "glass-card"
          }`}>
            <div className="text-6xl mb-4">🔍</div>
            <p className={theme === "light" ? "text-gray-500" : "text-gray-400"}>
              No companies found for "{searchTerm}"
            </p>
            <button 
              onClick={() => setSearchTerm("")} 
              className="mt-4 text-blue-500 hover:text-blue-600 text-sm transition-colors cursor-pointer"
            >
              Clear search
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-end items-center mb-4">
              <p className={`text-sm ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                Found <span className={`font-semibold ${theme === "light" ? "text-gray-900" : "text-white"}`}>
                  {filteredCompanies.length}
                </span> companies
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 -mt-6">
              {filteredCompanies.map((company, index) => (
                <Link
                  key={company.id}
                  href={`/company/${company.id}`}
                  className={`group rounded-xl p-6 transition-all duration-300 animate-card cursor-pointer ${
                    theme === "light"
                      ? "bg-white border border-gray-400 shadow-sm hover:shadow-md hover:border-gray-500 hover:-translate-y-1"
                      : "bg-[#0f172a] border border-white/10 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:-translate-y-1"
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:scale-105 ${
                      theme === "light"
                        ? "bg-gray-100 border border-gray-200"
                        : "bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10"
                    }`}>
                      {company.logo ? (
                        <img src={company.logo} alt={company.name} className="w-full h-full object-contain rounded-xl" />
                      ) : (
                        <span className="text-2xl bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                          {company.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold transition-colors duration-200 ${
                        theme === "light" 
                          ? "text-gray-900 group-hover:text-blue-600" 
                          : "text-white group-hover:text-blue-400"
                      }`}>
                        {company.name}
                      </h3>
                      <p className={`text-sm ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                        {company.industry || "Technology"}
                      </p>
                    </div>
                  </div>
                  <p className={`text-sm mb-4 line-clamp-2 ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                    {company.description || "A company hiring remote talent worldwide."}
                  </p>
                  <div className="flex flex-wrap gap-3 text-sm">
                    {company.location && (
                      <span className={`inline-flex items-center gap-1 transition-all duration-200 ${
                        theme === "light" 
                          ? "text-gray-500 group-hover:text-blue-600" 
                          : "text-gray-500 group-hover:text-blue-400"
                      }`}>
                        <LocationIcon />
                        {company.location}
                      </span>
                    )}
                    {company.size && (
                      <span className={`inline-flex items-center gap-1 transition-all duration-200 ${
                        theme === "light" 
                          ? "text-gray-500 group-hover:text-blue-600" 
                          : "text-gray-500 group-hover:text-blue-400"
                      }`}>
                        <UsersIcon />
                        {company.size}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        
        .animate-card {
          opacity: 0;
          animation: fadeInUp 0.4s ease-out forwards;
        }
        
        .glass-card {
          background-color: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 1rem;
        }
        
        .hero-gradient {
          background: radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.15), transparent 70%);
        }
      `}</style>
    </div>
  );
}