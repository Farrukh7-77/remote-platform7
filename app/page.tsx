// app/page.tsx - WITH FEATURED BADGE
"use client";
import JobAlert from "@/components/JobAlert";
import { useState } from "react";
import { jobs, type Job } from "@/data/jobs";
import Link from "next/link";

export default function HomePage() {
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter sidebar states
  const [tempSelectedTypes, setTempSelectedTypes] = useState<string[]>([]);
  const [tempSalaryRange, setTempSalaryRange] = useState<[number, number]>([2000, 15000]);
  const [tempSelectedLocation, setTempSelectedLocation] = useState<string>("all");
  const [tempExperienceLevel, setTempExperienceLevel] = useState<string>("all");
  
  // Active filters
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [salaryRange, setSalaryRange] = useState<[number, number]>([2000, 15000]);
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [experienceLevel, setExperienceLevel] = useState<string>("all");
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 5;

  const jobTypes = ["Full-time", "Part-time", "Contract", "Remote", "Internship"];
  const locations = ["all", ...new Set(jobs.map(job => job.location.split(" / ")[0]))];

  const toggleTempJobType = (type: string) => {
    setTempSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const applyFilters = () => {
    setSelectedTypes(tempSelectedTypes);
    setSalaryRange(tempSalaryRange);
    setSelectedLocation(tempSelectedLocation);
    setExperienceLevel(tempExperienceLevel);
    setIsFilterOpen(false);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setTempSelectedTypes([]);
    setTempSalaryRange([2000, 15000]);
    setTempSelectedLocation("all");
    setTempExperienceLevel("all");
    setSelectedTypes([]);
    setSalaryRange([2000, 15000]);
    setSelectedLocation("all");
    setExperienceLevel("all");
    setCurrentPage(1);
  };

  const filteredJobs = jobs
  .filter((job) => {
    const matchesSearch = searchTerm === "" ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(job.type);
    const avgSalary = (job.salaryMin + job.salaryMax) / 2;
    const matchesSalary = avgSalary >= salaryRange[0] && avgSalary <= salaryRange[1];
    const matchesLocation = selectedLocation === "all" || job.location.includes(selectedLocation);
    
    let matchesExperience = true;
    if (experienceLevel === "entry") matchesExperience = job.salaryMax < 4000;
    else if (experienceLevel === "mid") matchesExperience = job.salaryMax >= 4000 && job.salaryMax < 8000;
    else if (experienceLevel === "senior") matchesExperience = job.salaryMax >= 8000;
    
    return matchesSearch && matchesType && matchesSalary && matchesLocation && matchesExperience;
  })
  .sort((a, b) => {
    // Featured jobs come first
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    // Then sort by date (newest first)
    return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
  });

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, startIndex + jobsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const activeFilterCount = selectedTypes.length + (selectedLocation !== "all" ? 1 : 0) + (experienceLevel !== "all" ? 1 : 0);
  const popularCategories = ["Design", "Engineering", "Marketing", "Writing", "Customer Support", "Sales"];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Find Your Dream Remote Job
            </h1>
            <p className="text-blue-100">
              {filteredJobs.length} remote opportunities available
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Search by title, company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-5 py-3 text-gray-900 placeholder-gray-400 bg-transparent focus:outline-none rounded-l-xl"
                />
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-r-xl font-medium">
                  Search
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto mt-8">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg py-3 px-2">
                <div className="text-2xl font-bold text-white">2,400+</div>
                <div className="text-xs text-blue-100">Remote Jobs</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg py-3 px-2">
                <div className="text-2xl font-bold text-white">180+</div>
                <div className="text-xs text-blue-100">Countries</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg py-3 px-2">
                <div className="text-2xl font-bold text-white">850+</div>
                <div className="text-xs text-blue-100">Companies</div>
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto mt-6">
            <div className="flex flex-wrap justify-center gap-2">
              {popularCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSearchTerm(cat)}
                  className="px-4 py-1.5 bg-white/20 hover:bg-white/30 text-white text-sm rounded-full"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="text-center mt-4 md:hidden">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="bg-white/20 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 mx-auto"
            >
              <span>🔍</span> Filters
              {activeFilterCount > 0 && (
                <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* FILTER SIDEBAR */}
          <aside className={`${isFilterOpen ? "block" : "hidden"} md:block md:w-80 flex-shrink-0`}>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 sticky top-20">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
                <button onClick={resetFilters} className="text-xs text-red-500 hover:text-red-600">Reset all</button>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Job Type</h4>
                <div className="space-y-2">
                  {jobTypes.map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={tempSelectedTypes.includes(type)} onChange={() => toggleTempJobType(type)} className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Salary Range</h4>
                <input type="range" min="2000" max="15000" step="500" value={tempSalaryRange[1]} onChange={(e) => setTempSalaryRange([tempSalaryRange[0], Number(e.target.value)])} className="w-full" />
                <div className="flex justify-between text-xs">${tempSalaryRange[0]} - ${tempSalaryRange[1]}</div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Location</h4>
                <select value={tempSelectedLocation} onChange={(e) => setTempSelectedLocation(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800">
                  {locations.map((loc) => (<option key={loc} value={loc}>{loc === "all" ? "All Locations" : loc}</option>))}
                </select>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Experience Level</h4>
                <div className="space-y-2">
                  {[
                    { value: "all", label: "All Levels" },
                    { value: "entry", label: "Entry Level (0-2 years)" },
                    { value: "mid", label: "Mid Level (3-5 years)" },
                    { value: "senior", label: "Senior Level (5+ years)" },
                  ].map((level) => (
                    <label key={level.value} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="tempExperience" value={level.value} checked={tempExperienceLevel === level.value} onChange={(e) => setTempExperienceLevel(e.target.value)} className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{level.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button onClick={applyFilters} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg mt-4">Apply Filters</button>
              
              {/* JOB ALERT COMPONENT */}
              <JobAlert
                filters={{
                  searchTerm,
                  selectedTypes: tempSelectedTypes,
                  salaryRange: tempSalaryRange,
                  selectedLocation: tempSelectedLocation,
                  experienceLevel: tempExperienceLevel,
                }}
              />
            </div>
          </aside>

          {/* JOB LISTINGS */}
          <div className="flex-1">
            <div className="mb-5 flex justify-between items-center">
              <p className="text-gray-600 text-sm">Showing <span className="font-semibold">{currentJobs.length}</span> of <span className="font-semibold">{filteredJobs.length}</span> jobs</p>
              {activeFilterCount > 0 && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{activeFilterCount} active filter(s)</span>}
            </div>

            <div className="space-y-4">
              {currentJobs.map((job) => (<JobCard key={job.id} job={job} />))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-700">← Previous</button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button key={page} onClick={() => goToPage(page)} className={`w-10 h-10 rounded-lg transition ${currentPage === page ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300"}`}>{page}</button>
                  ))}
                </div>
                <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300">Next →</button>
              </div>
            )}

            {filteredJobs.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border">
                <p className="text-gray-500">No jobs match your filters.</p>
                <button onClick={resetFilters} className="mt-3 text-blue-600 text-sm">Reset all filters</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Job Card Component with FEATURED BADGE
function JobCard({ job }: { job: Job }) {
  const isNew = new Date(job.postedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  const [isBookmarked, setIsBookmarked] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`bookmark_${job.id}`);
      return saved === 'true';
    }
    return false;
  });

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newValue = !isBookmarked;
    setIsBookmarked(newValue);
    localStorage.setItem(`bookmark_${job.id}`, String(newValue));
  };
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-lg transition-all">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 rounded-xl ${job.companyLogoBgColor} flex items-center justify-center font-bold text-lg`}>
              {job.companyLogo}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                {isNew && <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full font-medium">New</span>}
                {job.featured && (
                  <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs rounded-full font-medium">
                    ⭐ Featured
                  </span>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{job.company}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">{job.type}</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">📍 {job.location}</span>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">💰 ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}/mo</span>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{job.description}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Posted: {new Date(job.postedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
        </div>
        
        <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2">
          <button onClick={toggleBookmark} className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isBookmarked ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
            <span>{isBookmarked ? "🔖" : "📑"}</span>
            <span>{isBookmarked ? "Saved" : "Save"}</span>
          </button>
          <Link href={`/job/${job.id}`} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg text-center text-sm">View Details →</Link>
        </div>
      </div>
    </div>
  );
}