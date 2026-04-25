import { useCalculator } from "@/state/CalculatorContext";
import {
  COUNTRY_LABEL,
  POSTCODE_LABEL,
  POSTCODE_LENGTH,
  isValidPostcodeFormat,
  lookupLocation,
  type Country,
} from "@/lib/location";

const COUNTRIES: Country[] = ["AU", "US"];

export function LocationPicker() {
  const { inputs, setInput, setCountry, location } = useCalculator();
  const { country, postcode } = inputs;

  const trimmed = postcode.trim();
  const formatOk = isValidPostcodeFormat(country, trimmed);
  const lookupOk = formatOk && lookupLocation(country, trimmed) !== null;
  const expectedLen = POSTCODE_LENGTH[country];

  let status: { tone: "ok" | "warn" | "muted"; text: string };
  if (trimmed === "") {
    status = { tone: "muted", text: `Enter your ${POSTCODE_LABEL[country].toLowerCase()} for accurate sun-hours.` };
  } else if (!formatOk) {
    status = {
      tone: "warn",
      text: `${POSTCODE_LABEL[country]}s are ${expectedLen} digits.`,
    };
  } else if (!lookupOk) {
    status = { tone: "warn", text: "Postcode not recognised — using default sun-hours." };
  } else {
    status = {
      tone: "ok",
      text: `${location.city}, ${location.state} — ${location.peakSunHours.toFixed(1)} sun hours/day · ${
        location.hemisphere === "S" ? "Southern" : "Northern"
      } hemisphere`,
    };
  }

  const statusColor =
    status.tone === "ok"
      ? "text-gain"
      : status.tone === "warn"
      ? "text-loss"
      : "text-ink-muted";

  return (
    <div className="rounded-2xl border border-line bg-surface p-6 md:p-7 shadow-card">
      <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
        Your location
      </h4>
      <p className="mt-1 text-[12.5px] text-ink-muted">
        Sets the hemisphere (which way's optimal) and your local sun hours.
      </p>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-5">
        <label className="block">
          <span className="block text-[13px] font-semibold text-ink mb-2">Country</span>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value as Country)}
            aria-label="Country"
            className="w-full rounded-lg bg-edit/50 hover:bg-edit border border-line px-3 py-2.5 text-base font-semibold text-ink focus:outline-none focus:bg-edit focus:border-edit-ring focus:ring-4 focus:ring-edit-ring/30 transition-all"
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {COUNTRY_LABEL[c]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="block text-[13px] font-semibold text-ink mb-2">
            {POSTCODE_LABEL[country]}
          </span>
          <input
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={expectedLen}
            value={postcode}
            onChange={(e) => setInput("postcode", e.target.value.replace(/\D/g, "").slice(0, expectedLen))}
            placeholder={country === "AU" ? "4155" : "90210"}
            aria-label={POSTCODE_LABEL[country]}
            className="w-full rounded-lg bg-edit/50 hover:bg-edit border border-line px-3 py-2.5 text-base font-semibold tabular-nums text-ink focus:outline-none focus:bg-edit focus:border-edit-ring focus:ring-4 focus:ring-edit-ring/30 transition-all placeholder:text-ink-faint placeholder:font-normal"
          />
        </label>
      </div>

      <div className={`mt-4 text-[13px] font-medium ${statusColor}`}>{status.text}</div>
    </div>
  );
}
