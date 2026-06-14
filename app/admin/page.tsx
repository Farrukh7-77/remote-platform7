"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DashboardStats {
  totalJobs: number;
  totalUsers: number;
  totalCompanies: number;
  totalApplications: number;
  pendingJobs: number;
  pendingEmployers: number;
  pendingCompanies: number;
  monthlyJobs: number;
  monthlyApplications: number;
}

interface WeeklyData {
  date: string;
  count: number;
}

interface StatusData {
  status: string;
  count: number;
}

interface CategoryData {
  category: string;
  count: number;
}

interface RecentJob {
  id: number;
  title: string;
  company: string;
  type: string;
  location: string;
  is_verified: boolean;
  status: string;
  created_at: string;
}

interface RecentApplication {
  id: number;
  full_name: string;
  email: string;
  status: string;
  applied_at: string;
  job_title: string;
  company_name: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [weeklyApps, setWeeklyApps] = useState<WeeklyData[]>([]);
  const [weeklyJobs, setWeeklyJobs] = useState<WeeklyData[]>([]);
  const [appStatus, setAppStatus] = useState<StatusData[]>([]);
  const [topCategories, setTopCategories] = useState<CategoryData[]>([]);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [recentApps, setRecentApps] = useState<RecentApplication[]>([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.push("/signin");
        return;
      }

      const res = await fetch("/api/admin/dashboard-stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (data.success) {
        setStats(data.stats);
        setWeeklyApps(data.weeklyApplications || []);
        setWeeklyJobs(data.weeklyJobs || []);
        setAppStatus(data.applicationStatus || []);
        setTopCategories(data.topCategories || []);
        setRecentJobs(data.recentJobs || []);
        setRecentApps(data.recentApplications || []);
      } else if (data.error === "Unauthorized" || data.error === "Forbidden") {
        router.push("/signin");
      }
    } catch (error) {
      console.error("Fetch dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/20 text-yellow-400",
      reviewed: "bg-blue-500/20 text-blue-400",
      accepted: "bg-green-500/20 text-green-400",
      rejected: "bg-red-500/20 text-red-400",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400";
  };

  const getJobStatusBadge = (job: RecentJob) => {
    if (job.is_verified && job.status === "approved") {
      return <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400">Approved</span>;
    } else if (job.status === "rejected") {
      return <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-400">Rejected</span>;
    } else {
      return <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-500/20 text-yellow-400">Pending</span>;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-white/60 mt-1">Welcome back! Here's what's happening with your platform.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Jobs */}
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl p-5 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400/70 text-sm">Total Jobs</p>
              <p className="text-3xl font-bold text-white mt-1">{stats?.totalJobs || 0}</p>
              <p className="text-green-400 text-xs mt-2">+{stats?.monthlyJobs || 0} this month</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl p-5 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-400/70 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-white mt-1">{stats?.totalUsers || 0}</p>
              <p className="text-white/40 text-xs mt-2">{stats?.pendingEmployers || 0} pending verification</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Companies */}
        <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 rounded-xl p-5 border border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-400/70 text-sm">Companies</p>
              <p className="text-3xl font-bold text-white mt-1">{stats?.totalCompanies || 0}</p>
              <p className="text-white/40 text-xs mt-2">{stats?.pendingCompanies || 0} pending verification</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Applications */}
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl p-5 border border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400/70 text-sm">Applications</p>
              <p className="text-3xl font-bold text-white mt-1">{stats?.totalApplications || 0}</p>
              <p className="text-green-400 text-xs mt-2">+{stats?.monthlyApplications || 0} this month</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Alerts */}
{(stats?.pendingJobs || 0) > 0 || (stats?.pendingEmployers || 0) > 0 || (stats?.pendingCompanies || 0) > 0 ? (
  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
    <div className="flex items-center gap-3 flex-wrap justify-between">
      <div className="flex items-center gap-3">
        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-yellow-400 text-sm">Pending Approvals:</span>
      </div>
      <div className="flex gap-4 text-sm flex-wrap">
        {stats?.pendingJobs ? (
          <Link href="/admin/jobs" className="text-white hover:text-blue-400 transition-colors">
            {stats.pendingJobs} Jobs
          </Link>
        ) : null}
        {stats?.pendingEmployers ? (
          <Link href="/admin/pending-employers" className="text-white hover:text-blue-400 transition-colors">
            {stats.pendingEmployers} Employers
          </Link>
        ) : null}
        {stats?.pendingCompanies ? (
          <Link href="/admin/companies" className="text-white hover:text-blue-400 transition-colors">
            {stats.pendingCompanies} Companies
          </Link>
        ) : null}
      </div>
    </div>
  </div>
) : null}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart - Applications */}
        <div className="bg-[#0f172a] rounded-xl p-5 border border-white/10">
          <h3 className="text-white font-semibold mb-4">Weekly Applications</h3>
          <div className="space-y-3">
            {weeklyApps.length === 0 ? (
              <p className="text-white/40 text-center py-8">No applications this week</p>
            ) : (
              weeklyApps.map((item, idx) => {
                const maxCount = Math.max(...weeklyApps.map(w => w.count), 1);
                const height = (item.count / maxCount) * 100;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-white/40 text-xs w-20">{new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    <div className="flex-1 h-8 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        style={{ width: `${height}%` }}
                      />
                    </div>
                    <span className="text-white text-sm w-8">{item.count}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Weekly Activity Chart - Jobs */}
        <div className="bg-[#0f172a] rounded-xl p-5 border border-white/10">
          <h3 className="text-white font-semibold mb-4">Weekly Jobs Posted</h3>
          <div className="space-y-3">
            {weeklyJobs.length === 0 ? (
              <p className="text-white/40 text-center py-8">No jobs posted this week</p>
            ) : (
              weeklyJobs.map((item, idx) => {
                const maxCount = Math.max(...weeklyJobs.map(w => w.count), 1);
                const height = (item.count / maxCount) * 100;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-white/40 text-xs w-20">{new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    <div className="flex-1 h-8 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                        style={{ width: `${height}%` }}
                      />
                    </div>
                    <span className="text-white text-sm w-8">{item.count}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Status Distribution */}
        <div className="bg-[#0f172a] rounded-xl p-5 border border-white/10">
          <h3 className="text-white font-semibold mb-4">Application Status</h3>
          <div className="space-y-3">
            {appStatus.length === 0 ? (
              <p className="text-white/40 text-center py-8">No applications yet</p>
            ) : (
              appStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-md text-xs ${getStatusColor(item.status)}`}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                  <div className="flex-1 mx-4">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          item.status === 'accepted' ? 'bg-green-500' :
                          item.status === 'rejected' ? 'bg-red-500' :
                          item.status === 'reviewed' ? 'bg-blue-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${(item.count / (stats?.totalApplications || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-white text-sm">{item.count}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Job Categories */}
        <div className="bg-[#0f172a] rounded-xl p-5 border border-white/10">
          <h3 className="text-white font-semibold mb-4">Top Job Categories</h3>
          <div className="space-y-3">
            {topCategories.length === 0 ? (
              <p className="text-white/40 text-center py-8">No categories yet</p>
            ) : (
              topCategories.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">{item.category}</span>
                  <div className="flex-1 mx-4">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        style={{ width: `${(item.count / (topCategories[0]?.count || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-white text-sm">{item.count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Jobs Table */}
      <div className="bg-[#0f172a] rounded-xl border border-white/10 overflow-hidden">
        <div className="p-5 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-white font-semibold">Recent Job Postings</h3>
          <Link href="/admin/jobs" className="text-blue-400 text-sm hover:underline">View All →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr className="text-left text-white/60 text-sm">
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Company</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-white/40">No jobs yet</td>
                </tr>
              ) : (
                recentJobs.map((job) => (
                  <tr key={job.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-5 py-3 text-white text-sm">{job.title}</td>
                    <td className="px-5 py-3 text-white/70 text-sm">{job.company}</td>
                    <td className="px-5 py-3 text-white/60 text-sm">{job.type}</td>
                    <td className="px-5 py-3 text-white/60 text-sm">{job.location}</td>
                    <td className="px-5 py-3">{getJobStatusBadge(job)}</td>
                    <td className="px-5 py-3 text-white/40 text-sm">{formatDate(job.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="bg-[#0f172a] rounded-xl border border-white/10 overflow-hidden">
        <div className="p-5 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-white font-semibold">Recent Applications</h3>
          <Link href="/admin/applications" className="text-blue-400 text-sm hover:underline">View All →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr className="text-left text-white/60 text-sm">
                <th className="px-5 py-3">Applicant</th>
                <th className="px-5 py-3">Job</th>
                <th className="px-5 py-3">Company</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentApps.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-white/40">No applications yet</td>
                </tr>
              ) : (
                recentApps.map((app) => (
                  <tr key={app.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-white text-sm">{app.full_name}</p>
                        <p className="text-white/40 text-xs">{app.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-white/70 text-sm">{app.job_title || "N/A"}</td>
                    <td className="px-5 py-3 text-white/60 text-sm">{app.company_name || "N/A"}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(app.status)}`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-white/40 text-sm">{formatDate(app.applied_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}