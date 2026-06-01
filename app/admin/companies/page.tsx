"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Company {
  id: number;
  email: string;
  name: string;
  logo: string | null;
  industry: string | null;
  location: string | null;
  size: string | null;
  description: string | null;
  website: string | null;
  linkedin: string | null;
  is_verified: boolean;
  created_at: string;
  owner_name: string;
  owner_email: string;
  verified_by_email: string;
  verified_by_name: string;
  verified_at: string;
}

export default function AdminCompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ search: "", isVerified: "all" });
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    website: "",
    description: "",
    location: "",
    size: "",
    industry: "",
    linkedin: "",
    logo: "",
  });

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.push("/signin");
        return;
      }

      const params = new URLSearchParams();
      if (filter.search) params.append("search", filter.search);
      if (filter.isVerified !== "all") params.append("is_verified", filter.isVerified);

      const res = await fetch(`/api/admin/companies?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (data.success) {
        setCompanies(data.companies);
      } else if (data.error === "Unauthorized" || data.error === "Forbidden") {
        router.push("/signin");
      }
    } catch (error) {
      console.error("Fetch companies error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [filter]);

  const handleVerify = async (companyId: number, isVerified: boolean) => {
    setActionLoading(companyId);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/admin/companies", {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ companyId, action: isVerified ? "unverify" : "verify" }),
      });
      const data = await res.json();
      if (data.success) {
        fetchCompanies();
      } else {
        alert(data.error || "Failed to update company");
      }
    } catch (error) {
      console.error("Verify error:", error);
      alert("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (companyId: number, companyName: string) => {
    if (!confirm(`Are you sure you want to delete "${companyName}"? This will also delete all jobs associated with this company.`)) return;
    
    setActionLoading(companyId);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`/api/admin/companies?id=${companyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchCompanies();
      } else {
        alert(data.error || "Failed to delete company");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdate = async () => {
    if (!selectedCompany) return;
    
    setActionLoading(selectedCompany.id);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/admin/companies", {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          companyId: selectedCompany.id, 
          action: "update", 
          updates: editForm 
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowEditModal(false);
        setSelectedCompany(null);
        fetchCompanies();
      } else {
        alert(data.error || "Failed to update company");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const openEditModal = (company: Company) => {
    setSelectedCompany(company);
    setEditForm({
      name: company.name || "",
      website: company.website || "",
      description: company.description || "",
      location: company.location || "",
      size: company.size || "",
      industry: company.industry || "",
      linkedin: company.linkedin || "",
      logo: company.logo || "",
    });
    setShowEditModal(true);
  };

  const getVerifiedBadge = (isVerified: boolean) => {
    if (isVerified) {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">Verified</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400">Unverified</span>;
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
        <h1 className="text-2xl font-bold text-white">Companies Management</h1>
        <p className="text-white/60 mt-1">Manage all registered companies</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <select
          value={filter.isVerified}
          onChange={(e) => setFilter({ ...filter, isVerified: e.target.value })}
          className="px-4 py-2 rounded-lg bg-[#0f172a] border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </select>

        <input
          type="text"
          placeholder="Search by name or email..."
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          className="px-4 py-2 rounded-lg bg-[#0f172a] border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 min-w-[250px]"
        />

        <button
          onClick={() => setFilter({ search: "", isVerified: "all" })}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm hover:bg-white/10 transition-colors"
        >
          Clear Filters
        </button>

        <div className="text-white/60 text-sm self-center ml-auto">
          Total: {companies.length} companies
        </div>
      </div>

      {/* Companies Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-white/10">
            <tr className="text-left text-white/60 text-sm">
              <th className="pb-3 pl-3">Company</th>
              <th className="pb-3">Industry</th>
              <th className="pb-3">Location</th>
              <th className="pb-3">Owner</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Joined</th>
              <th className="pb-3 pr-3">Actions</th>
             </tr>
          </thead>
          <tbody>
            {companies.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-white/40">
                  No companies found
                </td>
               </tr>
            ) : (
              companies.map((company) => (
                <tr key={company.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 pl-3">
                    <div className="flex items-center gap-3">
                      {company.logo && (
                        <img 
                          src={company.logo} 
                          alt={company.name} 
                          className="w-8 h-8 rounded object-cover bg-white/5"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      )}
                      <div>
                        <p className="text-white font-medium">{company.name}</p>
                        <p className="text-white/40 text-sm">{company.email}</p>
                      </div>
                    </div>
                   </td>
                  <td className="py-4">
                    <span className="text-white/60 text-sm">{company.industry || "-"}</span>
                   </td>
                  <td className="py-4">
                    <span className="text-white/60 text-sm">{company.location || "-"}</span>
                   </td>
                  <td className="py-4">
                    <div>
                      <p className="text-white text-sm">{company.owner_name || "-"}</p>
                      <p className="text-white/40 text-xs">{company.owner_email}</p>
                    </div>
                   </td>
                  <td className="py-4">
                    {getVerifiedBadge(company.is_verified)}
                   </td>
                  <td className="py-4">
                    <p className="text-white/60 text-sm">{formatDate(company.created_at)}</p>
                   </td>
                  <td className="py-4 pr-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(company)}
                        disabled={actionLoading === company.id}
                        className="px-3 py-1 rounded-md bg-blue-500/20 text-blue-400 text-sm hover:bg-blue-500/30 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        Edit
                      </button>
                      {!company.is_verified ? (
                        <button
                          onClick={() => handleVerify(company.id, false)}
                          disabled={actionLoading === company.id}
                          className="px-3 py-1 rounded-md bg-green-500/20 text-green-400 text-sm hover:bg-green-500/30 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          {actionLoading === company.id ? "..." : "Verify"}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleVerify(company.id, true)}
                          disabled={actionLoading === company.id}
                          className="px-3 py-1 rounded-md bg-yellow-500/20 text-yellow-400 text-sm hover:bg-yellow-500/30 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          Unverify
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(company.id, company.name)}
                        disabled={actionLoading === company.id}
                        className="px-3 py-1 rounded-md bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {actionLoading === company.id ? "..." : "Delete"}
                      </button>
                    </div>
                   </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedCompany && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setShowEditModal(false)}>
          <div className="bg-[#0f172a] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-[#0f172a] border-b border-white/10 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Edit Company</h2>
              <button onClick={() => setShowEditModal(false)} className="text-white/60 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Company Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Logo URL</label>
                <input
                  type="text"
                  value={editForm.logo}
                  onChange={(e) => setEditForm({ ...editForm, logo: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Website</label>
                <input
                  type="text"
                  value={editForm.website}
                  onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">LinkedIn</label>
                <input
                  type="text"
                  value={editForm.linkedin}
                  onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/company/..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Industry</label>
                  <input
                    type="text"
                    value={editForm.industry}
                    onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Company Size</label>
                  <select
                    value={editForm.size}
                    onChange={(e) => setEditForm({ ...editForm, size: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="sticky bottom-0 bg-[#0f172a] border-t border-white/10 p-4 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={actionLoading === selectedCompany.id}
                className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {actionLoading === selectedCompany.id ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}