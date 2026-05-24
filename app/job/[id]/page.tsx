// app/job/[id]/page.tsx - BOTH APPLY BUTTONS (top right AND bottom)
"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import React from "react";

// SVG icons
const LocationIcon = () => (
  <svg className="w-4 h-4 text-gray-500 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const DollarIcon = () => (
  <svg className="w-4 h-4 text-gray-500 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4 text-gray-500 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = Number(params.id);
  
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  
  const [useDifferentCv, setUseDifferentCv] = useState(false);
  const [differentCvFile, setDifferentCvFile] = useState<File | null>(null);
  const [differentCvName, setDifferentCvName] = useState("");

  const isEmployer = user?.role === "employer";

  useEffect(() => {
    fetch(`/api/jobs/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.job) {
          setJob(data.job);
          if (data.job.posted_by) {
            fetch(`/api/companies/email/${encodeURIComponent(data.job.posted_by)}`)
              .then(res => res.json())
              .then(companyData => {
                if (companyData && companyData.logo) {
                  setCompanyLogo(companyData.logo);
                }
              })
              .catch(err => console.error("Failed to fetch company logo:", err));
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load job:", err);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (user && job) {
      const applications = JSON.parse(localStorage.getItem("applications") || "[]");
      const alreadyApplied = applications.some(
        (app: any) => app.jobId === job.id && app.applicantEmail === user.email
      );
      setHasApplied(alreadyApplied);
    }
  }, [user, job]);

  const sendApplicationEmail = async (applicationData: {
    name: string;
    email: string;
    coverLetter: string;
    cvFile?: File | null;
    cvName?: string | null;
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
    setIsSubmitting(true);
    
    const applications = JSON.parse(localStorage.getItem("applications") || "[]");
    applications.push({ id: Date.now(), jobId: job.id, jobTitle: job.title, company: job.company, applicantName: user?.name, applicantEmail: user?.email, coverLetter, appliedAt: new Date().toISOString(), isGuest: false });
    localStorage.setItem("applications", JSON.stringify(applications));
    
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
    
    await sendApplicationEmail({ name: user?.name || "", email: user?.email || "", coverLetter, cvFile });
    setHasApplied(true);
    setSubmitted(true);
    setShowApplyModal(false);
    setIsSubmitting(false);
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-500">Loading...</div></div>;
  if (!job) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold">Job not found</h1><Link href="/" className="text-blue-600">← Back</Link></div></div>;

  const getLogo = () => {
    if (companyLogo) return companyLogo;
    if (job.company_logo && job.company_logo.length > 2) return job.company_logo;
    return null;
  };

  const logoToShow = getLogo();
  const showApplyButtons = !isEmployer && !hasApplied && !submitted;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button onClick={() => router.back()} className="mb-6 text-gray-600 hover:text-blue-600 transition cursor-pointer">
          ← Back to all jobs
        </button>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden">
                  {logoToShow ? (
                    <img src={logoToShow} alt={job.company} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-2xl font-bold text-gray-600">
                      {job.company?.charAt(0).toUpperCase() || "C"}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                  <p className="text-gray-600 mt-1">{job.company}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {job.type}
                </span>
                {job.apply_type === "external" && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full flex items-center gap-1">
                    <ExternalLinkIcon /> External application
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Job Info Row with Top Apply Button on the right */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center text-gray-700"><LocationIcon /> {job.location}</div>
                <div className="flex items-center text-gray-700"><DollarIcon /> ${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()}/mo</div>
                <div className="flex items-center text-gray-700"><CalendarIcon /> {new Date(job.posted_at).toLocaleDateString()}</div>
              </div>
              
              {/* TOP APPLY BUTTON - Right side */}
              {showApplyButtons && job.apply_type !== "external" && (
                <button onClick={handleApplyClick} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all cursor-pointer text-sm">
                  Apply
                </button>
              )}
              {job.apply_type === "external" && showApplyButtons && (
                <button onClick={handleExternalApply} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all cursor-pointer text-sm">
                  Apply on Website
                </button>
              )}
              {hasApplied && (
                <span className="bg-green-100 text-green-700 font-semibold py-2 px-6 rounded-lg text-sm">
                  ✅ Applied
                </span>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Job Description</h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {job.description}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Requirements</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {(job.requirements || []).map((req: string, i: number) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>

            {/* BOTTOM APPLY BUTTON - Original position */}
            {showApplyButtons && job.apply_type !== "external" && (
              <div className="pt-4 border-t border-gray-200">
                <button onClick={handleApplyClick} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2">
                  Apply for this position →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Apply for {job.title}</h2>
              <button onClick={() => setShowApplyModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <CloseIcon />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter (Optional)</label>
                <textarea 
                  rows={5} 
                  value={coverLetter} 
                  onChange={(e) => setCoverLetter(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-text"
                  placeholder="Tell the employer why you're a good fit..."
                />
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg border">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={useDifferentCv} 
                    onChange={(e) => { setUseDifferentCv(e.target.checked); if (!e.target.checked) setDifferentCvFile(null); }} 
                    className="w-4 h-4 cursor-pointer" 
                  />
                  <span className="cursor-pointer">Use a different CV for this application</span>
                </label>
                {useDifferentCv && (
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx" 
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) { setDifferentCvFile(f); setDifferentCvName(f.name); } }} 
                    className="mt-2 w-full cursor-pointer" 
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
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}