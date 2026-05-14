// app/job/[id]/page.tsx - Fixed hover, cursor, company link, badge styling
"use client";

import { useParams, useRouter } from "next/navigation";
import { jobs as staticJobs } from "@/data/jobs";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";

// Gray SVG icons
const LocationIcon = () => (
  <svg className="w-4 h-4 text-gray-500 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round"strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
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

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = Number(params.id);
  
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestCv, setGuestCv] = useState<File | null>(null);
  const [isGuestMode, setIsGuestMode] = useState(false);
  
  const [useDifferentCv, setUseDifferentCv] = useState(false);
  const [differentCvFile, setDifferentCvFile] = useState<File | null>(null);
  const [differentCvName, setDifferentCvName] = useState("");

  const isEmployer = user?.role === "employer";

  useEffect(() => {
    const postedJobs = JSON.parse(localStorage.getItem("posted_jobs") || "[]");
    const allJobs = [...staticJobs, ...postedJobs];
    const foundJob = allJobs.find((j) => j.id === id);
    setJob(foundJob || null);
    setLoading(false);
  }, [id]);

  // Find company ID from employer email for the link
  useEffect(() => {
    if (job) {
      const users = JSON.parse(localStorage.getItem("auth_users") || "[]");
      const employer = users.find((u: any) => u.email === job.postedBy);
      if (employer) {
        setCompanyId(employer.id);
      }
    }
  }, [job]);

  const sendApplicationEmail = async (applicationData: {
    name: string;
    email: string;
    coverLetter: string;
    cvFile?: File | null;
    cvName?: string | null;
  }) => {
    if (!job) return;
    
    const employerEmail = job.postedBy;
    if (!employerEmail) {
      console.error("No employer email found for job:", job.id);
      return;
    }

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
      const response = await fetch("/api/send-email", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) console.error("Failed to send email");
      else console.log("Email sent successfully to", employerEmail);
    } catch (error) {
      console.error("Email send error:", error);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-500">Loading...</div></div>;
  if (!job) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold">Job not found</h1><Link href="/" className="text-blue-600">← Back</Link></div></div>;

  const handleExternalApply = () => { if (job.applyUrl) window.open(job.applyUrl, "_blank"); };
  const handleApplyClick = () => {
    if (job.applyType === "external") return handleExternalApply();
    if (user) { setShowApplyForm(true); setIsGuestMode(false); setUseDifferentCv(false); setDifferentCvFile(null); }
    else setIsGuestMode(true);
  };

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestEmail || !guestEmail.includes("@")) return alert("Fill in name and email");
    setIsSubmitting(true);
    
    const applications = JSON.parse(localStorage.getItem("applications") || "[]");
    applications.push({ id: Date.now(), jobId: job.id, jobTitle: job.title, company: job.company, applicantName: guestName, applicantEmail: guestEmail, coverLetter, appliedAt: new Date().toISOString(), isGuest: true });
    localStorage.setItem("applications", JSON.stringify(applications));
    
    await sendApplicationEmail({ name: guestName, email: guestEmail, coverLetter, cvFile: guestCv, cvName: guestCv?.name });
    
    setTimeout(() => { setIsSubmitting(false); setSubmitted(true); setShowApplyForm(false); setIsGuestMode(false); }, 1000);
  };

  const handleSignedInSubmit = async () => {
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
    
    await sendApplicationEmail({ name: user?.name || "", email: user?.email || "", coverLetter, cvFile, cvName: cvFile?.name });
    
    setTimeout(() => { setIsSubmitting(false); setSubmitted(true); setShowApplyForm(false); }, 1000);
  };

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
                <div className={`w-16 h-16 rounded-xl ${job.companyLogoBgColor || "bg-gray-100"} flex items-center justify-center font-bold text-2xl`}>
                  {job.companyLogo || job.company?.substring(0,2).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                  {companyId ? (
                    <Link href={`/company/${companyId}`} className="text-gray-600 hover:text-blue-600 transition-colors inline-block mt-1 cursor-pointer">
                      {job.company}
                    </Link>
                  ) : (
                    <p className="text-gray-600 mt-1">{job.company}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {job.type}
                </span>
                {job.applyType === "external" && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                    External application
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center text-gray-700"><LocationIcon /> {job.location}</div>
              <div className="flex items-center text-gray-700"><DollarIcon /> ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}/mo</div>
              <div className="flex items-center text-gray-700"><CalendarIcon /> {new Date(job.postedAt).toLocaleDateString()}</div>
            </div>

            <div><h2 className="text-xl font-semibold text-gray-900 mb-3">Job Description</h2><p className="text-gray-700 leading-relaxed">{job.description}</p></div>
            <div><h2 className="text-xl font-semibold text-gray-900 mb-3">Requirements</h2><ul className="list-disc list-inside space-y-2 text-gray-700">{(job.requirements || []).map((req: string, i: number) => (<li key={i}>{req}</li>))}</ul></div>

            {isEmployer ? (
              <div className="pt-4 border-t border-gray-200 p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-500">You are logged in as an employer. To apply for jobs, please use a job seeker account.</p>
                <Link href="/register?role=job_seeker" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                  Create a job seeker account →
                </Link>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-200">
                {!submitted ? (
                  <div className="space-y-4">
                    {!showApplyForm && !isGuestMode ? (
                      <button
                        onClick={handleApplyClick}
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all cursor-pointer"
                      >
                        Apply for this position →
                      </button>
                    ) : isGuestMode ? (
                      <form onSubmit={handleGuestSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label><input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900" required /></div>
                          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label><input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900" required /></div>
                        </div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">CV/Resume (PDF, DOC)</label><input type="file" onChange={(e) => setGuestCv(e.target.files?.[0] || null)} accept=".pdf,.doc,.docx" className="w-full" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter (Optional)</label><textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900" placeholder="Why are you interested in this position?" /></div>
                        <div className="flex gap-3">
                          <button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-all cursor-pointer">{isSubmitting ? "Submitting..." : "Submit Application"}</button>
                          <button type="button" onClick={() => { setIsGuestMode(false); setShowApplyForm(false); }} className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-6 rounded-lg transition-all cursor-pointer">Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Cover Letter (Optional)</label><textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} rows={5} className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900" placeholder="Why are you interested in this position?" /></div>
                        
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={useDifferentCv} onChange={(e) => { setUseDifferentCv(e.target.checked); if (!e.target.checked) setDifferentCvFile(null); }} className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-gray-700">Use a different CV for this application</span>
                          </label>
                          {useDifferentCv && (
                            <div className="mt-3">
                              <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => { const file = e.target.files?.[0]; if (file) { setDifferentCvFile(file); setDifferentCvName(file.name); } }} className="w-full text-sm" />
                              {differentCvName && <p className="text-xs text-green-600 mt-1">📄 {differentCvName} will be used for this application</p>}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-3">
                          <button onClick={handleSignedInSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-all cursor-pointer">{isSubmitting ? "Submitting..." : "Submit Application"}</button>
                          <button onClick={() => setShowApplyForm(false)} className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-6 rounded-lg transition-all cursor-pointer">Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-green-100 rounded-lg"><p className="text-green-700 font-medium">✅ Application submitted successfully!</p><p className="text-sm text-green-600 mt-1">The company will contact you via email.</p><button onClick={() => router.push("/")} className="mt-3 text-blue-600 hover:underline text-sm cursor-pointer">← Browse more jobs</button></div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}