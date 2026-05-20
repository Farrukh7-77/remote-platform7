// app/page.tsx - Only animations added, design unchanged
"use client";

import { useState, useEffect } from "react";
import JobCard from "@/components/JobCard";
import Link from "next/link";

// SVG Icons (same as before)
const BriefcaseIcon = () => <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const FolderIcon = () => <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>;
const GlobeIcon = () => <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const GraduationIcon = () => <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422M12 14l6.16-3.422M12 18l9-5-9-5-9 5 9 5zm0 0l6.16-3.422" /></svg>;
const DollarIcon = () => <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

export default function HomePage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [salaryRange, setSalaryRange] = useState<[number, number]>([2000, 15000]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);

  const [openSections, setOpenSections] = useState({
    jobType: false,
    category: false,
    country: false,
    experience: false,
    salary: false,
  });

  useEffect(() => {
    fetch("/api/jobs")
      .then(res => res.json())
      .then(data => {
        setJobs(data.jobs || []);
        setLoading(false);
        setTimeout(() => setPageLoaded(true), 100);
      })
      .catch(err => {
        console.error("Failed to load jobs:", err);
        setLoading(false);
      });
  }, []);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const jobTypes = ["Full-time", "Part-time", "Contract", "Remote", "Internship"];
  const categories = ["Design", "Engineering", "Marketing", "Writing", "Customer Support", "Sales"];
  const countries = ["USA", "UK", "Germany", "Canada", "Australia", "Spain", "France", "Netherlands"];
  const experienceLevels = ["Entry (0-2 years)", "Mid (3-5 years)", "Senior (5+ years)"];

  const toggleArray = (arr: string[], setArr: any, val: string) => {
    setArr(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const resetFilters = () => {
    setSelectedTypes([]);
    setSelectedCategories([]);
    setSalaryRange([2000, 15000]);
    setSelectedCountries([]);
    setSelectedExperience([]);
    setSearchTerm("");
  };

  const filteredJobs = jobs
    .filter((job: any) => {
      const matchSearch = searchTerm === "" ||
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase());

      const matchType = selectedTypes.length === 0 || selectedTypes.includes(job.type);

      let matchCategory = true;
      if (selectedCategories.length > 0) {
        const categoryKeywords: Record<string, string[]> = {
          Design: ["design", "ui", "ux", "creative"],
          Engineering: ["developer", "engineer", "devops", "frontend", "backend"],
          Marketing: ["marketing", "seo", "social media"],
          Writing: ["writer", "content", "copywriter"],
          "Customer Support": ["support", "customer success"],
          Sales: ["sales", "business development"],
        };
        matchCategory = selectedCategories.some(cat =>
          categoryKeywords[cat]?.some(kw => job.title.toLowerCase().includes(kw))
        );
      }

      const avgSalary = (job.salary_min + job.salary_max) / 2;
      const matchSalary = avgSalary >= salaryRange[0] && avgSalary <= salaryRange[1];
      const matchCountry = selectedCountries.length === 0 || selectedCountries.some(c => job.location.includes(c));

      let matchesExperience = true;
      if (selectedExperience.length > 0) {
        let expMatched = false;
        if (selectedExperience.includes("Entry (0-2 years)") && job.salary_max < 4000) expMatched = true;
        if (selectedExperience.includes("Mid (3-5 years)") && job.salary_max >= 4000 && job.salary_max < 8000) expMatched = true;
        if (selectedExperience.includes("Senior (5+ years)") && job.salary_max >= 8000) expMatched = true;
        matchesExperience = expMatched;
      }

      return matchSearch && matchType && matchCategory && matchSalary && matchCountry && matchesExperience;
    })
    .sort((a: any, b: any) => (a.featured === b.featured ? 0 : a.featured ? -1 : 1));

  const activeFilterCount = selectedTypes.length + selectedCategories.length + selectedCountries.length + selectedExperience.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-500 animate-pulse">Loading jobs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-100 transition-opacity duration-700 ${pageLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Header - Gradient (unchanged but added subtle animation) */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5 transform -skew-y-6"></div>
        <div className="max-w-7xl mx-auto px-4 text-center relative">
          <h1 className="text-3xl font-bold text-white mb-4 animate-fade-in-up">Remote Jobs</h1>
          <div className="max-w-xl mx-auto flex bg-white rounded-lg shadow-md transition-all duration-300 focus-within:shadow-lg">
            <input
              type="text"
              placeholder="Search by title, company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 rounded-l-lg focus:outline-none text-gray-900 placeholder-gray-500 transition-all duration-200"
            />
            <button className="bg-blue-600 text-white px-5 rounded-r-lg hover:bg-blue-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
              Search
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Filter Button */}
      <div className="md:hidden flex justify-end px-4 py-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium shadow-md hover:bg-blue-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-yellow-400 text-black text-xs px-1.5 py-0.5 rounded-full animate-pulse">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* FILTER SIDEBAR */}
          <div className={`${showFilters ? "block animate-slide-down" : "hidden"} md:block md:w-72 md:ml-10`}>
            <div className="bg-white rounded-xl border border-gray-500 shadow-sm p-4 transition-all duration-200 hover:shadow-md">
              <div className="relative flex justify-center items-center mb-4">
                <h3 className="font-semibold text-gray-800 text-center">Filters</h3>
                <button onClick={resetFilters} className="absolute right-0 text-xs text-red-600 hover:text-red-700 transition-colors duration-200 hover:scale-105 cursor-pointer">
                  Reset all
                </button>
              </div>
              <div className="space-y-3">
                <FilterCard title="Job Type" icon={<BriefcaseIcon />} open={openSections.jobType} onToggle={() => toggleSection("jobType")} items={jobTypes} selected={selectedTypes} onChange={(v) => toggleArray(selectedTypes, setSelectedTypes, v)} />
                <FilterCard title="Category" icon={<FolderIcon />} open={openSections.category} onToggle={() => toggleSection("category")} items={categories} selected={selectedCategories} onChange={(v) => toggleArray(selectedCategories, setSelectedCategories, v)} />
                <FilterCard title="Country" icon={<GlobeIcon />} open={openSections.country} onToggle={() => toggleSection("country")} items={countries} selected={selectedCountries} onChange={(v) => toggleArray(selectedCountries, setSelectedCountries, v)} />
                <FilterCard title="Experience" icon={<GraduationIcon />} open={openSections.experience} onToggle={() => toggleSection("experience")} items={experienceLevels} selected={selectedExperience} onChange={(v) => toggleArray(selectedExperience, setSelectedExperience, v)} />
                <FilterCard title="Salary" icon={<DollarIcon />} open={openSections.salary} onToggle={() => toggleSection("salary")} isSalary salaryRange={salaryRange} setSalaryRange={setSalaryRange} />
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-3xl mx-auto">
            <div className="space-y-4">
              {filteredJobs.map((job: any, index: number) => (
                <div 
                  key={job.id} 
                  className="animate-card"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <JobCard job={job} />
                </div>
              ))}
            </div>
          </div>
        </div>
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
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }
        
        .animate-slide-down {
          animation: slideDown 0.3s ease-out;
        }
        
        .animate-card {
          opacity: 0;
          animation: fadeInUp 0.4s ease-out forwards;
        }
        
        /* Filter card hover effect */
        .filter-card-hover {
          transition: all 0.2s ease;
        }
        
        .filter-card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
      `}</style>
    </div>
  );
}

// FilterCard Component (with added hover effect)
function FilterCard({
  title,
  icon,
  open,
  onToggle,
  items,
  selected,
  onChange,
  isSalary,
  salaryRange,
  setSalaryRange,
}: {
  title: string;
  icon?: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  items?: string[];
  selected?: string[];
  onChange?: (v: string) => void;
  isSalary?: boolean;
  salaryRange?: [number, number];
  setSalaryRange?: (range: [number, number]) => void;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-200 filter-card-hover">
      <button onClick={onToggle} className="w-full flex justify-between items-center text-gray-800 cursor-pointer px-3 py-3 transition-colors duration-200 hover:text-blue-600">
        <span className="flex items-center gap-2 text-sm font-medium">
          {icon && <span className="text-gray-500 group-hover:text-blue-500 transition-colors">{icon}</span>}
          {title}
        </span>
        <span className={`text-gray-500 text-xs transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-1 border-t border-gray-100 pt-2 animate-slide-down">
          {!isSalary && items && selected && onChange && items.map((item) => (
            <label key={item} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-blue-600 transition-colors duration-200">
              <input type="checkbox" checked={selected.includes(item)} onChange={() => onChange(item)} className="cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all" />
              {item}
            </label>
          ))}
          {isSalary && salaryRange && setSalaryRange && (
            <div className="space-y-2">
              <input type="range" min="2000" max="15000" step="500" value={salaryRange[0]} onChange={(e) => setSalaryRange([+e.target.value, salaryRange[1]])} className="w-full cursor-pointer accent-blue-600 transition-all duration-100" />
              <input type="range" min="2000" max="15000" step="500" value={salaryRange[1]} onChange={(e) => setSalaryRange([salaryRange[0], +e.target.value])} className="w-full cursor-pointer accent-blue-600 transition-all duration-100" />
              <div className="text-xs text-gray-500 text-center">${salaryRange[0]} – ${salaryRange[1]}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}