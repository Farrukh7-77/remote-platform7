// app/applications/page.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useEffect, useState } from "react";

type Application = {
  id: number;
  jobId: number;
  jobTitle: string;
  company: string;
  applicantName: string;
  applicantEmail: string;
  coverLetter: string;
  appliedAt: string;
};

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    if (user) {
      const allApps = JSON.parse(localStorage.getItem("applications") || "[]");
      const userApps = allApps.filter((app: Application) => app.applicantEmail === user.email);
      setApplications(userApps);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Please Sign In</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">You need to be logged in to view your applications.</p>
          <Link href="/" className="inline-block mt-4 text-blue-600 hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">My Applications</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        You have applied to {applications.length} job(s)
      </p>

      {applications.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400">You haven't applied to any jobs yet.</p>
          <Link href="/" className="inline-block mt-3 text-blue-600 hover:underline">
            Browse Jobs →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{app.jobTitle}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{app.company}</p>
                  {app.coverLetter && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                      {app.coverLetter}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Applied: {new Date(app.appliedAt).toLocaleDateString()}
                  </p>
                </div>
                <Link
                  href={`/job/${app.jobId}`}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  View Job →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}