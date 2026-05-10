// components/JobAlert.tsx - with Cancel button
"use client";

import { useState, useEffect } from "react";

interface JobAlertProps {
  filters: {
    searchTerm: string;
    selectedTypes: string[];
    salaryRange: [number, number];
    selectedLocation: string;
    experienceLevel: string;
  };
}

export default function JobAlert({ filters }: JobAlertProps) {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const alerts = JSON.parse(localStorage.getItem("jobAlerts") || "[]");
    const filterKey = JSON.stringify(filters);
    const existing = alerts.find((alert: any) => alert.filterKey === filterKey);
    if (existing) {
      setIsSubscribed(true);
    }
  }, [filters]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setMessage("Please enter a valid email address");
      return;
    }

    const alerts = JSON.parse(localStorage.getItem("jobAlerts") || "[]");
    const filterKey = JSON.stringify(filters);
    
    const existingIndex = alerts.findIndex((alert: any) => alert.filterKey === filterKey);
    if (existingIndex !== -1) {
      alerts[existingIndex] = {
        id: Date.now(),
        email,
        filterKey,
        filters,
        createdAt: new Date().toISOString(),
      };
      setMessage("✅ Alert updated!");
    } else {
      alerts.push({
        id: Date.now(),
        email,
        filterKey,
        filters,
        createdAt: new Date().toISOString(),
      });
      setMessage("✅ Job Alert created! You'll receive email notifications.");
    }
    
    localStorage.setItem("jobAlerts", JSON.stringify(alerts));
    setIsSubscribed(true);
    setShowForm(false);
    setEmail("");
    
    setTimeout(() => setMessage(""), 3000);
  };

  const handleUnsubscribe = () => {
    const alerts = JSON.parse(localStorage.getItem("jobAlerts") || "[]");
    const filterKey = JSON.stringify(filters);
    const filtered = alerts.filter((alert: any) => alert.filterKey !== filterKey);
    localStorage.setItem("jobAlerts", JSON.stringify(filtered));
    setIsSubscribed(false);
    setMessage("❌ Alert removed");
    setTimeout(() => setMessage(""), 3000);
  };

  if (isSubscribed) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-green-600 dark:text-green-400">🔔 Active</span>
        <button
          onClick={handleUnsubscribe}
          className="text-xs text-red-500 hover:text-red-600"
        >
          Turn off
        </button>
      </div>
    );
  }

  return (
    <div>
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          <span>🔔</span> Job Alerts
        </button>
      ) : (
        <form onSubmit={handleSubscribe} className="space-y-2">
          {message && <div className="text-xs text-green-600">{message}</div>}
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              required
            />
            <button
              type="submit"
              className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1 text-sm bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}