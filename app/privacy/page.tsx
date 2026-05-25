// app/privacy/page.tsx
"use client";

import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
              <p>We collect information you provide directly to us, such as when you create an account, apply for jobs, or post job listings. This may include:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Name and contact information (email, phone number)</li>
                <li>Professional information (resume, cover letter, work history)</li>
                <li>Account credentials</li>
                <li>Company information (for employers)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Facilitate job applications and job postings</li>
                <li>Communicate with you about applications and job alerts</li>
                <li>Improve our services and user experience</li>
                <li>Send you relevant job recommendations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Information Sharing</h2>
              <p>We share your information only in these circumstances:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>With employers when you apply for their jobs</li>
                <li>With service providers who assist our operations</li>
                <li>When required by law or to protect legal rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data Security</h2>
              <p>We implement reasonable security measures to protect your personal information. However, no internet transmission is 100% secure.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Your Rights</h2>
              <p>You may access, update, or delete your account information at any time through your profile settings.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Contact Us</h2>
              <p>If you have questions about this Privacy Policy, please contact us at: <a href="mailto:privacy@remotejobs.com" className="text-blue-600 hover:underline">privacy@remotejobs.com</a></p>
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