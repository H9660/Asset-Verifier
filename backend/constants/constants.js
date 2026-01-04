export const FINANCE = "Finance";
export const ART = "Art";
export const TECHNICAL = "Technical";
export const BUFFER_MIME_TYPES = [
  // Archives
  "application/zip",
  "application/x-zip-compressed",
  "application/x-tar",
  "application/gzip",
  "application/x-7z-compressed",
  "application/x-rar-compressed",

  // PDFs & docs
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",

  // Generic binary
  "application/octet-stream",

  // WASM / binaries
  "application/wasm",
];

export const BUFFER_MIME_PREFIXES = ["image/", "video/", "audio/"];
