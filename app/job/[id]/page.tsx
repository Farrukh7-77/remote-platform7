// app/job/[id]/page.tsx - WITH EXTERNAL APPLY SUPPORT
"use client";

import { useParams, useRouter } from "next/navigation";
import { jobs } from "@/data/jobs";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = Number(params.id);
  const job = jobs.find((j) => j.id === id);
  
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Guest apply states
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestCv, setGuestCv] = useState<File | null>(null);
  const [isGuestMode, setIsGuestMode] = useState(false);

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Job not found</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">The job you're looking for doesn't exist.</p>
          <Link href="/" className="inline-block mt-4 text-blue-600 hover:underline">
            ← Back to jobs
          </Link>
        </div>
      </div>
    );
  }

  // Handle external apply - redirect to company's site
  const handleExternalApply = () => {
    if (job.applyUrl) {
      window.open(job.applyUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleApplyClick = () => {
    // If external apply, redirect directly
    if (job.applyType === "external") {
      handleExternalApply();
      return;
    }
    
    // Internal apply flow
    if (user) {
      setShowApplyForm(true);
      setIsGuestMode(false);
    } else {
      setIsGuestMode(true);
    }
  };

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestEmail) {
      alert("Please fill in your name and email");
      return;
    }
    if (!guestEmail.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }
    
    setIsSubmitting(true);
    
    const applications = JSON.parse(localStorage.getItem("applications") || "[]");
    const newApplication = {
      id: Date.now(),
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      applicantName: guestName,
      applicantEmail: guestEmail,
      coverLetter: coverLetter,
      appliedAt: new Date().toISOString(),
      isGuest: true,
    };
    applications.push(newApplication);
    localStorage.setItem("applications", JSON.stringify(applications));
    
    if (guestCv) {
      console.log("CV uploaded:", guestCv.name);
    }
    
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setShowApplyForm(false);
      setIsGuestMode(false);
    }, 1000);
  };

  const handleUserSubmit = () => {
    setIsSubmitting(true);
    
    const applications = JSON.parse(localStorage.getItem("applications") || "[]");
    const newApplication = {
      id: Date.now(),
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      applicantName: user?.name,
      applicantEmail: user?.email,
      coverLetter: coverLetter,
      appliedAt: new Date().toISOString(),
      isGuest: false,
    };
    applications.push(newApplication);
    localStorage.setItem("applications", JSON.stringify(applications));
    
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setShowApplyForm(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => router.back()}
          className="mb-6 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
        >
          ← Back to all jobs
        </button>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-xl ${job.companyLogoBgColor} flex items-center justify-center font-bold text-2xl`}>
                  {job.companyLogo}
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    {job.title}
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                    {job.company}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                  {job.type}
                </span>
                {job.applyType === "external" && (
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs rounded-full">
                    External application
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">📍 Location</p>
                <p className="font-medium text-gray-900 dark:text-white">{job.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">💰 Salary</p>
                <p className="font-medium text-green-600 dark:text-green-400">
                  ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}/mo
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">📅 Posted</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(job.postedAt).toLocaleDateString("en-US", { 
                    month: "long", 
                    day: "numeric", 
                    year: "numeric" 
                  })}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Job Description
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {job.description}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Requirements
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                {job.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              {!submitted ? (
                <>
                  {!showApplyForm && !isGuestMode ? (
                    <button
                      onClick={handleApplyClick}
                      className={`w-full md:w-auto font-semibold py-3 px-8 rounded-lg transition-colors ${
                        job.applyType === "external"
                          ? "bg-purple-600 hover:bg-purple-700 text-white"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {job.applyType === "external" ? "Apply →" : "Apply for this position →"}
                    </button>
                  ) : isGuestMode ? (
                    <form onSubmit={handleGuestSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            value={guestEmail}
                            onChange={(e) => setGuestEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          CV/Resume (PDF, DOC)
                        </label>
                        <input
                          type="file"
                          onChange={(e) => setGuestCv(e.target.files?.[0] || null)}
                          accept=".pdf,.doc,.docx"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                        <p className="text-xs text-gray-500 mt-1">Optional – you can also paste your cover letter below</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Cover Letter (Optional)
                        </label>
                        <textarea
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          placeholder="Why are you interested in this position?"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isSubmitting ? "Submitting..." : "Submit Application"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsGuestMode(false);
                            setShowApplyForm(false);
                          }}
                          className="bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-2 px-6 rounded-lg hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Cover Letter (Optional)
                        </label>
                        <textarea
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                          rows={5}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          placeholder="Why are you interested in this position?"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleUserSubmit}
                          disabled={isSubmitting}
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isSubmitting ? "Submitting..." : "Submit Application"}
                        </button>
                        <button
                          onClick={() => setShowApplyForm(false)}
                          className="bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-2 px-6 rounded-lg hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <p className="text-green-700 dark:text-green-400 font-medium">
                    ✅ Application submitted successfully!
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                    The company will contact you via email.
                  </p>
                  <button
                    onClick={() => router.push("/")}
                    className="mt-3 text-blue-600 hover:underline text-sm"
                  >
                    ← Browse more jobs
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}