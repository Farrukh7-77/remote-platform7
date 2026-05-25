// components/JobCard.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import CategoryIcon from "./CategoryIcon";

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
  company_logo_from_companies?: string;
};

// Category colors mapping
const getCategoryColor = (category?: string) => {
  switch (category?.toLowerCase()) {
    case "project management":
      return "bg-indigo-700 text-white border-indigo-600";
    case "computer & it":
    case "engineering":
      return "bg-blue-700 text-white border-blue-600";
    case "sales & business development":
      return "bg-emerald-700 text-white border-emerald-600";
    case "medical & health":
      return "bg-red-700 text-white border-red-600";
    case "operations":
      return "bg-purple-700 text-white border-purple-600";
    case "marketing & communications":
      return "bg-pink-700 text-white border-pink-600";
    case "accounting & finance":
      return "bg-green-700 text-white border-green-600";
    case "customer service":
      return "bg-yellow-700 text-white border-yellow-600";
    case "education & training":
      return "bg-orange-700 text-white border-orange-600";
    case "design":
      return "bg-cyan-700 text-white border-cyan-600";
    case "writing":
      return "bg-teal-700 text-white border-teal-600";
    case "legal":
      return "bg-violet-700 text-white border-violet-600";
    case "human resources":
      return "bg-rose-700 text-white border-rose-600";
    case "administrative":
      return "bg-gray-700 text-white border-gray-600";
    default:
      return "bg-gray-600 text-white border-gray-500";
  }
};

// Icons
const LocationIcon = () => (
  <svg className="w-3.5 h-3.5 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg className="w-3.5 h-3.5 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const DollarIcon = () => (
  <svg className="w-3.5 h-3.5 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const GraduationIcon = () => (
  <svg className="w-3.5 h-3.5 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422M12 14l6.16-3.422M12 18l9-5-9-5-9 5 9 5zm0 0l6.16-3.422" />
  </svg>
);

export default function JobCard({ job }: { job: Job }) {
  const { user, openAuthModal } = useAuth();
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Get token
  const getToken = () => localStorage.getItem("auth_token");

  // Check if job is saved on mount and when user changes
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
          headers: {
            "Authorization": `Bearer ${token}`
          }
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
        // Unsave
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
        } else {
          console.error("Failed to remove saved job");
        }
      } else {
        // Save
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
        } else {
          console.error("Failed to save job");
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

  const getShortCategory = (category?: string) => {
    if (!category) return "Uncategorized";
    switch (category.toLowerCase()) {
      case "project management":
        return "Project Mgmt";
      case "sales & business development":
        return "Sales & BD";
      case "marketing & communications":
        return "Marketing";
      case "customer service":
        return "Customer Support";
      case "accounting & finance":
        return "Finance";
      case "education & training":
        return "Education";
      case "human resources":
        return "HR";
      default:
        return category;
    }
  };

  const getLogo = () => {
    if (job.company_logo_from_companies) {
      return job.company_logo_from_companies;
    }
    if (job.companyLogo && job.companyLogo.length > 2) {
      return job.companyLogo;
    }
    return null;
  };

  const logoToShow = getLogo();
  const showLetterOnly = !logoToShow;

  return (
    <div
      onClick={() => router.push(`/job/${job.id}`)}
      className={`bg-white border rounded-lg p-3 hover:shadow-lg cursor-pointer transition-all duration-200 relative ${
        job.is_featured 
          ? "border-yellow-500 bg-yellow-50/30 border-l-4 border-l-yellow-500" 
          : "border-gray-600"
      }`}
    >
      {/* Save Button - Top Right */}
      <button
        onClick={toggleSave}
        disabled={loading}
        className="absolute top-2 right-2 w-7 h-7 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-50"
        aria-label="Save job"
      >
        {isSaved ? (
          <svg className="w-3.5 h-3.5 text-blue-600" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5 text-gray-500 hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        )}
      </button>

      {/* Top row: Logo on far right, title and company on left */}
      <div className="flex justify-between items-start gap-2 pr-8">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <CategoryIcon category={job.category} />
            <h3 className="text-sm font-semibold text-gray-950">{job.title}</h3>
          </div>
          <p className="text-xs text-gray-700 mt-0.5">{job.company}</p>
        </div>
        
        {/* Company Logo */}
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${showLetterOnly ? (job.companyLogoBgColor || "bg-gray-100 text-gray-700") : "bg-transparent"}`}>
          {logoToShow ? (
            <img src={logoToShow} alt={job.company} className="w-full h-full object-contain rounded-lg" />
          ) : (
            job.company?.charAt(0).toUpperCase() || "C"
          )}
        </div>
      </div>

      {/* Icons and Category Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-1 border-t border-gray-100">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 text-xs bg-gray-50 text-gray-700 rounded-full border border-gray-300">
            <LocationIcon /> {job.location}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 text-xs bg-gray-50 text-gray-700 rounded-full border border-gray-300">
            <BriefcaseIcon /> {job.type}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 text-xs bg-gray-50 text-gray-700 rounded-full border border-gray-300">
            <GraduationIcon /> Senior Level
          </span>
          <span className="inline-flex items-center px-2 py-0.5 text-xs bg-gray-50 text-gray-700 rounded-full border border-gray-300">
            <DollarIcon /> {formatSalary(job.salary_min, job.salary_max)}
          </span>
        </div>
        
        <span className={`inline-flex items-center justify-center w-24 px-2 py-0.5 text-xs font-medium rounded-md border truncate ${categoryColor}`}>
          {getShortCategory(job.category)}
        </span>
      </div>
    </div>
  );
}