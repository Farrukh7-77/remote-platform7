// app/companies/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Company = {
  id: string;
  name: string;
  email: string;
  companyLogo?: string;
  companyIndustry?: string;
  companyLocation?: string;
  companySize?: string;
  companyDescription?: string;
  companyWebsite?: string;
  companyLinkedIn?: string;
  jobsPosted?: number;
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Get all employer users from localStorage
    const users = JSON.parse(localStorage.getItem("auth_users") || "[]");
    const employers = users.filter((u: any) => u.role === "employer");
    
    // Get all jobs to count jobs per company
    const allJobs = JSON.parse(localStorage.getItem("posted_jobs") || "[]");
    
    const companyList = employers.map((emp: any) => {
      const companyJobs = allJobs.filter((job: any) => job.postedBy === emp.email);
      return {
        id: emp.id,
        name: emp.companyName || emp.name,
        email: emp.email,
        companyLogo: emp.companyLogo || emp.avatar,
        companyIndustry: emp.companyIndustry,
        companyLocation: emp.companyLocation,
        companySize: emp.companySize,
        companyDescription: emp.companyDescription,
        companyWebsite: emp.companyWebsite,
        companyLinkedIn: emp.companyLinkedIn,
        jobsPosted: companyJobs.length,
      };
    });
    
    setCompanies(companyList);
  }, []);

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-10">Top Remote Companies</h1>
        
        <div className="max-w-md mx-auto mb-8">
          <input
            type="text"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {filteredCompanies.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">No companies found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <Link
                key={company.id}
                href={`/company/${company.id}`}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer block"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                    {company.companyLogo ? (
                      <img src={company.companyLogo} alt={company.name} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-2xl">🏢</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{company.name}</h3>
                    <p className="text-sm text-gray-500">{company.companyIndustry || "Technology"}</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {company.companyDescription || "A company hiring remote talent worldwide."}
                </p>
                <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                  {company.companyLocation && <span>📍 {company.companyLocation}</span>}
                  {company.companySize && <span>👥 {company.companySize} employees</span>}
                  <span className="text-blue-600 font-medium">📋 {company.jobsPosted} jobs</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}