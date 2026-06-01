"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Job {
  id: number;
  title: string;
  company: string;
  company_logo: string;
  location: string;
  type: string;
  salary_min: number;
  salary_max: number;
  description: string;
  requirements: string;
  status: string;
  is_verified: boolean;
  created_at: string;
  posted_at: string;
  posted_by_email: string;
  posted_by_name: string;
  verified_by_email: string;
  verified_by_name: string;
  category: string;
  experience_level: string;
}

export default function AdminJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: "all", search: "" });
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.push("/signin");
        return;
      }

      const params = new URLSearchParams();
      if (filter.status !== "all") params.append("status", filter.status);
      if (filter.search) params.append("search", filter.search);

      const res = await fetch(`/api/admin/jobs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (data.success) {
        setJobs(data.jobs);
      } else if (data.error === "Unauthorized" || data.error === "Forbidden") {
        router.push("/signin");
      }
    } catch (error) {
      console.error("Fetch jobs error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [filter]);

  const handleAction = async (jobId: number, action: "verify" | "reject" | "delete") => {
    const actionText = action === "verify" ? "approve" : action;
    if (!confirm(`Are you sure you want to ${actionText} this job?`)) return;
    
    setActionLoading(jobId);
    try {
      const token = localStorage.getItem("auth_token");
      
      if (action === "delete") {
        const res = await fetch(`/api/admin/jobs?id=${jobId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          fetchJobs();
        } else {
          alert(data.error || "Failed to delete job");
        }
      } else {
        const res = await fetch(`/api/admin/jobs`, {
          method: "PUT",
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ jobId, action }),
        });
        const data = await res.json();
        if (data.success) {
          fetchJobs();
        } else {
          alert(data.error || `Failed to ${action} job`);
        }
      }
    } catch (error) {
      console.error(`${action} error:`, error);
      alert("An error occurred. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (job: Job) => {
    if (job.status === "rejected") {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400">Rejected</span>;
    } else if (job.is_verified && job.status === "approved") {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">Approved</span>;
    } else {
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400">Pending</span>;
    }
  };

  const formatSalary = (min: number, max: number) => {
    if (!min && !max) return "Not specified";
    if (min && !max) return `$${min.toLocaleString()}+`;
    if (!min && max) return `Up to $${max.toLocaleString()}`;
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };

  const formatDate = (date: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
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
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Jobs Management</h1>
        <p className="text-white/60 mt-1">Manage and moderate all job postings</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="px-4 py-2 rounded-lg bg-[#0f172a] border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <input
          type="text"
          placeholder="Search by title or company..."
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          className="px-4 py-2 rounded-lg bg-[#0f172a] border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 min-w-[250px]"
        />

        <button
          onClick={() => setFilter({ status: "all", search: "" })}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm hover:bg-white/10 transition-colors"
        >
          Clear Filters
        </button>

        <div className="text-white/60 text-sm self-center ml-auto">
          Total: {jobs.length} jobs
        </div>
      </div>

      {/* Jobs Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-white/10">
            <tr className="text-left text-white/60 text-sm">
              <th className="pb-3 pl-3">Job Details</th>
              <th className="pb-3">Company</th>
              <th className="pb-3">Salary</th>
              <th className="pb-3">Posted By</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Date</th>
              <th className="pb-3 pr-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-white/40">
                  No jobs found
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 pl-3">
                    <div>
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setShowModal(true);
                        }}
                        className="text-white font-medium hover:text-blue-400 transition-colors text-left"
                      >
                        {job.title}
                      </button>
                      <p className="text-white/40 text-xs mt-1">{job.type} • {job.location}</p>
                      {job.category && (
                        <span className="text-white/30 text-xs mt-1 inline-block">
                          {job.category} • {job.experience_level}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      {job.company_logo && (
                        <img 
                          src={job.company_logo} 
                          alt={job.company} 
                          className="w-6 h-6 rounded object-cover bg-white/5"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      )}
                      <span className="text-white text-sm">{job.company}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="text-white/60 text-sm">{formatSalary(job.salary_min, job.salary_max)}</span>
                  </td>
                  <td className="py-4">
                    <div>
                      <p className="text-white text-sm">{job.posted_by_name || "Unknown"}</p>
                      <p className="text-white/40 text-xs">{job.posted_by_email}</p>
                    </div>
                  </td>
                  <td className="py-4">
                    {getStatusBadge(job)}
                   </td>
                  <td className="py-4">
                    <p className="text-white/60 text-sm">{formatDate(job.created_at || job.posted_at)}</p>
                  </td>
                  <td className="py-4 pr-3">
                    <div className="flex gap-2">
                      {job.status !== "rejected" && !job.is_verified && (
                        <button
                          onClick={() => handleAction(job.id, "verify")}
                          disabled={actionLoading === job.id}
                          className="px-3 py-1 rounded-md bg-green-500/20 text-green-400 text-sm hover:bg-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading === job.id ? "..." : "Approve"}
                        </button>
                      )}
                      {job.status !== "rejected" && job.is_verified !== true && (
                        <button
                          onClick={() => handleAction(job.id, "reject")}
                          disabled={actionLoading === job.id}
                          className="px-3 py-1 rounded-md bg-yellow-500/20 text-yellow-400 text-sm hover:bg-yellow-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading === job.id ? "..." : "Reject"}
                        </button>
                      )}
                      <button
                        onClick={() => handleAction(job.id, "delete")}
                        disabled={actionLoading === job.id}
                        className="px-3 py-1 rounded-md bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading === job.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Job Details Modal */}
      {showModal && selectedJob && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-[#0f172a] rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-[#0f172a] border-b border-white/10 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">{selectedJob.title}</h2>
              <button onClick={() => setShowModal(false)} className="text-white/60 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-white/60 text-sm mb-1">Company</h3>
                <p className="text-white">{selectedJob.company}</p>
              </div>
              <div>
                <h3 className="text-white/60 text-sm mb-1">Location</h3>
                <p className="text-white">{selectedJob.location}</p>
              </div>
              <div>
                <h3 className="text-white/60 text-sm mb-1">Salary</h3>
                <p className="text-white">{formatSalary(selectedJob.salary_min, selectedJob.salary_max)}</p>
              </div>
              <div>
                <h3 className="text-white/60 text-sm mb-1">Description</h3>
                <p className="text-white/80 text-sm whitespace-pre-wrap">{selectedJob.description}</p>
              </div>
              <div>
                <h3 className="text-white/60 text-sm mb-1">Requirements</h3>
                <p className="text-white/80 text-sm whitespace-pre-wrap">{selectedJob.requirements}</p>
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                {selectedJob.status !== "rejected" && !selectedJob.is_verified && (
                  <button
                    onClick={() => {
                      handleAction(selectedJob.id, "verify");
                      setShowModal(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                  >
                    Approve Job
                  </button>
                )}
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}