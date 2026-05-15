// app/employer/dashboard/page.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function EmployerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/");
        return;
      }
      if (user.role !== "employer") {
        router.push("/");
        return;
      }
      
      // Load employer's jobs from database
      const email = encodeURIComponent(user.email);
      fetch(`/api/jobs/employer/${email}`)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(data => {
          setJobs(data.jobs || []);
          setLoadingJobs(false);
        })
        .catch(err => {
          console.error("Failed to load jobs:", err);
          setError("Failed to load jobs. Please refresh the page.");
          setLoadingJobs(false);
        });
    }
  }, [user, loading, router]);

  if (loading || loadingJobs) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== "employer") return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
          <Link href="/post-job" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition">
            + Post a New Job
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{user.company_name || user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Job Postings</h2>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">{error}</div>
        )}
        
        {jobs.length === 0 && !error ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-4">You haven't posted any jobs yet.</p>
            <Link href="/post-job" className="text-blue-600 hover:underline">Post your first job →</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{job.location} • {job.type}</p>
                    <p className="text-gray-500 text-sm mt-2 line-clamp-1">{job.description}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${job.featured ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>
                      {job.featured ? "⭐ Featured" : "Standard"}
                    </span>
                    <p className="text-xs text-gray-400 mt-2">Posted: {new Date(job.posted_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-3">
                  <Link href={`/job/${job.id}`} className="text-sm text-blue-600 hover:underline">View</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}