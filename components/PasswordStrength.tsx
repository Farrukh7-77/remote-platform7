// components/PasswordStrength.tsx
"use client";

export default function PasswordStrength({ password }: { password: string }) {
  const getStrength = () => {
    let score = 0;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;
    return score;
  };

  const strength = getStrength();
  const percentage = (strength / 5) * 100;
  
  const getColor = () => {
    if (strength <= 2) return "bg-red-500";
    if (strength <= 3) return "bg-yellow-500";
    if (strength <= 4) return "bg-blue-500";
    return "bg-green-500";
  };
  
  const getLabel = () => {
    if (strength <= 2) return "Weak";
    if (strength <= 3) return "Fair";
    if (strength <= 4) return "Good";
    return "Strong";
  };

  if (!password) return null;
  
  return (
    <div className="mt-2">
      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getColor()} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className={`text-xs mt-1 ${strength <= 2 ? "text-red-500" : strength <= 3 ? "text-yellow-500" : strength <= 4 ? "text-blue-500" : "text-green-500"}`}>
        Password strength: {getLabel()}
      </p>
      <ul className="text-xs text-gray-500 mt-2 space-y-1">
        <li className={password.length >= 12 ? "text-green-500 line-through" : ""}>✓ At least 12 characters</li>
        <li className={/[A-Z]/.test(password) ? "text-green-500 line-through" : ""}>✓ At least one uppercase letter</li>
        <li className={/[a-z]/.test(password) ? "text-green-500 line-through" : ""}>✓ At least one lowercase letter</li>
        <li className={/[0-9]/.test(password) ? "text-green-500 line-through" : ""}>✓ At least one number</li>
        <li className={/[@$!%*?&]/.test(password) ? "text-green-500 line-through" : ""}>✓ At least one special character (@$!%*?&)</li>
      </ul>
    </div>
  );
}