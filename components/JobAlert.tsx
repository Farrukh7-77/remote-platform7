// components/JobAlert.tsx
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

  // Check if already subscribed to similar alert
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
    
    // Check if already exists
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
      setMessage("✅ Job Alert created! You'll receive email notifications for matching jobs.");
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
      <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
            <span>🔔</span> You'll receive email alerts for this search
          </div>
          <button
            onClick={handleUnsubscribe}
            className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
          >
            Unsubscribe
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
        >
          <span>🔔</span> Get email alerts for this search
        </button>
      ) : (
        <form onSubmit={handleSubscribe} className="space-y-3">
          {message && (
            <div className="text-sm text-green-600 dark:text-green-400">{message}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
              >
                Subscribe
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            We'll email you when new jobs match your filters. You can unsubscribe anytime.
          </p>
        </form>
      )}
    </div>
  );
}