// app/applications/page.tsx - SMALLER CARDS, LARGER "View" BUTTON
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

type Application = {
  id: number;
  jobId: number;
  jobTitle: string;
  company: string;
  applicantName: string;
  applicantEmail: string;
  coverLetter: string;
  appliedAt: string;
  isGuest: boolean;
  status?: "pending" | "reviewed" | "rejected" | "accepted";
};

export default function ApplicationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const allApplications = JSON.parse(localStorage.getItem("applications") || "[]");
      const userApplications = allApplications.filter(
        (app: Application) => app.applicantEmail === user.email
      );
      userApplications.sort((a: Application, b: Application) => 
        new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
      );
      setApplications(userApplications);
      setLoadingApps(false);
    }
  }, [user]);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "reviewed":
        return <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700">📋 Reviewed</span>;
      case "accepted":
        return <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">✅ Accepted</span>;
      case "rejected":
        return <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">❌ Rejected</span>;
      default:
        return <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">⏳ Pending</span>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading || loadingApps) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-500 animate-pulse">Loading applications...</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header with icon and subtitle */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-500 mt-1">Track your job applications history</p>
        </div>

        {applications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="text-7xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-500 mb-4">You haven't applied to any jobs yet</p>
            <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors">
              Browse jobs →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app, index) => (
              <div 
                key={app.id} 
                className="group bg-white rounded-xl border border-gray-200 p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/job/${app.jobId}`} 
                      className="text-base font-semibold text-gray-900 transition-colors duration-200"
                    >
                      {app.jobTitle}
                    </Link>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-sm text-gray-500">{app.company}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="text-xs text-gray-400">{formatDate(app.appliedAt)}</span>
                    </div>
                    {app.coverLetter && (
                      <p className="text-gray-500 text-xs mt-2 line-clamp-1">
                        📝 {app.coverLetter.length > 80 ? app.coverLetter.substring(0, 80) + "..." : app.coverLetter}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(app.status)}
                    <Link 
                      href={`/job/${app.jobId}`} 
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .group {
          animation: fadeInUp 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}