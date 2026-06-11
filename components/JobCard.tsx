// components/JobCard.tsx - SEPARATE MOBILE & DESKTOP STYLES
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
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
  views_count?: number;
  
};

// Experience level color
const getLevelColor = (level?: string, theme?: string) => {
  switch (level?.toLowerCase()) {
    case "entry (0-2 years)":
      return theme === "light" ? "text-green-700" : "text-green-400";
    case "mid (3-5 years)":
      return theme === "light" ? "text-blue-700" : "text-blue-400";
    case "senior (5+ years)":
      return theme === "light" ? "text-purple-700" : "text-purple-400";
    default:
      return theme === "light" ? "text-gray-600" : "text-gray-400";
  }
};

// Theme-ə uyğun kateqoriya rəngi
const getCategoryColorByTheme = (category?: string, theme?: string) => {
  const lowerCategory = category?.toLowerCase() || "";
  
  // Kateqoriya rəng map-i (gündüz rejimi üçün tünd, gecə üçün açıq)
  const colorMap: Record<string, string> = {
    "project management": theme === "light" ? "text-indigo-700" : "text-indigo-400",
    "computer & it": theme === "light" ? "text-blue-700" : "text-blue-400",
    "it": theme === "light" ? "text-blue-700" : "text-blue-400",
    "technology": theme === "light" ? "text-cyan-700" : "text-cyan-400",
    "sales & business development": theme === "light" ? "text-emerald-700" : "text-emerald-400",
    "sales": theme === "light" ? "text-emerald-700" : "text-emerald-400",
    "business development": theme === "light" ? "text-emerald-700" : "text-emerald-400",
    "medical & health": theme === "light" ? "text-red-700" : "text-red-400",
    "healthcare": theme === "light" ? "text-red-700" : "text-red-400",
    "operations": theme === "light" ? "text-purple-700" : "text-purple-400",
    "marketing & communications": theme === "light" ? "text-pink-700" : "text-pink-400",
    "marketing": theme === "light" ? "text-pink-700" : "text-pink-400",
    "communications": theme === "light" ? "text-pink-700" : "text-pink-400",
    "accounting & finance": theme === "light" ? "text-green-700" : "text-green-400",
    "accounting": theme === "light" ? "text-green-700" : "text-green-400",
    "finance": theme === "light" ? "text-green-700" : "text-green-400",
    "customer service": theme === "light" ? "text-yellow-700" : "text-yellow-400",
    "support": theme === "light" ? "text-yellow-700" : "text-yellow-400",
    "engineering": theme === "light" ? "text-slate-700" : "text-slate-400",
    "education & training": theme === "light" ? "text-orange-700" : "text-orange-400",
    "education": theme === "light" ? "text-orange-700" : "text-orange-400",
    "training": theme === "light" ? "text-orange-700" : "text-orange-400",
    "design": theme === "light" ? "text-rose-700" : "text-rose-400",
    "writing": theme === "light" ? "text-teal-700" : "text-teal-400",
    "content": theme === "light" ? "text-teal-700" : "text-teal-400",
    "legal": theme === "light" ? "text-violet-700" : "text-violet-400",
    "human resources": theme === "light" ? "text-amber-700" : "text-amber-400",
    "hr": theme === "light" ? "text-amber-700" : "text-amber-400",
    "administrative": theme === "light" ? "text-gray-700" : "text-gray-400",
    "admin": theme === "light" ? "text-gray-700" : "text-gray-400",
  };
  
  // Tam uyğunluğu yoxla
  for (const [key, value] of Object.entries(colorMap)) {
    if (lowerCategory === key) {
      return value;
    }
  }
  
  // Qismən uyğunluğu yoxla
  for (const [key, value] of Object.entries(colorMap)) {
    if (lowerCategory.includes(key)) {
      return value;
    }
  }
  
  // Default rəng
  return theme === "light" ? "text-gray-700" : "text-gray-400";
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
  <svg className="job-card-detail-icon salary-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
// Helper function to format time ago
// Helper function to format time ago
function timeAgo(date: string) {
  if (!date) return "Recently";
  
  const timestamp = new Date(date).getTime();
  if (isNaN(timestamp)) return "Recently";
  
  const seconds = Math.floor((new Date().getTime() - timestamp) / 1000);
  if (seconds < 0 || isNaN(seconds)) return "Recently";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Salary format function - returns both short and long formats
const formatSalary = (min: number | null, max: number | null) => {
  if (!min || !max) return { short: "Not specified", long: "Not specified" };
  
  // Qısa format (40k–100k)
  const short = min >= 20000 
    ? `$${Math.round(min / 1000)}k–$${Math.round(max / 1000)}k`
    : `$${min.toLocaleString()}–$${max.toLocaleString()}`;
  
  // Uzun format (40,000–100,000)
  const long = `$${min.toLocaleString()}–$${max.toLocaleString()}`;
  
  return { short, long };
};

export default function JobCard({ job }: { job: Job }) {
  const { user, openAuthModal } = useAuth();
  const { theme } = useTheme();
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
          
        }
      }
    } catch (error) {
      console.error("Error toggling save:", error);
    } finally {
      setLoading(false);
    }
  };

  const salaryFormats = formatSalary(job.salary_min, job.salary_max);
  const levelColor = getLevelColor(job.experience_level, theme);
  const categoryColor = getCategoryColorByTheme(job.category, theme);

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
        className={`group rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/50 hover:shadow-[0_0_25px_rgba(59,130,246,0.35)] cursor-pointer ${
          theme === "light" ? "bg-white" : "bg-[#0f172a]"
        } ${
          job.is_featured 
            ? "border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.1)]" 
            : theme === "light" 
              ? "border-gray-1000" 
              : "border-white/10"
        }`}
      >
        <div className="p-3">
          <div className="flex gap-3">
            {/* Logo - uses CSS classes */}
            <div className="flex-shrink-0 self-start">
              <div 
                className={`job-card-logo rounded-xl flex items-center justify-center font-bold ${showLetterOnly ? (job.companyLogoBgColor || "bg-gradient-to-br from-blue-500/20 to-purple-500/20") : "bg-transparent"} ${
                  theme === "light" ? "border border-gray-200" : "border border-white/10"
                }`}
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
                <h3 className={`job-card-title font-semibold break-words flex-1 ${theme === "light" ? "text-gray-900" : "text-white"}`}>
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
              {/* Company Name with Verified Badge */}
<div className="job-card-company-wrapper" style={{ position: "relative", top: "5px" }}>
  <div className="flex items-center gap-1.5">
    <p className={`job-card-company mt-0.5 ${theme === "light" ? "text-gray-700" : "text-gray-400"}`}>
      {job.company}
    </p>
    {/* Verified Badge - yuxarı qaldırıldı */}
    <div className="flex items-center justify-center" style={{ marginTop: "-7px" }} title="Verified Company">
      <svg 
        className="w-4 h-4 text-blue-500" 
        fill="currentColor" 
        viewBox="0 0 20 20" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    </div>
  </div>
</div>

              {/* Job Description */}
              <div className="job-card-description-wrapper" style={{ position: "relative", top: "20px" }}>
                <p className={`job-card-description text-sm line-clamp-2 ${theme === "light" ? "text-gray-600" : "text-gray-500"}`}>
                  {job.description?.substring(0, 100)}...
                </p>
              </div>

              {/* 4 Details */}
              <div className="relative" style={{ height: "auto" }}>
                <div className="job-card-details flex flex-wrap items-center" style={{ position: "relative", top: "40px" }}>
                  <span className={`job-card-detail-text flex items-center ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                    <LocationIcon /> <span className="truncate">{job.location}</span>
                  </span>
                  <span className={`job-card-detail-text flex items-center ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                    <BriefcaseIcon /> {job.type}
                  </span>
                  <span className={`job-card-detail-text flex items-center ${levelColor}`}>
                    <GraduationIcon /> <span className="truncate">{job.experience_level || "Not specified"}</span>
                  </span>
                  <span className={`job-card-detail-text salary-text flex items-center transition-all duration-200 overflow-hidden ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                    <span className="salary-icon mr-0.5">
                      <DollarIcon />
                    </span>
                    <span className="salary-short block group-hover:hidden transition-all duration-200">
                      {salaryFormats.short}
                    </span>
                    <span className="salary-long hidden group-hover:block transition-all duration-200 animate-slide-left">
                      {salaryFormats.long}
                    </span>
                  </span>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="job-card-bottom flex flex-wrap items-center justify-end gap-3 border-t border-gray-200 dark:border-white/10 pt-2 mt-1">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-0.5 text-gray-500 text-xs">
  <EyeIcon /> {job.views_count || 0}
</span>
                  <span 
  className="rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap"
  style={{ 
    color: job.category?.toLowerCase().includes('computer') || job.category?.toLowerCase().includes('it') ? '#1E40AF' :
           job.category?.toLowerCase().includes('legal') ? '#6D28D9' :
           job.category?.toLowerCase().includes('customer') ? '#B45309' :
           job.category?.toLowerCase().includes('sales') || job.category?.toLowerCase().includes('business') ? '#065F46' :
           job.category?.toLowerCase().includes('marketing') ? '#BE185D' :
           job.category?.toLowerCase().includes('medical') || job.category?.toLowerCase().includes('health') ? '#B91C1C' :
           job.category?.toLowerCase().includes('finance') || job.category?.toLowerCase().includes('accounting') ? '#15803D' :
           job.category?.toLowerCase().includes('engineering') ? '#334155' :
           job.category?.toLowerCase().includes('education') || job.category?.toLowerCase().includes('training') ? '#C2410C' :
           job.category?.toLowerCase().includes('design') ? '#BE123C' :
           job.category?.toLowerCase().includes('writing') ? '#0F766E' :
           job.category?.toLowerCase().includes('human') || job.category?.toLowerCase().includes('hr') ? '#D97706' :
           job.category?.toLowerCase().includes('project') ? '#4338CA' :
           job.category?.toLowerCase().includes('operation') ? '#7E22CE' :
           theme === 'light' ? '#374151' : '#9CA3AF',
    backgroundColor: job.category?.toLowerCase().includes('computer') || job.category?.toLowerCase().includes('it') ? '#DBEAFE' :
                     job.category?.toLowerCase().includes('legal') ? '#EDE9FE' :
                     job.category?.toLowerCase().includes('customer') ? '#FEF3C7' :
                     job.category?.toLowerCase().includes('sales') || job.category?.toLowerCase().includes('business') ? '#D1FAE5' :
                     job.category?.toLowerCase().includes('marketing') ? '#FCE7F3' :
                     job.category?.toLowerCase().includes('medical') || job.category?.toLowerCase().includes('health') ? '#FEE2E2' :
                     job.category?.toLowerCase().includes('finance') || job.category?.toLowerCase().includes('accounting') ? '#DCFCE7' :
                     job.category?.toLowerCase().includes('engineering') ? '#F1F5F9' :
                     job.category?.toLowerCase().includes('education') || job.category?.toLowerCase().includes('training') ? '#FFEDD5' :
                     job.category?.toLowerCase().includes('design') ? '#FFE4E6' :
                     job.category?.toLowerCase().includes('writing') ? '#CCFBF1' :
                     job.category?.toLowerCase().includes('human') || job.category?.toLowerCase().includes('hr') ? '#FEF3C7' :
                     job.category?.toLowerCase().includes('project') ? '#E0E7FF' :
                     job.category?.toLowerCase().includes('operation') ? '#F3E8FF' :
                     theme === 'light' ? '#F3F4F6' : 'rgba(255,255,255,0.1)',
    border: `1px solid ${theme === 'light' ? '#E5E7EB' : 'rgba(255,255,255,0.1)'}`
  }}
>
  {job.category || "Uncategorized"}
</span>
                  <span className="flex items-center gap-0.5 text-gray-500 text-xs">
                    <ClockIcon /> {timeAgo(job.postedAt || (job as any).posted_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </>
  );
}