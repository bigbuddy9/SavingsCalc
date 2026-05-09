/**
 * Brand registry — adds a new tenant by adding an entry here.
 *
 * Each brand can override:
 *   - display name (used in footer + page title)
 *   - logo asset (drop the file at /public/brands/<id>.png|svg)
 *   - primary colour (replaces the default amber accent across the UI)
 *
 * Brand resolution order:
 *   1. ?brand=<id> URL param (handy for previewing without DNS setup)
 *   2. First DNS label of the hostname (e.g. iinergy.savingscalc.co → "iinergy")
 *   3. Default brand
 */

export type Brand = {
  id: string;
  name: string;
  productName: string;
  tagline: string;
  /** Path under /public, or null to suppress the logo slot entirely. */
  logoSrc: string | null;
  /** Primary brand colour as a space-separated RGB triple (no commas, no #). */
  primaryRgb: string;
};

const DEFAULT_BRAND: Brand = {
  id: "default",
  name: "Solar",
  productName: "Solar Savings Analysis",
  tagline: "Your 25-year financial picture, end-to-end.",
  logoSrc: null,
  primaryRgb: "245 158 11", // amber #F59E0B
};

const BRANDS: Record<string, Brand> = {
  default: DEFAULT_BRAND,
  iinergy: {
    id: "iinergy",
    name: "iinergy",
    productName: "iinergy Solar Savings",
    tagline: "Energy found, not forged.",
    logoSrc: "/brands/iinergy.png",
    primaryRgb: "141 198 63", // lime green #8DC63F
  },
};

export function resolveBrandFromLocation(): Brand {
  if (typeof window === "undefined") return DEFAULT_BRAND;

  // 1. URL param wins (so previews are easy without DNS setup).
  const fromParam = new URLSearchParams(window.location.search).get("brand");
  if (fromParam && BRANDS[fromParam]) return BRANDS[fromParam];

  // 2. First DNS label — iinergy.savingscalc.co → "iinergy".
  // Skip when on localhost/preview deploys to keep the default brand.
  const host = window.location.hostname;
  const ignore = new Set(["localhost", "127.0.0.1", "savings-calc-eight"]);
  if (!ignore.has(host) && host.includes(".")) {
    const sub = host.split(".")[0].toLowerCase();
    if (BRANDS[sub]) return BRANDS[sub];
  }

  return DEFAULT_BRAND;
}

export function listBrandIds(): string[] {
  return Object.keys(BRANDS);
}
