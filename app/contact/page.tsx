// app/contact/page.tsx
"use client";

import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Validation
    if (!formData.name || !formData.email || !formData.message) {
      setError("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      setIsSubmitting(false);
      return;
    }

    // Save to localStorage (mock submission)
    setTimeout(() => {
      const messages = JSON.parse(localStorage.getItem("contact_messages") || "[]");
      messages.push({
        ...formData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem("contact_messages", JSON.stringify(messages));
      
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <div className="max-w-5xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Contact Us
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Have questions? We'd love to hear from you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Contact Info */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Get in Touch
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl">📧</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Email</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">hello@remotejobs.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="text-xl">💬</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Response Time</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Within 24-48 hours</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="text-xl">🌍</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Remote Team</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">We're fully remote</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">For Employers</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Interested in posting jobs? Contact us at <br />
                  <span className="text-blue-600">employers@remotejobs.com</span>
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Send us a Message
              </h3>

              {submitted && (
                <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm">
                  ✅ Message sent successfully! We'll get back to you soon.
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
                  ❌ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Select a subject</option>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Job Posting">Job Posting</option>
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="How can we help you?"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}