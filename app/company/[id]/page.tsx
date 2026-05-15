// app/company/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import JobCard from "@/components/JobCard";

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
};

type Job = {
  id: number;
  title: string;
  company: string;
  companyLogo: string;
  companyLogoBgColor: string;
  location: string;
  type: string;
  salary_min: number;
  salary_max: number;
  description: string;
  postedAt: string;
  featured: boolean;
  postedBy: string;
};

export default function CompanyPage() {
  const params = useParams();
  const companyId = params.id as string;
  
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("auth_users") || "[]");
    const foundCompany = users.find((u: any) => u.id === companyId && u.role === "employer");
    
    if (foundCompany) {
      setCompany({
        id: foundCompany.id,
        name: foundCompany.companyName || foundCompany.name,
        email: foundCompany.email,
        companyLogo: foundCompany.companyLogo || foundCompany.avatar,
        companyIndustry: foundCompany.companyIndustry,
        companyLocation: foundCompany.companyLocation,
        companySize: foundCompany.companySize,
        companyDescription: foundCompany.companyDescription,
        companyWebsite: foundCompany.companyWebsite,
        companyLinkedIn: foundCompany.companyLinkedIn,
      });
      
      // Get all jobs (static + posted)
      const staticJobs = JSON.parse(localStorage.getItem("sample_jobs") || "[]");
      const postedJobs = JSON.parse(localStorage.getItem("posted_jobs") || "[]");
      const allJobs = [...staticJobs, ...postedJobs];
      const companyJobs = allJobs.filter((job: any) => job.postedBy === foundCompany.email);
      
      // Ensure each job has required properties for JobCard
      const formattedJobs = companyJobs.map((job: any) => ({
        ...job,
        companyLogo: job.companyLogo || job.company?.substring(0, 2).toUpperCase(),
        companyLogoBgColor: job.companyLogoBgColor || "bg-gray-100 text-gray-700",
      }));
      
      setJobs(formattedJobs);
    }
    setLoading(false);
  }, [companyId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Company not found</h1>
          <Link href="/companies" className="text-blue-600 hover:underline mt-2 inline-block">
            ← Back to companies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <Link href="/companies" className="text-gray-500 hover:text-gray-700 mb-6 inline-block">
          ← Back to companies
        </Link>

        {/* Company Header */}
        <div className="bg-white rounded-xl border border-gray-300 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-xl bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden">
                {company.companyLogo ? (
                  <img src={company.companyLogo} alt={company.name} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-4xl">🏢</span>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
                <p className="text-gray-500 mt-1">{company.companyIndustry || "Technology"}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {company.companyLocation && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Location</label>
                  <p className="text-gray-900">{company.companyLocation}</p>
                </div>
              )}
              {company.companySize && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Company Size</label>
                  <p className="text-gray-900">{company.companySize} employees</p>
                </div>
              )}
              {company.companyWebsite && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Website</label>
                  <a href={company.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {company.companyWebsite}
                  </a>
                </div>
              )}
              {company.companyLinkedIn && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">LinkedIn</label>
                  <a href={company.companyLinkedIn} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    LinkedIn Page
                  </a>
                </div>
              )}
            </div>

            {company.companyDescription && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">About the Company</label>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap">{company.companyDescription}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Company Jobs */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Jobs at {company.name}</h2>
        
        {jobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-300 p-12 text-center">
            <p className="text-gray-500">No jobs posted yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}