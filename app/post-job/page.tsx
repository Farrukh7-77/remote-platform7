// app/post-job/page.tsx - UPDATED CATEGORIES
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthModal from "@/components/AuthModal";

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Remote", "Internship"];

// REAL WORLD CATEGORIES - prioritized by demand
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

const EXPERIENCE_LEVELS = ["Entry (0-2 years)", "Mid (3-5 years)", "Senior (5+ years)"];

export default function PostJobPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    type: "Full-time",
    category: "",
    experienceLevel: "",
    salaryMin: "3000",
    salaryMax: "5000",
    description: "",
    requirements: "",
    applyType: "internal",
    applyUrl: "",
    isFeatured: false,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-auto bg-white rounded-xl shadow-md p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
          <p className="text-gray-600 mb-6">Only employers can post jobs.</p>
          <button onClick={() => setIsAuthModalOpen(true)} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer">Sign In</button>
        </div>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    );
  }

  if (user.role !== "employer") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-auto bg-white rounded-xl shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Not an Employer Account</h1>
          <p className="text-gray-600 mb-6">Only employer accounts can post jobs.</p>
          <button onClick={() => router.push("/")} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg cursor-pointer">← Back to Home</button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const jobData = {
      title: formData.title,
      company: user.company_name || user.name,
      companyLogo: (user.company_name || user.name).substring(0, 2).toUpperCase(),
      companyLogoBgColor: "bg-gray-100 text-gray-700",
      location: formData.location,
      type: formData.type,
      category: formData.category,
      experience_level: formData.experienceLevel,
      salaryMin: parseInt(formData.salaryMin),
      salaryMax: parseInt(formData.salaryMax),
      description: formData.description,
      requirements: formData.requirements.split(",").map(r => r.trim()),
      postedBy: user.email,
      applyType: formData.applyType,
      applyUrl: formData.applyUrl || null,
      is_featured: formData.isFeatured,
    };

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData),
      });

      if (response.ok) {
        router.push("/employer/dashboard");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to post job");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Post a New Job</h1>
          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
              <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required>
                  <option value="">Select category</option>
                  {CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level *</label>
                <select value={formData.experienceLevel} onChange={e => setFormData({...formData, experienceLevel: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required>
                  <option value="">Select experience</option>
                  {EXPERIENCE_LEVELS.map(exp => <option key={exp}>{exp}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g., Global / Remote, Europe" className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Type *</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range (monthly)</label>
                <div className="flex gap-2">
                  <input type="number" value={formData.salaryMin} onChange={e => setFormData({...formData, salaryMin: e.target.value})} placeholder="Min" className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg" />
                  <input type="number" value={formData.salaryMax} onChange={e => setFormData({...formData, salaryMax: e.target.value})} placeholder="Max" className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
              <textarea rows={5} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (comma separated)</label>
              <input type="text" value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})} placeholder="e.g., React, TypeScript, 3+ years" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>

            {/* Featured Job Checkbox */}
            <div className="border-t border-gray-200 pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                  className="w-4 h-4 text-yellow-500 rounded"
                />
                <span className="text-sm font-medium text-gray-700">⭐ Featured Job (appears on top)</span>
              </label>
            </div>

            {/* External Apply URL Option */}
            <div className="border-t border-gray-200 pt-4">
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={formData.applyType === "external"}
                  onChange={(e) => setFormData({...formData, applyType: e.target.checked ? "external" : "internal", applyUrl: e.target.checked ? formData.applyUrl : ""})}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">External Application (apply on company website)</span>
              </label>
              
              {formData.applyType === "external" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Application URL *</label>
                  <input type="url" value={formData.applyUrl} onChange={e => setFormData({...formData, applyUrl: e.target.value})} placeholder="https://company.com/careers/apply" className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                </div>
              )}
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 cursor-pointer">
              {isSubmitting ? "Posting..." : "Post Job"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}