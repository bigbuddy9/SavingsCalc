const FALLBACK_LOCALE = "en-AU";
const FALLBACK_CURRENCY = "AUD";

/**
 * Locales picked per currency to give the most natural symbol/grouping.
 * The choice mostly matters for currencies whose symbol changes by locale
 * (e.g. CA$ vs $ for CAD when the locale is en-CA vs en-US).
 */
const LOCALE_BY_CURRENCY: Record<string, string> = {
  AUD: "en-AU", USD: "en-US", NZD: "en-NZ", CAD: "en-CA", GBP: "en-GB",
  EUR: "en-IE", JPY: "ja-JP", CNY: "zh-CN", INR: "en-IN", SGD: "en-SG",
  HKD: "en-HK", KRW: "ko-KR", THB: "th-TH", IDR: "id-ID", MYR: "ms-MY",
  PHP: "fil-PH", VND: "vi-VN", BRL: "pt-BR", ARS: "es-AR", CLP: "es-CL",
  COP: "es-CO", PEN: "es-PE", MXN: "es-MX", ZAR: "en-ZA", EGP: "ar-EG",
  MAD: "ar-MA", NGN: "en-NG", KES: "en-KE", AED: "ar-AE", SAR: "ar-SA",
  ILS: "he-IL", TRY: "tr-TR", RUB: "ru-RU", UAH: "uk-UA", PLN: "pl-PL",
  CZK: "cs-CZ", SEK: "sv-SE", NOK: "nb-NO", DKK: "da-DK", CHF: "de-CH",
};

const formatterCache = new Map<string, Intl.NumberFormat>();

function buildFormatter(currency: string, fractionDigits: number): Intl.NumberFormat {
  const key = `${currency}:${fractionDigits}`;
  const cached = formatterCache.get(key);
  if (cached) return cached;
  const locale = LOCALE_BY_CURRENCY[currency] ?? FALLBACK_LOCALE;
  const fmt = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  formatterCache.set(key, fmt);
  return fmt;
}

/**
 * Format an amount in the user's local currency.
 * Negatives are rendered as "−$X" with a real minus sign for visual clarity
 * (Intl uses "-$X" with a hyphen, which is easier to miss).
 */
export function formatMoney(
  n: number,
  currency: string = FALLBACK_CURRENCY,
  opts?: { withSign?: boolean }
): string {
  const rounded = Math.round(n);
  const fmt = buildFormatter(currency, 0);
  const formatted = fmt.format(Math.abs(rounded));
  if (rounded < 0) return "−" + formatted;
  if (opts?.withSign && rounded > 0) return "+" + formatted;
  return formatted;
}

/** Compact form: $123, $1.2K, $1.23M. Sign always shown. */
export function formatMoneyK(n: number, currency: string = FALLBACK_CURRENCY): string {
  const sign = n < 0 ? "−" : "+";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) {
    return sign + formatBareCurrency(abs / 1_000_000, currency, 2) + "M";
  }
  if (abs >= 1_000) {
    return sign + formatBareCurrency(abs / 1_000, currency, 0) + "K";
  }
  return sign + formatBareCurrency(abs, currency, 0);
}

/** Same as formatMoneyK, but unsigned (for hero numbers where sign is implied). */
export function formatMoneyKUnsigned(n: number, currency: string = FALLBACK_CURRENCY): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) {
    return formatBareCurrency(abs / 1_000_000, currency, 2) + "M";
  }
  if (abs >= 1_000) {
    return formatBareCurrency(abs / 1_000, currency, 0) + "K";
  }
  return formatBareCurrency(abs, currency, 0);
}

/** Currency-formatted number without any sign prefix. */
function formatBareCurrency(n: number, currency: string, fractionDigits: number): string {
  return buildFormatter(currency, fractionDigits).format(n);
}

/**
 * Returns just the currency symbol for a given ISO code, e.g. "£" for GBP.
 * Useful for input prefixes where we don't want a full formatted value.
 */
export function currencySymbol(currency: string = FALLBACK_CURRENCY): string {
  const fmt = buildFormatter(currency, 0);
  const part = fmt.formatToParts(0).find((p) => p.type === "currency");
  return part?.value ?? "$";
}

export function formatKwh(n: number): string {
  return Math.round(n).toLocaleString(FALLBACK_LOCALE) + " kWh";
}

export function formatPercent(n: number, decimals = 1): string {
  return n.toFixed(decimals) + "%";
}
