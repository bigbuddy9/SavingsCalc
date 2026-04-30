export const PRICE_INCREASE = 0.08;

/**
 * Annual panel output degradation as a fraction (0.009 = 0.9%/yr).
 *
 * Tier-1 panel manufacturers warrant 0.5–1.0%/yr; Resinc's published
 * cashflows compound at ~7%/yr net of degradation, which works out to
 * roughly 0.9%/yr on top of an 8% inflation assumption. We bake this into
 * the savings projection silently — exposing it as a UI input invites a
 * "wait, my panels degrade?" objection mid-quote, and the customer doesn't
 * need to see it to trust the headline numbers.
 *
 * Set to 0 if you want the optimistic no-degradation model.
 */
export const PANEL_DEGRADATION = 0.009;

export const MONTH_WEIGHTS = [
  1.30, 1.13, 1.10, 0.86, 0.70, 0.65, 0.65, 0.86, 1.00, 1.13, 1.22, 1.34,
] as const;

export const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;
