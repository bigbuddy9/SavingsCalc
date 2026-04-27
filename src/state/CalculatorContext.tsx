import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useRealCostCalc, type RealCostResult } from "@/hooks/useRealCostCalc";
import { useSystemCalc, type SystemResult } from "@/hooks/useSystemCalc";
import {
  usePricingCalc,
  type PriceLineItem,
  type PricingInputs,
  type PricingResult,
} from "@/hooks/usePricingCalc";
import { useCashflowCalc, type CashflowResult } from "@/hooks/useCashflowCalc";
import {
  ORIENTATIONS,
  type Orientation,
  type OrientationPanelCount,
  type OrientationTilt,
} from "@/lib/solar";
import {
  DEFAULT_LOCATION,
  lookupLocation,
  type Country,
  type LocationResult,
} from "@/lib/location";

export type CalculatorInputs = {
  // Section 1
  annualBill: number;
  taxRate: number;

  // Location (drives hemisphere + peak sun hours)
  country: Country;
  postcode: string;

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

  // Section 3 — pricing (line items are user-editable: add / rename / remove)
  priceLineItems: PriceLineItem[];
  solarStcs: number;
  solarStcPrice: number;
  batteryStcs: number;
  batteryStcPrice: number;
  discount: number;

  // Section 4
  loanTerm: number;
  interestRate: number;
  deposit: number;
  setupFee: number;
  monthlyFee: number;
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

  country: DEFAULT_LOCATION.country,
  postcode: DEFAULT_LOCATION.postcode,

  panelWatt: 440,
  // Default split mirrors the prototype: 23 panels, 11E + 12W
  panelsByOrientation: { ...ZERO_PANELS, E: 11, W: 12 },
  tiltByOrientation: { ...DEFAULT_TILTS },
  shadingDeratePct: 0,

  dailyUsage: 55,
  selfUseKwh: 47,
  peakRate: 0.37,
  fitRate: 0.05,

  priceLineItems: [
    { id: "system",         label: "System cost (panels + install)", amount: 62332 },
    { id: "inverter",       label: "Inverter",                       amount: 6000  },
    { id: "metering",       label: "Metering",                       amount: 850   },
    { id: "siteInspection", label: "Site inspection",                amount: 198   },
    { id: "splitArray",     label: "Split array",                    amount: 360   },
    { id: "roofHeight",     label: "Roof height",                    amount: 276   },
    { id: "other",          label: "Other",                          amount: 0     },
  ],
  solarStcs: 83,
  solarStcPrice: 39,
  batteryStcs: 372,
  batteryStcPrice: 39,
  discount: 7492,

  loanTerm: 10,
  interestRate: 6.29,
  deposit: 0,
  setupFee: 0,
  monthlyFee: 0,
};

export type CalculatorContextValue = {
  inputs: CalculatorInputs;
  setInput: <K extends keyof CalculatorInputs>(key: K, value: CalculatorInputs[K]) => void;
  setPanelsForOrientation: (o: Orientation, n: number) => void;
  setTiltForOrientation: (o: Orientation, deg: number) => void;
  setCountry: (country: Country) => void;
  addPriceLineItem: () => void;
  removePriceLineItem: (id: string) => void;
  updatePriceLineItem: (id: string, patch: Partial<Omit<PriceLineItem, "id">>) => void;
  /** Resolved location (city/state/hemisphere/peak-sun) derived from country + postcode. */
  location: LocationResult;
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

  /** Switching country resets the postcode so we don't keep an invalid one around. */
  const setCountry = (country: Country) => {
    setInputs((prev) =>
      prev.country === country ? prev : { ...prev, country, postcode: "" }
    );
  };

  const addPriceLineItem = () => {
    setInputs((prev) => ({
      ...prev,
      priceLineItems: [
        ...prev.priceLineItems,
        { id: `custom-${Date.now()}`, label: "", amount: 0 },
      ],
    }));
  };

  const removePriceLineItem = (id: string) => {
    setInputs((prev) => ({
      ...prev,
      priceLineItems: prev.priceLineItems.filter((i) => i.id !== id),
    }));
  };

  const updatePriceLineItem = (
    id: string,
    patch: Partial<Omit<PriceLineItem, "id">>
  ) => {
    setInputs((prev) => ({
      ...prev,
      priceLineItems: prev.priceLineItems.map((i) =>
        i.id === id ? { ...i, ...patch } : i
      ),
    }));
  };

  const location = useMemo<LocationResult>(
    () => lookupLocation(inputs.country, inputs.postcode) ?? {
      country: inputs.country,
      postcode: inputs.postcode,
      city: "",
      state: "",
      hemisphere: inputs.country === "AU" ? "S" : "N",
      peakSunHours: DEFAULT_LOCATION.peakSunHours,
    },
    [inputs.country, inputs.postcode]
  );

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
    peakSunHours: location.peakSunHours,
    hemisphere: location.hemisphere,
  });

  const pricingInputs: PricingInputs = useMemo(
    () => ({
      priceLineItems: inputs.priceLineItems,
      solarStcs: inputs.solarStcs,
      solarStcPrice: inputs.solarStcPrice,
      batteryStcs: inputs.batteryStcs,
      batteryStcPrice: inputs.batteryStcPrice,
      discount: inputs.discount,
    }),
    [
      inputs.priceLineItems,
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
    inputs.interestRate,
    inputs.deposit,
    inputs.setupFee,
    inputs.monthlyFee
  );

  const value = useMemo<CalculatorContextValue>(
    () => ({
      inputs,
      setInput,
      setPanelsForOrientation,
      setTiltForOrientation,
      setCountry,
      addPriceLineItem,
      removePriceLineItem,
      updatePriceLineItem,
      location,
      realCost,
      system,
      pricing,
      cashflow,
    }),
    [inputs, location, realCost, system, pricing, cashflow]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCalculator(): CalculatorContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCalculator must be used inside CalculatorProvider");
  return v;
}
