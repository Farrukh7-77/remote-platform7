// app/profile/page.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [jobStatus, setJobStatus] = useState("actively_looking");
  const [cvFile, setCvFile] = useState<{ name: string; uploadedAt: string } | null>(null);
  const [applicationCount, setApplicationCount] = useState(0);
  const [savedJobsCount, setSavedJobsCount] = useState(0);

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === "job_seeker") {
      setLocation(localStorage.getItem(`profile_location_${user.email}`) || "");
      setBio(localStorage.getItem(`profile_bio_${user.email}`) || "");
      setLinkedin(localStorage.getItem(`profile_linkedin_${user.email}`) || "");
      setGithub(localStorage.getItem(`profile_github_${user.email}`) || "");
      setPortfolio(localStorage.getItem(`profile_portfolio_${user.email}`) || "");
      setJobStatus(localStorage.getItem(`profile_jobstatus_${user.email}`) || "actively_looking");
      
      const savedCv = localStorage.getItem(`cv_${user.email}`);
      if (savedCv) {
        try { setCvFile(JSON.parse(savedCv)); } catch { setCvFile({ name: savedCv, uploadedAt: new Date().toISOString() }); }
      }
      
      const applications = JSON.parse(localStorage.getItem("applications") || "[]");
      setApplicationCount(applications.filter((app: any) => app.applicantEmail === user.email).length);
      
      let savedCount = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("bookmark_") && localStorage.getItem(key) === "true") savedCount++;
      }
      setSavedJobsCount(savedCount);
    }
  }, [user]);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-500">Loading...</div></div>;
  if (!user) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const diffDays = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "today";
    if (diffDays === 1) return "yesterday";
    return `${diffDays} days ago`;
  };

  const jobStatusLabels: Record<string, { label: string; color: string }> = {
    actively_looking: { label: "Actively looking", color: "bg-green-100 text-green-700" },
    open_to_offers: { label: "Open to offers", color: "bg-blue-100 text-blue-700" },
    not_looking: { label: "Not looking", color: "bg-gray-100 text-gray-700" },
  };

  // İŞƏGÖTÜRƏN (EMPLOYER) PROFİLİ
  if (user.role === "employer") {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Company Profile</h1>
            <Link
              href="/profile/edit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Profile
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-gray-300 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-xl bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden">
                  {(user as any).companyLogo ? (
                    <img src={(user as any).companyLogo} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-4xl">🏢</span>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{user.companyName || user.name}</h2>
                  <p className="text-gray-500 mt-1">{user.email}</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Industry</label>
                  <p className="text-gray-900">{(user as any).companyIndustry || "Not specified"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Company Size</label>
                  <p className="text-gray-900">{(user as any).companySize || "Not specified"} employees</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Location</label>
                  <p className="text-gray-900">{(user as any).companyLocation || "Not specified"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Contact Person</label>
                  <p className="text-gray-900">{user.name}</p>
                </div>
                {(user as any).companyWebsite && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Website</label>
                    <a href={(user as any).companyWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {(user as any).companyWebsite}
                    </a>
                  </div>
                )}
                {(user as any).companyLinkedIn && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">LinkedIn</label>
                    <a href={(user as any).companyLinkedIn} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      LinkedIn Page
                    </a>
                  </div>
                )}
              </div>
              {(user as any).companyDescription && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">About the Company</label>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-700 whitespace-pre-wrap">{(user as any).companyDescription}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // İŞ AXATARAN (JOB SEEKER) PROFİLİ
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <Link
            href="/profile/edit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit Profile
          </Link>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-xl border border-gray-400 overflow-hidden mb-6">
          <div className="p-6 bg-white">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-300">
                {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-4xl">👤</span>}
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Job Seeker</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${jobStatusLabels[jobStatus]?.color || "bg-gray-100 text-gray-700"}`}>
                    {jobStatusLabels[jobStatus]?.label || "Open to offers"}
                  </span>
                </div>
                <p className="text-gray-500 mt-1">{user.email}</p>
                {location && <p className="text-gray-500 text-sm mt-1">📍 {location}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button onClick={() => router.push("/applications")} className="bg-white rounded-xl border border-gray-400 p-4 text-center hover:shadow-md transition cursor-pointer">
            <div className="text-2xl font-bold text-blue-600">{applicationCount}</div>
            <div className="text-sm text-gray-600">Applications sent</div>
          </button>
          <button onClick={() => router.push("/saved-jobs")} className="bg-white rounded-xl border border-gray-400 p-4 text-center hover:shadow-md transition cursor-pointer">
            <div className="text-2xl font-bold text-blue-600">{savedJobsCount}</div>
            <div className="text-sm text-gray-600">Saved jobs</div>
          </button>
        </div>

        {/* Personal Info */}
        <div className="bg-white rounded-xl border border-gray-400 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900">Personal Info</h3>
          </div>
          <div className="p-6 space-y-4">
            <div><label className="block text-sm font-medium text-gray-500">Full Name</label><p className="text-gray-900">{user.name}</p></div>
            <div><label className="block text-sm font-medium text-gray-500">Email Address</label><p className="text-gray-900">{user.email}</p></div>
            <div><label className="block text-sm font-medium text-gray-500">Location</label><p className="text-gray-900">{location || "Not specified"}</p></div>
            <div><label className="block text-sm font-medium text-gray-500">Job seeking status</label><p className="text-gray-900">{jobStatusLabels[jobStatus]?.label || "Open to offers"}</p></div>
            <div><label className="block text-sm font-medium text-gray-500">Bio</label><p className="text-gray-700">{bio || "No bio added yet."}</p></div>
          </div>
        </div>

        {/* Links */}
        <div className="bg-white rounded-xl border border-gray-400 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900">Links</h3>
          </div>
          <div className="p-6 space-y-3">
            {linkedin && <div><label className="block text-sm font-medium text-gray-500">LinkedIn</label><a href={linkedin} target="_blank" className="text-blue-600 hover:underline break-all">{linkedin}</a></div>}
            {github && <div><label className="block text-sm font-medium text-gray-500">GitHub</label><a href={github} target="_blank" className="text-blue-600 hover:underline break-all">{github}</a></div>}
            {portfolio && <div><label className="block text-sm font-medium text-gray-500">Portfolio</label><a href={portfolio} target="_blank" className="text-blue-600 hover:underline break-all">{portfolio}</a></div>}
            {!linkedin && !github && !portfolio && <p className="text-gray-400">No links added yet.</p>}
          </div>
        </div>

        {/* Resume */}
        <div className="bg-white rounded-xl border border-gray-400 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900">Resume</h3>
          </div>
          <div className="p-6">
            {cvFile ? (
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📄</span>
                  <div>
                    <p className="font-medium text-gray-900">{cvFile.name}</p>
                    <p className="text-xs text-gray-400">Uploaded {formatDate(cvFile.uploadedAt)}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const savedCv = localStorage.getItem(`cv_${user.email}`);
                    if (savedCv) {
                      try {
                        const parsed = JSON.parse(savedCv);
                        const byteCharacters = atob(parsed.data.split(',')[1]);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
                        const blob = new Blob([new Uint8Array(byteNumbers)], { type: "application/pdf" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = parsed.name;
                        a.click();
                        URL.revokeObjectURL(url);
                      } catch { alert("Download not available"); }
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg cursor-pointer"
                >
                  Download CV
                </button>
              </div>
            ) : (
              <p className="text-gray-400">No CV uploaded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}