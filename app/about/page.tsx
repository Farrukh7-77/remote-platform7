// app/about/page.tsx
"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            About RemoteJobs
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Connecting talent with opportunities worldwide
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Our Mission
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            At RemoteJobs, we believe that great talent knows no borders. 
            Our mission is to connect skilled professionals with forward-thinking 
            companies that embrace remote work. We're building a world where 
            anyone can find meaningful work, regardless of their location.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">2,400+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Jobs Posted</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">180+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Countries</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">850+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Companies</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">10K+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Job Seekers</div>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl mb-2">🌍</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Global Access</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Jobs from anywhere, for anyone</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🤝</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Trust & Transparency</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Verified companies, honest listings</p>
            </div>
            <div>
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Easy to Use</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Simple application process</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to find your dream job?</h2>
          <p className="text-blue-100 mb-6">Join thousands of professionals working remotely</p>
          <Link
            href="/"
            className="inline-block bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Browse Jobs →
          </Link>
        </div>
      </div>
    </div>
  );
}