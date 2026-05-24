// app/employer/analytics/page.tsx - FIXED TypeScript errors
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type JobWithApplications = {
  id: number;
  title: string;
  posted_at: string;
  application_count: number;
  is_featured: boolean;
  category?: string;
  type?: string;
};

type TimeFilter = "week" | "month" | "year" | "all";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#6366f1", "#14b8a6", "#f97316"];

export default function EmployerAnalytics() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<JobWithApplications[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("month");
  const [loadingData, setLoadingData] = useState(true);
  const [totalApplications, setTotalApplications] = useState(0);
  const [totalJobs, setTotalJobs] = useState(0);

  useEffect(() => {
    if (!loading && !user) router.push("/");
    if (user && user.role !== "employer") router.push("/");
  }, [user, loading, router]);

  const isWithinTimeFilter = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    switch (timeFilter) {
      case "week": return diffDays <= 7;
      case "month": return diffDays <= 30;
      case "year": return diffDays <= 365;
      default: return true;
    }
  };

  useEffect(() => {
    if (!user?.email) return;
    const fetchData = async () => {
      try {
        const jobsRes = await fetch(`/api/jobs/employer/${user.email}`);
        const jobsData = await jobsRes.json();
        const employerJobs = jobsData.jobs || [];
        const allApplications = JSON.parse(localStorage.getItem("applications") || "[]");
        const jobsWithApps = employerJobs.map((job: any) => ({
          ...job,
          application_count: allApplications.filter((app: any) => app.jobId === job.id).length
        }));
        setJobs(jobsWithApps);
        const filteredJobs = jobsWithApps.filter((job: any) => isWithinTimeFilter(job.posted_at));
        setTotalJobs(filteredJobs.length);
        const total = filteredJobs.reduce((sum: number, job: any) => sum + job.application_count, 0);
        setTotalApplications(total);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [user?.email]);

  useEffect(() => {
    if (!user?.email) return;
    const refreshData = async () => {
      setLoadingData(true);
      try {
        const jobsRes = await fetch(`/api/jobs/employer/${user.email}`);
        const jobsData = await jobsRes.json();
        const employerJobs = jobsData.jobs || [];
        const allApplications = JSON.parse(localStorage.getItem("applications") || "[]");
        const jobsWithApps = employerJobs.map((job: any) => ({
          ...job,
          application_count: allApplications.filter((app: any) => app.jobId === job.id).length
        }));
        const filteredJobs = jobsWithApps.filter((job: any) => isWithinTimeFilter(job.posted_at));
        setJobs(filteredJobs);
        setTotalJobs(filteredJobs.length);
        const total = filteredJobs.reduce((sum: number, job: any) => sum + job.application_count, 0);
        setTotalApplications(total);
      } catch (error) {
        console.error("Failed to refresh data:", error);
      } finally {
        setLoadingData(false);
      }
    };
    refreshData();
  }, [timeFilter, user?.email]);

  const prepareMonthlyData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyMap = new Map();
    months.forEach(month => monthlyMap.set(month, { month, jobs: 0, applications: 0 }));
    jobs.forEach(job => {
      const date = new Date(job.posted_at);
      const monthName = months[date.getMonth()];
      const existing = monthlyMap.get(monthName);
      if (existing) {
        existing.jobs += 1;
        existing.applications += job.application_count;
      }
    });
    return Array.from(monthlyMap.values()).filter((m: any) => m.jobs > 0 || m.applications > 0);
  };

  const getCategoryData = () => {
    const categoryMap = new Map<string, number>();
    jobs.forEach(job => {
      if (job.category && job.application_count > 0) {
        categoryMap.set(job.category, (categoryMap.get(job.category) || 0) + job.application_count);
      }
    });
    return Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  };

  const getJobTypeData = () => {
    const typeMap = new Map<string, number>();
    jobs.forEach(job => {
      if (job.type && job.application_count > 0) {
        typeMap.set(job.type, (typeMap.get(job.type) || 0) + job.application_count);
      }
    });
    return Array.from(typeMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  };

  const getDailyData = () => {
    const last30Days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      last30Days.push({ date: dateStr, applications: 0 });
    }
    const allApplications = JSON.parse(localStorage.getItem("applications") || "[]");
    const employerJobIds = new Set(jobs.map(j => j.id));
    allApplications.forEach((app: any) => {
      if (employerJobIds.has(app.jobId)) {
        const appDate = new Date(app.appliedAt);
        const dayIndex = Math.floor((today.getTime() - appDate.getTime()) / (1000 * 60 * 60 * 24));
        if (dayIndex >= 0 && dayIndex < 30) {
          const idx = 29 - dayIndex;
          if (last30Days[idx]) last30Days[idx].applications += 1;
        }
      }
    });
    return last30Days;
  };

  const topJobs = [...jobs].filter(j => j.application_count > 0).sort((a, b) => b.application_count - a.application_count).slice(0, 5);
  const monthlyData = prepareMonthlyData();
  const categoryData = getCategoryData();
  const jobTypeData = getJobTypeData();
  const dailyData = getDailyData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-1">{label}</p>
          {payload.map((p: any, idx: number) => (
            <p key={idx} className="text-sm" style={{ color: p.color }}>
              {p.name}: {Math.floor(p.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatYAxis = (value: number) => Math.floor(value).toString();

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-500 animate-pulse">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-500 mt-1">Track your job posting performance</p>
            </div>
            <div className="flex gap-2 bg-white rounded-lg border border-gray-200 p-1">
              {[
                { value: "week", label: "Week" },
                { value: "month", label: "Month" },
                { value: "year", label: "Year" },
                { value: "all", label: "All Time" }
              ].map((filter) => (
                <button key={filter.value} onClick={() => setTimeFilter(filter.value as TimeFilter)} className={`px-4 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${timeFilter === filter.value ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}>
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500">Total Jobs Posted</p><p className="text-3xl font-bold text-blue-600">{totalJobs}</p></div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500">Total Applications</p><p className="text-3xl font-bold text-green-600">{totalApplications}</p></div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500">Avg. per Job</p><p className="text-3xl font-bold text-purple-600">{totalJobs > 0 ? Math.floor(totalApplications / totalJobs) : 0}</p></div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500">Featured Jobs</p><p className="text-3xl font-bold text-yellow-600">{jobs.filter(j => j.is_featured).length}</p></div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Charts - Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Activity</h3>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={formatYAxis} allowDecimals={false} domain={[0, 'auto']} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="jobs" stroke="#3b82f6" name="Jobs Posted" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="applications" stroke="#10b981" name="Applications" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Applications (Last 30 Days)</h3>
            {dailyData.some(d => d.applications > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={5} />
                  <YAxis tickFormatter={formatYAxis} allowDecimals={false} domain={[0, 'auto']} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="applications" stroke="#3b82f6" fill="#93c5fd" name="Applications" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">No applications in last 30 days</div>
            )}
          </div>
        </div>

        {/* Charts - Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Jobs by Applications</h3>
            {topJobs.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topJobs} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={formatYAxis} allowDecimals={false} domain={[0, 'auto']} />
                  <YAxis type="category" dataKey="title" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="application_count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">No applications received yet</div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Applications by Category</h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                    {categoryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">No category data available</div>
            )}
          </div>
        </div>

        {/* Charts - Row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Applications by Job Type</h3>
            {jobTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={jobTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                    {jobTypeData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">No job type data available</div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Insights</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Most popular category</span>
                <span className="font-semibold text-blue-600">{categoryData[0]?.name || "N/A"}</span>
                <span className="text-sm text-gray-500">{categoryData[0]?.value || 0} applications</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Most popular job type</span>
                <span className="font-semibold text-blue-600">{jobTypeData[0]?.name || "N/A"}</span>
                <span className="text-sm text-gray-500">{jobTypeData[0]?.value || 0} applications</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Best performing job</span>
                <span className="font-semibold text-blue-600 truncate max-w-[150px]">{topJobs[0]?.title || "N/A"}</span>
                <span className="text-sm text-gray-500">{topJobs[0]?.application_count || 0} apps</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Featured jobs boost</span>
                <span className="font-semibold text-green-600">
                  {jobs.filter(j => j.is_featured).length > 0 && jobs.filter(j => !j.is_featured).length > 0
                    ? `${Math.round((jobs.filter(j => j.is_featured).reduce((s: number, j: any) => s + j.application_count, 0) / jobs.filter(j => j.is_featured).length) / (jobs.filter(j => !j.is_featured).reduce((s: number, j: any) => s + j.application_count, 0) / jobs.filter(j => !j.is_featured).length) * 100)}% more`
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Jobs Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Job Title</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Posted Date</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Applications</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Status</th>
                 </tr>
              </thead>
              <tbody>
                {jobs.length > 0 ? jobs.map((job) => (
                  <tr key={job.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="py-3 px-4"><Link href={`/job/${job.id}`} className="text-blue-600 hover:underline">{job.title}</Link></td>
                    <td className="text-center py-3 px-4 text-gray-600">{new Date(job.posted_at).toLocaleDateString()}</td>
                    <td className="text-center py-3 px-4"><span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">{job.application_count}</span></td>
                    <td className="text-center py-3 px-4">{job.is_featured ? <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">⭐ Featured</span> : <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">Normal</span>}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-400">No jobs posted in this period</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}