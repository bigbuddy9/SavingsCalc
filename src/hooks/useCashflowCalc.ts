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
  annualPayment: number;
  years: CashflowYearRow[];
  breakEvenYear: number | null;
  totalCumNet: number;
  cumSavings25: number;
  cumPayments25: number;
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
  interestRatePercent: number
): CashflowResult {
  return useMemo(() => {
    const term = Number.isFinite(loanTermYears) && loanTermYears > 0 ? Math.floor(loanTermYears) : 10;
    const annualPayment = calculateLoanPayment(investment, interestRatePercent, term);

    const years: CashflowYearRow[] = [];
    let cumPayments = 0;
    let cumSavings = 0;
    let breakEvenYear: number | null = null;

    for (let year = 1; year <= 25; year++) {
      const payment = year <= term ? annualPayment : 0;
      const savings = yr1Savings * Math.pow(1 + PRICE_INCREASE, year - 1);
      cumPayments += payment;
      cumSavings += savings;
      const netAnnual = savings - payment;
      const cumNet = cumSavings - cumPayments;
      if (breakEvenYear === null && netAnnual > 0) breakEvenYear = year;
      years.push({ year, payment, savings, netAnnual, cumPayments, cumSavings, cumNet });
    }

    return {
      annualPayment,
      years,
      breakEvenYear,
      totalCumNet: years[24].cumNet,
      cumSavings25: years[24].cumSavings,
      cumPayments25: years[24].cumPayments,
    };
  }, [investment, yr1Savings, loanTermYears, interestRatePercent]);
}
