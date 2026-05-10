// app/page.tsx - One outer card containing individual filter cards
"use client";

import { useState, useEffect, useRef } from "react";
import { jobs } from "@/data/jobs";
import JobCard from "@/components/JobCard";

// SVG Icons
const BriefcaseIcon = () => <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const FolderIcon = () => <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>;
const GlobeIcon = () => <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const GraduationIcon = () => <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422M12 14l6.16-3.422M12 18l9-5-9-5-9 5 9 5zm0 0l6.16-3.422" /></svg>;
const DollarIcon = () => <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [salaryRange, setSalaryRange] = useState<[number, number]>([2000, 15000]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const [openSections, setOpenSections] = useState({
    jobType: false,
    category: false,
    country: false,
    experience: false,
    salary: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem("filterSections");
    if (saved) setOpenSections(JSON.parse(saved));
  }, []);

  const toggleSection = (section: keyof typeof openSections) => {
    const newState = { ...openSections, [section]: !openSections[section] };
    setOpenSections(newState);
    localStorage.setItem("filterSections", JSON.stringify(newState));
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
    .filter((job) => {
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

      const avgSalary = (job.salaryMin + job.salaryMax) / 2;
      const matchSalary = avgSalary >= salaryRange[0] && avgSalary <= salaryRange[1];
      const matchCountry = selectedCountries.length === 0 || selectedCountries.some(c => job.location.includes(c));

      return matchSearch && matchType && matchCategory && matchSalary && matchCountry;
    })
    .sort((a, b) => (a.featured === b.featured ? 0 : a.featured ? -1 : 1));

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Remote Jobs</h1>
          <div className="max-w-xl mx-auto flex bg-white rounded-lg shadow">
            <input
              type="text"
              placeholder="Search by title, company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 rounded-l-lg focus:outline-none text-gray-900 placeholder-gray-500"
            />
            <button className="bg-blue-600 text-white px-5 rounded-r-lg hover:bg-blue-700 cursor-pointer">Search</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* FILTER SIDEBAR - one outer card containing everything */}
          <aside className={`${showFilters ? "block" : "hidden"} md:block md:w-72 md:ml-10`}>
            <div className="bg-white rounded-xl border border-gray-500 shadow-sm p-4">
              {/* Header inside outer card */}
              <div className="relative flex justify-center items-center mb-4">
                <h3 className="font-semibold text-gray-800 text-center">Filters</h3>
                <button onClick={resetFilters} className="absolute right-0 text-xs text-red-600 hover:text-red-700 cursor-pointer">
                  Reset all
                </button>
              </div>
              
              {/* Individual filter cards inside outer card */}
              <div className="space-y-3">
                <FilterCard title="Job Type" icon={<BriefcaseIcon />} open={openSections.jobType} onToggle={() => toggleSection("jobType")} items={jobTypes} selected={selectedTypes} onChange={(v) => toggleArray(selectedTypes, setSelectedTypes, v)} />
                <FilterCard title="Category" icon={<FolderIcon />} open={openSections.category} onToggle={() => toggleSection("category")} items={categories} selected={selectedCategories} onChange={(v) => toggleArray(selectedCategories, setSelectedCategories, v)} />
                <FilterCard title="Country" icon={<GlobeIcon />} open={openSections.country} onToggle={() => toggleSection("country")} items={countries} selected={selectedCountries} onChange={(v) => toggleArray(selectedCountries, setSelectedCountries, v)} />
                <FilterCard title="Experience" icon={<GraduationIcon />} open={openSections.experience} onToggle={() => toggleSection("experience")} items={experienceLevels} selected={selectedExperience} onChange={(v) => toggleArray(selectedExperience, setSelectedExperience, v)} />
                <FilterCard title="Salary" icon={<DollarIcon />} open={openSections.salary} onToggle={() => toggleSection("salary")} isSalary salaryRange={salaryRange} setSalaryRange={setSalaryRange} />
              </div>
            </div>
          </aside>

          {/* JOB LISTINGS */}
          <div className="flex-1 max-w-3xl mx-auto">
            <div className="space-y-4">
              {filteredJobs.map((job) => <JobCard key={job.id} job={job} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        if (open) onToggle();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onToggle]);

  return (
    <div ref={cardRef} className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer">
      <button onClick={onToggle} className="w-full flex justify-between items-center text-gray-800 cursor-pointer">
        <span className="flex items-center gap-2 text-sm font-medium">
          {icon && <span className="text-gray-500">{icon}</span>}
          {title}
        </span>
        <span className="text-gray-500 text-xs">▼</span>
      </button>
      {open && (
        <div className="mt-3 pl-2 space-y-1 border-t border-gray-100 pt-2">
          {!isSalary && items && selected && onChange && items.map((item) => (
            <label key={item} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={selected.includes(item)} onChange={() => onChange(item)} className="cursor-pointer" />
              {item}
            </label>
          ))}
          {isSalary && salaryRange && setSalaryRange && (
            <div className="space-y-2">
              <input type="range" min="2000" max="15000" step="500" value={salaryRange[0]} onChange={(e) => setSalaryRange([+e.target.value, salaryRange[1]])} className="w-full cursor-pointer" />
              <input type="range" min="2000" max="15000" step="500" value={salaryRange[1]} onChange={(e) => setSalaryRange([salaryRange[0], +e.target.value])} className="w-full cursor-pointer" />
              <div className="text-xs text-gray-500">${salaryRange[0]} – ${salaryRange[1]}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}