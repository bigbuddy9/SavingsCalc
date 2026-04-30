import { useMemo } from "react";
import { PANEL_DEGRADATION, PRICE_INCREASE } from "@/lib/constants";

export type CashflowYearRow = {
  year: number;
  payment: number;
  savings: number;
  netAnnual: number;
  cumPayments: number;
  cumSavings: number;
  cumNet: number;
};

export type CashflowResult = {
  /** Pure amortized annual repayment on (investment − deposit). Excludes loan fees. */
  annualLoanPayment: number;
  /** annualLoanPayment + (monthlyFee × 12). What the customer pays each year during the loan term. */
  annualPayment: number;
  loanPrincipal: number;
  years: CashflowYearRow[];
  /** First year where annual savings exceed annual payments + fees. */
  breakEvenYear: number | null;
  /** First year where cumulative savings catch up to the upfront investment.
   *  More meaningful than breakEvenYear for cash purchases (where breakEvenYear
   *  is always 1) — represents the actual payback period.
   */
  paybackYear: number | null;
  totalCumNet: number;
  cumSavings25: number;
  cumPayments25: number;
  /** True when year-1 savings >= year-1 payment (incl. setup + monthly fees). */
  cashflowPositiveDay1: boolean;
  /** Convenience: did the user pick a finance term, or is this a cash purchase? */
  hasLoan: boolean;
};

export function calculateLoanPayment(principal: number, annualRatePercent: number, years: number): number {
  if (principal <= 0 || years <= 0) return 0;
  const monthlyRate = annualRatePercent / 100 / 12;
  const months = years * 12;
  if (monthlyRate === 0) return principal / years;
  const monthlyPayment =
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
    (Math.pow(1 + monthlyRate, months) - 1);
  return monthlyPayment * 12;
}

export function useCashflowCalc(
  investment: number,
  yr1Savings: number,
  loanTermYears: number,
  interestRatePercent: number,
  deposit: number = 0,
  setupFee: number = 0,
  monthlyFee: number = 0
): CashflowResult {
  return useMemo(() => {
    // term=0 (or unset) is a valid "cash purchase, no loan" state — keep it
    // at 0 instead of silently falling back to 10. With term=0,
    // calculateLoanPayment returns 0 and no year falls in the loan window.
    const term = Number.isFinite(loanTermYears) && loanTermYears > 0 ? Math.floor(loanTermYears) : 0;
    const hasLoan = term > 0;
    const safeDeposit = Math.max(0, deposit);
    const safeSetupFee = Math.max(0, setupFee);
    // Setup fee gets rolled into the loan principal (Resinc convention) so it
    // amortises across the term instead of slamming year 1 with a one-off
    // charge. Cash purchase: setup fee is ignored — it only makes sense as a
    // loan establishment cost.
    const loanPrincipal = hasLoan
      ? Math.max(0, investment - safeDeposit + safeSetupFee)
      : 0;
    const annualLoanPayment = calculateLoanPayment(loanPrincipal, interestRatePercent, term);
    const annualMonthlyFees = Math.max(0, monthlyFee) * 12;
    const annualPayment = annualLoanPayment + annualMonthlyFees;

    // Effective year-on-year savings growth = electricity inflation × panel
    // output retention. Resinc-style: 8% inflation × ~0.991 retention ≈ 7%/yr.
    // Degradation is a hidden constant — see lib/constants.ts.
    const yearMultiplier = (1 + PRICE_INCREASE) * (1 - PANEL_DEGRADATION);

    const years: CashflowYearRow[] = [];
    let cumPayments = 0;
    let cumSavings = 0;
    let breakEvenYear: number | null = null;
    let paybackYear: number | null = null;

    for (let year = 1; year <= 25; year++) {
      const inLoanTerm = hasLoan && year <= term;
      const payment = inLoanTerm ? annualPayment : 0;
      const savings = yr1Savings * Math.pow(yearMultiplier, year - 1);
      cumPayments += payment;
      cumSavings += savings;
      const netAnnual = savings - payment;
      const cumNet = cumSavings - cumPayments;
      if (breakEvenYear === null && netAnnual > 0) breakEvenYear = year;
      if (paybackYear === null && cumSavings >= investment) paybackYear = year;
      years.push({ year, payment, savings, netAnnual, cumPayments, cumSavings, cumNet });
    }

    const cashflowPositiveDay1 = years[0].netAnnual >= 0;

    return {
      annualLoanPayment,
      annualPayment,
      loanPrincipal,
      years,
      breakEvenYear,
      paybackYear,
      totalCumNet: years[24].cumNet,
      cumSavings25: years[24].cumSavings,
      cumPayments25: years[24].cumPayments,
      cashflowPositiveDay1,
      hasLoan,
    };
  }, [investment, yr1Savings, loanTermYears, interestRatePercent, deposit, setupFee, monthlyFee]);
}
