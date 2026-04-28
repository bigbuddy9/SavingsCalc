import { useEffect, useState } from "react";
import { useCalculator } from "@/state/CalculatorContext";
import {
  COUNTRIES,
  getCountryByCode,
  getCountryByName,
  isValidPostcodeFormat,
  lookupLocation,
} from "@/lib/location";

export function LocationPicker() {
  const { inputs, setInput, setCountry } = useCalculator();
  const { country, postcode } = inputs;

  const entry = getCountryByCode(country);
  const supportsPostcode = !!entry?.postcodeLength;
  const expectedLen = entry?.postcodeLength ?? 0;

  // Local input state for the country textbox so we can show what the user is
  // typing while we wait for an exact match.
  const [countryDraft, setCountryDraft] = useState<string>(entry?.name ?? "");
  useEffect(() => {
    setCountryDraft(entry?.name ?? "");
  }, [entry?.name]);

  function handleCountryChange(raw: string) {
    setCountryDraft(raw);
    const match = getCountryByName(raw);
    if (match) {
      setCountry(match.code);
    } else if (raw.trim() === "") {
      setCountry("");
    }
  }

  // Status banner under the inputs.
  let status: { tone: "ok" | "warn" | "muted"; text: string };
  if (!entry) {
    status = countryDraft.trim() === ""
      ? { tone: "muted", text: "Pick a country to use accurate sun-hours for your area." }
      : { tone: "warn", text: "Country not recognised — pick from the list." };
  } else if (supportsPostcode) {
    const trimmed = postcode.trim();
    if (trimmed === "") {
      status = {
        tone: "muted",
        text: `Add your ${expectedLen}-digit postcode for city-level accuracy. Using the country average for now (${entry.peakSunHours.toFixed(1)} sun hrs/day).`,
      };
    } else if (!isValidPostcodeFormat(country, trimmed)) {
      status = { tone: "warn", text: `Postcode should be ${expectedLen} digits.` };
    } else {
      const resolved = lookupLocation(country, trimmed);
      if (resolved && resolved.city) {
        status = {
          tone: "ok",
          text: `${resolved.city}, ${resolved.state} — ${resolved.peakSunHours.toFixed(1)} sun hrs/day · ${resolved.hemisphere === "S" ? "Southern" : "Northern"} hemisphere.`,
        };
      } else {
        status = { tone: "warn", text: "Postcode out of range — using country average." };
      }
    }
  } else {
    // Country has no postcode lookup: show country-level info only.
    status = {
      tone: "ok",
      text: `${entry.name} — ${entry.peakSunHours.toFixed(1)} sun hrs/day · ${entry.hemisphere === "S" ? "Southern" : "Northern"} hemisphere.`,
    };
  }

  const statusColor =
    status.tone === "ok" ? "text-gain"
    : status.tone === "warn" ? "text-pain"
    : "text-ink-muted";

  return (
    <div className="rounded-2xl border border-line bg-surface p-6 md:p-7 shadow-card">
      <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
        Your location
      </h4>
      <p className="mt-1 text-[12.5px] text-ink-muted">
        Sets the hemisphere and your local sun hours. Australia and the US support postcode-level accuracy.
      </p>

      <div
        className={`mt-5 grid gap-5 ${supportsPostcode ? "grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" : "grid-cols-1"}`}
      >
        <label className="block">
          <span className="block text-[13px] font-semibold text-ink mb-2">Country</span>
          <input
            type="text"
            list="country-list"
            value={countryDraft}
            onChange={(e) => handleCountryChange(e.target.value)}
            placeholder="Start typing… (e.g. Australia)"
            aria-label="Country"
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-lg bg-edit/50 hover:bg-edit border border-line px-3 py-2.5 text-base font-semibold text-ink focus:outline-none focus:bg-edit focus:border-edit-ring focus:ring-4 focus:ring-edit-ring/30 transition-all placeholder:text-ink-faint placeholder:font-normal"
          />
          <datalist id="country-list">
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.name} />
            ))}
          </datalist>
        </label>

        {supportsPostcode && (
          <label className="block">
            <span className="block text-[13px] font-semibold text-ink mb-2">
              {country === "US" ? "ZIP code" : "Postcode"}
            </span>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength={expectedLen}
              value={postcode}
              onChange={(e) =>
                setInput("postcode", e.target.value.replace(/\D/g, "").slice(0, expectedLen))
              }
              placeholder={country === "AU" ? "2000" : "90210"}
              aria-label={country === "US" ? "ZIP code" : "Postcode"}
              className="w-full rounded-lg bg-edit/50 hover:bg-edit border border-line px-3 py-2.5 text-base font-semibold tabular-nums text-ink focus:outline-none focus:bg-edit focus:border-edit-ring focus:ring-4 focus:ring-edit-ring/30 transition-all placeholder:text-ink-faint placeholder:font-normal"
            />
          </label>
        )}
      </div>

      <div className={`mt-4 text-[13px] font-medium ${statusColor}`}>{status.text}</div>
    </div>
  );
}
