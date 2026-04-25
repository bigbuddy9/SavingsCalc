import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useRealCostCalc, type RealCostResult } from "@/hooks/useRealCostCalc";
import { useSystemCalc, type SystemResult } from "@/hooks/useSystemCalc";
import { usePricingCalc, type PricingInputs, type PricingResult } from "@/hooks/usePricingCalc";
import { useCashflowCalc, type CashflowResult } from "@/hooks/useCashflowCalc";
import {
  ORIENTATIONS,
  type Orientation,
  type OrientationPanelCount,
  type OrientationTilt,
} from "@/lib/solar";

export type CalculatorInputs = {
  // Section 1
  annualBill: number;
  taxRate: number;

  // Section 2 — system
  panelWatt: number;
  panelsByOrientation: OrientationPanelCount;
  tiltByOrientation: OrientationTilt;
  shadingDeratePct: number;       // 0..1 (e.g. 0.05 = 5%)

  // Section 2 — usage and rates
  dailyUsage: number;             // kWh/day
  selfUseKwh: number;             // kWh/day of solar consumed (incl. via battery)
  peakRate: number;               // $/kWh
  fitRate: number;                // $/kWh

  // Section 3 — pricing
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

const ZERO_PANELS: OrientationPanelCount = ORIENTATIONS.reduce((acc, o) => {
  acc[o] = 0;
  return acc;
}, {} as OrientationPanelCount);

const DEFAULT_TILTS: OrientationTilt = ORIENTATIONS.reduce((acc, o) => {
  acc[o] = 30;
  return acc;
}, {} as OrientationTilt);

const DEFAULTS: CalculatorInputs = {
  annualBill: 4917,
  taxRate: 30,

  panelWatt: 440,
  // Default split mirrors the prototype: 23 panels, 11E + 12W
  panelsByOrientation: { ...ZERO_PANELS, E: 11, W: 12 },
  tiltByOrientation: { ...DEFAULT_TILTS },
  shadingDeratePct: 0,

  dailyUsage: 55,
  selfUseKwh: 47,
  peakRate: 0.37,
  fitRate: 0.05,

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
  setPanelsForOrientation: (o: Orientation, n: number) => void;
  setTiltForOrientation: (o: Orientation, deg: number) => void;
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

  const setPanelsForOrientation = (o: Orientation, n: number) => {
    setInputs((prev) => ({
      ...prev,
      panelsByOrientation: { ...prev.panelsByOrientation, [o]: Math.max(0, Math.floor(n || 0)) },
    }));
  };

  const setTiltForOrientation = (o: Orientation, deg: number) => {
    setInputs((prev) => ({
      ...prev,
      tiltByOrientation: { ...prev.tiltByOrientation, [o]: Math.max(0, Math.min(60, deg || 0)) },
    }));
  };

  const realCost = useRealCostCalc(inputs.annualBill, inputs.taxRate);

  const system = useSystemCalc({
    panelsByOrientation: inputs.panelsByOrientation,
    tiltByOrientation: inputs.tiltByOrientation,
    panelWattage: inputs.panelWatt,
    shadingDeratePct: inputs.shadingDeratePct,
    dailyUsageKwh: inputs.dailyUsage,
    selfUseKwh: inputs.selfUseKwh,
    peakRatePerKwh: inputs.peakRate,
    fitRatePerKwh: inputs.fitRate,
  });

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

  // Year-1 savings now derived in Section 2 from the system + rates inputs.
  const cashflow = useCashflowCalc(
    pricing.investment,
    system.year1Savings,
    inputs.loanTerm,
    inputs.interestRate
  );

  const value = useMemo<CalculatorContextValue>(
    () => ({
      inputs,
      setInput,
      setPanelsForOrientation,
      setTiltForOrientation,
      realCost,
      system,
      pricing,
      cashflow,
    }),
    [inputs, realCost, system, pricing, cashflow]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCalculator(): CalculatorContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCalculator must be used inside CalculatorProvider");
  return v;
}
