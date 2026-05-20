// app/companies/page.tsx - Dark borders preserved
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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

export default function CompaniesPage() {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-500 animate-pulse">Loading companies...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 transition-opacity duration-700 ${pageLoaded ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Simple Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-white mb-2 animate-fade-in-up">
            Top Remote Companies
          </h1>
          <p className="text-white/80 animate-fade-in-up" style={{ animationDelay: "50ms" }}>
            Discover companies hiring remote talent worldwide
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="max-w-md mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search companies by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-700 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {filteredCompanies.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-700 shadow-sm animate-fade-in-up">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500">No companies found for "{searchTerm}"</p>
            <button 
              onClick={() => setSearchTerm("")} 
              className="mt-4 text-blue-600 hover:text-blue-700 text-sm transition-colors cursor-pointer"
            >
              Clear search
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-end items-center mb-4 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
              <p className="text-sm text-gray-500">
                Found <span className="font-semibold text-gray-700">{filteredCompanies.length}</span> companies
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((company, index) => (
                <Link
                  key={company.id}
                  href={`/company/${company.id}`}
                  className="group bg-white rounded-xl border border-gray-700 p-6 hover:shadow-xl hover:border-gray-900 transition-all duration-300 transform hover:-translate-y-1 animate-card"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-700 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-md">
                      {company.logo ? (
                        <img src={company.logo} alt={company.name} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-2xl transition-transform duration-300 group-hover:scale-110">🏢</span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                        {company.name}
                      </h3>
                      <p className="text-sm text-gray-500">{company.industry || "Technology"}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 group-hover:text-gray-700 transition-colors duration-200">
                    {company.description || "A company hiring remote talent worldwide."}
                  </p>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                    {company.location && (
                      <span className="inline-flex items-center gap-1 transition-all duration-200 hover:text-blue-600">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {company.location}
                      </span>
                    )}
                    {company.size && (
                      <span className="inline-flex items-center gap-1 transition-all duration-200 hover:text-blue-600">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
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

      {/* Global Animation Styles */}
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
      `}</style>
    </div>
  );
}