// lib/fileUpload.ts
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { valid: false, error: "Only PDF, DOC, DOCX files are allowed" };
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "File size must be less than 5MB" };
  }
  
  return { valid: true };
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .substring(0, 100);
}