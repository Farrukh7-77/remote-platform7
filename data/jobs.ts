// data/jobs.ts
export type Job = {
  id: number;
  title: string;
  company: string;
  companyLogo: string;
  companyLogoBgColor: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Remote" | "Internship";
  salaryMin: number;
  salaryMax: number;
  description: string;
  requirements: string[];
  postedAt: string;
  featured: boolean;
  applyType: "internal" | "external"; // NEW
  applyUrl?: string; // NEW - only for external
};

export const jobs: Job[] = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "TechCorp",
    companyLogo: "TC",
    companyLogoBgColor: "bg-blue-100 text-blue-700",
    location: "Europe / Remote",
    type: "Remote",
    salaryMin: 6000,
    salaryMax: 9000,
    description: "Join our remote team to build cutting-edge web applications using React, Next.js, and TypeScript.",
    requirements: ["5+ years React experience", "TypeScript", "Next.js", "Tailwind CSS"],
    postedAt: "2026-05-04",
    featured: true,
    applyType: "internal", // Apply on our platform
  },
  {
    id: 2,
    title: "Backend Engineer",
    company: "DataFlow",
    companyLogo: "DF",
    companyLogoBgColor: "bg-purple-100 text-purple-700",
    location: "Global / Remote",
    type: "Full-time",
    salaryMin: 7000,
    salaryMax: 11000,
    description: "Looking for a backend expert to build scalable APIs and microservices.",
    requirements: ["Node.js", "Python", "PostgreSQL", "AWS"],
    postedAt: "2026-05-03",
    featured: true,
    applyType: "external",
    applyUrl: "https://dataflow.com/careers/backend-engineer",
  },
  {
    id: 3,
    title: "Product Designer",
    company: "CreativeStudio",
    companyLogo: "CS",
    companyLogoBgColor: "bg-pink-100 text-pink-700",
    location: "Americas / Remote",
    type: "Contract",
    salaryMin: 5000,
    salaryMax: 7500,
    description: "Seeking a product designer with UI/UX expertise for our SaaS platform.",
    requirements: ["Figma", "User research", "Prototyping", "Design systems"],
    postedAt: "2026-05-05",
    featured: false,
    applyType: "internal",
  },
  {
    id: 4,
    title: "DevOps Engineer",
    company: "CloudScale",
    companyLogo: "CL",
    companyLogoBgColor: "bg-cyan-100 text-cyan-700",
    location: "EMEA / Remote",
    type: "Remote",
    salaryMin: 8000,
    salaryMax: 12000,
    description: "Help us build and maintain our cloud infrastructure.",
    requirements: ["AWS", "Kubernetes", "Terraform", "CI/CD"],
    postedAt: "2026-05-02",
    featured: true,
    applyType: "external",
    applyUrl: "https://cloudscale.com/jobs/devops",
  },
  {
    id: 5,
    title: "Customer Success Manager",
    company: "SupportHub",
    companyLogo: "SH",
    companyLogoBgColor: "bg-green-100 text-green-700",
    location: "Global / Remote",
    type: "Full-time",
    salaryMin: 3500,
    salaryMax: 5000,
    description: "Manage enterprise client relationships and ensure satisfaction.",
    requirements: ["3+ years CS experience", "English fluent", "CRM tools"],
    postedAt: "2026-05-01",
    featured: false,
    applyType: "internal",
  },
  {
    id: 6,
    title: "Technical Writer",
    company: "DocuWrite",
    companyLogo: "DW",
    companyLogoBgColor: "bg-orange-100 text-orange-700",
    location: "Asia / Remote",
    type: "Part-time",
    salaryMin: 2000,
    salaryMax: 3000,
    description: "Create documentation for developer tools and APIs.",
    requirements: ["Technical writing", "Markdown", "Git", "English"],
    postedAt: "2026-04-30",
    featured: false,
    applyType: "external",
    applyUrl: "https://docuwrite.com/careers/technical-writer",
  },
];