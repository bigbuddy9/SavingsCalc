/**
 * Round-trip the calculator inputs through the URL hash so a sales rep can
 * share a configured quote via a copy/paste link.
 *
 * Format: window.location.hash = "#" + base64url(JSON.stringify(inputs))
 *
 * Why hash instead of query string: hash never hits the server (Vercel ignores
 * it), so we can swap the URL on every keystroke without any 404 risk and
 * without page reload.
 */

import type { CalculatorInputs } from "./CalculatorContext";

export function encodeInputs(inputs: CalculatorInputs): string {
  try {
    const json = JSON.stringify(inputs);
    // base64url: unicode-safe, URL-safe, no padding so the hash stays compact.
    const b64 = btoa(unescape(encodeURIComponent(json)));
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  } catch {
    return "";
  }
}

export function decodeInputs(hash: string): Partial<CalculatorInputs> | null {
  if (!hash) return null;
  const trimmed = hash.startsWith("#") ? hash.slice(1) : hash;
  if (trimmed.length === 0) return null;
  try {
    const b64 = trimmed.replace(/-/g, "+").replace(/_/g, "/");
    // Re-pad to a multiple of 4 because we stripped trailing "=" on encode.
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const json = decodeURIComponent(escape(atob(padded)));
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed === "object") {
      return parsed as Partial<CalculatorInputs>;
    }
  } catch {
    // Garbled hash — ignore, keep defaults.
  }
  return null;
}

/** Pull and decode the current page's hash. Safe to call on first render. */
export function readInputsFromUrl(): Partial<CalculatorInputs> | null {
  if (typeof window === "undefined") return null;
  return decodeInputs(window.location.hash);
}

/** Push the encoded inputs into the URL hash without triggering a navigation. */
export function writeInputsToUrl(inputs: CalculatorInputs): void {
  if (typeof window === "undefined") return;
  const encoded = encodeInputs(inputs);
  const newUrl = `${window.location.pathname}${window.location.search}#${encoded}`;
  window.history.replaceState(null, "", newUrl);
}
