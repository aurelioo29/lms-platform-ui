export function getPasswordStrength(pw = "") {
  const length = pw.length;

  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const hasSymbol = /[^A-Za-z0-9]/.test(pw);

  let score = 0;

  // length scoring
  if (length >= 8) score += 1;
  if (length >= 12) score += 1;

  // complexity scoring
  if (hasLower) score += 1;
  if (hasUpper) score += 1;
  if (hasNumber) score += 1;
  if (hasSymbol) score += 1;

  // normalize to 0..4
  const level =
    score <= 2 ? 0 : score === 3 ? 1 : score === 4 ? 2 : score === 5 ? 3 : 4;

  const map = [
    { label: "Very weak", bar: 20, className: "bg-red-500" },
    { label: "Weak", bar: 40, className: "bg-orange-500" },
    { label: "Good", bar: 65, className: "bg-yellow-500" },
    { label: "Strong", bar: 85, className: "bg-green-500" },
    { label: "Very strong", bar: 100, className: "bg-emerald-600" },
  ];

  const pick = map[level];

  return {
    level,
    ...pick,
    hints: [
      length < 8 ? "Use at least 8 characters" : null,
      !hasUpper ? "Add an uppercase letter" : null,
      !hasNumber ? "Add a number" : null,
      !hasSymbol ? "Add a symbol" : null,
    ].filter(Boolean),
  };
}
