// app/post-job/page.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import StripePayment from "@/components/StripePayment";

export default function PostJobPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState<"form" | "payment">("form");
  const [jobData, setJobData] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full-time",
    salaryMin: "3000",
    salaryMax: "5000",
    description: "",
    requirements: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Please Sign In</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">You need to be logged in to post a job.</p>
          <button
            onClick={() => router.push("/")}
            className="inline-block mt-4 text-blue-600 hover:underline"
          >
            ← Back to home
          </button>
        </div>
      </div>
    );
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
  };

  const handlePaymentSuccess = () => {
    setIsSubmitting(true);
    
    // Save job to localStorage
    const jobs = JSON.parse(localStorage.getItem("posted_jobs") || "[]");
    const newJob = {
      id: Date.now(),
      ...jobData,
      salaryMin: parseInt(jobData.salaryMin),
      salaryMax: parseInt(jobData.salaryMax),
      requirements: jobData.requirements.split(",").map(r => r.trim()),
      companyLogo: "🏢",
      postedAt: new Date().toISOString(),
      featured: false,
      postedBy: user.email,
    };
    jobs.push(newJob);
    localStorage.setItem("posted_jobs", JSON.stringify(jobs));
    // Check and trigger job alerts for new job
const checkJobAlerts = (newJob: any) => {
  const alerts = JSON.parse(localStorage.getItem("jobAlerts") || "[]");
  const matchedAlerts: any[] = [];
  
  alerts.forEach((alert: any) => {
    const filters = alert.filters;
    
    // Check if job matches alert filters
    const matchesSearch = filters.searchTerm === "" ||
      newJob.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      newJob.company.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    const matchesType = filters.selectedTypes.length === 0 || filters.selectedTypes.includes(newJob.type);
    
    const avgSalary = (newJob.salaryMin + newJob.salaryMax) / 2;
    const matchesSalary = avgSalary >= filters.salaryRange[0] && avgSalary <= filters.salaryRange[1];
    
    const matchesLocation = filters.selectedLocation === "all" || newJob.location.includes(filters.selectedLocation);
    
    let matchesExperience = true;
    if (filters.experienceLevel === "entry") matchesExperience = newJob.salaryMax < 4000;
    else if (filters.experienceLevel === "mid") matchesExperience = newJob.salaryMax >= 4000 && newJob.salaryMax < 8000;
    else if (filters.experienceLevel === "senior") matchesExperience = newJob.salaryMax >= 8000;
    
    if (matchesSearch && matchesType && matchesSalary && matchesLocation && matchesExperience) {
      matchedAlerts.push(alert);
    }
  });
  
  // Simulate email sending (console log)
  if (matchedAlerts.length > 0) {
    console.log(`📧 JOB ALERT: New job "${newJob.title}" matches ${matchedAlerts.length} alert(s):`);
    matchedAlerts.forEach((alert) => {
      console.log(`   → Would send email to: ${alert.email}`);
    });
  } else {
    console.log("📧 No matching job alerts found.");
  }
};

// Call this function after saving the job
checkJobAlerts(newJob);
    
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/?job_posted=success");
    }, 1000);
  };

  const jobTypes = ["Full-time", "Part-time", "Contract", "Remote", "Internship"];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Post a Remote Job
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {step === "form" ? "Fill in the job details" : "Complete payment to publish your job"}
            </p>
          </div>

          {step === "form" ? (
            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={jobData.title}
                  onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={jobData.company}
                  onChange={(e) => setJobData({ ...jobData, company: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={jobData.location}
                    onChange={(e) => setJobData({ ...jobData, location: e.target.value })}
                    placeholder="e.g., Global / Remote, Europe, etc."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Job Type *
                  </label>
                  <select
                    value={jobData.type}
                    onChange={(e) => setJobData({ ...jobData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {jobTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Min Salary (USD/month) *
                  </label>
                  <input
                    type="number"
                    value={jobData.salaryMin}
                    onChange={(e) => setJobData({ ...jobData, salaryMin: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Salary (USD/month) *
                  </label>
                  <input
                    type="number"
                    value={jobData.salaryMax}
                    onChange={(e) => setJobData({ ...jobData, salaryMax: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Job Description *
                </label>
                <textarea
                  value={jobData.description}
                  onChange={(e) => setJobData({ ...jobData, description: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Describe the role, responsibilities, benefits..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Requirements (comma separated) *
                </label>
                <input
                  type="text"
                  value={jobData.requirements}
                  onChange={(e) => setJobData({ ...jobData, requirements: e.target.value })}
                  placeholder="e.g., React, TypeScript, 3+ years experience"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Separate each requirement with a comma</p>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Continue to Payment → ($19)
              </button>
            </form>
          ) : (
            <div className="p-6">
              <StripePayment
                amount={19}
                onSuccess={handlePaymentSuccess}
                onCancel={() => setStep("form")}
              />
            </div>
          )}

          {isSubmitting && (
            <div className="p-6 text-center">
              <div className="animate-pulse">
                <p className="text-green-600 dark:text-green-400 font-medium">
                  ✅ Payment successful! Publishing your job...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}