export const PRICE_INCREASE = 0.08;

/**
 * Annual panel output degradation as a fraction (0.007 = 0.7%/yr).
 *
 * Reverse-engineered from Resinc's published year-by-year cashflow:
 * their effective compounding rate of ~7.3%/yr implies degradation
 * of ~0.7% (since 1.08 × 0.993 ≈ 1.073). Tier-1 panel manufacturers
 * warrant 0.5–1.0%/yr; 0.7% is mid-range and matches Resinc.
 *
 * We bake this into the savings projection silently — exposing it as
 * a UI input invites a "wait, my panels degrade?" objection mid-quote,
 * and the customer doesn't need to see it to trust the headline numbers.
 *
 * Set to 0 if you want the optimistic no-degradation model.
 */
export const PANEL_DEGRADATION = 0.007;

/**
 * Real-world system loss factor as a fraction (0.015 = 1.5%).
 *
 * Applied to year-1 savings to account for soiling, cabling resistance,
 * inverter efficiency reserve, and other small system losses that aren't
 * captured by orientation × tilt derate. Reverse-engineered from Resinc:
 * for the same inputs, Resinc reports year-1 savings as 98.5% of the
 * raw self-use × peak + excess × FIT calculation — implying a uniform
 * 1.5% haircut on both self-use and export.
 *
 * The loss factor is baked into Y1 only; subsequent years compound from
 * the post-loss Y1 value, so the haircut propagates naturally without
 * compounding additionally.
 */
export const SYSTEM_LOSS_FACTOR = 0.015;

export const MONTH_WEIGHTS = [
  1.30, 1.13, 1.10, 0.86, 0.70, 0.65, 0.65, 0.86, 1.00, 1.13, 1.22, 1.34,
] as const;

export const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;
