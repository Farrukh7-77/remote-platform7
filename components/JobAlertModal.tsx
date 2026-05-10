// components/JobAlertModal.tsx
"use client";

import { useState, useEffect } from "react";

interface JobAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    searchTerm: string;
    selectedTypes: string[];
    salaryRange: [number, number];
    selectedLocation: string;
    experienceLevel: string;
  };
}

export default function JobAlertModal({ isOpen, onClose, filters }: JobAlertModalProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const alerts = JSON.parse(localStorage.getItem("jobAlerts") || "[]");
    const filterKey = JSON.stringify(filters);
    const existing = alerts.find((alert: any) => alert.filterKey === filterKey);
    setIsSubscribed(!!existing);
    if (existing) setEmail(existing.email);
  }, [isOpen, filters]);

  if (!isOpen) return null;

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
    
    setTimeout(() => {
      setMessage("");
      onClose();
    }, 1500);
  };

  const handleUnsubscribe = () => {
    const alerts = JSON.parse(localStorage.getItem("jobAlerts") || "[]");
    const filterKey = JSON.stringify(filters);
    const filtered = alerts.filter((alert: any) => alert.filterKey !== filterKey);
    localStorage.setItem("jobAlerts", JSON.stringify(filtered));
    setIsSubscribed(false);
    setEmail("");
    setMessage("❌ Alert removed");
    setTimeout(() => {
      setMessage("");
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          🔔 Job Alerts
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          Get email notifications when new jobs match your filters.
        </p>

        {message && (
          <div className={`mb-4 text-sm text-center ${message.includes("✅") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {message}
          </div>
        )}

        {isSubscribed ? (
          <div className="text-center">
            <p className="text-green-600 dark:text-green-400 mb-4">
              ✅ You're subscribed to job alerts for this search.
            </p>
            <button
              onClick={handleUnsubscribe}
              className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 cursor-pointer"
            >
              Unsubscribe
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubscribe}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors cursor-pointer"
              >
                Subscribe
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}