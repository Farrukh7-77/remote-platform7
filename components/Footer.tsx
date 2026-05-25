// components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Remote<span className="text-blue-600">Jobs</span>
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Find the best remote jobs from companies around the world.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition">Home</Link></li>
              <li><Link href="/companies" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition">Companies</Link></li>
              <li><Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition">About</Link></li>
              <li><Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">For Employers</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/post-job" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition">Post a Job</Link></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition">Pricing</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition">Hire Talent</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} RemoteJobs. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}