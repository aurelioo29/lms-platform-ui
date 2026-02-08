const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

export async function getCsrfCookie() {
  const res = await fetch(`${API_URL}/sanctum/csrf-cookie`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(`Failed to get CSRF cookie (${res.status})`);
}

export async function apiFetch(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();

  const xsrf = getCookie("XSRF-TOKEN");
  const xsrfDecoded = xsrf ? decodeURIComponent(xsrf) : null;

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (method !== "GET" && method !== "HEAD" && xsrfDecoded) {
    headers["X-XSRF-TOKEN"] = xsrfDecoded;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  // parse response aman (json / text kosong)
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
