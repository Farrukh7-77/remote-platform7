// app/saved-jobs/page.tsx
"use client";

import { useState, useEffect } from "react";
import { jobs, type Job } from "@/data/jobs";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function SavedJobsPage() {
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);

  useEffect(() => {
    // Get all bookmark keys from localStorage
    const bookmarks: number[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("bookmark_") && localStorage.getItem(key) === "true") {
        const jobId = parseInt(key.replace("bookmark_", ""));
        bookmarks.push(jobId);
      }
    }
    
    // Filter jobs that are bookmarked
    const saved = jobs.filter(job => bookmarks.includes(job.id));
    setSavedJobs(saved);
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Please Sign In</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">You need to be logged in to view saved jobs.</p>
          <Link href="/" className="inline-block mt-4 text-blue-600 hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Saved Jobs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            You have saved {savedJobs.length} job(s)
          </p>
        </div>

        {savedJobs.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <p className="text-gray-500 dark:text-gray-400">You haven't saved any jobs yet.</p>
            <Link href="/" className="inline-block mt-3 text-blue-600 hover:underline">
              Browse Jobs →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {savedJobs.map((job) => (
              <SavedJobCard key={job.id} job={job} onRemove={() => {
                // Remove from localStorage and update state
                localStorage.setItem(`bookmark_${job.id}`, "false");
                setSavedJobs(savedJobs.filter(j => j.id !== job.id));
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Saved Job Card Component
function SavedJobCard({ job, onRemove }: { job: Job; onRemove: () => void }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-lg transition-all">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{job.companyLogo}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {job.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{job.company}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
              {job.type}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">📍 {job.location}</span>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              💰 ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}/mo
            </span>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
            {job.description}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Link
            href={`/job/${job.id}`}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
          >
            View Details
          </Link>
          <button
            onClick={onRemove}
            className="inline-block bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium px-4 py-2 rounded-lg transition-colors text-sm hover:bg-red-200"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}