import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useRealCostCalc, type RealCostResult } from "@/hooks/useRealCostCalc";
import { useSystemCalc, type SystemResult } from "@/hooks/useSystemCalc";
import { usePricingCalc, type PricingInputs, type PricingResult } from "@/hooks/usePricingCalc";
import { useCashflowCalc, type CashflowResult } from "@/hooks/useCashflowCalc";

export type CalculatorInputs = {
  // Section 1
  annualBill: number;
  taxRate: number;

  // Section 2
  systemSize: number;
  panelCount: number;
  panelWatt: number;
  batterySize: number;
  annualProduction: number;
  dailyUsage: number;
  annualSavings: number;

  // Section 3
  priceSystem: number;
  priceInverter: number;
  priceMetering: number;
  priceSiteInspection: number;
  priceSplitArray: number;
  priceRoofHeight: number;
  priceOther: number;
  solarStcs: number;
  solarStcPrice: number;
  batteryStcs: number;
  batteryStcPrice: number;
  discount: number;

  // Section 4
  loanTerm: number;
  interestRate: number;
};

const DEFAULTS: CalculatorInputs = {
  annualBill: 4917,
  taxRate: 30,
  systemSize: 10.12,
  panelCount: 23,
  panelWatt: 440,
  batterySize: 40,
  annualProduction: 13367,
  dailyUsage: 55,
  annualSavings: 6116,
  priceSystem: 62332,
  priceInverter: 6000,
  priceMetering: 850,
  priceSiteInspection: 198,
  priceSplitArray: 360,
  priceRoofHeight: 276,
  priceOther: 0,
  solarStcs: 83,
  solarStcPrice: 39,
  batteryStcs: 372,
  batteryStcPrice: 39,
  discount: 7492,
  loanTerm: 10,
  interestRate: 6.29,
};

export type CalculatorContextValue = {
  inputs: CalculatorInputs;
  setInput: <K extends keyof CalculatorInputs>(key: K, value: CalculatorInputs[K]) => void;
  realCost: RealCostResult;
  system: SystemResult;
  pricing: PricingResult;
  cashflow: CashflowResult;
};

const Ctx = createContext<CalculatorContextValue | null>(null);

export function CalculatorProvider({ children }: { children: ReactNode }) {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULTS);

  const setInput = <K extends keyof CalculatorInputs>(key: K, value: CalculatorInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const realCost = useRealCostCalc(inputs.annualBill, inputs.taxRate);
  const system = useSystemCalc(inputs.annualProduction, inputs.dailyUsage);

  const pricingInputs: PricingInputs = useMemo(
    () => ({
      priceSystem: inputs.priceSystem,
      priceInverter: inputs.priceInverter,
      priceMetering: inputs.priceMetering,
      priceSiteInspection: inputs.priceSiteInspection,
      priceSplitArray: inputs.priceSplitArray,
      priceRoofHeight: inputs.priceRoofHeight,
      priceOther: inputs.priceOther,
      solarStcs: inputs.solarStcs,
      solarStcPrice: inputs.solarStcPrice,
      batteryStcs: inputs.batteryStcs,
      batteryStcPrice: inputs.batteryStcPrice,
      discount: inputs.discount,
    }),
    [
      inputs.priceSystem,
      inputs.priceInverter,
      inputs.priceMetering,
      inputs.priceSiteInspection,
      inputs.priceSplitArray,
      inputs.priceRoofHeight,
      inputs.priceOther,
      inputs.solarStcs,
      inputs.solarStcPrice,
      inputs.batteryStcs,
      inputs.batteryStcPrice,
      inputs.discount,
    ]
  );

  const pricing = usePricingCalc(pricingInputs);
  const cashflow = useCashflowCalc(
    pricing.investment,
    inputs.annualSavings,
    inputs.loanTerm,
    inputs.interestRate
  );

  const value = useMemo<CalculatorContextValue>(
    () => ({ inputs, setInput, realCost, system, pricing, cashflow }),
    [inputs, realCost, system, pricing, cashflow]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCalculator(): CalculatorContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCalculator must be used inside CalculatorProvider");
  return v;
}
