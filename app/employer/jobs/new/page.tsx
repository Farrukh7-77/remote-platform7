// app/employer/jobs/new/page.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PostJobPage() {
  const { user } = useAuth();
  const router = useRouter();
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

  if (!user || user.role !== "employer") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600 mt-2">Only employers can post jobs.</p>
          <button onClick={() => router.push("/")} className="mt-4 text-blue-600">← Back to home</button>
        </div>
      </div>
    );
  }

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
      companyLogo: user.companyName?.substring(0, 2).toUpperCase() || user.name.substring(0, 2).toUpperCase(),
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

  const jobTypes = ["Full-time", "Part-time", "Contract", "Remote", "Internship"];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Post a New Job</h1>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
              <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g., Global / Remote, Europe, etc." className="w-full px-4 py-2 border rounded-lg" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Type *</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                  {jobTypes.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range (monthly)</label>
                <div className="flex gap-2">
                  <input type="number" value={formData.salaryMin} onChange={e => setFormData({...formData, salaryMin: e.target.value})} placeholder="Min" className="w-1/2 px-4 py-2 border rounded-lg" />
                  <input type="number" value={formData.salaryMax} onChange={e => setFormData({...formData, salaryMax: e.target.value})} placeholder="Max" className="w-1/2 px-4 py-2 border rounded-lg" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
              <textarea rows={5} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (comma separated)</label>
              <input type="text" value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})} placeholder="e.g., React, TypeScript, 3+ years" className="w-full px-4 py-2 border rounded-lg" />
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition">
              {isSubmitting ? "Posting..." : "Post Job"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}