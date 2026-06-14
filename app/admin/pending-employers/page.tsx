"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface PendingEmployer {
  id: number;
  email: string;
  name: string;
  company_name: string;
  voen: string;
  industry: string | null;
  company_size: string | null;
  location: string | null;
  website: string | null;
  linkedin: string | null;
  verification_status: string;
  created_at: string;
  email_verified_at: string;
}

export default function PendingEmployersPage() {
  const router = useRouter();
  const [employers, setEmployers] = useState<PendingEmployer[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedEmployer, setSelectedEmployer] = useState<PendingEmployer | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsEmployer, setDetailsEmployer] = useState<PendingEmployer | null>(null);

  const fetchEmployers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.push("/signin");
        return;
      }

      const res = await fetch("/api/admin/pending-employers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (data.success) {
        setEmployers(data.employers);
      } else if (data.error === "Unauthorized" || data.error === "Forbidden") {
        router.push("/signin");
      }
    } catch (error) {
      console.error("Fetch employers error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployers();
  }, []);

  const handleApprove = async (userId: number) => {
    if (!confirm("Approve this employer?")) return;
    
    setActionLoading(userId);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/admin/pending-employers", {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId, action: "approve" }),
      });
      const data = await res.json();
      if (data.success) {
        fetchEmployers();
      } else {
        alert(data.error || "Failed to approve");
      }
    } catch (error) {
      console.error("Approve error:", error);
      alert("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!selectedEmployer) return;
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }
    
    setActionLoading(selectedEmployer.id);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/admin/pending-employers", {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          userId: selectedEmployer.id, 
          action: "reject", 
          rejectionReason 
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowRejectModal(false);
        setRejectionReason("");
        setSelectedEmployer(null);
        fetchEmployers();
      } else {
        alert(data.error || "Failed to reject");
      }
    } catch (error) {
      console.error("Reject error:", error);
      alert("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const openDetailsModal = (emp: PendingEmployer) => {
    setDetailsEmployer(emp);
    setShowDetailsModal(true);
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Pending Employer Verifications</h1>
        <p className="text-white/60 mt-1">
          Review and verify employer accounts before they can access the platform
        </p>
      </div>

      {employers.length === 0 ? (
        <div className="text-center py-12 text-white/40 bg-white/5 rounded-xl">
          <svg className="w-12 h-12 mx-auto mb-3 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>No pending employer verifications</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr className="text-left text-white/60 text-sm">
                <th className="pb-3 pl-3">Company</th>
                <th className="pb-3">Industry</th>
                <th className="pb-3">Size</th>
                <th className="pb-3">Location</th>
                <th className="pb-3">Contact Person</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">VAT Number</th>
                <th className="pb-3">Registered</th>
                <th className="pb-3 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employers.map((emp) => (
                <tr key={emp.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 pl-3">
                    <button
                      onClick={() => openDetailsModal(emp)}
                      className="text-white font-medium hover:text-blue-400 hover:underline transition-colors cursor-pointer text-left"
                    >
                      {emp.company_name || "N/A"}
                    </button>
                    {emp.website && (
                      <a 
                        href={emp.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-400 hover:text-blue-300 text-xs block mt-1"
                      >
                        Website ↗
                      </a>
                    )}
                  </td>
                  <td className="py-4">
                    <span className="text-white/60 text-sm">{emp.industry || "-"}</span>
                  </td>
                  <td className="py-4">
                    <span className="text-white/60 text-sm">{emp.company_size || "-"}</span>
                  </td>
                  <td className="py-4">
                    <span className="text-white/60 text-sm">{emp.location || "-"}</span>
                  </td>
                  <td className="py-4">
                    <span className="text-white text-sm">{emp.name}</span>
                  </td>
                  <td className="py-4">
                    <span className="text-white/60 text-sm">{emp.email}</span>
                  </td>
                  <td className="py-4">
                    <span className="text-white/60 text-sm font-mono">{emp.voen || "N/A"}</span>
                  </td>
                  <td className="py-4">
                    <div>
                      <p className="text-white/60 text-xs">{formatDate(emp.created_at)}</p>
                      {emp.email_verified_at && (
                        <p className="text-green-400/60 text-xs">Email: {formatDate(emp.email_verified_at)}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 pr-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(emp.id)}
                        disabled={actionLoading === emp.id}
                        className="px-3 py-1 rounded-md bg-green-500/20 text-green-400 text-sm hover:bg-green-500/30 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {actionLoading === emp.id ? "..." : "Approve"}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedEmployer(emp);
                          setRejectionReason("");
                          setShowRejectModal(true);
                        }}
                        disabled={actionLoading === emp.id}
                        className="px-3 py-1 rounded-md bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && detailsEmployer && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-[#0f172a] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-[#0f172a] border-b border-white/10 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">{detailsEmployer.company_name}</h2>
                <p className="text-white/60 text-sm mt-1">Company Details</p>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="text-white/60 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Company Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Company Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-white/50 text-xs mb-1">Company Name</p>
                    <p className="text-white font-medium">{detailsEmployer.company_name || "N/A"}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-white/50 text-xs mb-1">Industry</p>
                    <p className="text-white font-medium">{detailsEmployer.industry || "N/A"}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-white/50 text-xs mb-1">Company Size</p>
                    <p className="text-white font-medium">{detailsEmployer.company_size || "N/A"}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-white/50 text-xs mb-1">Location</p>
                    <p className="text-white font-medium">{detailsEmployer.location || "N/A"}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 md:col-span-2">
                    <p className="text-white/50 text-xs mb-1">Website</p>
                    {detailsEmployer.website ? (
                      <a 
                        href={detailsEmployer.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
                      >
                        {detailsEmployer.website}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : (
                      <p className="text-white/40">N/A</p>
                    )}
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 md:col-span-2">
                    <p className="text-white/50 text-xs mb-1">LinkedIn</p>
                    {detailsEmployer.linkedin ? (
                      <a 
                        href={detailsEmployer.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
                      >
                        {detailsEmployer.linkedin}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : (
                      <p className="text-white/40">N/A</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-white/50 text-xs mb-1">Contact Person</p>
                    <p className="text-white font-medium">{detailsEmployer.name}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-white/50 text-xs mb-1">Email</p>
                    <p className="text-white font-medium">{detailsEmployer.email}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 md:col-span-2">
                    <p className="text-white/50 text-xs mb-1">VAT Number (VÖEN)</p>
                    <p className="text-white font-medium font-mono">{detailsEmployer.voen || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Registration Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Registration Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-white/50 text-xs mb-1">Registered Date</p>
                    <p className="text-white font-medium">{formatDate(detailsEmployer.created_at)}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-white/50 text-xs mb-1">Email Verified</p>
                    <p className="text-white font-medium">
                      {detailsEmployer.email_verified_at ? (
                        <span className="text-green-400">{formatDate(detailsEmployer.email_verified_at)}</span>
                      ) : (
                        <span className="text-red-400">Not Verified</span>
                      )}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 md:col-span-2">
                    <p className="text-white/50 text-xs mb-1">Status</p>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                      Pending Verification
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-[#0f172a] border-t border-white/10 p-4 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  handleApprove(detailsEmployer.id);
                }}
                className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors cursor-pointer"
              >
                Approve
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedEmployer(detailsEmployer);
                  setRejectionReason("");
                  setShowRejectModal(true);
                }}
                className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedEmployer && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowRejectModal(false)}>
          <div className="bg-[#0f172a] rounded-xl max-w-md w-full border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Reject Employer</h2>
            </div>
            <div className="p-4">
              <p className="text-white/70 mb-4">
                Reject <strong className="text-white">{selectedEmployer.company_name}</strong>?
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Reason for rejection (required)..."
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-red-400 min-h-[100px]"
              />
            </div>
            <div className="p-4 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedEmployer(null);
                  setRejectionReason("");
                }}
                className="px-4 py-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
                className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}