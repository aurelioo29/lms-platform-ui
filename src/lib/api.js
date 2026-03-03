const API_URL = process.env.NEXT_PUBLIC_API_URL;

// =========================
// Cookie Helpers
// =========================
function readCookie(name) {
  if (typeof document === "undefined") return null;

  const found = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="));

  if (!found) return null;

  const value = found.split("=").slice(1).join("=");
  return value || null;
}

function isHttps() {
  if (typeof window === "undefined") return false;
  return window.location.protocol === "https:";
}

// =========================
// Auth Cookie Helpers
// =========================
export function setAuthCookie(token, days = 7) {
  if (typeof document === "undefined") return;

  const secure = isHttps() ? " Secure;" : "";
  const maxAge = days * 24 * 60 * 60;

  document.cookie = `auth=${encodeURIComponent(
    token,
  )}; Path=/; Max-Age=${maxAge}; SameSite=Lax;${secure}`;
}

export function clearAuthCookie() {
  if (typeof document === "undefined") return;

  const secure = isHttps() ? " Secure;" : "";
  document.cookie = `auth=; Path=/; Max-Age=0; SameSite=Lax;${secure}`;
}

// =========================
// Sanctum CSRF Helper
// =========================
export async function getCsrfCookie() {
  const res = await fetch(`${API_URL}/sanctum/csrf-cookie`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error(`Failed to get CSRF cookie (${res.status})`);
}

// =========================
// Core Fetch Helpers
// =========================
async function parseResponse(res) {
  const text = await res.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function buildHeaders(optionsHeaders = {}, method = "GET") {
  const upper = method.toUpperCase();

  const xsrf = readCookie("XSRF-TOKEN");
  const xsrfDecoded = xsrf ? decodeURIComponent(xsrf) : null;

  const auth = readCookie("auth");
  const authDecoded = auth ? decodeURIComponent(auth) : null;

  const headers = {
    Accept: "application/json",
    ...(optionsHeaders || {}),
  };

  // Kalau request JSON (bukan upload), set default content-type
  // (Upload akan override dan tidak set content-type)
  if (!headers["Content-Type"] && !headers["content-type"]) {
    headers["Content-Type"] = "application/json";
  }

  // Bearer token ALWAYS wins kalau ada
  if (authDecoded && !headers.Authorization) {
    headers.Authorization = `Bearer ${authDecoded}`;
  }

  const hasBearer = Boolean(authDecoded);

  // XSRF hanya untuk cookie-based sanctum (tanpa bearer)
  if (!hasBearer && upper !== "GET" && upper !== "HEAD" && xsrfDecoded) {
    headers["X-XSRF-TOKEN"] = xsrfDecoded;
  }

  return { headers, hasBearer };
}

export async function apiFetch(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();

  const { headers } = buildHeaders(options.headers, method);

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    method,
    headers,
    credentials: "include",
  });

  const payload = await parseResponse(res);

  if (!res.ok) {
    const err = new Error(payload?.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  return payload;
}

export async function apiUpload(path, formData, options = {}) {
  const method = (options.method || "POST").toUpperCase();

  // build headers tapi buang Content-Type (biar browser set boundary)
  const built = buildHeaders(options.headers, method);
  const headers = { ...built.headers };
  delete headers["Content-Type"];
  delete headers["content-type"];

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    method,
    headers,
    body: formData,
    credentials: "include",
  });

  const payload = await parseResponse(res);

  if (!res.ok) {
    const err = new Error(payload?.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  return payload;
}
