// app/profile/edit/page.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import FileInput from "@/components/FileInput";

export default function EditProfilePage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Basic info
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvName, setCvName] = useState("");

  // Job Seeker specific
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [jobStatus, setJobStatus] = useState("actively_looking");

  // Employer specific
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [companyLocation, setCompanyLocation] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [companyIndustry, setCompanyIndustry] = useState("");
  const [companyLinkedIn, setCompanyLinkedIn] = useState("");
  const [companyLogo, setCompanyLogo] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }

    // Load basic info
    setName(user.name || "");
    setEmail(user.email || "");
    setAvatar(user.avatar || "");

    if (user.role === "job_seeker") {
      // Load Job Seeker data
      setLocation(localStorage.getItem(`profile_location_${user.email}`) || "");
      setBio(localStorage.getItem(`profile_bio_${user.email}`) || "");
      setLinkedin(localStorage.getItem(`profile_linkedin_${user.email}`) || "");
      setGithub(localStorage.getItem(`profile_github_${user.email}`) || "");
      setPortfolio(localStorage.getItem(`profile_portfolio_${user.email}`) || "");
      setJobStatus(localStorage.getItem(`profile_jobstatus_${user.email}`) || "actively_looking");
      
      const savedCv = localStorage.getItem(`cv_${user.email}`);
      if (savedCv) {
        try { setCvName(JSON.parse(savedCv).name); } catch { setCvName(savedCv); }
      }
    } else {
      // Load Employer data
      setCompanyName(user.company_name || "");
      setCompanyWebsite((user as any).company_website || "");
      setCompanyDescription((user as any).company_description || "");
      setCompanyLocation((user as any).company_location || "");
      setCompanySize((user as any).company_size || "");
      setCompanyIndustry((user as any).company_industry || "");
      setCompanyLinkedIn((user as any).company_linkedin || "");
      setCompanyLogo((user as any).company_logo || "");
    }
  }, [user, router]);

  if (!user) return null;

  const resizeImage = (file: File, maxSize: number): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ratio = Math.min(maxSize / img.width, maxSize / img.height);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setMessage("❌ Image must be under 2MB");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    const resized = await resizeImage(file, 200);
    setAvatar(resized);
  };

  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setCvFile(file); setCvName(file.name); }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      if (user.role === "employer") {
        await updateUser({
          name,
          avatar: companyLogo,
          company_name: companyName,
          company_website: companyWebsite,
          company_logo: companyLogo,
          company_description: companyDescription,
          company_location: companyLocation,
          company_size: companySize,
          company_industry: companyIndustry,
          company_linkedin: companyLinkedIn,
        } as any);
      } else {
        await updateUser({ name, avatar });
        
        // Save Job Seeker specific data
        localStorage.setItem(`profile_location_${user.email}`, location);
        localStorage.setItem(`profile_bio_${user.email}`, bio);
        localStorage.setItem(`profile_linkedin_${user.email}`, linkedin);
        localStorage.setItem(`profile_github_${user.email}`, github);
        localStorage.setItem(`profile_portfolio_${user.email}`, portfolio);
        localStorage.setItem(`profile_jobstatus_${user.email}`, jobStatus);
        
        if (cvFile) {
          await new Promise<void>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              localStorage.setItem(`cv_${user.email}`, JSON.stringify({
                name: cvFile.name,
                data: reader.result,
                uploadedAt: new Date().toISOString()
              }));
              resolve();
            };
            reader.readAsDataURL(cvFile);
          });
        }
      }
      setMessage("✅ Profile updated successfully!");
      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    } catch {
      setMessage("❌ Something went wrong. Please try again.");
      setTimeout(() => setMessage(""), 4000);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
          <button
            onClick={() => router.push("/profile")}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            Cancel
          </button>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${message.startsWith("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {message}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {user.role === "employer" ? (
            <>
              {/* Company Logo */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Company Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                    {companyLogo ? (
                      <img src={companyLogo} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-3xl">🏢</span>
                    )}
                  </div>
                  <FileInput accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setCompanyLogo(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }} fileName={companyLogo ? "Logo uploaded ✓" : ""} label="Choose Logo" />
                </div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label><input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Contact Person Name *</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">About the Company</label><textarea value={companyDescription} onChange={(e) => setCompanyDescription(e.target.value)} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Website</label><input type="url" value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} placeholder="https://yourcompany.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Page</label><input type="url" value={companyLinkedIn} onChange={(e) => setCompanyLinkedIn(e.target.value)} placeholder="https://linkedin.com/company/yourcompany" className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Location</label><input type="text" value={companyLocation} onChange={(e) => setCompanyLocation(e.target.value)} placeholder="e.g. New York, USA" className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label><select value={companySize} onChange={(e) => setCompanySize(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg"><option value="">Select size</option><option value="1-10">1–10 employees</option><option value="11-50">11–50 employees</option><option value="51-200">51–200 employees</option><option value="201-500">201–500 employees</option><option value="500+">500+ employees</option></select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Industry</label><select value={companyIndustry} onChange={(e) => setCompanyIndustry(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg"><option value="">Select industry</option><option value="Technology">Technology</option><option value="Finance">Finance</option><option value="Marketing">Marketing</option><option value="Healthcare">Healthcare</option><option value="Education">Education</option><option value="E-commerce">E-commerce</option><option value="Design">Design</option><option value="Other">Other</option></select></div>
            </>
          ) : (
            <>
              {/* Avatar */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {avatar ? <img src={avatar} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-3xl">👤</span>}
                  </div>
                  <FileInput accept="image/*" onChange={handleAvatarUpload} fileName={avatar ? "Photo uploaded ✓" : ""} label="Choose Photo" />
                </div>
              </div>

              {/* Basic Info */}
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label><input type="email" value={email} disabled className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" /></div>

              {/* Location */}
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Location (City, Country)</label><input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Istanbul, Turkey" className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>

              {/* Bio */}
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Bio / About You</label><textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Tell employers about yourself..." className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>

              {/* Job Status */}
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Job Seeking Status</label><select value={jobStatus} onChange={(e) => setJobStatus(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg"><option value="actively_looking">Actively looking</option><option value="open_to_offers">Open to offers</option><option value="not_looking">Not looking</option></select></div>

              {/* Links */}
              <div><label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label><input type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/yourprofile" className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label><input type="url" value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/yourusername" className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Portfolio / Personal Website</label><input type="url" value={portfolio} onChange={(e) => setPortfolio(e.target.value)} placeholder="https://yourportfolio.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>

              {/* CV */}
              <div><label className="block text-sm font-medium text-gray-700 mb-1">CV / Resume</label><FileInput accept=".pdf,.doc,.docx" onChange={handleCvUpload} fileName={cvName} label="Choose CV" /></div>
            </>
          )}

          <button onClick={handleSave} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 cursor-pointer">
            {isLoading ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}