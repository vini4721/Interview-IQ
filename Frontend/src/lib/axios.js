import axios from "axios";

/** Set from `ClerkApiAuth` so every API request sends a Bearer JWT (required when the API is on another origin/port than the Vite app). */
let clerkGetToken = null;

export function setClerkTokenGetter(fn) {
  clerkGetToken = fn;
}

const normalizeApiBaseUrl = (rawUrl = "") => {
  const trimmed = String(rawUrl || "").trim();
  if (!trimmed) return "/api";

  // Keep local/dev proxy behavior as-is.
  if (trimmed.startsWith("/")) return trimmed;

  // For absolute URLs, ensure all requests target backend API routes.
  return trimmed.replace(/\/+$/, "").endsWith("/api")
    ? trimmed.replace(/\/+$/, "")
    : `${trimmed.replace(/\/+$/, "")}/api`;
};

const axiosInstance = axios.create({
  baseURL: normalizeApiBaseUrl(import.meta.env.VITE_API_URL),
  withCredentials: true,
});

axiosInstance.interceptors.request.use(async (config) => {
  if (clerkGetToken) {
    try {
      const token = await clerkGetToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      /* leave unauthenticated; backend will 401 */
    }
  }
  return config;
});

export default axiosInstance;
