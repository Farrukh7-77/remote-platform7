// app/about/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AboutPage() {
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setPageLoaded(true), 100);
  }, []);

  return (
    <div className={`min-h-screen bg-[#050816] transition-opacity duration-700 ${pageLoaded ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 px-4">
        <div className="hero-gradient absolute inset-0 pointer-events-none"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3">
            <span className="text-white">About</span>{' '}
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">RemoteJobs</span>
          </h1>
          <p className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto">
            Connecting talent with opportunities worldwide
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Mission Section */}
        <div className="glass-card p-6 md:p-8 mb-8 animate-card" style={{ animationDelay: "100ms" }}>
          <h2 className="text-2xl font-semibold text-white mb-4">Our Mission</h2>
          <p className="text-gray-300 leading-relaxed">
            At RemoteJobs, we believe that great talent knows no borders. 
            Our mission is to connect skilled professionals with forward-thinking 
            companies that embrace remote work. We're building a world where 
            anyone can find meaningful work, regardless of their location.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-4 md:p-6 text-center transition-all duration-300 hover:-translate-y-1 animate-card" style={{ animationDelay: "150ms" }}>
            <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">2,400+</div>
            <div className="text-xs md:text-sm text-gray-400 mt-1">Jobs Posted</div>
          </div>
          <div className="glass-card p-4 md:p-6 text-center transition-all duration-300 hover:-translate-y-1 animate-card" style={{ animationDelay: "200ms" }}>
            <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">180+</div>
            <div className="text-xs md:text-sm text-gray-400 mt-1">Countries</div>
          </div>
          <div className="glass-card p-4 md:p-6 text-center transition-all duration-300 hover:-translate-y-1 animate-card" style={{ animationDelay: "250ms" }}>
            <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">850+</div>
            <div className="text-xs md:text-sm text-gray-400 mt-1">Companies</div>
          </div>
          <div className="glass-card p-4 md:p-6 text-center transition-all duration-300 hover:-translate-y-1 animate-card" style={{ animationDelay: "300ms" }}>
            <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">10K+</div>
            <div className="text-xs md:text-sm text-gray-400 mt-1">Job Seekers</div>
          </div>
        </div>

        {/* Values Section */}
        <div className="glass-card p-6 md:p-8 mb-8 animate-card" style={{ animationDelay: "350ms" }}>
          <h2 className="text-2xl font-semibold text-white mb-6">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-2">🌍</div>
              <h3 className="text-lg font-medium text-white mb-2">Global Access</h3>
              <p className="text-sm text-gray-400">Jobs from anywhere, for anyone</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🤝</div>
              <h3 className="text-lg font-medium text-white mb-2">Trust & Transparency</h3>
              <p className="text-sm text-gray-400">Verified companies, honest listings</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">⚡</div>
              <h3 className="text-lg font-medium text-white mb-2">Easy to Use</h3>
              <p className="text-sm text-gray-400">Simple application process</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 md:p-8 text-center animate-card" style={{ animationDelay: "400ms" }}>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-3">Ready to find your dream job?</h2>
          <p className="text-blue-100 text-sm md:text-base mb-5">Join thousands of professionals working remotely</p>
          <Link 
            href="/" 
            className="inline-block bg-white text-blue-600 font-semibold px-5 md:px-6 py-2.5 rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 cursor-pointer text-sm md:text-base"
          >
            Browse Jobs →
          </Link>
        </div>

      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-card {
          opacity: 0;
          animation: fadeInUp 0.4s ease-out forwards;
        }
        
        .glass-card {
          background-color: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 1rem;
        }
        
        .hero-gradient {
          background: radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.15), transparent 70%);
        }
      `}</style>
    </div>
  );
}