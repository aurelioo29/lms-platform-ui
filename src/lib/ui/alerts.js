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

export const swalBase = {
  width: 460,
  heightAuto: false,
  backdrop: "rgba(0,0,0,.55)",
  background: "var(--background)",
  color: "var(--foreground)",
  buttonsStyling: false,
  focusConfirm: false,
  returnFocus: false,
  showClass: { popup: "swal2-show-fix" },
  hideClass: { popup: "swal2-hide-fix" },
  customClass: {
    container: "swal2-container-fix",
    popup: "swal2-popup-fix",
    title: "swal2-title-fix",
    htmlContainer: "swal2-html-fix",
    actions: "swal2-actions-fix",
    confirmButton: "swal2-confirm-fix",
    cancelButton: "swal2-cancel-fix",
  },
};

export function alertError({
  title = "Ada yang perlu dicek",
  message,
  messages,
  confirmText = "Oke",
} = {}) {
  const list = Array.isArray(messages) ? messages.filter(Boolean) : [];
  const single = list.length === 1 ? String(list[0]) : null;

  return Swal.fire({
    ...swalBase,
    icon: "error",
    iconColor: "var(--foreground)",
    title,
    text: single || message || undefined,
    html: !single && list.length > 0 ? toBulletHtml(list) : undefined,
    confirmButtonText: confirmText,
  });
}

export function alertSuccess({
  title = "Berhasil",
  message,
  confirmText = "Sip",
} = {}) {
  return Swal.fire({
    ...swalBase,
    icon: "success",
    iconColor: "var(--foreground)",
    title,
    text: message,
    confirmButtonText: confirmText,
  });
}

export function alertInfo({
  title = "Info",
  message,
  confirmText = "Oke",
} = {}) {
  return Swal.fire({
    ...swalBase,
    icon: "info",
    iconColor: "var(--foreground)",
    title,
    text: message,
    confirmButtonText: confirmText,
  });
}

export function alertConfirm({
  title = "Konfirmasi",
  message = "Lanjutkan aksi ini?",
  confirmText = "Ya, lanjut",
  cancelText = "Batal",
  icon = "warning",
  reverseButtons = true,
} = {}) {
  return Swal.fire({
    ...swalBase,
    icon,
    iconColor: "var(--foreground)",
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons,
  });
}

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

export function humanizeServerMessage(field, raw) {
  const msg = String(raw || "");

  if (field === "password") {
    return "Password terlalu lemah. Gunakan kombinasi huruf & angka.";
  }

  return msg;
}

export async function handleApiError(e, options = {}) {
  const {
    setFieldError, // (field, message) => void
    fallbackMessage = "Terjadi kesalahan. Coba lagi.",
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
      title: "Input belum valid",
      messages: friendly.length ? friendly : ["Data belum valid. Coba lagi."],
    });
    return true;
  }

  // 401 auth
  if (e?.status === 401) {
    await alertError({
      title: "Gagal masuk",
      message: "Email atau password salah.",
    });
    return true;
  }

  // fallback
  await alertError({
    title: "Oops",
    message: e?.message || fallbackMessage,
  });
  return true;
}
