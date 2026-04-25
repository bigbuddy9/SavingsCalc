# Solar Production Logic

How this calculator turns the user's roof inputs into daily kWh, annual kWh, and Year-1 savings. All numbers are calibrated against Resinc's published outputs.

---

## 1. Per-orientation production formula

For each of the 8 roof orientations independently:

```
array_kW   = panels_in_orientation × panel_watts ÷ 1000
daily_kWh  = array_kW
           × peak_sun_hours
           × (1 − derate(orientation, tilt))
           × (1 − shading)
```

Then sum across all 8 orientations:

```
total_daily_kWh   = Σ daily_kWh per orientation
total_annual_kWh  = total_daily_kWh × 365
weighted_derate   = Σ (derate × panels) ÷ total_panels
```

## 2. Constants

| Symbol | Value | Notes |
|---|---|---|
| `peak_sun_hours` | **5.1 h/day** | Hardcoded. Reverse-engineered from Resinc datapoints. |
| `shading` | 0..1 | User input (Section 2). Default 0%. |

## 3. Derate lookup tables

The "derate" is the percentage of theoretical output lost due to orientation × tilt mismatch. Calibrated to Resinc.

### North (validated — 6 datapoints)

| Tilt | Derate |
|---:|---:|
| 0°  | 25% |
| 10° | 20% |
| 20° | 16% |
| 30° | **15%** ← optimum |
| 40° | 17% |
| 50° | 21% |

### South (validated — 5 datapoints + 0° rule)

| Tilt | Derate |
|---:|---:|
| 0°  | **25%** ← optimum |
| 10° | 30% |
| 20° | 37% |
| 30° | 46% |
| 40° | 56% |
| 50° | 64% |

### East (validated — 5 datapoints + 0° rule)

| Tilt | Derate |
|---:|---:|
| 0°  | 25% |
| 10° | **24%** ← optimum |
| 20° | 26% |
| 30° | 28% |
| 40° | 32% |
| 50° | 36% |

### NE / SE (anchored only — awaiting full curves)

| Tilt | NE derate | SE derate |
|---:|---:|---:|
| 0°  | 25% | 25% |
| 30° | 18% | 39% |

For tilts other than 0° and 30°, NE and SE inherit the **shape** of North's tilt curve — that is, the relative additional derate from being X degrees off the orientation's optimum is taken from N's known curve. This is replaced by direct datapoints once Resinc screenshots arrive.

### Mirror rule

| Orientation | Behaves identically to |
|---|---|
| West (W)         | East (E) |
| North-West (NW)  | North-East (NE) |
| South-West (SW)  | South-East (SE) |

## 4. Universal rules

### Flat-panel rule (0° tilt)

A panel lying flat on the roof doesn't care which way the roof faces. So every orientation's derate at 0° tilt = **25%**. Confirmed against Resinc for N, S, E.

### Interpolation

For tilts **between** known datapoints: linear interpolation.
For tilts **outside** the table (e.g. 60°): linear extrapolation using the slope of the nearest segment, capped at 95% derate.

## 5. Year-1 savings

Section 2 derives the user's first-year solar savings, which then flows into Section 4's loan cashflow.

```
self_use_savings  = self_use_kWh × 365 × peak_rate
excess_export_kWh = max(0, daily_production − self_use_kWh)
fit_earnings      = excess_export_kWh × 365 × fit_rate
year_1_savings    = self_use_savings + fit_earnings
```

| Field | Source | Notes |
|---|---|---|
| `self_use_kWh` | User input (Section 2) | Daily kWh of solar consumed by the home (incl. via battery). |
| `peak_rate` | User input (Section 2) | $/kWh from grid. |
| `fit_rate` | User input (Section 2) | Feed-in tariff $/kWh. |

Each subsequent year's savings compounds at the same rate as Section 1's electricity-price assumption (8%/year by default).

## 6. Section 1 reference (for completeness)

```
year_n_cost      = annual_bill × (1 + 0.08)^(n − 1)
year_n_pretax    = year_n_cost × 1 ÷ (1 − tax_rate)
cumulative_25y   = Σ year_n_cost  for n = 1..25
```

## 7. Section 4 reference

```
monthly_rate     = annual_rate ÷ 12
months           = loan_term_years × 12
annual_repayment = principal × (r × (1 + r)^n) ÷ ((1 + r)^n − 1) × 12
year_n_savings   = year_1_savings × (1 + 0.08)^(n − 1)
year_n_payment   = annual_repayment   if n ≤ loan_term  else 0
year_n_net       = year_n_savings − year_n_payment
break_even_year  = first n where year_n_net > 0
```

## 8. Open questions / TODO

- Get full Resinc curves for **NE** and **SE** (currently anchored at 0° and 30° only).
- Confirm `peak_sun_hours = 5.1` for non-Brisbane latitudes (Sydney, Melbourne, Perth may differ).

## 9. Where this lives in code

| Concept | File |
|---|---|
| Derate lookups + interpolation | `src/lib/solar.ts` |
| Daily/annual production hook | `src/hooks/useSystemCalc.ts` |
| Year-1 savings | `src/hooks/useSystemCalc.ts` (within the same hook) |
| Real-cost compounding | `src/hooks/useRealCostCalc.ts` |
| Loan amortization + cashflow | `src/hooks/useCashflowCalc.ts` |
| All inputs | `src/state/CalculatorContext.tsx` |
| Parity tests | `src/__tests__/calc.test.ts` |
