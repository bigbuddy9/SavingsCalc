# Methodology & Accuracy

A plain-English walkthrough of every number this calculator produces, where the underlying assumptions come from, and how to verify them against an independent source.

Intended audience: a solar business owner, accountant, or technically-curious customer who wants to confirm the tool is doing real maths — not running a hand-wavy sales script.

---

## TL;DR

- Every number in the tool is derived from the customer's own inputs (bill, system size, finance terms, location) plus a small set of published constants (peak sun hours, derate curves, electricity inflation, panel degradation).
- Output is validated against **Resinc**'s published cashflow estimates — for a like-for-like quote (Sydney 2000, $4,000 annual bill, 23 × 440W system, 10-year loan at 6.29%) the tool's daily production, year-1 savings, year-1 payment, year-1 net cashflow, 25-year cumulative savings, and 25-year ROI all land within ~1% of Resinc's figures.
- Where the model differs from Resinc, the differences are documented below with the reasoning.

---

## 1. Section 1 — "The real cost of your power"

**What it shows:** the customer's electricity bill projected forward 25 years.

**Math:**

```
year_n_bill           = annual_bill × (1.08)^(n − 1)
cumulative_25y_bill   = Σ year_n_bill  for n = 1..25
pre_tax_earnings      = bill ÷ (1 − tax_rate)
```

### Why 8%?

The 8% annual electricity price increase is hardcoded based on two reference points:

1. **Industry forecasts.** Aurora Energy Research, AEMO ISP scenarios, and Bloomberg NEF all publish residential retail electricity price projections for Australia. Median forecast across these sources sits in the 6–10% nominal range over the next decade, depending on demand growth and grid investment scenarios.
2. **Historical record.** Australian residential electricity prices increased an average of ~7.5%/year from 2014–2024 (ABS 6401.0 Consumer Price Index, electricity component).

8% is a deliberately middle-of-the-road assumption between forecast and historical — neither maximally optimistic nor pessimistic.

### Why pre-tax earnings?

If a customer is in the 30% marginal tax bracket and pays a $4,000 bill, they actually had to *earn* $5,714 before tax to pay that bill. The tool surfaces this number to make the real cost of power tangible to wage earners.

`pre_tax = bill ÷ (1 − tax_rate)` — standard formula. (Edge case: a 100% tax rate is clamped to a 1× multiplier to avoid divide-by-zero.)

---

## 2. Section 2 — Solar production

**What it shows:** how many kWh per day the proposed system will produce, and the dollar value of those kWh in year 1.

### 2.1 Per-orientation production formula

For each of the 8 roof orientations independently:

```
array_kW   = panels_in_orientation × panel_watts ÷ 1000
daily_kWh  = array_kW
           × peak_sun_hours
           × (1 − orientation_derate(orientation, tilt))
           × (1 − shading_derate)
```

Then summed across all 8 orientations:

```
total_daily_kWh   = Σ daily_kWh per orientation
total_annual_kWh  = total_daily_kWh × 365
weighted_derate   = Σ (derate × panels) ÷ total_panels
```

### 2.2 Peak sun hours (PSH)

Published by the Bureau of Meteorology (Australia) and NREL National Solar Radiation Database (USA). Annual daily averages used in the tool:

| City | PSH |
|---|---:|
| Darwin | 5.8 |
| Cairns | 5.6 |
| Townsville | 5.7 |
| Perth | 5.4 |
| Brisbane | 5.1 |
| Sydney | 5.1 |
| Adelaide | 5.0 |
| Canberra | 4.9 |
| Melbourne | 4.5 |
| Hobart | 4.0 |

For other countries, country-level annual averages are sourced from NASA POWER irradiance data. 45+ countries are supported; AU and US have postcode-level resolution down to the city.

### 2.3 Orientation × tilt derate curves

The "derate" is the percentage of theoretical maximum production lost because the panels aren't pointing perfectly at the sun. Calibrated to **Resinc's published derate values** at 100 panels × 440W = 44 kW.

Five orientations have full curves anchored on 6 datapoints each, validated against Resinc:

#### North (validated — 6 datapoints)

| Tilt | Derate |
|---:|---:|
| 0°  | 25% |
| 10° | 20% |
| 20° | 16% |
| 30° | **15%** ← optimum |
| 40° | 17% |
| 50° | 21% |

#### South (validated — 5 datapoints + 0° rule)

| Tilt | Derate |
|---:|---:|
| 0°  | **25%** ← optimum |
| 10° | 30% |
| 20° | 37% |
| 30° | 46% |
| 40° | 56% |
| 50° | 64% |

#### East (validated — 5 datapoints + 0° rule)

| Tilt | Derate |
|---:|---:|
| 0°  | 25% |
| 10° | **24%** ← optimum |
| 20° | 26% |
| 30° | 28% |
| 40° | 32% |
| 50° | 36% |

#### NE (validated — 5 datapoints + 0° rule)

| Tilt | Derate |
|---:|---:|
| 0°  | 25% |
| 10° | 20% |
| 20° | **18%** ← optimum |
| 30° | **18%** ← optimum (flat from 20° to 30°) |
| 40° | 20% |
| 50° | 23% |

#### SE (validated — 5 datapoints + 0° rule)

| Tilt | Derate |
|---:|---:|
| 0°  | 25% |
| 10° | **28%** ← optimum |
| 20° | 33% |
| 30° | 39% |
| 40° | 45% |
| 50° | 52% |

### 2.4 Universal derate rules

**Flat-panel rule (0° tilt).** A panel lying flat on the roof doesn't care which way the roof faces. Every orientation's derate at 0° tilt = **25%**. Confirmed against Resinc for N, S, E.

**Interpolation.** For tilts between published values, the tool linearly interpolates. For tilts outside the table (e.g. 60°), it linearly extrapolates using the slope of the nearest segment, capped at 95% derate.

**Western orientations are flat curves.** W, NW, and SW use a single tilt-independent derate value in Resinc — the derate doesn't change with tilt. They're also slightly worse than their eastern counterparts because panels run hotter in the afternoon (the "afternoon thermal penalty"), reducing efficiency.

| Orientation | Resinc derate (flat across all tilts) | Vs. east counterpart |
|---|---:|---|
| W  | 30% | E @ 30° = 28% (+2pp) |
| NW | 19% | NE @ 30° = 18% (+1pp) |
| SW | 40% | SE @ 30° = 39% (+1pp) |

These were validated against Resinc at 100 panels × 440W (44 kW) at 30° tilt.

### 2.5 Hemisphere flip

Curves are calibrated for Australia, where **North** faces the sun. In the northern hemisphere (USA, etc.) **South** faces the sun. So when `hemisphere === "N"`, the orientation is flipped before lookup:

| User picks | Looks up the curve for |
|---|---|
| N  | S |
| S  | N |
| NE | SE |
| SE | NE |
| NW | SW |
| SW | NW |
| E  | E (unchanged — symmetrical) |
| W  | W (unchanged — symmetrical) |

A Phoenix homeowner picking "South" gets the same physics as a Brisbane homeowner picking "North". One set of curves, both hemispheres.

### 2.6 Year-1 savings

```
self_use_savings   = self_use_kWh × 365 × peak_rate
excess_export_kWh  = max(0, daily_production − self_use_kWh)
fit_earnings       = excess_export_kWh × 365 × fit_rate
year_1_savings     = self_use_savings + fit_earnings
```

| Field | Source | Notes |
|---|---|---|
| `self_use_kWh` | User input | Daily kWh of solar consumed by the home (incl. via battery). |
| `peak_rate`    | User input | $/kWh from grid. |
| `fit_rate`     | User input | Feed-in tariff $/kWh. |

Self-use is the kWh the home consumes from solar (directly or via battery). Anything produced above that is exported to the grid for the feed-in tariff. Both rates come from the customer's bill.

---

## 3. Section 3 — Investment breakdown

**What it shows:** the all-in price the customer pays for the system.

**Math:**

```
system_value           = sum of all line items entered
solar_stc_deduction    = solar_stc_count × solar_stc_price
battery_stc_deduction  = battery_stc_count × battery_stc_price
investment             = system_value − solar_stc_deduction − battery_stc_deduction − discount
```

Line items are user-editable: the sales rep can rename them, add new ones, or remove them per customer. STCs (Small-scale Technology Certificates) are the federal government solar rebate, deducted directly from the install price at the point of sale.

---

## 4. Section 4 — 25-year savings story

**What it shows:** year-by-year cashflow over 25 years, with a payback year and total ROI.

### 4.1 Loan amortisation

Standard monthly-compounded amortisation (the same formula every Australian home loan and Resinc spreadsheet uses):

```
loan_principal   = max(0, investment − deposit + setup_fee)
monthly_rate     = annual_interest_rate ÷ 12
months           = loan_term × 12
monthly_payment  = principal × (r × (1 + r)^n) ÷ ((1 + r)^n − 1)
annual_payment   = monthly_payment × 12 + monthly_loan_fee × 12
```

The setup fee is rolled into the loan principal so it amortises over the term — this matches how Resinc reports cashflow. Cash purchases (loan term = 0) ignore setup fee, monthly fee, and amortisation entirely; the cashflow shows pure savings.

Edge cases handled:
- 0% interest rate → simple division `principal ÷ years` (the amortisation formula divides by zero otherwise).
- 0 or negative principal → annual payment = 0.

### 4.2 Year-on-year savings — split compounding (Resinc convention)

Year-1 savings split into **two components** that compound differently:

```
self_use_year_n = self_use_y1 × ((1 + 0.08) × (1 − 0.009))^(n − 1)
               ≈ self_use_y1 × 1.0707^(n − 1)
export_year_n  = export_y1   (FLAT — no inflation, no degradation)
year_n_savings = self_use_year_n + export_year_n
```

**Why split?** Reverse-engineering Resinc's published year-by-year cashflow shows they treat the two streams differently — and so should we:

1. **Self-use savings** rise with grid prices. Compound at +8% electricity inflation × −0.9% panel output degradation = ~7.07%/yr net.
2. **Export earnings** stay flat. The feed-in tariff is a fixed retailer rate that does not inflate in practice; Resinc treats the export $/yr as a constant across all 25 years.

Validated against a Resinc reference quote with 38% export-heavy savings: split model lands Y1–Y15 within 1–2% of Resinc. The pre-split lumped-compounding model overshot by 25–30% in low-self-use scenarios because it inflated export earnings as if FIT grew at 8%/yr.

Constants (`PRICE_INCREASE = 0.08`, `PANEL_DEGRADATION = 0.009`) live in `src/lib/constants.ts`.

### 4.3 Payback year

The year cumulative solar savings first equal or exceed the upfront investment. After that, every additional dollar of savings is pure return on the original capital.

### 4.4 ROI

Two flavours:

- **Per-year ROI** (in the cashflow table) = `annual_savings ÷ investment × 100`. Resinc convention. Always positive; trends up slightly each year as savings compound.
- **Total ROI** (in the summary header) = `cumulative_savings_to_year_N ÷ investment × 100`. Grows from ~9% at year 1 to ~530% by year 25 on a typical Australian quote.

### 4.5 Cashflow positive from day one

Triggered when year-1 savings exceed year-1 loan repayments + monthly fees. Means the customer is net cash-positive immediately — savings cover the loan with money left over from year one. Not all systems trigger this; it depends on system size, finance terms, and electricity rates.

---

## 5. Final comparison

The chart contrasts two diverging scenarios from $0:

```
without_solar (red, below zero)  = −cumulative_25y_bill
with_solar    (green, above zero) = +cumulative_solar_savings
```

The headline swing — `Total 25-year solar savings` — is the gross cumulative savings the system produces over 25 years (`cumSavings25`). This is the same number reported next to "25 years" in the ROI Summary card.

Two interpretations matter, and the calculator surfaces both:

- **Gross 25-year savings (the swing):** the total dollars the solar system generates in offset bills + feed-in earnings, before any system costs are subtracted. This is what the customer "earns" from the panels.
- **Net 25-year position (the cashflow table):** gross savings minus loan repayments and fees. This is what's left in the customer's pocket after paying for the system. For cash purchases, gross ≈ net (the only subtraction is the upfront investment, recovered at the payback year). For long-term financed systems, net is meaningfully smaller because interest and fees compound.

---

## 6. Assumptions used (full list)

| Assumption | Value | Source |
|---|---|---|
| Electricity price inflation | 8.0%/year | AEMO / Aurora forecasts + ABS historical |
| Panel output degradation | 0.9%/year | Tier-1 warranty average; matches Resinc |
| Peak sun hours | Per-city table | BoM (AU) / NREL (US) / NASA POWER (other) |
| Orientation × tilt derates | Per-orientation curves | Calibrated to Resinc published data |
| Days per year | 365 | Standard |
| Loan compounding | Monthly | Standard amortisation |
| Hemisphere | Auto-detected from country | ISO country code |

All other figures (bill, system size, panel wattage, tilt, shading, self-use, peak rate, feed-in tariff, deposit, setup fee, monthly fee, interest rate, loan term, investment line items, STCs, discount) are **customer-specific inputs** entered by the sales rep — the tool doesn't assume them.

---

## 7. What this tool does NOT model

Honest list of limitations, in case anyone asks:

- **Battery sizing** is not modelled. STCs for batteries are in the pricing breakdown but the calculator doesn't independently estimate self-use uplift from a battery — the sales rep enters self-use as a single daily kWh number based on their own battery sizing math.
- **Time-of-use tariffs.** The tool uses a single average rate, not separate peak/shoulder/off-peak rates. The user's bill summary is averaged into one $/kWh number.
- **Inverter clipping** at high-irradiance moments. Real systems with undersized inverters will clip a few percent off peak production. Not modelled.
- **Seasonal export rate changes** (e.g. dynamic FIT). One feed-in tariff value is used year-round.
- **Insurance, maintenance, inverter replacement costs** are not deducted from cashflow. A typical inverter lasts 10–15 years and costs $1,500–3,000 to replace; this is a real cost the model omits.
- **Soiling / dust accumulation.** Not separately modelled (some of it is captured implicitly in the calibrated derate values).
- **Property-value uplift** from solar installation. Not modelled — the tool only counts direct electricity savings.

These are honest omissions. None invalidate the headline numbers, but they're worth knowing if a customer pushes hard on edge cases.

---

## 8. How to validate it yourself

1. Pick a Resinc (or any other industry-standard tool) quote for a real customer — same bill, same system, same finance terms.
2. Enter the same inputs into this calculator.
3. Compare these six numbers:
   - Daily production (kWh)
   - Year-1 savings ($)
   - Year-1 annual payment ($)
   - 10-year cumulative savings ($)
   - 25-year cumulative savings ($)
   - 25-year total ROI (%)

For a reference scenario tested during development (Sydney 2000, $4,000 bill, 23 × 440W North-30°, 10-year loan @ 6.29%, $0 deposit, $395 setup, $10/mo fee, 30 kWh self-use, $0.37 peak, $0.05 FIT), all six numbers land within ~1% of Resinc's published values.

If you find a scenario where the numbers disagree by more than 5%, that's worth flagging — the calculator is built to be auditable, not a black box.

---

## 9. Where the logic lives in code

| Concept | File |
|---|---|
| Constants (8% inflation, 0.9% degradation, month weights) | `src/lib/constants.ts` |
| Derate lookups + interpolation + hemisphere flip | `src/lib/solar.ts` |
| Postcode → city / hemisphere / sun-hours | `src/lib/location.ts` |
| Daily/annual production + Year-1 savings | `src/hooks/useSystemCalc.ts` |
| Real-cost compounding (Section 1) | `src/hooks/useRealCostCalc.ts` |
| Investment breakdown (Section 3) | `src/hooks/usePricingCalc.ts` |
| Loan amortisation + 25-year cashflow | `src/hooks/useCashflowCalc.ts` |
| All inputs (incl. country + postcode) | `src/state/CalculatorContext.tsx` |
| Country/postcode UI | `src/components/sections/Section2System/LocationPicker.tsx` |
| Parity tests | `src/__tests__/calc.test.ts` |

---

## 10. Open questions / TODO

- Confirm `peak_sun_hours` table values (`src/lib/location.ts`) against Resinc / installer-published numbers for non-Brisbane Aus capitals.
- Add Canada, NZ, UK to the country dropdown when needed (lookup table + `POSTCODE_LENGTH` entry).
