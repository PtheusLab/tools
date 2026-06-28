export function parseIntOrNull(value: string | null | undefined): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[^0-9]/g, "");
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? null : parsed;
}

export function parseFloatOrNull(
  value: string | null | undefined
): number | null {
  if (!value) return null;
  const parsed = parseFloat(value.trim());
  return isNaN(parsed) ? null : parsed;
}

export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function parseKiloSuffix(value: string): number | null {
  const clean = value.trim().toLowerCase();
  const match = clean.match(/^([\d,.]+)\s*k?$/);
  if (!match || !match[1]) return null;

  const num = parseFloat(match[1].replace(/,/g, ""));
  if (isNaN(num)) return null;

  return clean.endsWith("k") ? Math.round(num * 1000) : num;
}
