// app/post-job/page.tsx - redirect to /register?role=employer
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthModal from "@/components/AuthModal";

export default function PostJobPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    type: "Full-time",
    salaryMin: "3000",
    salaryMax: "5000",
    description: "",
    requirements: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Case 1: User not logged in at all
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-auto bg-white rounded-xl shadow-md p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
          <p className="text-gray-600 mb-6">
            Only employers can post jobs. Please sign in to your employer account or create one.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push("/register?role=employer")}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition cursor-pointer"
            >
              Create Employer Account
            </button>
          </div>
        </div>
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    );
  }

  // Case 2: User is logged in but not an employer
  if (user.role !== "employer") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-auto bg-white rounded-xl shadow-md p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Not an Employer Account</h1>
          <p className="text-gray-600 mb-6">
            You are logged in as a <strong>Job Seeker</strong>. Only employer accounts can post jobs.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition cursor-pointer"
          >
            ← Back to Home
          </button>
          <p className="text-sm text-gray-500 mt-4">
            Need to post a job?{" "}
            <button
              onClick={() => router.push("/register?role=employer")}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              Create an employer account
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Case 3: User is logged in as employer - show the form
  const jobTypes = ["Full-time", "Part-time", "Contract", "Remote", "Internship"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const jobs = JSON.parse(localStorage.getItem("posted_jobs") || "[]");
    const newJob = {
      id: Date.now(),
      ...formData,
      salaryMin: parseInt(formData.salaryMin),
      salaryMax: parseInt(formData.salaryMax),
      requirements: formData.requirements.split(",").map(r => r.trim()),
      company: user.companyName || user.name,
      companyLogo: (user.companyName || user.name).substring(0, 2).toUpperCase(),
      companyLogoBgColor: "bg-gray-100 text-gray-700",
      postedAt: new Date().toISOString(),
      featured: false,
      postedBy: user.email,
      applyType: "internal",
    };
    jobs.push(newJob);
    localStorage.setItem("posted_jobs", JSON.stringify(jobs));

    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/employer/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Post a New Job</h1>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <input
                type="text"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
                placeholder="e.g., Global / Remote, Europe, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Type *</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {jobTypes.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range (monthly)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formData.salaryMin}
                    onChange={e => setFormData({...formData, salaryMin: e.target.value})}
                    placeholder="Min"
                    className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    value={formData.salaryMax}
                    onChange={e => setFormData({...formData, salaryMax: e.target.value})}
                    placeholder="Max"
                    className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
              <textarea
                rows={5}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (comma separated)</label>
              <input
                type="text"
                value={formData.requirements}
                onChange={e => setFormData({...formData, requirements: e.target.value})}
                placeholder="e.g., React, TypeScript, 3+ years experience"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Separate each requirement with a comma</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Posting..." : "Post Job"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}