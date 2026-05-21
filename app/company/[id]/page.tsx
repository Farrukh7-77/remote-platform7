// app/company/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Company = {
  id: number;
  name: string;
  email: string;
  logo?: string;
  industry?: string;
  location?: string;
  size?: string;
  description?: string;
  website?: string;
  linkedin?: string;
};

type Job = {
  id: number;
  title: string;
  location?: string;
  type?: string;
  salary_min?: number;
  salary_max?: number;
  posted_at: string;
};

export default function CompanyPage() {
  const params = useParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params?.id) return;
    
    // Şirkət məlumatlarını çək
    fetch(`/api/companies/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setCompany(data.company);
        setLoading(false);
      })
      .catch(() => {
        setError("Yüklənmə xətası");
        setLoading(false);
      });

    // Şirkətin iş elanlarını çək
    fetch(`/api/jobs?companyId=${params.id}`)
      .then(res => res.json())
      .then(data => setJobs(data.jobs || []));
  }, [params?.id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-gray-500 animate-pulse">Loading company...</div>
      </div>
    </div>
  );

  if (error || !company) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      <p className="text-red-500">{error || "Şirkət tapılmadı"}</p>
      <Link href="/companies" className="text-blue-500 hover:underline cursor-pointer">← Geri qayıt</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/companies" className="text-blue-500 hover:underline text-sm mb-6 inline-block cursor-pointer">
          ← Bütün şirkətlər
        </Link>

        {/* Şirkət profil kartı */}
        <div className="bg-white rounded-xl border border-gray-700 overflow-hidden mb-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-xl bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden">
                {company.logo ? (
                  <img src={company.logo} alt={company.name} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-4xl">🏢</span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                <p className="text-gray-500">{company.email}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">Industry</label>
                <p className="text-gray-900">{company.industry || "Not specified"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Company Size</label>
                <p className="text-gray-900">{company.size ? `${company.size} employees` : "Not specified"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Location</label>
                <p className="text-gray-900">{company.location || "Not specified"}</p>
              </div>
              {company.website && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Website</label>
                  <a href={company.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                    {company.website}
                  </a>
                </div>
              )}
              {company.linkedin && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">LinkedIn</label>
                  <a href={company.linkedin} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                    LinkedIn Page
                  </a>
                </div>
              )}
            </div>

            {company.description && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">About the Company</label>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap">{company.description}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* İş elanları */}
        <div className="bg-white rounded-xl border border-gray-700 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Open Positions ({jobs.length})</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {jobs.length === 0 ? (
              <p className="p-6 text-gray-400 text-center">No open positions at the moment.</p>
            ) : (
              jobs.map(job => (
                <Link key={job.id} href={`/job/${job.id}`} className="block p-6 hover:bg-gray-50 transition-all duration-200 cursor-pointer">
                  <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">{job.title}</h3>
                  <div className="flex gap-4 mt-1 text-sm text-gray-500 flex-wrap">
                    {job.location && <span>📍 {job.location}</span>}
                    {job.type && <span>💼 {job.type}</span>}
                    {job.salary_min && job.salary_max && (
                      <span>💰 ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}</span>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}