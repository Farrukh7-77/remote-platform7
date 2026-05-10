// app/companies/page.tsx
"use client";

import { useState } from "react";
import { companies, type Company } from "@/data/companies";
import Link from "next/link";

export default function CompaniesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");

  const industries = ["all", ...new Set(companies.map(c => c.industry))];

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = searchTerm === "" ||
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = selectedIndustry === "all" || company.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Top Remote Companies</h1>
          <p className="text-gray-600 mt-2">{filteredCompanies.length} companies hiring remotely</p>
        </div>

        <div className="max-w-md mx-auto mb-8">
          <input
            type="text"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {industries.map((industry) => (
            <button
              key={industry}
              onClick={() => setSelectedIndustry(industry)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedIndustry === industry
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {industry === "all" ? "All Industries" : industry}
            </button>
          ))}
        </div>

        {filteredCompanies.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">No companies found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CompanyCard({ company }: { company: Company }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all hover:border-blue-300">
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-12 h-12 rounded-xl ${company.logoBgColor} flex items-center justify-center font-bold text-lg`}>
          {company.logo}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{company.name}</h3>
          <p className="text-sm text-gray-600">{company.industry}</p>
        </div>
      </div>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{company.description}</p>
      <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-4">
        <span>📍 {company.location}</span>
        <span>👥 {company.size} employees</span>
        <span className="text-blue-600 font-medium">📋 {company.jobsPosted}+ jobs</span>
      </div>
      <Link
        href={`/?company=${encodeURIComponent(company.name)}`}
        className="inline-block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2 rounded-lg transition-colors"
      >
        View Jobs
      </Link>
    </div>
  );
}