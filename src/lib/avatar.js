const API_URL = process.env.NEXT_PUBLIC_API_URL; // http://localhost:4000

export function getAvatarSrc(avatar) {
  const a = (avatar ?? "").trim();

  if (!a || a === "null" || a === "undefined") {
    return "/avatars/default-profile.png";
  }

  if (a.startsWith("http://") || a.startsWith("https://")) return a;

  // kalau backend simpan relative "avatars/xxx.png"
  // laravel storage public => /storage/avatars/xxx.png
  if (API_URL) return `${API_URL}/storage/${a.replace(/^\/+/, "")}`;

  // fallback (kalau env belum kebaca)
  return `/storage/${a.replace(/^\/+/, "")}`;
}

export function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase() || "U";
}
