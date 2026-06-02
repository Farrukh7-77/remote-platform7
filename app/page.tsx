// app/page.tsx - PREMIUM DARK DESIGN with Hero Section
"use client";

import { useState, useEffect } from "react";
import JobCard from "@/components/JobCard";
import Link from "next/link";

// SVG Icons
const BriefcaseIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const FolderIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>;
const GlobeIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const GraduationIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422M12 14l6.16-3.422M12 18l9-5-9-5-9 5 9 5zm0 0l6.16-3.422" /></svg>;
const DollarIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const SearchIcon = () => <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const ResetIcon = () => <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;

const CATEGORIES = [
  "Project Management",
  "Computer & IT",
  "Sales & Business Development",
  "Medical & Health",
  "Operations",
  "Marketing & Communications",
  "Accounting & Finance",
  "Customer Service",
  "Engineering",
  "Education & Training",
  "Design",
  "Writing",
  "Legal",
  "Human Resources",
  "Administrative"
];

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Remote", "Internship"];
const COUNTRIES = ["USA", "UK", "Germany", "Canada", "Australia", "Spain", "France", "Netherlands"];
const EXPERIENCE_LEVELS = ["Entry (0-2 years)", "Mid (3-5 years)", "Senior (5+ years)"];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "salary_high", label: "Salary: High to Low" },
  { value: "salary_low", label: "Salary: Low to High" },
];

type FilterTab = "all" | "saved" | "applied";

export default function HomePage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [salaryRange, setSalaryRange] = useState<[number, number]>([0, 200000]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [savedJobIds, setSavedJobIds] = useState<number[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<number[]>([]);

  const [openSections, setOpenSections] = useState({
    jobType: false,
    category: false,
    country: false,
    experience: false,
    salary: false,
  });

  // Load saved jobs from API
  useEffect(() => {
    const fetchSavedJobs = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) return;
      
      try {
        const response = await fetch("/api/saved-jobs", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.savedJobIds) setSavedJobIds(data.savedJobIds);
      } catch (error) {
        console.error("Error fetching saved jobs:", error);
      }
    };
    
    const fetchAppliedJobs = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) return;
      
      try {
        const response = await fetch("/api/applications", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.applications) {
          setAppliedJobIds(data.applications.map((app: any) => app.job_id));
        }
      } catch (error) {
        console.error("Error fetching applied jobs:", error);
      }
    };
    
    fetchSavedJobs();
    fetchAppliedJobs();
  }, []);

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

  // Click outside to close sort dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.sort-dropdown')) {
        setSortOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleArray = (arr: string[], setArr: any, val: string) => {
    setArr(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const resetFilters = () => {
    setSelectedTypes([]);
    setSelectedCategories([]);
    setSalaryRange([0, 200000]);
    setSelectedCountries([]);
    setSelectedExperience([]);
    setSearchTerm("");
    setSortBy("newest");
    setActiveTab("all");
  };

  // Filter jobs
  let filteredJobs = jobs
    .filter((job: any) => {
      if (activeTab === "saved" && !savedJobIds.includes(job.id)) return false;
      if (activeTab === "applied" && !appliedJobIds.includes(job.id)) return false;
      
      const matchSearch = searchTerm === "" ||
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase());

      const matchType = selectedTypes.length === 0 || selectedTypes.includes(job.type);
      const matchCategory = selectedCategories.length === 0 || 
        (job.category && selectedCategories.includes(job.category));

      const avgSalary = (job.salary_min + job.salary_max) / 2;
      const matchSalary = avgSalary >= salaryRange[0] && avgSalary <= salaryRange[1];
      const matchCountry = selectedCountries.length === 0 || selectedCountries.some(c => job.location.includes(c));
      const matchesExperience = selectedExperience.length === 0 || 
        (job.experience_level && selectedExperience.includes(job.experience_level));

      return matchSearch && matchType && matchCategory && matchSalary && matchCountry && matchesExperience;
    });

  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a: any, b: any) => {
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    
    switch (sortBy) {
      case "newest":
        return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
      case "oldest":
        return new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime();
      case "salary_high":
        return (b.salary_max || 0) - (a.salary_max || 0);
      case "salary_low":
        return (a.salary_min || 0) - (b.salary_min || 0);
      default:
        return 0;
    }
  });

  const activeFilterCount = selectedTypes.length + selectedCategories.length + selectedCountries.length + selectedExperience.length;

  const totalJobs = jobs.length;
  const savedCount = savedJobIds.length;
  const appliedCount = appliedJobIds.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-400 animate-pulse">Loading jobs...</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen transition-opacity duration-700 ${pageLoaded ? 'opacity-100' : 'opacity-0'}`}
      style={{ backgroundColor: '#091028' }}
    >
      {/* HERO SECTION with Background Image - FIXED RESPONSIVE */}
      <section className="hero-section relative overflow-hidden pt-5 pb-5 px-4 bg-cover bg-no-repeat bg-center md:bg-center" style={{ backgroundImage: "url('/hero-bg.png')" }}>
        {/* Light overlay */}
        <div className="absolute inset-0 bg-black/0 pointer-events-none"></div>
        
        {/* Gradient effects */}
        <div className="hero-gradient absolute inset-0 pointer-events-none opacity-20"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="hidden lg:block absolute lg:-left-16 xl:-left-24 top-1/2 -translate-y-1/2 w-96 h-96 pointer-events-none z-0">
          <img 
            src="/hero-laptop.png" 
            alt="laptop illustration" 
            className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]"
          />
        </div>

        <div className="absolute -left-9 sm:left-0 top-[57%] sm:top-1/2 -translate-y-1/2 pointer-events-none z-0 lg:hidden">
          <img 
            src="/hero-laptop.png" 
            alt="laptop" 
            className="w-32 h-32 sm:w-48 sm:h-48 md:w-80 md:h-80 object-contain drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]"
          />
        </div>
        
        <div className="absolute right-[-20px] sm:right-0 top-[55%] sm:top-1/2 -translate-y-1/2 pointer-events-none z-0">
          <img 
            src="/hero-earth.png" 
            alt="earth" 
            className="w-28 sm:w-48 md:w-56 lg:w-64 xl:w-72 object-contain drop-shadow-[0_0_30px_rgba(59,130,246,0.3)] opacity-80 sm:opacity-100"
          />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="hero-title text-base sm:text-lg md:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 md:mb-4 flex flex-wrap justify-center items-center gap-1 sm:gap-2 md:gap-3 mt-0 md:mt-0">
            <span className="text-white">Find Your</span>{' '}
            <span className="text-white">Next</span>{' '}
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Remote</span>{' '}
            <span className="text-white">Job</span>
            <img 
              src="/job-icon.png" 
              alt="job icon" 
              className="hero-icon w-8 h-8 sm:w-8 sm:h-8 md:w-16 md:h-16 lg:w-20 lg:h-20 object-contain md:relative md:top-[-6px] md:left-[-12px]"
            />
          </h1>
          
          <div className="hero-search-container max-w-[240px] sm:max-w-[280px] md:max-w-2xl mx-auto mt-2 md:-mt-6 px-2 sm:px-4">
            <div className="relative group">
              <div className="relative flex items-center bg-[#0f172a]/60 backdrop-blur-sm border border-white/15 rounded-lg overflow-hidden focus-within:border-blue-500/40 transition-all duration-300">
                <div className="pl-2 sm:pl-3 md:pl-4">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-2 sm:px-3 md:px-3 py-2 sm:py-2.5 md:py-3 bg-transparent focus:outline-none text-white placeholder-gray-400 text-xs sm:text-sm"
                />
                <button className="bg-gradient-to-r from-blue-700 to-blue-600 text-white font-semibold py-1.5 sm:py-2 md:py-2 px-2.5 sm:px-4 md:px-5 m-0.5 sm:m-1 rounded-md transition-all duration-200 hover:scale-[1.02] flex items-center gap-1 text-xs sm:text-sm">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="w-full px-3 md:px-4 lg:px-6 py-4 md:py-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          
          {/* FILTER SIDEBAR - Desktop only */}
          <div className={`${showFilters ? "block animate-slide-down" : "hidden"} md:block md:w-72`}>
            <div className="glass-card p-4 md:p-5 transition-all duration-300 sticky top-24">
              <div className="relative flex justify-between items-center mb-4 md:mb-5">
                <h3 className="font-bold text-white text-base md:text-lg">Filters</h3>
                <button onClick={resetFilters} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-400 transition-colors cursor-pointer">
                  <ResetIcon />
                  Reset all
                </button>
              </div>
              <div className="space-y-2">
                <FilterCard title="Job Type" icon={<BriefcaseIcon />} open={openSections.jobType} onToggle={() => toggleSection("jobType")} items={JOB_TYPES} selected={selectedTypes} onChange={(v) => toggleArray(selectedTypes, setSelectedTypes, v)} />
                <FilterCard title="Category" icon={<FolderIcon />} open={openSections.category} onToggle={() => toggleSection("category")} items={CATEGORIES} selected={selectedCategories} onChange={(v) => toggleArray(selectedCategories, setSelectedCategories, v)} />
                <FilterCard title="Country" icon={<GlobeIcon />} open={openSections.country} onToggle={() => toggleSection("country")} items={COUNTRIES} selected={selectedCountries} onChange={(v) => toggleArray(selectedCountries, setSelectedCountries, v)} />
                <FilterCard title="Experience" icon={<GraduationIcon />} open={openSections.experience} onToggle={() => toggleSection("experience")} items={EXPERIENCE_LEVELS} selected={selectedExperience} onChange={(v) => toggleArray(selectedExperience, setSelectedExperience, v)} />
                <FilterCard title="Salary" icon={<DollarIcon />} open={openSections.salary} onToggle={() => toggleSection("salary")} isSalary salaryRange={salaryRange} setSalaryRange={setSalaryRange} />
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - Jobs */}
          <div className="flex-1 min-w-0">
            {/* ===== MOBILE & DESKTOP: Tabs + Filter + Sort ALL IN ONE ROW ===== */}
            <div className="flex flex-row items-center justify-between gap-2 mb-4">
              
              {/* Tabs - solda */}
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-2 sm:px-3 md:px-5 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    activeTab === "all"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  All <span className="hidden xs:inline">Jobs</span> <span className="ml-0.5 md:ml-1 text-xs opacity-80">({totalJobs})</span>
                </button>
                <button
                  onClick={() => setActiveTab("saved")}
                  className={`px-2 sm:px-3 md:px-5 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    activeTab === "saved"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Saved <span className="ml-0.5 md:ml-1 text-xs opacity-80">({savedCount})</span>
                </button>
                <button
                  onClick={() => setActiveTab("applied")}
                  className={`px-2 sm:px-3 md:px-5 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    activeTab === "applied"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Applied <span className="ml-0.5 md:ml-1 text-xs opacity-80">({appliedCount})</span>
                </button>
              </div>

              {/* Sağ tərəfdəki elementlər: Filter (yalnız mobile) + Sort */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Filter button - YALNIZ MOBİL ÜÇÜN (desktop-da görünmür) */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden flex items-center gap-1 px-2 py-1.5 glass-card text-xs rounded-full"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span>Filter</span>
                  {activeFilterCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Sort Dropdown */}
                <div className="sort-dropdown relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSortOpen(!sortOpen); }}
                    className="flex items-center gap-1 md:gap-2 px-2 sm:px-3 md:px-4 py-1.5 md:py-2 glass-card text-xs md:text-sm text-gray-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                    <span className="hidden sm:inline">Sort:</span>
                    <span className="text-blue-400 text-xs md:text-sm hidden sm:inline">
                      {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                    </span>
                    <svg className={`w-3 h-3 md:w-4 md:h-4 transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {sortOpen && (
                    <div className="absolute right-0 mt-2 w-40 md:w-48 bg-[#0f172a] rounded-xl border border-white/10 py-1 z-20 animate-fade-in-up">
                      {SORT_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value);
                            setSortOpen(false);
                          }}
                          className={`w-full text-left px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm transition-colors duration-150 cursor-pointer ${
                            sortBy === option.value
                              ? "text-blue-400 bg-blue-500/10"
                              : "text-gray-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Job Cards */}
            <div className="space-y-3 md:space-y-4">
              {sortedJobs.map((job: any, index: number) => (
                <div key={job.id} className="animate-card w-full" style={{ animationDelay: `${index * 50}ms` }}>
                  <JobCard job={job} />
                </div>
              ))}
            </div>

            {sortedJobs.length === 0 && (
              <div className="glass-card p-8 md:p-12 text-center">
                <p className="text-gray-400 text-sm md:text-base">No jobs found matching your criteria</p>
                <button onClick={resetFilters} className="mt-3 md:mt-4 text-blue-400 hover:text-blue-300 text-sm cursor-pointer">
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out; }
        .animate-slide-down { animation: slideDown 0.3s ease-out; }
        .animate-card { opacity: 0; animation: fadeInUp 0.4s ease-out forwards; }
        
        @media (max-width: 480px) {
          .xs\\:inline { display: inline; }
        }
        @media (min-width: 481px) {
          .xs\\:inline { display: none; }
        }
      `}</style>
    </div>
  );
}

// FilterCard component
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
    <div className="border border-white/15 rounded-xl overflow-hidden shadow-[0_2px_6px_rgba(0,0,0,0.35)] transition-all duration-200 hover:-translate-y-0.5">
      <button 
        onClick={onToggle} 
        className="w-full flex justify-between items-center text-gray-300 cursor-pointer px-3 md:px-4 py-3 md:py-4 transition-colors duration-200 hover:text-white bg-[#0a0f1a]"
      >
        <span className="flex items-center gap-2 md:gap-2.5 text-xs md:text-sm font-medium">
          {icon && <span className="text-blue-400">{icon}</span>}
          {title}
        </span>
        <span className={`text-gray-500 text-xs transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {open && (
        <div className="px-3 md:px-4 pb-3 md:pb-4 space-y-1.5 border-t border-white/10 pt-2 md:pt-3 animate-slide-down bg-[#0f172a]">
          {!isSalary && items && selected && onChange && items.map((item) => (
            <label key={item} className="flex items-center gap-2 text-xs md:text-sm text-gray-400 cursor-pointer hover:text-blue-400 transition-colors duration-200 py-0.5">
              <input type="checkbox" checked={selected.includes(item)} onChange={() => onChange(item)} className="cursor-pointer rounded border-gray-600 bg-transparent text-blue-500 focus:ring-blue-500 transition-all" />
              {item}
            </label>
          ))}
          {isSalary && salaryRange && setSalaryRange && (
            <div className="space-y-3 py-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>${salaryRange[0]}</span>
                <span>${salaryRange[1]}</span>
              </div>
              <input 
                type="range" 
                min="2000" 
                max="15000" 
                step="500" 
                value={salaryRange[0]} 
                onChange={(e) => setSalaryRange([+e.target.value, salaryRange[1]])} 
                className="w-full cursor-pointer accent-blue-500 transition-all duration-100" 
              />
              <input 
                type="range" 
                min="2000" 
                max="15000" 
                step="500" 
                value={salaryRange[1]} 
                onChange={(e) => setSalaryRange([salaryRange[0], +e.target.value])} 
                className="w-full cursor-pointer accent-blue-500 transition-all duration-100" 
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}