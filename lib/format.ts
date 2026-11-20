const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/** Converts any Latin digits (0-9) found in the input to Persian digits — everything else (commas, spaces, other characters) is left untouched. */
export function toPersianDigits(input: string | number): string {
  return String(input).replace(
    /[0-9]/g,
    (digit) => PERSIAN_DIGITS[Number(digit)],
  );
}

const LATIN_DIGITS: Record<string, string> = {
  "۰": "0",
  "۱": "1",
  "۲": "2",
  "۳": "3",
  "۴": "4",
  "۵": "5",
  "۶": "6",
  "۷": "7",
  "۸": "8",
  "۹": "9",
};

/** The reverse of toPersianDigits — used before parsing user-typed input, since a Persian keyboard often produces Persian digits. */
export function toLatinDigits(input: string): string {
  return input.replace(/[۰-۹]/g, (digit) => LATIN_DIGITS[digit]);
}

export function formatPrice(value: number): string {
  return toPersianDigits(new Intl.NumberFormat("en-US").format(value));
}

export function formatToman(value: number): string {
  return `${formatPrice(value)} تومان`;
}

/**
 * Normalizes an Iranian mobile number ("0912...", "912...", or one typed
 * with Persian digits) to E.164 ("+98912...").
 *
 * Deliberately NOT switched to Persian digits — this is a technical
 * identifier (sent to the SMS provider, matched against Better Auth's
 * phone plugin, stored in the database), not something displayed to a
 * person, so it must stay plain ASCII regardless of the display-
 * formatting change above.
 */
export function normalizeIranPhone(input: string): string {
  const digits = toLatinDigits(input).replace(/\D/g, "");
  if (digits.startsWith("98")) return `+${digits}`;
  if (digits.startsWith("0")) return `+98${digits.slice(1)}`;
  return `+98${digits}`;
}

/** Percent off between the list price and the current price (0 when not discounted). */
export function discountPercent(price: number, compareAtPrice?: number | null): number {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

/** «۲ میلیون تومان» for round millions, otherwise the plain toman amount. */
export function formatTomanShort(value: number): string {
  if (value >= 1_000_000 && value % 1_000_000 === 0) {
    return `${toPersianDigits(value / 1_000_000)} میلیون تومان`;
  }
  return formatToman(value);
}

/** «۰۹۱۲ ۳۴۵ ۶۷۸۹» from any Iranian mobile format; unknown shapes pass through. */
export function formatPhoneDisplay(input: string): string {
  const digits = toLatinDigits(input).replace(/\D/g, "");
  const local = digits.startsWith("98")
    ? `0${digits.slice(2)}`
    : digits.startsWith("0")
      ? digits
      : `0${digits}`;
  if (local.length !== 11) return toPersianDigits(input);
  return toPersianDigits(
    `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`,
  );
}

/** Parses the «عنوان: مقدار» per-line specification text from the admin. */
export function parseSpecifications(
  text: string | null | undefined,
): { label: string; value: string }[] {
  if (!text) return [];
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const i = line.indexOf(":");
      return i === -1
        ? { label: "", value: line }
        : { label: line.slice(0, i).trim(), value: line.slice(i + 1).trim() };
    });
}

/** Parses a size description like «دور سینه: ۹۶، دور کمر: ۷۸» into columns. */
export function parseSizeMeasures(
  text: string | null | undefined,
): { label: string; value: string }[] {
  if (!text) return [];
  const parts = text
    .split(/[،,\n]/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0 || !parts.every((p) => p.includes(":"))) return [];
  return parts.map((p) => {
    const i = p.indexOf(":");
    return { label: p.slice(0, i).trim(), value: p.slice(i + 1).trim() };
  });
}
