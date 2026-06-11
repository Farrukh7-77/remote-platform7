// app/job/[id]/page.tsx - SIDEBAR MODERN DESIGN
"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useState, useEffect } from "react";
import React from "react";

// SVG icons
const LocationIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const DollarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const BuildingIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const id = Number(params.id);
  
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [companyData, setCompanyData] = useState<any>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [viewTracked, setViewTracked] = useState(false);
  
  const [useDifferentCv, setUseDifferentCv] = useState(false);
  const [differentCvFile, setDifferentCvFile] = useState<File | null>(null);
  const [differentCvName, setDifferentCvName] = useState("");

  const isEmployer = user?.role === "employer";
  const isOwner = isEmployer && user?.email === job?.posted_by;
  const getToken = () => localStorage.getItem("auth_token");
  const isLightMode = theme === "light";

  useEffect(() => {
    fetch(`/api/jobs/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.job) {
          setJob(data.job);
          // Fetch company details
          if (data.job.posted_by) {
            fetch(`/api/companies/email/${encodeURIComponent(data.job.posted_by)}`)
              .then(res => res.json())
              .then(companyData => {
                setCompanyData(companyData);
              })
              .catch(err => console.error("Failed to fetch company:", err));
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load job:", err);
        setLoading(false);
      });
  }, [id]);

  // Check if user has already applied
  useEffect(() => {
    const checkAppliedStatus = async () => {
      if (!user || !job) return;
      
      const token = getToken();
      if (!token) return;
      
      try {
        const response = await fetch("/api/applications", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        const applications = data.applications || [];
        const alreadyApplied = applications.some((app: any) => app.job_id === job.id);
        setHasApplied(alreadyApplied);
      } catch (error) {
        console.error("Error checking application status:", error);
      }
    };
    
    checkAppliedStatus();
  }, [user, job]);

  // Track view after 5 seconds
  useEffect(() => {
    if (!job || viewTracked) return;
    
    // Session ID al və ya yarat
    let sessionId = localStorage.getItem("session_id");
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem("session_id", sessionId);
    }
    
    // 5 saniyəlik timer
    const timer = setTimeout(async () => {
      try {
        await fetch(`/api/jobs/${job.id}/view`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userEmail: user?.email || null,
            sessionId: sessionId
          })
        });
        setViewTracked(true);
      } catch (error) {
        console.error("Failed to track view:", error);
      }
    }, 5000); // 5 saniyə
    
    // Əgər istifadəçi 5 saniyədən əvvəl səhifəni tərk edərsə, timer-i ləğv et
    return () => clearTimeout(timer);
  }, [job, user, viewTracked]);

  const sendApplicationEmail = async (applicationData: {
    name: string;
    email: string;
    coverLetter: string;
    cvFile?: File | null;
  }) => {
    if (!job) return;
    
    const employerEmail = job.posted_by;
    if (!employerEmail) return;

    const formData = new FormData();
    formData.append("to", employerEmail);
    formData.append("subject", `New Application: ${job.title} at ${job.company}`);
    formData.append("html", `
      <h2>New Job Application</h2>
      <p><strong>Position:</strong> ${job.title}</p>
      <p><strong>Company:</strong> ${job.company}</p>
      <hr/>
      <h3>Applicant Details:</h3>
      <p><strong>Name:</strong> ${applicationData.name}</p>
      <p><strong>Email:</strong> ${applicationData.email}</p>
      <p><strong>Cover Letter:</strong></p>
      <p>${applicationData.coverLetter || "No cover letter provided"}</p>
    `);
    
    if (applicationData.cvFile) {
      formData.append("attachment", applicationData.cvFile);
    }

    try {
      await fetch("/api/send-email", { method: "POST", body: formData });
    } catch (error) {
      console.error("Email send error:", error);
    }
  };

  const handleExternalApply = () => {
    if (job.apply_url) window.open(job.apply_url, "_blank");
  };

  const handleApplyClick = () => {
    if (hasApplied) {
      alert("You have already applied for this position!");
      return;
    }
    if (job.apply_type === "external" && job.apply_url) {
      handleExternalApply();
      return;
    }
    if (!user) {
      router.push("/register");
      return;
    }
    setShowApplyModal(true);
  };

  const handleSubmitApplication = async () => {
    if (!user) {
      alert("Please sign in to apply");
      return;
    }
    
    setIsSubmitting(true);
    
    const token = getToken();
    if (!token) {
      alert("Please sign in again");
      setIsSubmitting(false);
      return;
    }
    
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          jobId: job.id,
          fullName: user.name,
          email: user.email,
          phone: "",
          coverLetter: coverLetter,
          resumeUrl: "",
          portfolioUrl: "",
          linkedinUrl: ""
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        let cvFile = null;
        if (useDifferentCv && differentCvFile) {
          cvFile = differentCvFile;
        } else {
          const savedCv = localStorage.getItem(`cv_${user?.email}`);
          if (savedCv) {
            try {
              const parsed = JSON.parse(savedCv);
              const byteCharacters = atob(parsed.data.split(',')[1]);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
              const blob = new Blob([new Uint8Array(byteNumbers)], { type: 'application/pdf' });
              cvFile = new File([blob], parsed.name, { type: 'application/pdf' });
            } catch(e) {}
          }
        }
        
        await sendApplicationEmail({ 
          name: user.name, 
          email: user.email, 
          coverLetter, 
          cvFile 
        });
        
        setHasApplied(true);
        setSubmitted(true);
        setShowApplyModal(false);
        alert("Application submitted successfully!");
      } else {
        alert(data.error || "Failed to submit application");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isLightMode ? "bg-gray-50" : "bg-[#050816]"}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className={`${isLightMode ? "text-gray-500" : "text-gray-400"} animate-pulse`}>Loading...</div>
        </div>
      </div>
    );
  }
  
  if (!job) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isLightMode ? "bg-gray-50" : "bg-[#050816]"}`}>
        <div className="text-center">
          <h1 className={`text-2xl font-bold ${isLightMode ? "text-gray-900" : "text-white"}`}>Job not found</h1>
          <Link href="/" className="text-blue-500 hover:text-blue-600 mt-2 inline-block">← Back to home</Link>
        </div>
      </div>
    );
  }

  const getLogo = () => {
    if (companyData?.logo) return companyData.logo;
    if (job.company_logo && job.company_logo.length > 2) return job.company_logo;
    return null;
  };

  const logoToShow = getLogo();
  const showApplyButtons = !isEmployer && !hasApplied && !submitted;

  // Format requirements
  const requirementsList = Array.isArray(job.requirements) 
    ? job.requirements 
    : job.requirements?.split('\n').filter((r: string) => r.trim()) || [];

  // Time ago function
  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className={`min-h-screen py-8 ${isLightMode ? "bg-gradient-to-br from-gray-50 to-gray-100" : "bg-gradient-to-br from-[#050816] to-[#0a0f1a]"}`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <button 
  onClick={() => router.back()} 
  className={`mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-medium transition-all duration-200 cursor-pointer group ${
    isLightMode 
      ? "border-gray-300 text-gray-800 hover:bg-gray-200 hover:border-gray-400 hover:text-blue-600" 
      : "border-white/10 text-gray-300 hover:bg-white/15 hover:border-white/30 hover:text-blue-400"
  }`}
>
  <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
  Back
</button>

        {/* 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className={`rounded-2xl p-6 shadow-sm transition-all ${isLightMode ? "bg-white border border-gray-900 shadow-gray-200/50" : "glass-card"}`}>
              <div className="flex flex-wrap gap-4">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden ${isLightMode ? "bg-gray-100" : "bg-[#1a1f2e]"}`}>
                  {logoToShow ? (
                    <img src={logoToShow} alt={job.company} className="w-full h-full object-contain" />
                  ) : (
                    <span className={`text-2xl font-bold ${isLightMode ? "text-gray-600" : "text-gray-400"}`}>
                      {job.company?.charAt(0).toUpperCase() || "C"}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h1 className={`text-2xl md:text-3xl font-bold ${isLightMode ? "text-gray-900" : "text-white"}`}>{job.title}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={isLightMode ? "text-gray-600" : "text-gray-300"}>{job.company}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isLightMode ? "bg-blue-100 text-blue-700" : "bg-blue-500/20 text-blue-400"}`}>
                      {job.type}
                    </span>
                    {job.is_featured && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${isLightMode ? "bg-amber-100 text-amber-700" : "bg-amber-500/20 text-amber-400"}`}>
                        ⭐ Featured
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className={`rounded-2xl p-6 shadow-sm transition-all ${isLightMode ? "bg-white border border-gray-900 shadow-gray-200/50" : "glass-card"}`}>
              <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isLightMode ? "text-gray-900" : "text-white"}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Job Description
              </h2>
              <div className={`leading-relaxed whitespace-pre-line ${isLightMode ? "text-gray-700" : "text-gray-300"}`}>
                {job.description}
              </div>
            </div>

            {/* Requirements Card */}
            {requirementsList.length > 0 && (
              <div className={`rounded-2xl p-6 shadow-sm transition-all ${isLightMode ? "bg-white border border-gray-900 shadow-gray-200/50" : "glass-card"}`}>
                <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isLightMode ? "text-gray-900" : "text-white"}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Requirements
                </h2>
                <ul className={`space-y-2 ${isLightMode ? "text-gray-700" : "text-gray-300"}`}>
                  {requirementsList.map((req: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <svg className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - Sidebar Info */}
          {/* RIGHT COLUMN - Sidebar Info */}
<div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Quick Info Card */}
            <div className={`rounded-2xl p-6 shadow-sm transition-all ${isLightMode ? "bg-white border border-gray-900 shadow-gray-200/50" : "glass-card"}`}>
              <h3 className={`font-semibold mb-4 ${isLightMode ? "text-gray-900" : "text-white"}`}>Quick Info</h3>
              <div className="space-y-4">
                <DetailRow 
                  icon={<LocationIcon />} 
                  label="Location" 
                  value={job.location} 
                  isLightMode={isLightMode}
                />
                <DetailRow 
                  icon={<DollarIcon />} 
                  label="Salary" 
                  value={`$${job.salary_min?.toLocaleString()} - $${job.salary_max?.toLocaleString()}`} 
                  isLightMode={isLightMode}
                  highlight
                />
                <DetailRow 
                  icon={<BriefcaseIcon />} 
                  label="Category" 
                  value={job.category || "Uncategorized"} 
                  isLightMode={isLightMode}
                />
                <DetailRow 
                  icon={<ClockIcon />} 
                  label="Posted" 
                  value={timeAgo(job.posted_at)} 
                  isLightMode={isLightMode}
                />
                {job.experience_level && (
                  <DetailRow 
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    } 
                    label="Experience" 
                    value={job.experience_level} 
                    isLightMode={isLightMode}
                  />
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-white/10">
                {showApplyButtons && job.apply_type !== "external" && (
                  <button 
                    onClick={handleApplyClick} 
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
                  >
                    Apply Now
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                )}
                {showApplyButtons && job.apply_type === "external" && (
                  <button 
                    onClick={handleExternalApply} 
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
                  >
                    Apply on Website
                    <ExternalLinkIcon />
                  </button>
                )}
                {hasApplied && (
                  <div className={`flex items-center justify-center gap-2 py-3 rounded-xl ${isLightMode ? "bg-green-50 text-green-700" : "bg-green-500/20 text-green-400"}`}>
                    <CheckIcon />
                    <span className="font-semibold">Already Applied</span>
                  </div>
                )}
                {isOwner && (
                  <Link
                    href={`/job/${job.id}/edit`}
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${isLightMode ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-400"}`}
                  >
                    <EditIcon /> Edit Job
                  </Link>
                )}
              </div>
            </div>

            {/* Company Info Card */}
            {companyData && (
              <div className={`rounded-2xl p-6 shadow-sm transition-all ${isLightMode ? "bg-white border border-gray-900 shadow-gray-200/50" : "glass-card"}`}>
                <h3 className={`font-semibold mb-4 ${isLightMode ? "text-gray-900" : "text-white"}`}>About Company</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <BuildingIcon />
                    <span className={`text-sm ${isLightMode ? "text-gray-600" : "text-gray-400"}`}>{companyData.name || job.company}</span>
                  </div>
                  {companyData.industry && (
                    <div className="flex items-center gap-3">
                      <GlobeIcon />
                      <span className={`text-sm ${isLightMode ? "text-gray-600" : "text-gray-400"}`}>{companyData.industry}</span>
                    </div>
                  )}
                  {companyData.size && (
                    <div className="flex items-center gap-3">
                      <UsersIcon />
                      <span className={`text-sm ${isLightMode ? "text-gray-600" : "text-gray-400"}`}>{companyData.size} employees</span>
                    </div>
                  )}
                  {companyData.location && (
                    <div className="flex items-center gap-3">
                      <LocationIcon />
                      <span className={`text-sm ${isLightMode ? "text-gray-600" : "text-gray-400"}`}>{companyData.location}</span>
                    </div>
                  )}
                  {companyData.website && (
                    <a 
                      href={companyData.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 transition-colors"
                    >
                      Visit Website →
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in">
          <div className={`rounded-2xl max-w-md w-full mx-4 p-6 shadow-2xl ${isLightMode ? "bg-white" : "bg-[#0f172a] border border-white/10"}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${isLightMode ? "text-gray-900" : "text-white"}`}>Apply for {job.title}</h2>
              <button onClick={() => setShowApplyModal(false)} className={`transition-colors cursor-pointer ${isLightMode ? "text-gray-400 hover:text-gray-600" : "text-gray-500 hover:text-gray-300"}`}>
                <CloseIcon />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isLightMode ? "text-gray-700" : "text-gray-300"}`}>Cover Letter (Optional)</label>
                <textarea 
                  rows={5} 
                  value={coverLetter} 
                  onChange={(e) => setCoverLetter(e.target.value)} 
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-text ${isLightMode ? "bg-white border-gray-300 text-gray-900" : "bg-[#1a1f2e] border-white/10 text-white placeholder-gray-500"}`}
                  placeholder="Tell the employer why you're a good fit..."
                />
              </div>
              
              <div className={`p-4 rounded-lg ${isLightMode ? "bg-gray-50 border border-gray-200" : "bg-white/5 border border-white/10"}`}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={useDifferentCv} 
                    onChange={(e) => { setUseDifferentCv(e.target.checked); if (!e.target.checked) setDifferentCvFile(null); }} 
                    className="w-4 h-4 cursor-pointer" 
                  />
                  <span className={`cursor-pointer text-sm ${isLightMode ? "text-gray-700" : "text-gray-300"}`}>Use a different CV for this application</span>
                </label>
                {useDifferentCv && (
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx" 
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) { setDifferentCvFile(f); setDifferentCvName(f.name); } }} 
                    className={`mt-3 w-full cursor-pointer text-sm ${isLightMode ? "text-gray-700" : "text-gray-300"}`}
                  />
                )}
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={handleSubmitApplication} 
                  disabled={isSubmitting} 
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </button>
                <button 
                  onClick={() => setShowApplyModal(false)} 
                  className={`flex-1 font-semibold py-2 rounded-lg transition cursor-pointer ${isLightMode ? "bg-gray-200 hover:bg-gray-300 text-gray-800" : "bg-white/10 hover:bg-white/20 text-gray-300"}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
        .glass-card {
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}

// Detail Row Component
function DetailRow({ 
  icon, 
  label, 
  value, 
  isLightMode, 
  highlight = false 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  isLightMode: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className={`mt-1 ${highlight ? 'text-green-500' : 'text-blue-500'}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-500'}`}>
          {label}
        </p>
        <p 
          className={`text-base font-medium truncate ${
            highlight 
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent' 
              : isLightMode ? 'text-gray-800' : 'text-gray-200'
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}