# Methodology & Accuracy

A plain-English walkthrough of every number this calculator produces, where the underlying assumptions come from, and how to verify them against an independent source.

Intended audience: a solar business owner, accountant, or technically-curious customer who wants to confirm the tool is doing real maths — not running a hand-wavy sales script.

---

## TL;DR

- Every number in the tool is derived from the customer's own inputs (bill, system size, finance terms, location) plus a small set of published constants (peak sun hours, derate curves, electricity inflation, panel degradation).
- Output validated against **Resinc**'s published cashflow estimates — for a like-for-like quote (Sydney 2000, $4,000 annual bill, 23 × 440W system, 10-year loan at 6.29%) the tool's daily production, year-1 savings, year-1 payment, year-1 net cashflow, 25-year cumulative savings, and 25-year ROI all land within ~1% of Resinc's figures.
- Where the model genuinely differs from Resinc, the differences are documented below with the reasoning.

---

## 1. Section 1 — "The real cost of your power"

**What it shows:** the customer's electricity bill projected forward 25 years.

**Math:**

```
year_n_bill = annual_bill × (1.08)^(n − 1)
cumulative_25y_bill = sum of year_1_bill through year_25_bill
pre_tax_earnings_required = bill / (1 − tax_rate)
```

**Why 8%?**

The 8% annual electricity price increase is hardcoded based on two reference points:

1. **Industry forecasts.** Aurora Energy Research, AEMO ISP scenarios, and Bloomberg NEF all publish residential retail electricity price projections for Australia. Median forecast across these sources sits in the 6–10% nominal range over the next decade, depending on demand growth and grid investment scenarios.
2. **Historical record.** Australian residential electricity prices increased an average of ~7.5%/year from 2014–2024 (ABS 6401.0 Consumer Price Index, electricity component).

8% is a deliberately middle-of-the-road assumption between forecast and historical — neither maximally optimistic nor pessimistic.

**Why pre-tax earnings?**

If a customer is in the 30% marginal tax bracket and pays a $4,000 bill, they actually had to *earn* $5,714 before tax to pay that bill. The tool surfaces this number to make the real cost of power tangible to wage earners.

`pre_tax = bill / (1 − tax_rate)` — standard formula.

---

## 2. Section 2 — Solar production

**What it shows:** how many kWh per day the proposed system will produce.

**Math:**

```
array_kW   = panels_in_orientation × panel_watts ÷ 1000
daily_kWh  = array_kW × peak_sun_hours × (1 − orientation_derate(orientation, tilt)) × (1 − shading_derate)
```

Then summed across all 8 orientations.

### Peak sun hours (PSH)

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

For other countries, country-level annual averages are sourced from NASA POWER irradiance data. 45+ countries are supported with country-level resolution; AU and US have postcode-level resolution down to the city.

### Orientation × tilt derate curves

The "derate" is the percentage of theoretical maximum production lost because the panels aren't pointing perfectly at the sun. Calibrated to **Resinc's published derate values** at 100 panels × 440W = 44 kW.

Five orientations (N, S, E, NE, SE) have full curves anchored on 6 datapoints each, validated against Resinc:

| Orientation | 0° | 10° | 20° | 30° | 40° | 50° |
|---|---:|---:|---:|---:|---:|---:|
| N (optimal) | 25% | 20% | 16% | **15%** | 17% | 21% |
| S | **25%** | 30% | 37% | 46% | 56% | 64% |
| E | 25% | **24%** | 26% | 28% | 32% | 36% |
| NE | 25% | 20% | **18%** | **18%** | 20% | 23% |
| SE | 25% | **28%** | 33% | 39% | 45% | 52% |

(Bold = optimum tilt for that orientation.)

For tilts between published values, the tool linearly interpolates. For tilts outside the published range (e.g. 60°), it extrapolates using the nearest segment slope, capped at 95% derate.

W, NW, SW currently mirror E, NE, SE (a roof facing west is treated identically to one facing east). This is documented in the code as a known approximation; the published Resinc datapoints needed to break the mirror are the only outstanding calibration item.

### Hemisphere flip

For Northern Hemisphere customers, the optimal orientation is **South**, not North. The tool detects hemisphere from the country and internally swaps `N ↔ S`, `NE ↔ SE`, `NW ↔ SW` before looking up the derate. Same Resinc-calibrated curves; the labels just match the customer's local intuition.

### Year-1 savings

```
self_use_savings = self_use_kWh × 365 × peak_rate
excess_export_kWh = max(0, daily_production − self_use_kWh)
fit_earnings = excess_export_kWh × 365 × fit_rate
year_1_savings = self_use_savings + fit_earnings
```

Self-use is the kWh the home consumes from solar (directly or via battery). Anything produced above that is exported to the grid for the feed-in tariff. Both rates are user inputs taken from the customer's bill.

---

## 3. Section 3 — Investment breakdown

**What it shows:** the all-in price the customer pays for the system.

**Math:**

```
system_value = sum of all line items entered
solar_stc_deduction = solar_stc_count × solar_stc_price
battery_stc_deduction = battery_stc_count × battery_stc_price
investment = system_value − solar_stc_deduction − battery_stc_deduction − discount
```

Line items are user-editable: the sales rep can rename them, add new ones, or remove them per customer. STCs (Small-scale Technology Certificates) are the federal government solar rebate, deducted directly from the install price at the point of sale.

---

## 4. Section 4 — 25-year savings story

**What it shows:** year-by-year cashflow over 25 years, with a payback year and total ROI.

### Loan amortisation

Standard monthly-compounded amortisation (the same formula every Australian home loan and Resinc spreadsheet uses):

```
loan_principal = max(0, investment − deposit + setup_fee)
monthly_rate = annual_interest_rate ÷ 12
months = loan_term × 12
monthly_payment = principal × (r × (1 + r)^n) ÷ ((1 + r)^n − 1)
annual_payment = monthly_payment × 12 + monthly_loan_fee × 12
```

The setup fee is rolled into the loan principal so it amortises over the term — this matches how Resinc reports cashflow. Cash purchases (loan term = 0) ignore setup fee, monthly fee, and amortisation entirely; the cashflow shows pure savings.

### Year-on-year savings

```
year_n_savings = year_1_savings × ((1 + 0.08) × (1 − 0.009))^(n − 1)
              ≈ year_1_savings × 1.0707^(n − 1)
```

Two compounding factors apply each year:

1. **+8% electricity inflation** (Section 1 assumption).
2. **−0.9% panel output degradation.** Tier-1 panel manufacturers warrant 0.5–1.0%/yr; 0.9% is the published Resinc assumption. Combined with inflation, savings grow at a net ~7.07%/yr.

This is the Resinc convention. Removing degradation (setting it to 0%) gives an "optimistic" 8%/yr growth model that overstates 25-year cumulative savings by ~25%.

### Payback year

The year cumulative solar savings first equal or exceed the upfront investment. After that, every additional dollar of savings is pure return on the original capital.

### ROI

Two flavours:

- **Per-year ROI** (in the cashflow table) = `annual_savings / investment × 100`. Resinc convention. Always positive; trends up slightly each year as savings compound.
- **Total ROI** (in the summary header) = `cumulative_savings_to_year_N / investment × 100`. Grows from ~9% at year 1 to ~530% by year 25 on a typical Australian quote.

### Cashflow positive from day one

Triggered when year-1 savings exceed year-1 loan repayments + monthly fees. Means the customer is net cash-positive immediately — savings cover the loan with money left over from year one. Not all systems will trigger this; it depends on system size, finance terms, and electricity rates.

---

## 5. Final comparison

```
without_solar = −cumulative_25_year_bill          (cash out, no offset)
with_solar    = without_solar + cashflow_total    (bills offset by savings, less repayments)
lifetime_difference = cashflow_total              (the delta solar creates)
```

This is the single most important number for the customer: how much money they end up with at year 25, with vs without solar.

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

These are honest omissions. None of them invalidate the headline numbers, but they're worth knowing if a customer pushes hard on edge cases.

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
