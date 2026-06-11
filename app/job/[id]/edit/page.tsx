"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function EditJobPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    type: "",
    category: "",
    experience_level: "",
    salary_min: "",
    salary_max: "",
    description: "",
    requirements: "",
  });

  useEffect(() => {
    fetch(`/api/jobs/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.job) {
          setJob(data.job);
          setFormData({
            title: data.job.title || "",
            location: data.job.location || "",
            type: data.job.type || "",
            category: data.job.category || "",
            experience_level: data.job.experience_level || "",
            salary_min: data.job.salary_min || "",
            salary_max: data.job.salary_max || "",
            description: data.job.description || "",
            requirements: data.job.requirements?.join("\n") || "",
          });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load job:", err);
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          salary_min: parseInt(formData.salary_min),
          salary_max: parseInt(formData.salary_max),
          requirements: formData.requirements.split("\n").filter(r => r.trim()),
        }),
      });

      if (response.ok) {
        router.push(`/job/${id}`);
      } else {
        alert("Failed to update job");
      }
    } catch (error) {
      console.error("Error updating job:", error);
      alert("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  if (!user || user.role !== "employer") return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Access denied</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Job</h1>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-4">
          {/* Form fields - eyni post-job səhifəsindəki kimi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
              <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                <option value="">Select type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary (min)</label>
              <input type="number" value={formData.salary_min} onChange={(e) => setFormData({...formData, salary_min: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary (max)</label>
              <input type="number" value={formData.salary_max} onChange={(e) => setFormData({...formData, salary_max: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={5} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (hər sətirdə bir)</label>
            <textarea rows={4} value={formData.requirements} onChange={(e) => setFormData({...formData, requirements: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="React&#10;Node.js&#10;TypeScript" />
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="submit" 
              disabled={saving} 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition cursor-pointer disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button 
              type="button" 
              onClick={() => router.back()} 
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}   