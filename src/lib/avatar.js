export function getAvatarSrc(avatar) {
  const a = (avatar ?? "").trim();

  if (!a || a === "null" || a === "undefined") {
    return "/avatars/default-profile.png";
  }

  if (a.startsWith("http://") || a.startsWith("https://")) return a;
  if (a.startsWith("/")) return a;
  return `/${a}`;
}
