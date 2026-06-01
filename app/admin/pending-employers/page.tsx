"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface PendingEmployer {
  id: number;
  email: string;
  name: string;
  company_name: string;
  voen: string;
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
                    <p className="text-white font-medium">{emp.company_name || "N/A"}</p>
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