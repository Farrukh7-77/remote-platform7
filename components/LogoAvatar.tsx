// components/LogoAvatar.tsx
"use client";

const colorSchemes = [
  "bg-gradient-to-br from-blue-500 to-blue-700",
  "bg-gradient-to-br from-purple-500 to-purple-700",
  "bg-gradient-to-br from-green-500 to-green-700",
  "bg-gradient-to-br from-orange-500 to-orange-700",
  "bg-gradient-to-br from-pink-500 to-pink-700",
  "bg-gradient-to-br from-teal-500 to-teal-700",
  "bg-gradient-to-br from-indigo-500 to-indigo-700",
  "bg-gradient-to-br from-red-500 to-red-700",
];

export default function LogoAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorIndex = hash % colorSchemes.length;
  const bgClass = colorSchemes[colorIndex];
  
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  const initials = name
    .split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`${sizeClasses[size]} ${bgClass} rounded-xl flex items-center justify-center font-bold text-white shadow-sm`}>
      {initials}
    </div>
  );
}