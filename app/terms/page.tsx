// app/terms/page.tsx
"use client";

import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <p className="text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
              <p>By accessing or using RemoteJobs, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. User Accounts</h2>
              <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to accept responsibility for all activities that occur under your account.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Job Seekers</h2>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>You may apply to jobs and save job listings</li>
                <li>You agree to provide accurate information in your applications</li>
                <li>You may not submit fraudulent or misleading applications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Employers</h2>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>You may post job listings and manage applications</li>
                <li>You agree to post accurate and lawful job descriptions</li>
                <li>You may not post duplicate or misleading job listings</li>
                <li>You are responsible for responding to applications in a timely manner</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Prohibited Conduct</h2>
              <p>You may not:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Post illegal, fraudulent, or offensive content</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use automated bots or scraping tools</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Content Ownership</h2>
              <p>You retain ownership of content you post. By posting, you grant us a license to display and distribute that content on our platform.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Termination</h2>
              <p>We reserve the right to suspend or terminate accounts that violate these terms or for any other reason at our discretion.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Limitation of Liability</h2>
              <p>RemoteJobs is not responsible for the accuracy of job listings or the outcome of job applications. We are not an employer and do not guarantee employment.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Changes to Terms</h2>
              <p>We may update these terms from time to time. Continued use of the platform constitutes acceptance of updated terms.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Contact</h2>
              <p>For questions about these Terms, contact us at: <a href="mailto:legal@remotejobs.com" className="text-blue-600 hover:underline">legal@remotejobs.com</a></p>
            </section>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link href="/" className="text-blue-600 hover:underline">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}