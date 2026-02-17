import { apiFetch, apiUpload, getCsrfCookie } from "@/lib/api";

export const authKeys = {
  me: ["auth", "me"],
};

export function fetchMe() {
  return apiFetch("/api/auth/me");
}

export async function loginRequest(data) {
  await getCsrfCookie();
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function registerRequest(data) {
  await getCsrfCookie();
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function logoutRequest() {
  // logout juga POST => pastikan csrf cookie sudah ada
  await getCsrfCookie();
  return apiFetch("/api/auth/logout", { method: "POST" });
}

export async function resendVerificationRequest(email) {
  await getCsrfCookie();
  return apiFetch("/api/auth/email/resend", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function forgotPasswordRequest(data) {
  await getCsrfCookie();
  return apiFetch("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function resetPasswordRequest(data) {
  await getCsrfCookie();
  return apiFetch("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAvatarRequest(file) {
  await getCsrfCookie();

  const fd = new FormData();
  fd.append("avatar", file);

  return apiUpload("/api/auth/profile/avatar", fd, { method: "POST" });
}

export async function removeAvatarRequest() {
  await getCsrfCookie();
  // backend kamu perlu endpoint DELETE /api/auth/profile/avatar
  return apiFetch("/api/auth/profile/avatar", { method: "DELETE" });
}

export async function updateUsernameRequest(name) {
  await getCsrfCookie();
  return apiFetch("/api/auth/profile/username", {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export async function updateEmailRequest(email) {
  await getCsrfCookie();
  return apiFetch("/api/auth/profile/email", {
    method: "PATCH",
    body: JSON.stringify({ email }),
  });
}

export async function updatePasswordRequest(data) {
  await getCsrfCookie();
  return apiFetch("/api/auth/profile/password", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
