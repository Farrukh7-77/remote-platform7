// app/saved-jobs/page.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import JobCard from "@/components/JobCard";

type Job = {
  id: number;
  title: string;
  company: string;
  companyLogo: string;
  companyLogoBgColor: string;
  location: string;
  type: string;
  salary_min: number;
  salary_max: number;
  description: string;
  postedAt: string;
  is_featured: boolean;
};

export default function SavedJobsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Bütün elanları çək
    fetch("/api/jobs")
      .then(res => res.json())
      .then(data => {
        setAllJobs(data.jobs || []);
        setLoadingJobs(false);
      })
      .catch(err => {
        console.error("Failed to load jobs:", err);
        setLoadingJobs(false);
      });
  }, []);

  useEffect(() => {
    if (allJobs.length > 0) {
      // Saved job ID-lərini localStorage-dan oxu
      const savedIds: number[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("bookmark_") && localStorage.getItem(key) === "true") {
          const jobId = parseInt(key.replace("bookmark_", ""));
          if (!isNaN(jobId)) savedIds.push(jobId);
        }
      }
      // Saved job-ları filtrlə
      const saved = allJobs.filter(job => savedIds.includes(job.id));
      setSavedJobs(saved);
    }
  }, [allJobs]);

  const removeSavedJob = (jobId: number) => {
    localStorage.setItem(`bookmark_${jobId}`, "false");
    setSavedJobs(savedJobs.filter(job => job.id !== jobId));
  };

  if (loading || loadingJobs) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-500 animate-pulse">Loading saved jobs...</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Saved Jobs</h1>
          <p className="text-gray-500 mt-1">Jobs you've bookmarked for later</p>
        </div>

        {savedJobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">🔖</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved jobs yet</h3>
            <p className="text-gray-500 mb-4">Start saving jobs by clicking the ★ button on job cards</p>
            <Link href="/" className="text-blue-600 hover:underline">
              Browse jobs →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {savedJobs.map((job) => (
              <div key={job.id} className="relative group">
                <JobCard job={job} />
                <button
                  onClick={() => removeSavedJob(job.id)}
                  className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg transition cursor-pointer opacity-0 group-hover:opacity-100"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}