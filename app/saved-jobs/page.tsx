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
  salary_min: number | null;
  salary_max: number | null;
  description: string;
  postedAt: string;
  is_featured: boolean;
  category?: string;
  company_logo_from_companies?: string;
};

export default function SavedJobsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const getToken = () => localStorage.getItem("auth_token");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
      return;
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      const token = getToken();
      if (!user || !token) {
        setLoadingJobs(false);
        return;
      }

      try {
        // Get saved job IDs from database
        const savedResponse = await fetch("/api/saved-jobs", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const savedData = await savedResponse.json();
        const savedJobIds = savedData.savedJobIds || [];

        if (savedJobIds.length === 0) {
          setSavedJobs([]);
          setLoadingJobs(false);
          return;
        }

        // Get all jobs and filter saved ones
        const jobsResponse = await fetch("/api/jobs");
        const jobsData = await jobsResponse.json();
        const allJobs = jobsData.jobs || [];
        
        const filteredJobs = allJobs.filter((job: Job) => savedJobIds.includes(job.id));
        setSavedJobs(filteredJobs);
      } catch (error) {
        console.error("Error fetching saved jobs:", error);
      } finally {
        setLoadingJobs(false);
      }
    };

    if (user) {
      fetchSavedJobs();
    }
  }, [user]);

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
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Saved Jobs</h1>
          <p className="text-gray-500 mt-1">Jobs you have bookmarked for later</p>
        </div>

        {savedJobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📌</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved jobs yet</h3>
            <p className="text-gray-500 mb-6">Start saving jobs you're interested in and they'll appear here</p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {savedJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}