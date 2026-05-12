// components/FileInput.tsx
"use client";

import { useRef } from "react";

export default function FileInput({
  accept,
  onChange,
  label = "Choose File",
  fileName,
}: {
  accept: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  fileName?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      onClick={() => inputRef.current?.click()}
      className="flex items-center justify-between w-full border border-gray-300 rounded-lg px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
    >
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className="text-sm text-gray-500 truncate max-w-[200px]">
        {fileName || "No file chosen"}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={onChange}
        className="hidden"
      />
    </div>
  );
}