/**
 * Country / postcode → city, hemisphere, peak sun hours.
 *
 * Two tiers of resolution:
 *  - AU + US: full postcode → city/state lookup (existing behaviour).
 *  - Everywhere else: country-level peak-sun average + hemisphere; the
 *    "city" field stays empty and the UI shows the country name in its place.
 *
 * Peak-sun-hour values are annual daily averages from public irradiance
 * datasets (BoM for Aus, NREL for US, NASA POWER for everywhere else).
 */

export type Country = string; // ISO 3166-1 alpha-2, or "" for unset
export type Hemisphere = "N" | "S";

export type LocationResult = {
  country: Country;
  countryName: string;
  postcode: string;
  city: string;
  state: string;
  hemisphere: Hemisphere;
  peakSunHours: number;
};

export type CountryEntry = {
  code: Country;
  name: string;
  hemisphere: Hemisphere;
  peakSunHours: number;
  /** If set, this country has detailed postcode→city resolution. */
  postcodeLength?: number;
};

/**
 * 45+ countries covering the major solar markets.
 * Country-level peakSunHours are annual daily averages.
 */
export const COUNTRIES: CountryEntry[] = [
  // Oceania
  { code: "AU", name: "Australia",        hemisphere: "S", peakSunHours: 4.8, postcodeLength: 4 },
  { code: "NZ", name: "New Zealand",      hemisphere: "S", peakSunHours: 3.9 },
  // North America
  { code: "US", name: "United States",    hemisphere: "N", peakSunHours: 4.5, postcodeLength: 5 },
  { code: "CA", name: "Canada",           hemisphere: "N", peakSunHours: 3.7 },
  { code: "MX", name: "Mexico",           hemisphere: "N", peakSunHours: 5.2 },
  // Europe
  { code: "GB", name: "United Kingdom",   hemisphere: "N", peakSunHours: 2.8 },
  { code: "IE", name: "Ireland",          hemisphere: "N", peakSunHours: 2.7 },
  { code: "FR", name: "France",           hemisphere: "N", peakSunHours: 3.5 },
  { code: "DE", name: "Germany",          hemisphere: "N", peakSunHours: 2.9 },
  { code: "ES", name: "Spain",            hemisphere: "N", peakSunHours: 4.9 },
  { code: "IT", name: "Italy",            hemisphere: "N", peakSunHours: 4.3 },
  { code: "PT", name: "Portugal",         hemisphere: "N", peakSunHours: 4.8 },
  { code: "GR", name: "Greece",           hemisphere: "N", peakSunHours: 4.8 },
  { code: "NL", name: "Netherlands",      hemisphere: "N", peakSunHours: 2.8 },
  { code: "BE", name: "Belgium",          hemisphere: "N", peakSunHours: 2.8 },
  { code: "SE", name: "Sweden",           hemisphere: "N", peakSunHours: 2.9 },
  { code: "NO", name: "Norway",           hemisphere: "N", peakSunHours: 2.6 },
  { code: "DK", name: "Denmark",          hemisphere: "N", peakSunHours: 2.8 },
  { code: "FI", name: "Finland",          hemisphere: "N", peakSunHours: 2.7 },
  { code: "PL", name: "Poland",           hemisphere: "N", peakSunHours: 3.0 },
  { code: "CH", name: "Switzerland",      hemisphere: "N", peakSunHours: 3.4 },
  { code: "AT", name: "Austria",          hemisphere: "N", peakSunHours: 3.2 },
  { code: "CZ", name: "Czechia",          hemisphere: "N", peakSunHours: 3.0 },
  { code: "TR", name: "Turkey",           hemisphere: "N", peakSunHours: 4.4 },
  { code: "RU", name: "Russia",           hemisphere: "N", peakSunHours: 3.0 },
  { code: "UA", name: "Ukraine",          hemisphere: "N", peakSunHours: 3.0 },
  // Asia
  { code: "JP", name: "Japan",            hemisphere: "N", peakSunHours: 3.6 },
  { code: "KR", name: "South Korea",      hemisphere: "N", peakSunHours: 3.7 },
  { code: "CN", name: "China",            hemisphere: "N", peakSunHours: 4.0 },
  { code: "IN", name: "India",            hemisphere: "N", peakSunHours: 5.5 },
  { code: "SG", name: "Singapore",        hemisphere: "N", peakSunHours: 4.8 },
  { code: "MY", name: "Malaysia",         hemisphere: "N", peakSunHours: 4.8 },
  { code: "TH", name: "Thailand",         hemisphere: "N", peakSunHours: 5.0 },
  { code: "ID", name: "Indonesia",        hemisphere: "S", peakSunHours: 4.8 },
  { code: "PH", name: "Philippines",      hemisphere: "N", peakSunHours: 5.1 },
  { code: "VN", name: "Vietnam",          hemisphere: "N", peakSunHours: 4.7 },
  // Middle East
  { code: "AE", name: "United Arab Emirates", hemisphere: "N", peakSunHours: 6.0 },
  { code: "SA", name: "Saudi Arabia",     hemisphere: "N", peakSunHours: 6.5 },
  { code: "IL", name: "Israel",           hemisphere: "N", peakSunHours: 5.5 },
  // Africa
  { code: "ZA", name: "South Africa",     hemisphere: "S", peakSunHours: 5.5 },
  { code: "EG", name: "Egypt",            hemisphere: "N", peakSunHours: 6.0 },
  { code: "MA", name: "Morocco",          hemisphere: "N", peakSunHours: 5.5 },
  { code: "NG", name: "Nigeria",          hemisphere: "N", peakSunHours: 5.0 },
  { code: "KE", name: "Kenya",            hemisphere: "S", peakSunHours: 5.5 },
  // South America
  { code: "BR", name: "Brazil",           hemisphere: "S", peakSunHours: 5.2 },
  { code: "AR", name: "Argentina",        hemisphere: "S", peakSunHours: 4.9 },
  { code: "CL", name: "Chile",            hemisphere: "S", peakSunHours: 5.3 },
  { code: "CO", name: "Colombia",         hemisphere: "N", peakSunHours: 4.5 },
  { code: "PE", name: "Peru",             hemisphere: "S", peakSunHours: 5.5 },
];

const COUNTRY_BY_CODE: Record<string, CountryEntry> = COUNTRIES.reduce(
  (acc, c) => ({ ...acc, [c.code]: c }),
  {}
);

const COUNTRY_BY_NAME_LC: Record<string, CountryEntry> = COUNTRIES.reduce(
  (acc, c) => ({ ...acc, [c.name.toLowerCase()]: c }),
  {}
);

export function getCountryByCode(code: string): CountryEntry | undefined {
  return COUNTRY_BY_CODE[code];
}

export function getCountryByName(name: string): CountryEntry | undefined {
  return COUNTRY_BY_NAME_LC[name.trim().toLowerCase()];
}

type Range = {
  min: number;
  max: number;
  city: string;
  state: string;
  peakSunHours: number;
};

const AU_RANGES: Range[] = [
  { min: 800,  max: 899,  city: "Darwin",    state: "NT",  peakSunHours: 5.8 },
  { min: 1000, max: 2599, city: "Sydney",    state: "NSW", peakSunHours: 4.8 },
  { min: 2600, max: 2618, city: "Canberra",  state: "ACT", peakSunHours: 4.7 },
  { min: 2619, max: 2899, city: "Sydney",    state: "NSW", peakSunHours: 4.8 },
  { min: 2900, max: 2920, city: "Canberra",  state: "ACT", peakSunHours: 4.7 },
  { min: 2921, max: 2999, city: "Sydney",    state: "NSW", peakSunHours: 4.8 },
  { min: 3000, max: 3999, city: "Melbourne", state: "VIC", peakSunHours: 4.2 },
  { min: 8000, max: 8999, city: "Melbourne", state: "VIC", peakSunHours: 4.2 },
  { min: 4000, max: 4207, city: "Brisbane",  state: "QLD", peakSunHours: 5.1 },
  { min: 4208, max: 4299, city: "Gold Coast",state: "QLD", peakSunHours: 5.0 },
  { min: 4300, max: 4499, city: "Brisbane",  state: "QLD", peakSunHours: 5.1 },
  { min: 4500, max: 4699, city: "Sunshine Coast", state: "QLD", peakSunHours: 5.2 },
  { min: 4700, max: 4805, city: "Rockhampton",state: "QLD", peakSunHours: 5.5 },
  { min: 4806, max: 4830, city: "Townsville", state: "QLD", peakSunHours: 5.7 },
  { min: 4831, max: 4895, city: "Cairns",    state: "QLD", peakSunHours: 5.6 },
  { min: 9000, max: 9999, city: "Brisbane",  state: "QLD", peakSunHours: 5.1 },
  { min: 5000, max: 5999, city: "Adelaide",  state: "SA",  peakSunHours: 4.8 },
  { min: 6000, max: 6797, city: "Perth",     state: "WA",  peakSunHours: 5.4 },
  { min: 6798, max: 6799, city: "Christmas Island", state: "WA", peakSunHours: 5.6 },
  { min: 7000, max: 7999, city: "Hobart",    state: "TAS", peakSunHours: 3.9 },
];

const US_RANGES: Range[] = [
  { min:   501, max:  6999, city: "Boston",       state: "MA", peakSunHours: 4.1 },
  { min:  7000, max:  8999, city: "Newark",       state: "NJ", peakSunHours: 4.2 },
  { min:  9000, max:  9999, city: "APO/FPO",      state: "AE", peakSunHours: 4.5 },
  { min: 10000, max: 14999, city: "New York",     state: "NY", peakSunHours: 4.1 },
  { min: 15000, max: 19699, city: "Pittsburgh",   state: "PA", peakSunHours: 3.9 },
  { min: 19700, max: 19999, city: "Wilmington",   state: "DE", peakSunHours: 4.2 },
  { min: 20000, max: 20599, city: "Washington",   state: "DC", peakSunHours: 4.4 },
  { min: 20600, max: 21999, city: "Baltimore",    state: "MD", peakSunHours: 4.3 },
  { min: 22000, max: 24699, city: "Richmond",     state: "VA", peakSunHours: 4.5 },
  { min: 24700, max: 26999, city: "Charleston",   state: "WV", peakSunHours: 4.0 },
  { min: 27000, max: 28999, city: "Charlotte",    state: "NC", peakSunHours: 4.7 },
  { min: 29000, max: 29999, city: "Columbia",     state: "SC", peakSunHours: 4.8 },
  { min: 30000, max: 31999, city: "Atlanta",      state: "GA", peakSunHours: 4.7 },
  { min: 32000, max: 32999, city: "Jacksonville", state: "FL", peakSunHours: 5.1 },
  { min: 33000, max: 33999, city: "Miami",        state: "FL", peakSunHours: 5.3 },
  { min: 34000, max: 34999, city: "Fort Myers",   state: "FL", peakSunHours: 5.4 },
  { min: 35000, max: 36999, city: "Birmingham",   state: "AL", peakSunHours: 4.6 },
  { min: 37000, max: 38599, city: "Nashville",    state: "TN", peakSunHours: 4.5 },
  { min: 38600, max: 39999, city: "Jackson",      state: "MS", peakSunHours: 4.7 },
  { min: 40000, max: 42799, city: "Louisville",   state: "KY", peakSunHours: 4.3 },
  { min: 43000, max: 45999, city: "Columbus",     state: "OH", peakSunHours: 4.0 },
  { min: 46000, max: 47999, city: "Indianapolis", state: "IN", peakSunHours: 4.2 },
  { min: 48000, max: 49999, city: "Detroit",      state: "MI", peakSunHours: 3.9 },
  { min: 50000, max: 52899, city: "Des Moines",   state: "IA", peakSunHours: 4.4 },
  { min: 53000, max: 54999, city: "Milwaukee",    state: "WI", peakSunHours: 4.0 },
  { min: 55000, max: 56799, city: "Minneapolis",  state: "MN", peakSunHours: 4.2 },
  { min: 57000, max: 57999, city: "Sioux Falls",  state: "SD", peakSunHours: 4.6 },
  { min: 58000, max: 58999, city: "Fargo",        state: "ND", peakSunHours: 4.4 },
  { min: 59000, max: 59999, city: "Billings",     state: "MT", peakSunHours: 4.7 },
  { min: 60000, max: 62999, city: "Chicago",      state: "IL", peakSunHours: 4.2 },
  { min: 63000, max: 65999, city: "St. Louis",    state: "MO", peakSunHours: 4.7 },
  { min: 66000, max: 67999, city: "Wichita",      state: "KS", peakSunHours: 5.0 },
  { min: 68000, max: 69999, city: "Omaha",        state: "NE", peakSunHours: 4.7 },
  { min: 70000, max: 71499, city: "New Orleans",  state: "LA", peakSunHours: 4.9 },
  { min: 71600, max: 72999, city: "Little Rock",  state: "AR", peakSunHours: 4.7 },
  { min: 73000, max: 74999, city: "Oklahoma City",state: "OK", peakSunHours: 5.0 },
  { min: 75000, max: 76999, city: "Dallas",       state: "TX", peakSunHours: 5.2 },
  { min: 77000, max: 77999, city: "Houston",      state: "TX", peakSunHours: 4.9 },
  { min: 78000, max: 79999, city: "San Antonio",  state: "TX", peakSunHours: 5.3 },
  { min: 80000, max: 81999, city: "Denver",       state: "CO", peakSunHours: 5.5 },
  { min: 82000, max: 83199, city: "Cheyenne",     state: "WY", peakSunHours: 5.3 },
  { min: 83200, max: 83999, city: "Boise",        state: "ID", peakSunHours: 4.9 },
  { min: 84000, max: 84999, city: "Salt Lake City",state:"UT", peakSunHours: 5.3 },
  { min: 85000, max: 86599, city: "Phoenix",      state: "AZ", peakSunHours: 6.5 },
  { min: 87000, max: 88499, city: "Albuquerque",  state: "NM", peakSunHours: 6.0 },
  { min: 88900, max: 89999, city: "Las Vegas",    state: "NV", peakSunHours: 6.4 },
  { min: 90000, max: 93599, city: "Los Angeles",  state: "CA", peakSunHours: 5.6 },
  { min: 93600, max: 94299, city: "Fresno",       state: "CA", peakSunHours: 5.7 },
  { min: 94300, max: 95199, city: "San Francisco",state: "CA", peakSunHours: 5.0 },
  { min: 95200, max: 95999, city: "Sacramento",   state: "CA", peakSunHours: 5.4 },
  { min: 96700, max: 96899, city: "Honolulu",     state: "HI", peakSunHours: 5.6 },
  { min: 97000, max: 97999, city: "Portland",     state: "OR", peakSunHours: 3.9 },
  { min: 98000, max: 99499, city: "Seattle",      state: "WA", peakSunHours: 3.6 },
  { min: 99500, max: 99999, city: "Anchorage",    state: "AK", peakSunHours: 3.0 },
];

const RANGES_BY_COUNTRY: Record<string, Range[]> = {
  AU: AU_RANGES,
  US: US_RANGES,
};

function findRange(ranges: Range[], n: number): Range | null {
  for (const r of ranges) {
    if (n >= r.min && n <= r.max) return r;
  }
  return null;
}

/** Returns true if the postcode string matches the country's expected length. */
export function isValidPostcodeFormat(country: Country, postcode: string): boolean {
  const trimmed = postcode.trim();
  if (!/^\d+$/.test(trimmed)) return false;
  const entry = getCountryByCode(country);
  if (!entry?.postcodeLength) return false;
  return trimmed.length === entry.postcodeLength;
}

/**
 * Resolve a country + (optional) postcode into a usable LocationResult.
 *
 *   - For AU/US with a valid postcode → city/state-level data.
 *   - For any other country (or AU/US with no postcode) → country-level
 *     average peakSunHours and hemisphere; city/state remain blank.
 *   - Empty country → null.
 */
export function lookupLocation(country: Country, postcode: string): LocationResult | null {
  const entry = getCountryByCode(country);
  if (!entry) return null;

  const ranges = RANGES_BY_COUNTRY[entry.code];
  if (ranges && entry.postcodeLength) {
    const trimmed = postcode.trim();
    if (trimmed.length === entry.postcodeLength && /^\d+$/.test(trimmed)) {
      const match = findRange(ranges, Number(trimmed));
      if (match) {
        return {
          country: entry.code,
          countryName: entry.name,
          postcode: trimmed,
          city: match.city,
          state: match.state,
          hemisphere: entry.hemisphere,
          peakSunHours: match.peakSunHours,
        };
      }
    }
  }

  return {
    country: entry.code,
    countryName: entry.name,
    postcode: postcode.trim(),
    city: "",
    state: "",
    hemisphere: entry.hemisphere,
    peakSunHours: entry.peakSunHours,
  };
}

/** Fallback used when no country has been entered. Math still runs. */
export const FALLBACK_PEAK_SUN_HOURS = 5.0;
export const FALLBACK_HEMISPHERE: Hemisphere = "S";
