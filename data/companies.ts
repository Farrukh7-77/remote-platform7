// data/companies.ts
export type Company = {
  id: number;
  name: string;
  logo: string; // Now stores initial letter or emoji, will be styled
  logoBgColor: string;
  industry: string;
  location: string;
  size: string;
  jobsPosted: number;
  description: string;
};

export const companies: Company[] = [
  {
    id: 1,
    name: "TechCorp",
    logo: "TC",
    logoBgColor: "bg-blue-100 text-blue-700",
    industry: "Technology",
    location: "San Francisco, CA",
    size: "200-500",
    jobsPosted: 12,
    description: "Leading software development company specializing in web and mobile apps.",
  },
  {
    id: 2,
    name: "DataFlow",
    logo: "DF",
    logoBgColor: "bg-purple-100 text-purple-700",
    industry: "Data Infrastructure",
    location: "London, UK",
    size: "100-250",
    jobsPosted: 8,
    description: "Building the future of data processing and analytics.",
  },
  {
    id: 3,
    name: "CreativeStudio",
    logo: "CS",
    logoBgColor: "bg-pink-100 text-pink-700",
    industry: "Design",
    location: "Berlin, Germany",
    size: "50-100",
    jobsPosted: 5,
    description: "Award-winning design agency for startups and enterprises.",
  },
  {
    id: 4,
    name: "CloudScale",
    logo: "CL",
    logoBgColor: "bg-cyan-100 text-cyan-700",
    industry: "Cloud Computing",
    location: "Austin, TX",
    size: "500-1000",
    jobsPosted: 15,
    description: "Enterprise cloud solutions and managed services.",
  },
  {
    id: 5,
    name: "SupportHub",
    logo: "SH",
    logoBgColor: "bg-green-100 text-green-700",
    industry: "Customer Support",
    location: "Manila, Philippines",
    size: "300-500",
    jobsPosted: 20,
    description: "Global customer support outsourcing leader.",
  },
];