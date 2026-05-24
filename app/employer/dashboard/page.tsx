// app/employer/dashboard/page.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";

type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary_min: number;
  salary_max: number;
  posted_at: string;
  is_featured: boolean;
  featured_until?: string;
  application_count?: number;
};

export default function EmployerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  
  // Promote modal state
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [selectedDays, setSelectedDays] = useState(7);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
    if (user && user.role !== "employer") {
      router.push("/");
    }
  }, [user, loading, router]);

  const fetchJobs = useCallback(async () => {
    if (!user?.email) return;
    setLoadingJobs(true);
    try {
      const response = await fetch(`/api/jobs/employer/${user.email}`);
      const data = await response.json();
      const sortedJobs = (data.jobs || []).sort((a: Job, b: Job) => {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return 0;
      });
      setJobs(sortedJobs);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoadingJobs(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) {
      fetchJobs();
    }
  }, [user?.email, fetchJobs]);

  const deleteJob = async (jobId: number) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        await fetchJobs();
      } else {
        console.error("Failed to delete job");
      }
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  const handlePromote = (jobId: number) => {
    setSelectedJobId(jobId);
    setShowPromoteModal(true);
  };

  const handlePayment = async () => {
    if (!selectedJobId) return;
    setIsProcessing(true);
    
    try {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: selectedDays, jobId: selectedJobId }),
      });
      const { clientSecret } = await response.json();
      
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      if (!stripe) {
        alert("Stripe failed to load");
        return;
      }
      
      const result = await stripe.confirmPayment({
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/employer/dashboard`,
        },
      });
      
      if (result.error) {
        alert("Payment failed: " + result.error.message);
      } else {
        alert("Payment successful! Job will be featured shortly.");
        setTimeout(() => fetchJobs(), 3000);
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed");
    } finally {
      setIsProcessing(false);
      setShowPromoteModal(false);
    }
  };

  if (loading || loadingJobs) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-500 animate-pulse">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage your job postings</p>
          </div>
          <Link
            href="/post-job"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Post New Job
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{jobs.length}</div>
            <div className="text-sm text-gray-500">Total Jobs Posted</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="text-2xl font-bold text-green-600">{jobs.filter(j => j.is_featured).length}</div>
            <div className="text-sm text-gray-500">Featured Jobs</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="text-2xl font-bold text-purple-600">
              {jobs.reduce((sum, j) => sum + (j.application_count || 0), 0)}
            </div>
            <div className="text-sm text-gray-500">Total Applications</div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Your Job Postings</h2>
          </div>
          
          {jobs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-500 mb-4">You haven't posted any jobs yet</p>
              <Link href="/post-job" className="text-blue-600 hover:underline">
                Post your first job →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {jobs.map((job) => (
                <div key={job.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                        {job.is_featured && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full flex items-center gap-1">
                            ⭐ Featured
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm mt-1">
                        📍 {job.location} • 💼 {job.type}
                      </p>
                      <p className="text-gray-600 text-sm mt-2">
                        💰 ${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()}
                      </p>
                      <p className="text-gray-400 text-xs mt-2">
                        Posted: {new Date(job.posted_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePromote(job.id)}
                        disabled={job.is_featured}
                        className={`px-3 py-1.5 text-xs rounded-lg transition cursor-pointer ${
                          job.is_featured
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-yellow-500 text-white hover:bg-yellow-600"
                        }`}
                      >
                        {job.is_featured ? "⭐ Featured" : "🚀 Promote"}
                      </button>
                      <Link
                        href={`/job/${job.id}`}
                        className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition cursor-pointer"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => deleteJob(job.id)}
                        className="px-3 py-1.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Promote Modal */}
      {showPromoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Promote Your Job</h2>
            <p className="text-gray-600 text-sm mb-4">Choose how long you want your job to be featured on top</p>
            
            <div className="space-y-3 mb-6">
              <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <div>
                  <span className="font-medium">7 days</span>
                  <p className="text-xs text-gray-500">$9.99</p>
                </div>
                <input
                  type="radio"
                  name="days"
                  value="7"
                  checked={selectedDays === 7}
                  onChange={() => setSelectedDays(7)}
                  className="w-4 h-4"
                />
              </label>
              
              <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <div>
                  <span className="font-medium">14 days</span>
                  <p className="text-xs text-gray-500">$14.99</p>
                </div>
                <input
                  type="radio"
                  name="days"
                  value="14"
                  checked={selectedDays === 14}
                  onChange={() => setSelectedDays(14)}
                  className="w-4 h-4"
                />
              </label>
              
              <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <div>
                  <span className="font-medium">30 days</span>
                  <p className="text-xs text-gray-500">$24.99</p>
                </div>
                <input
                  type="radio"
                  name="days"
                  value="30"
                  checked={selectedDays === 30}
                  onChange={() => setSelectedDays(30)}
                  className="w-4 h-4"
                />
              </label>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : `Pay $${selectedDays === 7 ? 9.99 : selectedDays === 14 ? 14.99 : 24.99}`}
              </button>
              <button
                onClick={() => setShowPromoteModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}