// src/lib/ui/alerts.js
import Swal from "sweetalert2";

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toBulletHtml(items) {
  const safe = (items || []).filter(Boolean);
  return `
    <div class="text-left">
      <ul class="list-disc pl-5 space-y-1">
        ${safe.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}
      </ul>
    </div>
  `;
}

/**
 * Base config yang cocok untuk shadcn tokens.
 * NOTE: jangan set target kecuali kamu butuh banget.
 */
export const swalBase = {
  width: 460,
  heightAuto: false,
  backdrop: "rgba(0,0,0,.45)",
  background: "var(--background)",
  color: "var(--foreground)",
  buttonsStyling: false,
  customClass: {
    container: "swal2-container-fix",
    popup: "rounded-2xl border border-border shadow-2xl",
    title: "text-lg font-semibold",
    htmlContainer: "text-sm text-muted-foreground",
    confirmButton:
      "bg-primary text-primary-foreground px-4 py-2 rounded-md cursor-pointer",
    cancelButton:
      "bg-muted text-foreground px-4 py-2 rounded-md cursor-pointer",
  },
};

export function alertError({
  title = "Periksa input kamu",
  message,
  messages,
  confirmText = "Oke",
} = {}) {
  const list = Array.isArray(messages) ? messages.filter(Boolean) : [];
  const single = list.length === 1 ? String(list[0]) : null;

  return Swal.fire({
    ...swalBase,
    icon: "error",
    title,
    // ✅ kalau cuma 1, tampilkan plain text (tanpa bullet)
    text: single || message || undefined,
    // ✅ kalau lebih dari 1, baru pakai html list
    html: !single && list.length > 0 ? toBulletHtml(list) : undefined,
    confirmButtonText: confirmText,
  });
}

export function alertSuccess({
  title = "Berhasil",
  message,
  confirmText = "OK",
} = {}) {
  return Swal.fire({
    ...swalBase,
    icon: "success",
    title,
    text: message,
    confirmButtonText: confirmText,
  });
}

export function alertInfo({
  title = "Info",
  message,
  confirmText = "OK",
} = {}) {
  return Swal.fire({
    ...swalBase,
    icon: "info",
    title,
    text: message,
    confirmButtonText: confirmText,
  });
}

export function alertConfirm({
  title = "Konfirmasi",
  message,
  confirmText = "Ya",
  cancelText = "Batal",
  icon = "question",
  reverseButtons = true,
} = {}) {
  return Swal.fire({
    ...swalBase,
    icon,
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons,
  });
}

/**
 * Ambil error list dari API (Laravel 422 biasanya).
 */
export function extractLaravelErrors(e) {
  const list = [];
  if (e?.status === 422 && e?.payload?.errors) {
    Object.values(e.payload.errors).forEach((msgs) => {
      const first = Array.isArray(msgs) ? msgs[0] : msgs;
      if (first) list.push(String(first));
    });
  }
  return list;
}

/**
 * Map error tertentu jadi bahasa manusia.
 * Kamu bisa tambah case lain kapan aja.
 */
export function humanizeServerMessage(field, raw) {
  const msg = String(raw || "");

  if (field === "password") {
    // biar gak muncul "harus mengandung huruf kecil..."
    return "Password terlalu lemah. Gunakan kombinasi huruf & angka.";
  }

  return msg;
}

/**
 * Handler error API yang bisa dipakai di semua form.
 * - setFieldError optional (react-hook-form setError)
 * - onEmailNotVerified optional (buat login)
 */
export async function handleApiError(e, options = {}) {
  const {
    setFieldError, // (field, message) => void
    fallbackMessage = "Terjadi error. Coba lagi.",
    hideServerDetails = true,
  } = options;

  // 422 validation
  if (e?.status === 422 && e?.payload?.errors) {
    const friendly = [];

    Object.entries(e.payload.errors).forEach(([field, msgs]) => {
      const raw = msgs?.[0] || "";
      const msg = hideServerDetails ? humanizeServerMessage(field, raw) : raw;

      if (setFieldError) setFieldError(field, msg);
      if (msg) friendly.push(msg);
    });

    await alertError({
      title: "Periksa input kamu",
      messages: friendly.length ? friendly : ["Data belum valid. Coba lagi."],
    });
    return true; // handled
  }

  // 401 auth
  if (e?.status === 401) {
    await alertError({
      title: "Gagal",
      message: "Email atau password salah.",
    });
    return true;
  }

  // fallback
  await alertError({
    title: "Oops!",
    message: e?.message || fallbackMessage,
  });
  return true;
}
