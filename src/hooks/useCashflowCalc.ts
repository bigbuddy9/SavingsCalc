import { useMemo } from "react";
import { PRICE_INCREASE } from "@/lib/constants";

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
  breakEvenYear: number | null;
  totalCumNet: number;
  cumSavings25: number;
  cumPayments25: number;
  /** True when year-1 savings >= year-1 payment (incl. setup + monthly fees). */
  cashflowPositiveDay1: boolean;
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
    const safeDeposit = Math.max(0, deposit);
    const loanPrincipal = Math.max(0, investment - safeDeposit);
    const annualLoanPayment = calculateLoanPayment(loanPrincipal, interestRatePercent, term);
    const annualMonthlyFees = Math.max(0, monthlyFee) * 12;
    const annualPayment = annualLoanPayment + annualMonthlyFees;

    const years: CashflowYearRow[] = [];
    let cumPayments = 0;
    let cumSavings = 0;
    let breakEvenYear: number | null = null;

    const hasLoan = term > 0;
    for (let year = 1; year <= 25; year++) {
      // During the loan term: amortized repayment + monthly fees × 12.
      // Setup fee tacks onto year 1 only.
      // No loan → no repayments and no loan-related fees apply.
      const inLoanTerm = hasLoan && year <= term;
      const payment =
        (inLoanTerm ? annualPayment : 0) + (hasLoan && year === 1 ? Math.max(0, setupFee) : 0);
      const savings = yr1Savings * Math.pow(1 + PRICE_INCREASE, year - 1);
      cumPayments += payment;
      cumSavings += savings;
      const netAnnual = savings - payment;
      const cumNet = cumSavings - cumPayments;
      if (breakEvenYear === null && netAnnual > 0) breakEvenYear = year;
      years.push({ year, payment, savings, netAnnual, cumPayments, cumSavings, cumNet });
    }

    const cashflowPositiveDay1 = years[0].netAnnual >= 0;

    return {
      annualLoanPayment,
      annualPayment,
      loanPrincipal,
      years,
      breakEvenYear,
      totalCumNet: years[24].cumNet,
      cumSavings25: years[24].cumSavings,
      cumPayments25: years[24].cumPayments,
      cashflowPositiveDay1,
    };
  }, [investment, yr1Savings, loanTermYears, interestRatePercent, deposit, setupFee, monthlyFee]);
}
