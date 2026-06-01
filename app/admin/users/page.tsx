"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  email: string;
  name: string;
  role: "user" | "employer" | "admin";
  avatar: string | null;
  is_active: boolean;
  created_at: string;
  blocked_at: string | null;
  company_name: string | null;
  verification_status?: string; // YENİ: pending, approved, rejected
  voen?: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ role: "all", search: "" });
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.push("/signin");
        return;
      }

      const params = new URLSearchParams();
      if (filter.role !== "all") params.append("role", filter.role);
      if (filter.search) params.append("search", filter.search);

      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (data.success) {
        setUsers(data.users);
      } else if (data.error === "Unauthorized" || data.error === "Forbidden") {
        router.push("/signin");
      }
    } catch (error) {
      console.error("Fetch users error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const handleBlockToggle = async (userId: number) => {
    setActionLoading(userId);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`/api/admin/users`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId, action: "block" }),
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      } else {
        alert(data.error || "Failed to update user");
      }
    } catch (error) {
      console.error("Block toggle error:", error);
      alert("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    setActionLoading(userId);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`/api/admin/users`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId, action: "changeRole", role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      } else {
        alert(data.error || "Failed to change role");
      }
    } catch (error) {
      console.error("Role change error:", error);
      alert("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  // YENİ: Employer təsdiqləmə
  const handleVerifyEmployer = async (userId: number, action: "approve" | "reject") => {
    if (action === "reject" && !rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    setActionLoading(userId);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/admin/pending-employers", {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          userId, 
          action, 
          rejectionReason: action === "reject" ? rejectionReason : undefined 
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowRejectModal(false);
        setRejectionReason("");
        setSelectedUser(null);
        fetchUsers();
      } else {
        alert(data.error || `Failed to ${action} employer`);
      }
    } catch (error) {
      console.error("Verify employer error:", error);
      alert("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId: number, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) return;
    
    setActionLoading(userId);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      } else {
        alert(data.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Delete user error:", error);
      alert("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: "bg-purple-500/20 text-purple-400",
      employer: "bg-blue-500/20 text-blue-400",
      user: "bg-green-500/20 text-green-400",
    };
    return colors[role as keyof typeof colors] || "bg-gray-500/20 text-gray-400";
  };

  const getStatusBadge = (isActive: boolean, blockedAt: string | null) => {
    if (!isActive || blockedAt) {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400">Blocked</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">Active</span>;
  };

  // YENİ: Verification status badge
  const getVerificationBadge = (user: User) => {
    if (user.role !== "employer") return null;
    
    if (user.verification_status === "pending") {
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400">Pending Approval</span>;
    }
    if (user.verification_status === "rejected") {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400">Rejected</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">Verified</span>;
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
        <h1 className="text-2xl font-bold text-white">Users Management</h1>
        <p className="text-white/60 mt-1">Manage all registered users</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <select
          value={filter.role}
          onChange={(e) => setFilter({ ...filter, role: e.target.value })}
          className="px-4 py-2 rounded-lg bg-[#0f172a] border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Roles</option>
          <option value="user">Job Seekers</option>
          <option value="employer">Employers</option>
          <option value="admin">Admins</option>
        </select>

        <input
          type="text"
          placeholder="Search by email or name..."
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          className="px-4 py-2 rounded-lg bg-[#0f172a] border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 min-w-[250px]"
        />

        <button
          onClick={() => setFilter({ role: "all", search: "" })}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm hover:bg-white/10 transition-colors"
        >
          Clear Filters
        </button>

        <div className="text-white/60 text-sm self-center ml-auto">
          Total: {users.length} users
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-white/10">
            <tr className="text-left text-white/60 text-sm">
              <th className="pb-3 pl-3">User</th>
              <th className="pb-3">Role</th>
              <th className="pb-3">Company / VAT</th>
              <th className="pb-3">Verification</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Joined</th>
              <th className="pb-3 pr-3">Actions</th>
             </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-white/40">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 pl-3">
                    <div>
                      <p className="text-white font-medium">{user.name || "Unnamed"}</p>
                      <p className="text-white/40 text-sm">{user.email}</p>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadge(user.role)}`}>
                      {user.role === "user" ? "Job Seeker" : user.role === "employer" ? "Employer" : "Admin"}
                    </span>
                  </td>
                  <td className="py-4">
                    <div>
                      <p className="text-white/60 text-sm">{user.company_name || "-"}</p>
                      {user.voen && (
                        <p className="text-white/40 text-xs font-mono">VAT: {user.voen}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4">
                    {getVerificationBadge(user)}
                  </td>
                  <td className="py-4">
                    {getStatusBadge(user.is_active, user.blocked_at)}
                  </td>
                  <td className="py-4">
                    <p className="text-white/60 text-sm">{formatDate(user.created_at)}</p>
                  </td>
                  <td className="py-4 pr-3">
                    <div className="flex gap-2 flex-wrap">
                      {/* YENİ: Pending employer üçün Approve/Reject düymələri */}
                      {user.role === "employer" && user.verification_status === "pending" && (
                        <>
                          <button
                            onClick={() => handleVerifyEmployer(user.id, "approve")}
                            disabled={actionLoading === user.id}
                            className="px-3 py-1 rounded-md bg-green-500/20 text-green-400 text-sm hover:bg-green-500/30 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {actionLoading === user.id ? "..." : "Approve"}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setRejectionReason("");
                              setShowRejectModal(true);
                            }}
                            disabled={actionLoading === user.id}
                            className="px-3 py-1 rounded-md bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {/* Block/Unblock Button */}
                      <button
                        onClick={() => handleBlockToggle(user.id)}
                        disabled={actionLoading === user.id}
                        className={`px-3 py-1 rounded-md text-sm transition-colors disabled:opacity-50 cursor-pointer ${
                          user.is_active && !user.blocked_at
                            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                            : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                        }`}
                      >
                        {actionLoading === user.id ? "..." : (user.is_active && !user.blocked_at ? "Block" : "Unblock")}
                      </button>

                      {/* Role Change Dropdown */}
                      {user.role !== "admin" && user.verification_status !== "pending" && (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          disabled={actionLoading === user.id}
                          className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-white text-sm focus:outline-none disabled:opacity-50"
                        >
                          <option value="user">Job Seeker</option>
                          <option value="employer">Employer</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}

                      {/* Delete Button */}
                      {user.role !== "admin" && (
                        <button
                          onClick={() => handleDelete(user.id, user.name || user.email)}
                          disabled={actionLoading === user.id}
                          className="px-3 py-1 rounded-md bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          {actionLoading === user.id ? "..." : "Delete"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowRejectModal(false)}>
          <div className="bg-[#0f172a] rounded-xl max-w-md w-full border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Reject Employer</h2>
            </div>
            <div className="p-4">
              <p className="text-white/70 mb-4">
                Reject <strong className="text-white">{selectedUser.company_name || selectedUser.name}</strong>?
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
                  setSelectedUser(null);
                  setRejectionReason("");
                }}
                className="px-4 py-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerifyEmployer(selectedUser.id, "reject")}
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