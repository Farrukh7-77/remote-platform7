// components/JobCard.tsx - Fixed null salary
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Job = {
  id: number;
  title: string;
  company: string;
  companyLogo: string;
  companyLogoBgColor: string;
  location: string;
  type: string;
  salaryMin: number | null;
  salaryMax: number | null;
  description: string;
  postedAt: string;
  featured: boolean;
};

function getRelativeTime(dateString: string): string {
  const now = new Date();
  const posted = new Date(dateString);
  const diffMs = now.getTime() - posted.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays > 30) return posted.toLocaleDateString();
  if (diffDays > 7) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays >= 1) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  if (diffHours >= 1) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffMinutes >= 1) return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
  return "Just now";
}

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
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem(`bookmark_${job.id}`) === 'true';
    return false;
  });

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newVal = !isBookmarked;
    setIsBookmarked(newVal);
    localStorage.setItem(`bookmark_${job.id}`, String(newVal));
  };

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min || !max) return "Salary not specified";
    if (min >= 20000) return `$${Math.round(min / 1000)}k–${Math.round(max / 1000)}k`;
    return `$${min.toLocaleString()}–${max.toLocaleString()}`;
  };

  const relativeTime = getRelativeTime(job.postedAt);

  return (
    <div
      onClick={() => router.push(`/job/${job.id}`)}
      className={`bg-white border border-gray-600 rounded-lg p-4 hover:shadow-lg cursor-pointer transition-all duration-200 ${
        job.featured ? "border-l-4 border-l-yellow-500 bg-yellow-50/30" : ""
      }`}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-base font-semibold text-gray-950">{job.title}</h3>
        <button
          onClick={toggleBookmark}
          className={`text-lg cursor-pointer transition-all duration-200 hover:scale-110 ${
            isBookmarked ? "text-red-500" : "text-gray-400 hover:text-yellow-500"
          }`}
          aria-label="Save job"
        >
          ★
        </button>
      </div>

      <p className="text-sm text-gray-700 mt-1">{job.company}</p>

      <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2.5 py-1 text-xs bg-gray-50 text-gray-700 rounded-full border border-gray-300">
            <LocationIcon /> {job.location}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 text-xs bg-gray-50 text-gray-700 rounded-full border border-gray-300">
            <BriefcaseIcon /> {job.type}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 text-xs bg-gray-50 text-gray-700 rounded-full border border-gray-300">
            <GraduationIcon /> Senior Level
          </span>
          <span className="inline-flex items-center px-2.5 py-1 text-xs bg-gray-50 text-gray-700 rounded-full border border-gray-300">
            <DollarIcon /> {formatSalary(job.salaryMin, job.salaryMax)}
          </span>
        </div>
        <span className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
          📅 {relativeTime}
        </span>
      </div>
    </div>
  );
}