const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

// Optional helpers (recommended)
export function setAuthCookie(token, days = 7) {
  if (typeof document === "undefined") return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `auth=${encodeURIComponent(
    token,
  )}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

export function clearAuthCookie() {
  if (typeof document === "undefined") return;
  document.cookie = "auth=; Path=/; Max-Age=0; SameSite=Lax";
}

export async function getCsrfCookie() {
  const res = await fetch(`${API_URL}/sanctum/csrf-cookie`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(`Failed to get CSRF cookie (${res.status})`);
}

export async function apiFetch(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();

  // XSRF token (for Sanctum cookie-based requests)
  const xsrf = getCookie("XSRF-TOKEN");
  const xsrfDecoded = xsrf ? decodeURIComponent(xsrf) : null;

  // Bearer token (for token-based requests e.g. Google OAuth)
  const auth = getCookie("auth");
  const authDecoded = auth ? decodeURIComponent(auth) : null;

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // Attach Bearer token if available (Google OAuth flow)
  if (authDecoded && !headers.Authorization) {
    headers.Authorization = `Bearer ${authDecoded}`;
  }

  // Attach XSRF header for non-GET requests if cookie exists
  if (method !== "GET" && method !== "HEAD" && xsrfDecoded) {
    headers["X-XSRF-TOKEN"] = xsrfDecoded;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include", // keep cookies for Sanctum
  });

  // Safe response parsing (json or empty text)
  let payload = null;
  const text = await res.text();
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text || null;
  }

  if (!res.ok) {
    const error = new Error(
      payload?.message || `Request failed (${res.status})`,
    );
    error.status = res.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}
