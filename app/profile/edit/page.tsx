// app/profile/edit/page.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function EditProfilePage() {
  const { user, loading, updateUser } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [jobStatus, setJobStatus] = useState("actively_looking");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvFileName, setCvFileName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Employer fields
  const [companyName, setCompanyName] = useState("");
  const [companyIndustry, setCompanyIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [companyLocation, setCompanyLocation] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyLinkedin, setCompanyLinkedin] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setLocation(localStorage.getItem(`profile_location_${user.email}`) || "");
      setBio(localStorage.getItem(`profile_bio_${user.email}`) || "");
      setLinkedin(localStorage.getItem(`profile_linkedin_${user.email}`) || "");
      setGithub(localStorage.getItem(`profile_github_${user.email}`) || "");
      setPortfolio(localStorage.getItem(`profile_portfolio_${user.email}`) || "");
      setJobStatus(localStorage.getItem(`profile_jobstatus_${user.email}`) || "actively_looking");
      
      setCompanyName(user.company_name || "");
      setCompanyIndustry((user as any).company_industry || "");
      setCompanySize((user as any).company_size || "");
      setCompanyLocation((user as any).company_location || "");
      setCompanyWebsite((user as any).company_website || "");
      setCompanyLinkedin((user as any).company_linkedin || "");
      setCompanyDescription((user as any).company_description || "");
      
      const avatar = (user as any).company_logo || user.avatar;
      if (avatar) {
        setAvatarPreview(avatar);
      }
    }
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    const reader2 = new FileReader();
    reader2.onloadend = async () => {
      const base64String = reader2.result as string;
      
      // Update both avatar and company_logo for employer
      if (user?.role === "employer") {
        await updateUser({ 
          avatar: base64String,
          company_logo: base64String 
        });
      } else {
        await updateUser({ avatar: base64String });
      }
      
      // Force update localStorage
      const storedUser = localStorage.getItem("auth_user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userData.avatar = base64String;
        if (user?.role === "employer") {
          userData.company_logo = base64String;
        }
        localStorage.setItem("auth_user", JSON.stringify(userData));
      }
    };
    reader2.readAsDataURL(file);
  };

  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCvFile(file);
      setCvFileName(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (user) {
      localStorage.setItem(`profile_location_${user.email}`, location);
      localStorage.setItem(`profile_bio_${user.email}`, bio);
      localStorage.setItem(`profile_linkedin_${user.email}`, linkedin);
      localStorage.setItem(`profile_github_${user.email}`, github);
      localStorage.setItem(`profile_portfolio_${user.email}`, portfolio);
      localStorage.setItem(`profile_jobstatus_${user.email}`, jobStatus);
    }

    if (user?.role === "employer") {
      await updateUser({
        name,
        company_name: companyName,
        company_industry: companyIndustry,
        company_size: companySize,
        company_location: companyLocation,
        company_website: companyWebsite,
        company_linkedin: companyLinkedin,
        company_description: companyDescription,
      });
    } else {
      await updateUser({ name });
    }

    if (cvFile && user) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const cvData = {
          name: cvFileName,
          data: base64String,
          uploadedAt: new Date().toISOString(),
        };
        localStorage.setItem(`cv_${user.email}`, JSON.stringify(cvData));
      };
      reader.readAsDataURL(cvFile);
    }

    setSaving(false);
    router.push("/profile");
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  if (!user) return null;

  if (user.role === "employer") {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-xl border border-gray-300 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Edit Company Profile</h1>
              <Link href="/profile" className="text-gray-500 hover:text-gray-700 text-sm">← Back</Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-3xl">🏢</span>
                    )}
                  </div>
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition">
                    Upload Logo
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <input type="text" value={companyIndustry} onChange={(e) => setCompanyIndustry(e.target.value)} placeholder="e.g., Technology, Healthcare" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                  <select value={companySize} onChange={(e) => setCompanySize(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    <option value="">Select size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501+">501+ employees</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input type="text" value={companyLocation} onChange={(e) => setCompanyLocation(e.target.value)} placeholder="e.g., New York, Remote" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input type="url" value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} placeholder="https://..." className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                  <input type="url" value={companyLinkedin} onChange={(e) => setCompanyLinkedin(e.target.value)} placeholder="https://linkedin.com/company/..." className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">About the Company</label>
                <textarea rows={5} value={companyDescription} onChange={(e) => setCompanyDescription(e.target.value)} placeholder="Tell candidates about your company..." className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 cursor-pointer">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <Link href="/profile" className="flex-1 text-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition">
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl border border-gray-300 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
            <Link href="/profile" className="text-gray-500 hover:text-gray-700 text-sm">← Back</Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">👤</span>
                  )}
                </div>
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition">
                  Upload Photo
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., New York, Remote" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell employers about yourself..." className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Seeking Status</label>
              <select value={jobStatus} onChange={(e) => setJobStatus(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option value="actively_looking">Actively looking</option>
                <option value="open_to_offers">Open to offers</option>
                <option value="not_looking">Not looking</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                <input type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                <input type="url" value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/..." className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio</label>
              <input type="url" value={portfolio} onChange={(e) => setPortfolio(e.target.value)} placeholder="https://yourportfolio.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resume/CV</label>
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleCvUpload} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              {cvFileName && <p className="text-xs text-green-600 mt-1">Selected: {cvFileName}</p>}
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 cursor-pointer">
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <Link href="/profile" className="flex-1 text-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}