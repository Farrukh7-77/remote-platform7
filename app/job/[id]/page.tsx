// app/job/[id]/page.tsx - Sign in opens modal, no page redirect
"use client";

import { useParams, useRouter } from "next/navigation";
import { jobs } from "@/data/jobs";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import AuthModal from "@/components/AuthModal";

// Gray SVG icons (same as before)
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

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = Number(params.id);
  const job = jobs.find((j) => j.id === id);
  
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applyMethod, setApplyMethod] = useState<"guest" | "signedin" | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Guest apply states
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestCv, setGuestCv] = useState<File | null>(null);
  
  // Check if user has saved CV
  const [hasSavedCv, setHasSavedCv] = useState(false);

  useEffect(() => {
    if (user) {
      const savedCv = localStorage.getItem(`cv_${user.email}`);
      setHasSavedCv(!!savedCv);
    }
  }, [user]);

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Job not found</h1>
          <p className="text-gray-600 mt-2">The job you're looking for doesn't exist.</p>
          <Link href="/" className="inline-block mt-4 text-blue-600 hover:underline">← Back to jobs</Link>
        </div>
      </div>
    );
  }

  // Handle external apply
  const handleExternalApply = () => {
    if (job.applyUrl) {
      window.open(job.applyUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Handle signed-in user apply (1 click)
  const handleSignedInApply = () => {
    setIsSubmitting(true);
    const applications = JSON.parse(localStorage.getItem("applications") || "[]");
    applications.push({
      id: Date.now(),
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      applicantName: user?.name,
      applicantEmail: user?.email,
      coverLetter,
      appliedAt: new Date().toISOString(),
      isGuest: false,
    });
    localStorage.setItem("applications", JSON.stringify(applications));
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setShowApplyForm(false);
      setApplyMethod(null);
    }, 1000);
  };

  // Handle guest manual apply
  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestEmail || !guestEmail.includes("@")) {
      alert("Please fill in your name and a valid email address");
      return;
    }
    setIsSubmitting(true);
    const applications = JSON.parse(localStorage.getItem("applications") || "[]");
    applications.push({
      id: Date.now(),
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      applicantName: guestName,
      applicantEmail: guestEmail,
      coverLetter,
      appliedAt: new Date().toISOString(),
      isGuest: true,
    });
    localStorage.setItem("applications", JSON.stringify(applications));
    if (guestCv) {
      console.log("CV uploaded:", guestCv.name);
    }
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setShowApplyForm(false);
      setApplyMethod(null);
    }, 1000);
  };

  // Show apply options
  const handleShowApplyOptions = () => {
    if (job.applyType === "external") {
      handleExternalApply();
      return;
    }
    setShowApplyForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button onClick={() => router.back()} className="mb-6 text-gray-600 hover:text-blue-600 transition cursor-pointer">
          ← Back to all jobs
        </button>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-xl ${job.companyLogoBgColor} flex items-center justify-center font-bold text-2xl`}>
                  {job.companyLogo}
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{job.title}</h1>
                  <p className="text-lg text-gray-600 mt-1">{job.company}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">{job.type}</span>
                {job.applyType === "external" && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">External application</span>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center text-gray-700"><LocationIcon /> {job.location}</div>
              <div className="flex items-center text-gray-700"><DollarIcon /> ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}/mo</div>
              <div className="flex items-center text-gray-700"><CalendarIcon /> {new Date(job.postedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Job Description</h2>
              <p className="text-gray-700 leading-relaxed">{job.description}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Requirements</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {job.requirements.map((req, i) => <li key={i}>{req}</li>)}
              </ul>
            </div>

            <div className="pt-4 border-t border-gray-200">
              {!submitted ? (
                <div className="space-y-4">
                  {!showApplyForm ? (
                    job.applyType === "external" ? (
                      <button
                        onClick={handleExternalApply}
                        className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors cursor-pointer"
                      >
                        Apply on Company Site →
                      </button>
                    ) : (
                      <button
                        onClick={handleShowApplyOptions}
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors cursor-pointer"
                      >
                        Apply for this position →
                      </button>
                    )
                  ) : (
                    <div className="space-y-4 max-w-lg">
                      {applyMethod === null ? (
                        <div className="space-y-3">
                          <h3 className="text-lg font-medium text-gray-900">How would you like to apply?</h3>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <button
                              onClick={() => setApplyMethod("guest")}
                              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors cursor-pointer text-center"
                            >
                              📧 Apply as Guest
                              <p className="text-xs text-gray-500 mt-1">Fill form manually</p>
                            </button>
                            {user && hasSavedCv ? (
                              <button
                                onClick={() => setApplyMethod("signedin")}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors cursor-pointer text-center"
                              >
                                👤 Apply with my profile
                                <p className="text-xs text-blue-200 mt-1">1 click with saved CV</p>
                              </button>
                            ) : user && !hasSavedCv ? (
                              <button
                                onClick={() => router.push("/profile")}
                                className="flex-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-medium py-3 px-4 rounded-lg transition-colors cursor-pointer text-center"
                              >
                                📄 Upload CV first
                                <p className="text-xs text-yellow-600 mt-1">Go to your profile</p>
                              </button>
                            ) : (
                              <button
                                onClick={() => setIsAuthModalOpen(true)}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors cursor-pointer text-center"
                              >
                                👤 Sign in to apply faster
                                <p className="text-xs text-gray-500 mt-1">Save your CV for future</p>
                              </button>
                            )}
                          </div>
                          <button
                            onClick={() => setShowApplyForm(false)}
                            className="text-sm text-gray-500 hover:text-gray-700 mt-2 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : applyMethod === "guest" ? (
                        <form onSubmit={handleGuestSubmit} className="space-y-4">
                          <h3 className="text-lg font-medium text-gray-900">Apply as Guest</h3>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                            <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900" required />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                            <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900" required />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CV/Resume (PDF, DOC)</label>
                            <input type="file" onChange={(e) => setGuestCv(e.target.files?.[0] || null)} accept=".pdf,.doc,.docx" className="w-full" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter (Optional)</label>
                            <textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900" />
                          </div>
                          <div className="flex gap-3">
                            <button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg disabled:opacity-50 cursor-pointer">
                              {isSubmitting ? "Submitting..." : "Submit Application"}
                            </button>
                            <button type="button" onClick={() => setApplyMethod(null)} className="bg-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-lg hover:bg-gray-400 cursor-pointer">
                              Back
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-gray-900">Apply with your profile</h3>
                          <p className="text-sm text-gray-600">You're applying as <strong>{user?.name}</strong> ({user?.email})</p>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter (Optional)</label>
                            <textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900" />
                          </div>
                          <div className="flex gap-3">
                            <button onClick={handleSignedInApply} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg disabled:opacity-50 cursor-pointer">
                              {isSubmitting ? "Submitting..." : "Submit Application (1 click)"}
                            </button>
                            <button type="button" onClick={() => setApplyMethod(null)} className="bg-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-lg hover:bg-gray-400 cursor-pointer">
                              Back
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-green-100 rounded-lg">
                  <p className="text-green-700 font-medium">✅ Application submitted successfully!</p>
                  <p className="text-sm text-green-600 mt-1">The company will contact you via email.</p>
                  <button onClick={() => router.push("/")} className="mt-3 text-blue-600 hover:underline text-sm cursor-pointer">← Browse more jobs</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal for Sign In */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}