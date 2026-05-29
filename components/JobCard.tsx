// components/JobCard.tsx - SEPARATE MOBILE & DESKTOP STYLES
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast, Toast } from "./Toast";

type Job = {
  id: number;
  title: string;
  company: string;
  companyLogo: string;
  companyLogoBgColor: string;
  location: string;
  type: string;
  salary_min: number | null;
  salary_max: number | null;
  description: string;
  postedAt: string;
  is_featured: boolean;
  category?: string;
  experience_level?: string;
  company_logo_from_companies?: string;
  applicants_count?: number;
};

// Category colors mapping
const getCategoryColor = (category?: string) => {
  switch (category?.toLowerCase()) {
    case "project management":
      return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
    case "computer & it":
    case "engineering":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "sales & business development":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "medical & health":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    case "operations":
      return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    case "marketing & communications":
      return "bg-pink-500/10 text-pink-400 border-pink-500/20";
    case "accounting & finance":
      return "bg-green-500/10 text-green-400 border-green-500/20";
    case "customer service":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    case "education & training":
      return "bg-orange-500/10 text-orange-400 border-orange-500/20";
    case "design":
      return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
    case "writing":
      return "bg-teal-500/10 text-teal-400 border-teal-500/20";
    case "legal":
      return "bg-violet-500/10 text-violet-400 border-violet-500/20";
    case "human resources":
      return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    case "administrative":
      return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    default:
      return "bg-gray-500/10 text-gray-400 border-gray-500/20";
  }
};

// Experience level color
const getLevelColor = (level?: string) => {
  switch (level?.toLowerCase()) {
    case "entry (0-2 years)":
      return "text-green-400";
    case "mid (3-5 years)":
      return "text-blue-400";
    case "senior (5+ years)":
      return "text-purple-400";
    default:
      return "text-gray-400";
  }
};

// Icons
const LocationIcon = () => (
  <svg className="job-card-detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg className="job-card-detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const DollarIcon = () => (
  <svg className="job-card-detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const GraduationIcon = () => (
  <svg className="job-card-detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422M12 14l6.16-3.422M12 18l9-5-9-5-9 5 9 5zm0 0l6.16-3.422" />
  </svg>
);

const ClockIcon = () => (
  <svg className="job-card-time-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="job-card-time-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

// Helper function to format time ago
function timeAgo(date: string) {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function JobCard({ job }: { job: Job }) {
  const { user, openAuthModal } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem("auth_token");

  useEffect(() => {
    const checkSavedStatus = async () => {
      const token = getToken();
      if (!user || !token) {
        setIsSaved(false);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/saved-jobs", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.savedJobIds) {
          setIsSaved(data.savedJobIds.includes(job.id));
        }
      } catch (error) {
        console.error("Error checking saved status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSavedStatus();
  }, [user, job.id]);

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (user?.role === "employer") {
      showToast("Employers cannot save jobs. This feature is for job seekers only.", "warning");
      return;
    }
    
    if (!user) {
      openAuthModal();
      return;
    }

    const token = getToken();
    if (!token) {
      openAuthModal();
      return;
    }

    setLoading(true);
    
    try {
      if (isSaved) {
        const response = await fetch("/api/saved-jobs", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ jobId: job.id })
        });
        
        if (response.ok) {
          setIsSaved(false);
          showToast("Job removed from saved list", "success");
        }
      } else {
        const response = await fetch("/api/saved-jobs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ jobId: job.id })
        });
        
        if (response.ok) {
          setIsSaved(true);
          showToast("Job saved successfully", "success");
        }
      }
    } catch (error) {
      console.error("Error toggling save:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min || !max) return "Salary not specified";
    if (min >= 20000) return `$${Math.round(min / 1000)}k–${Math.round(max / 1000)}k`;
    return `$${min.toLocaleString()}–${max.toLocaleString()}`;
  };

  const categoryColor = getCategoryColor(job.category);
  const levelColor = getLevelColor(job.experience_level);

  const getLogo = () => {
    if (job.company_logo_from_companies) return job.company_logo_from_companies;
    if (job.companyLogo && job.companyLogo.length > 2) return job.companyLogo;
    return null;
  };

  const logoToShow = getLogo();
  const showLetterOnly = !logoToShow;

  return (
    <>
      <div
        onClick={() => router.push(`/job/${job.id}`)}
        className={`group bg-[#0f172a] rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/50 hover:shadow-[0_0_25px_rgba(59,130,246,0.35)] cursor-pointer ${
          job.is_featured 
            ? "border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.1)]" 
            : "border-white/10"
        }`}
      >
        <div className="p-3">
          <div className="flex gap-3">
            {/* Logo - uses CSS classes */}
            <div className="flex-shrink-0 self-start">
              <div 
                className={`job-card-logo rounded-xl flex items-center justify-center font-bold ${showLetterOnly ? (job.companyLogoBgColor || "bg-gradient-to-br from-blue-500/20 to-purple-500/20") : "bg-transparent"} border border-white/10`}
              >
                {logoToShow ? (
                  <img src={logoToShow} alt={job.company} className="w-full h-full object-contain rounded-xl" />
                ) : (
                  <span className="job-card-logo-text bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                    {job.company?.charAt(0).toUpperCase() || "C"}
                  </span>
                )}
              </div>
            </div>

            {/* All Content - Right side */}
            <div className="flex-1 min-w-0">
              {/* Title Row */}
              <div className="flex items-start justify-between gap-1">
                <h3 className="job-card-title text-white font-semibold break-words flex-1">
                  {job.title}
                </h3>
                
                {/* Save + Arrow */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={toggleSave}
                    disabled={loading}
                    className="job-card-save-button rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-50"
                    aria-label="Save job"
                  >
                    {isSaved ? (
                      <svg className="job-card-save-icon text-yellow-400" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    ) : (
                      <svg className="job-card-save-icon text-white hover:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    )}
                  </button>
                  <svg className="job-card-arrow-icon text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* Company Name */}
              <p className="job-card-company text-gray-400 mt-0.5">{job.company}</p>

              {/* 4 Details */}
              <div className="job-card-details flex flex-wrap items-center">
                <span className="job-card-detail-text flex items-center text-gray-400">
                  <LocationIcon /> <span className="truncate">{job.location}</span>
                </span>
                <span className="job-card-detail-text flex items-center text-gray-400">
                  <BriefcaseIcon /> {job.type}
                </span>
                <span className={`job-card-detail-text flex items-center ${levelColor}`}>
                  <GraduationIcon /> <span className="truncate">{job.experience_level || "Not specified"}</span>
                </span>
                <span className="job-card-detail-text flex items-center text-gray-400 group-hover:text-green-400 transition-colors duration-200">
                  <DollarIcon /> {formatSalary(job.salary_min, job.salary_max)}
                </span>
              </div>

              {/* Bottom Row */}
              <div className="job-card-bottom flex flex-wrap items-center justify-between gap-1 border-t border-white/10">
                <div className="job-card-time flex items-center text-gray-500">
                  <span className="flex items-center gap-0.5">
                    <ClockIcon /> {timeAgo(job.postedAt)}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <EyeIcon /> {job.applicants_count || 0}
                  </span>
                </div>
                <span className={`job-card-category rounded-full border ${categoryColor} whitespace-nowrap`}>
                  {job.category || "Uncategorized"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </>
  );
}