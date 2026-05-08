import { describe, expect, it } from "vitest";
import { calculateLoanPayment } from "@/hooks/useCashflowCalc";
import { calculateSolarProduction } from "@/lib/solar";
import { lookupLocation } from "@/lib/location";
import { PRICE_INCREASE, PANEL_DEGRADATION, SYSTEM_LOSS_FACTOR } from "@/lib/constants";

/**
 * End-to-end Resinc parity harness.
 *
 * This file runs the reference scenario from METHODOLOGY.md (§8) through the
 * real calculation code and prints every number you'd verify in Resinc.
 *
 * To verify a different scenario:
 *   1. Edit the SCENARIO block below
 *   2. Run `npm test`
 *   3. Compare the printed table against Resinc's quote
 *
 * Tolerances: Resinc rounds to whole dollars and dKwh, so anything inside
 * ±1% is considered parity. Anything outside ±5% is a real divergence.
 */

const SCENARIO = {
  label: "Scenario 2 — Sydney 2000 / $3,500 bill / 20 × 440W all-N@30° / 10yr loan @ 6.29%",
  annualBill: 3500,
  taxRatePercent: 30,
  country: "AU" as const,
  postcode: "2000",
  panelsByOrientation: { N: 20, NE: 0, E: 0, SE: 0, S: 0, SW: 0, W: 0, NW: 0 },
  tiltByOrientation: { N: 30, NE: 30, E: 30, SE: 30, S: 30, SW: 30, W: 30, NW: 30 },
  panelWattage: 440,
  shadingDeratePct: 0,
  selfUseDailyKwh: 18,
  peakRatePerKwh: 0.32,
  fitRatePerKwh: 0.07,
  investment: 14000,
  loanTermYears: 10,
  interestRatePercent: 6.29,
  deposit: 0,
  setupFee: 395,
  monthlyFee: 10,
};

function fmtMoney(n: number): string {
  return n.toLocaleString("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  });
}

function fmtPct(n: number, dp = 1): string {
  return `${n.toFixed(dp)}%`;
}

describe(`Resinc parity harness — ${SCENARIO.label}`, () => {
  // === LOCATION LOOKUP ===
  const location = lookupLocation(SCENARIO.country, SCENARIO.postcode);
  if (!location) throw new Error("Location lookup failed");

  // === SECTION 2 — PRODUCTION ===
  const prod = calculateSolarProduction({
    panelsByOrientation: SCENARIO.panelsByOrientation,
    tiltByOrientation: SCENARIO.tiltByOrientation,
    panelWattage: SCENARIO.panelWattage,
    shadingDeratePct: SCENARIO.shadingDeratePct,
    peakSunHours: location.peakSunHours,
    hemisphere: location.hemisphere,
  });

  // === YEAR-1 SAVINGS ===
  const safeSelfUse = Math.max(0, SCENARIO.selfUseDailyKwh);
  const excessExportDaily = Math.max(0, prod.dailyProductionKwh - safeSelfUse);
  const lossMultiplier = 1 - SYSTEM_LOSS_FACTOR;
  const gridOffsetSavings = safeSelfUse * 365 * SCENARIO.peakRatePerKwh * lossMultiplier;
  const exportEarnings = excessExportDaily * 365 * SCENARIO.fitRatePerKwh * lossMultiplier;
  const year1Savings = gridOffsetSavings + exportEarnings;

  // === SECTION 1 — REAL COST PROJECTION ===
  let cumulativeBill = 0;
  for (let year = 1; year <= 25; year++) {
    cumulativeBill += SCENARIO.annualBill * Math.pow(1 + PRICE_INCREASE, year - 1);
  }

  // === SECTION 4 — LOAN AMORTISATION ===
  const loanPrincipal = Math.max(0, SCENARIO.investment - SCENARIO.deposit + SCENARIO.setupFee);
  const annualLoanPayment = calculateLoanPayment(
    loanPrincipal,
    SCENARIO.interestRatePercent,
    SCENARIO.loanTermYears
  );
  const annualMonthlyFees = SCENARIO.monthlyFee * 12;
  const annualPayment = annualLoanPayment + annualMonthlyFees;
  const monthlyPayment = annualPayment / 12;

  // === SECTION 4 — 25-YEAR CASHFLOW ===
  // Resinc convention: self-use compounds at (1+inflation)(1-degradation),
  // export earnings stay flat (FIT does not inflate).
  const selfUseMultiplier = (1 + PRICE_INCREASE) * (1 - PANEL_DEGRADATION);
  let cumPayments = 0;
  let cumSavings = 0;
  let paybackYear: number | null = null;
  let breakEvenYear: number | null = null;
  const yearRows: Array<{
    year: number;
    payment: number;
    savings: number;
    netAnnual: number;
    cumPayments: number;
    cumSavings: number;
    cumNet: number;
  }> = [];

  for (let year = 1; year <= 25; year++) {
    const inLoanTerm = year <= SCENARIO.loanTermYears;
    const payment = inLoanTerm ? annualPayment : 0;
    const selfUseN = gridOffsetSavings * Math.pow(selfUseMultiplier, year - 1);
    const exportN = exportEarnings; // flat
    const savings = selfUseN + exportN;
    cumPayments += payment;
    cumSavings += savings;
    const netAnnual = savings - payment;
    const cumNet = cumSavings - cumPayments;
    if (breakEvenYear === null && netAnnual > 0) breakEvenYear = year;
    if (paybackYear === null && cumSavings >= SCENARIO.investment) paybackYear = year;
    yearRows.push({ year, payment, savings, netAnnual, cumPayments, cumSavings, cumNet });
  }

  const cumSavings10 = yearRows[9].cumSavings;
  const cumSavings25 = yearRows[24].cumSavings;
  const totalROI25 = (cumSavings25 / SCENARIO.investment) * 100;

  it("prints the full Resinc-comparable output table", () => {
    const lines: string[] = [
      "",
      "═══════════════════════════════════════════════════════════════",
      `  RESINC PARITY — ${SCENARIO.label}`,
      "═══════════════════════════════════════════════════════════════",
      "",
      "▎ LOCATION",
      `  city                   ${location.city}, ${location.state ?? ""}`,
      `  hemisphere             ${location.hemisphere}`,
      `  peak sun hours         ${location.peakSunHours} h/day`,
      "",
      "▎ SECTION 1 — REAL COST OF POWER (no solar)",
      `  Yr 1 bill              ${fmtMoney(SCENARIO.annualBill)}`,
      `  25-yr cumulative bill  ${fmtMoney(cumulativeBill)}`,
      "",
      "▎ SECTION 2 — SOLAR PRODUCTION",
      `  System size            ${prod.systemSizeKw.toFixed(2)} kW`,
      `  Total panels           ${prod.totalPanels}`,
      `  Weighted derate        ${fmtPct(prod.weightedDeratePct * 100, 1)}`,
      `  Daily production       ${prod.dailyProductionKwh.toFixed(1)} kWh`,
      `  Annual production      ${prod.annualProductionKwh.toFixed(0)} kWh`,
      `  Self-use offset        ${fmtMoney(gridOffsetSavings)}/yr`,
      `  Export earnings        ${fmtMoney(exportEarnings)}/yr`,
      `  YEAR-1 SAVINGS         ${fmtMoney(year1Savings)}`,
      "",
      "▎ SECTION 3 — INVESTMENT",
      `  Investment             ${fmtMoney(SCENARIO.investment)}`,
      "",
      "▎ SECTION 4 — LOAN",
      `  Loan principal         ${fmtMoney(loanPrincipal)}  (= ${fmtMoney(SCENARIO.investment)} − ${fmtMoney(SCENARIO.deposit)} + ${fmtMoney(SCENARIO.setupFee)} setup)`,
      `  Annual loan payment    ${fmtMoney(annualLoanPayment)}/yr`,
      `  Monthly fees           ${fmtMoney(annualMonthlyFees)}/yr  (${fmtMoney(SCENARIO.monthlyFee)}/mo)`,
      `  TOTAL annual payment   ${fmtMoney(annualPayment)}/yr  ≈ ${fmtMoney(monthlyPayment)}/mo`,
      `  Weekly equivalent      ${fmtMoney(annualPayment / 52)}/wk`,
      "",
      "▎ MILESTONE SAVINGS",
      `  Year-1 net cashflow    ${fmtMoney(year1Savings - annualPayment)}  (savings ${fmtMoney(year1Savings)} − payment ${fmtMoney(annualPayment)})`,
      `  10-yr cum savings      ${fmtMoney(cumSavings10)}`,
      `  25-yr cum savings      ${fmtMoney(cumSavings25)}`,
      `  25-yr total ROI        ${fmtPct(totalROI25, 0)}`,
      `  Payback year           Yr ${paybackYear ?? "N/A"}`,
      `  Break-even year        Yr ${breakEvenYear ?? "N/A"}`,
      "",
      "▎ FIRST 10 YEARS — CASHFLOW TABLE",
      "  Yr │ Payment    │ Savings    │ Net/yr     │ Cum savings  │ Cum net",
      "  ───┼────────────┼────────────┼────────────┼──────────────┼────────────",
      ...yearRows.slice(0, 10).map((r) =>
        `  ${String(r.year).padStart(2)} │ ${fmtMoney(r.payment).padStart(10)} │ ${fmtMoney(r.savings).padStart(10)} │ ${fmtMoney(r.netAnnual).padStart(10)} │ ${fmtMoney(r.cumSavings).padStart(12)} │ ${fmtMoney(r.cumNet).padStart(10)}`
      ),
      "",
      "═══════════════════════════════════════════════════════════════",
      "",
    ];
    // eslint-disable-next-line no-console
    console.log(lines.join("\n"));

    // Sanity assertions for the user's current scenario.
    expect(prod.totalPanels).toBeGreaterThan(0);
    expect(year1Savings).toBeGreaterThan(0);
    expect(cumSavings25).toBeGreaterThan(year1Savings * 15);
  });
});
