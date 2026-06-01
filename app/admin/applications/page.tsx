"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Application {
  id: number;
  job_id: number;
  job_title: string;
  company_name: string;
  job_location: string;
  user_id: number;
  applicant_name: string;
  applicant_email: string;
  applicant_avatar: string;
  full_name: string;
  email: string;
  phone: string;
  cover_letter: string;
  resume_url: string;
  portfolio_url: string;
  linkedin_url: string;
  status: "pending" | "reviewed" | "accepted" | "rejected";
  applied_at: string;
  updated_at: string;
}

const statusColors = {
  pending: "bg-yellow-500/20 text-yellow-400",
  reviewed: "bg-blue-500/20 text-blue-400",
  accepted: "bg-green-500/20 text-green-400",
  rejected: "bg-red-500/20 text-red-400",
};

const statusLabels = {
  pending: "Pending",
  reviewed: "Reviewed",
  accepted: "Accepted",
  rejected: "Rejected",
};

export default function AdminApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: "all", search: "" });
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchApplications = async () => {
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

      const res = await fetch(`/api/admin/applications?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (data.success) {
        setApplications(data.applications);
      } else if (data.error === "Unauthorized" || data.error === "Forbidden") {
        router.push("/signin");
      }
    } catch (error) {
      console.error("Fetch applications error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const handleStatusChange = async (applicationId: number, newStatus: string) => {
    setActionLoading(applicationId);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/admin/applications", {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ applicationId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchApplications();
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Status change error:", error);
      alert("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (applicationId: number) => {
    if (!confirm("Are you sure you want to delete this application?")) return;
    
    setActionLoading(applicationId);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`/api/admin/applications?id=${applicationId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchApplications();
      } else {
        alert(data.error || "Failed to delete application");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Applications Management</h1>
        <p className="text-white/60 mt-1">Manage all job applications from job seekers</p>
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
          <option value="reviewed">Reviewed</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>

        <input
          type="text"
          placeholder="Search by name, email, job title, or company..."
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          className="px-4 py-2 rounded-lg bg-[#0f172a] border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 min-w-[300px]"
        />

        <button
          onClick={() => setFilter({ status: "all", search: "" })}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm hover:bg-white/10 transition-colors"
        >
          Clear Filters
        </button>

        <div className="text-white/60 text-sm self-center ml-auto">
          Total: {applications.length} applications
        </div>
      </div>

      {/* Applications Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-white/10">
            <tr className="text-left text-white/60 text-sm">
              <th className="pb-3 pl-3">Job / Company</th>
              <th className="pb-3">Applicant</th>
              <th className="pb-3">Contact</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Applied Date</th>
              <th className="pb-3 pr-3">Actions</th>
             </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-white/40">
                  No applications found
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 pl-3">
                    <div>
                      <p className="text-white font-medium">{app.job_title || "N/A"}</p>
                      <p className="text-white/40 text-sm">{app.company_name} • {app.job_location}</p>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      {app.applicant_avatar && (
                        <img src={app.applicant_avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                      )}
                      <div>
                        <p className="text-white text-sm">{app.applicant_name || app.full_name}</p>
                        <p className="text-white/40 text-xs">ID: {app.user_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <div>
                      <p className="text-white/60 text-sm">{app.email}</p>
                      {app.phone && <p className="text-white/40 text-xs">{app.phone}</p>}
                    </div>
                  </td>
                  <td className="py-4">
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      disabled={actionLoading === app.id}
                      className={`px-2 py-1 rounded-md text-xs font-medium border-none focus:outline-none cursor-pointer ${statusColors[app.status]} bg-transparent`}
                    >
                      <option value="pending" className="bg-[#0f172a] text-yellow-400">Pending</option>
                      <option value="reviewed" className="bg-[#0f172a] text-blue-400">Reviewed</option>
                      <option value="accepted" className="bg-[#0f172a] text-green-400">Accepted</option>
                      <option value="rejected" className="bg-[#0f172a] text-red-400">Rejected</option>
                    </select>
                  </td>
                  <td className="py-4">
                    <p className="text-white/60 text-sm">{formatDate(app.applied_at)}</p>
                  </td>
                  <td className="py-4 pr-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setShowDetailModal(true);
                        }}
                        className="px-3 py-1 rounded-md bg-blue-500/20 text-blue-400 text-sm hover:bg-blue-500/30 transition-colors cursor-pointer"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleDelete(app.id)}
                        disabled={actionLoading === app.id}
                        className="px-3 py-1 rounded-md bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {actionLoading === app.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Application Details Modal */}
      {showDetailModal && selectedApp && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setShowDetailModal(false)}>
          <div className="bg-[#0f172a] rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-[#0f172a] border-b border-white/10 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Application Details</h2>
              <button onClick={() => setShowDetailModal(false)} className="text-white/60 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Job Info */}
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-sm font-medium text-white/60 mb-2">Job Position</h3>
                <p className="text-white font-medium">{selectedApp.job_title}</p>
                <p className="text-white/60 text-sm mt-1">{selectedApp.company_name} • {selectedApp.job_location}</p>
              </div>

              {/* Applicant Info */}
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-sm font-medium text-white/60 mb-2">Applicant Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/40 text-xs">Full Name</p>
                    <p className="text-white">{selectedApp.full_name || selectedApp.applicant_name}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Email</p>
                    <p className="text-white">{selectedApp.email}</p>
                  </div>
                  {selectedApp.phone && (
                    <div>
                      <p className="text-white/40 text-xs">Phone</p>
                      <p className="text-white">{selectedApp.phone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-white/40 text-xs">Applied Date</p>
                    <p className="text-white">{formatDate(selectedApp.applied_at)}</p>
                  </div>
                </div>
              </div>

              {/* Links */}
              {(selectedApp.resume_url || selectedApp.portfolio_url || selectedApp.linkedin_url) && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-white/60 mb-2">Links & Documents</h3>
                  <div className="space-y-2">
                    {selectedApp.resume_url && (
                      <a href={selectedApp.resume_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View Resume / CV
                      </a>
                    )}
                    {selectedApp.portfolio_url && (
                      <a href={selectedApp.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View Portfolio
                      </a>
                    )}
                    {selectedApp.linkedin_url && (
                      <a href={selectedApp.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                          <circle cx="4" cy="4" r="2" stroke="none" fill="currentColor" />
                        </svg>
                        LinkedIn Profile
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Cover Letter */}
              {selectedApp.cover_letter && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-white/60 mb-2">Cover Letter</h3>
                  <p className="text-white/80 text-sm whitespace-pre-wrap">{selectedApp.cover_letter}</p>
                </div>
              )}

              {/* Status Update */}
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-sm font-medium text-white/60 mb-2">Update Status</h3>
                <div className="flex gap-3 flex-wrap">
                  {["pending", "reviewed", "accepted", "rejected"].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        handleStatusChange(selectedApp.id, status);
                        setSelectedApp({ ...selectedApp, status: status as any });
                      }}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                        selectedApp.status === status
                          ? statusColors[status as keyof typeof statusColors] + " border border-current"
                          : "bg-white/5 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      {statusLabels[status as keyof typeof statusLabels]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-[#0f172a] border-t border-white/10 p-4 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}