import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
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
  formatMoney as fmtMoney,
  formatMoneyK as fmtMoneyK,
  formatMoneyKUnsigned as fmtMoneyKUnsigned,
  currencySymbol as fmtCurrencySymbol,
} from "@/lib/format";
import { readInputsFromUrl, writeInputsToUrl } from "./urlSync";
import {
  ORIENTATIONS,
  type Orientation,
  type OrientationPanelCount,
  type OrientationTilt,
} from "@/lib/solar";
import {
  FALLBACK_HEMISPHERE,
  FALLBACK_PEAK_SUN_HOURS,
  lookupLocation,
  type Country,
  type LocationResult,
} from "@/lib/location";
import {
  loadQuotes,
  upsertQuote,
  removeQuote,
  generateQuoteId,
  type SavedQuote,
} from "./quotesStore";

// ─── Session state (current working session) ────────────────────────────────

const LS_KEY = "savingscalc_state";
const LS_ACTIVE_ID = "savingscalc_active_id";

function loadFromLocalStorage(): Partial<CalculatorInputs> | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function saveToLocalStorage(inputs: CalculatorInputs): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(inputs));
  } catch {}
}

function loadActiveId(): string | null {
  try {
    return localStorage.getItem(LS_ACTIVE_ID);
  } catch {
    return null;
  }
}

function saveActiveId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(LS_ACTIVE_ID, id);
    } else {
      localStorage.removeItem(LS_ACTIVE_ID);
    }
  } catch {}
}

// ─── Types ──────────────────────────────────────────────────────────────────

export type CalculatorInputs = {
  customerName: string;

  annualBill: number;
  taxRate: number;

  country: Country;
  postcode: string;

  panelWatt: number;
  panelsByOrientation: OrientationPanelCount;
  tiltByOrientation: OrientationTilt;
  shadingDeratePct: number;

  dailyUsage: number;
  selfUseKwh: number;
  peakRate: number;
  fitRate: number;

  priceLineItems: PriceLineItem[];
  solarStcs: number;
  solarStcPrice: number;
  batteryStcs: number;
  batteryStcPrice: number;
  discount: number;

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

export const DEFAULTS: CalculatorInputs = {
  customerName: "",
  annualBill: 0,
  taxRate: 30,

  country: "",
  postcode: "",

  panelWatt: 440,
  panelsByOrientation: { ...ZERO_PANELS },
  tiltByOrientation: { ...DEFAULT_TILTS },
  shadingDeratePct: 0,

  dailyUsage: 0,
  selfUseKwh: 0,
  peakRate: 0,
  fitRate: 0,

  priceLineItems: [
    { id: "system",         label: "System cost (panels + install)", amount: 0 },
    { id: "inverter",       label: "Inverter",                       amount: 0 },
    { id: "metering",       label: "Metering",                       amount: 0 },
    { id: "siteInspection", label: "Site inspection",                amount: 0 },
    { id: "splitArray",     label: "Split array",                    amount: 0 },
    { id: "roofHeight",     label: "Roof height",                    amount: 0 },
    { id: "other",          label: "Other",                          amount: 0 },
  ],
  solarStcs: 0,
  solarStcPrice: 39,
  batteryStcs: 0,
  batteryStcPrice: 39,
  discount: 0,

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
  location: LocationResult;
  realCost: RealCostResult;
  system: SystemResult;
  pricing: PricingResult;
  cashflow: CashflowResult;
  formatMoney: (n: number, opts?: { withSign?: boolean }) => string;
  formatMoneyK: (n: number) => string;
  formatMoneyKUnsigned: (n: number) => string;
  currencySymbol: string;
  // ── Quotes library ──
  quotes: SavedQuote[];
  activeQuoteId: string | null;
  loadQuote: (quote: SavedQuote) => void;
  newQuote: () => void;
  deleteQuote: (id: string) => void;
};

// ─── Provider ───────────────────────────────────────────────────────────────

const Ctx = createContext<CalculatorContextValue | null>(null);

export function CalculatorProvider({ children }: { children: ReactNode }) {
  // Load priority: URL hash (shared link) → localStorage (returning user) → clean defaults.
  const [inputs, setInputs] = useState<CalculatorInputs>(() => {
    const fromUrl = readInputsFromUrl();
    if (fromUrl) return { ...DEFAULTS, ...fromUrl };
    const fromStorage = loadFromLocalStorage();
    if (fromStorage) return { ...DEFAULTS, ...fromStorage };
    return DEFAULTS;
  });

  const [activeQuoteId, setActiveQuoteId] = useState<string | null>(() => loadActiveId());
  const [quotes, setQuotes] = useState<SavedQuote[]>(() => loadQuotes());

  // Refresh the in-memory quotes list from localStorage.
  const refreshQuotes = useCallback(() => setQuotes(loadQuotes()), []);

  // Persist session state on every change.
  useEffect(() => {
    writeInputsToUrl(inputs);
    saveToLocalStorage(inputs);
  }, [inputs]);

  // Persist active quote ID.
  useEffect(() => {
    saveActiveId(activeQuoteId);
  }, [activeQuoteId]);

  // Auto-save to the quotes library (debounced 1.5 s) whenever customer name is set.
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeQuoteIdRef = useRef(activeQuoteId);
  activeQuoteIdRef.current = activeQuoteId;

  useEffect(() => {
    if (!inputs.customerName.trim()) return;

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      const currentId = activeQuoteIdRef.current;
      const id = currentId ?? generateQuoteId();

      const quote: SavedQuote = {
        id,
        customerName: inputs.customerName.trim(),
        savedAt: new Date().toISOString(),
        inputs,
      };

      upsertQuote(quote);
      if (!currentId) setActiveQuoteId(id);
      refreshQuotes();
    }, 1500);

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [inputs, refreshQuotes]);

  // ── Quotes actions ──────────────────────────────────────────────────────

  const loadQuote = useCallback((quote: SavedQuote) => {
    setInputs({ ...DEFAULTS, ...quote.inputs });
    setActiveQuoteId(quote.id);
  }, []);

  const newQuote = useCallback(() => {
    setInputs(DEFAULTS);
    setActiveQuoteId(null);
  }, []);

  const deleteQuote = useCallback((id: string) => {
    removeQuote(id);
    refreshQuotes();
    if (activeQuoteIdRef.current === id) {
      setActiveQuoteId(null);
    }
  }, [refreshQuotes]);

  // ── Input setters ───────────────────────────────────────────────────────

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

  const updatePriceLineItem = (id: string, patch: Partial<Omit<PriceLineItem, "id">>) => {
    setInputs((prev) => ({
      ...prev,
      priceLineItems: prev.priceLineItems.map((i) =>
        i.id === id ? { ...i, ...patch } : i
      ),
    }));
  };

  // ── Derived values ──────────────────────────────────────────────────────

  const location = useMemo<LocationResult>(
    () =>
      lookupLocation(inputs.country, inputs.postcode) ?? {
        country: inputs.country,
        countryName: "",
        postcode: inputs.postcode,
        city: "",
        state: "",
        hemisphere: FALLBACK_HEMISPHERE,
        peakSunHours: FALLBACK_PEAK_SUN_HOURS,
        currency: "AUD",
      },
    [inputs.country, inputs.postcode]
  );

  const currency = location.currency;
  const formatMoney = useMemo(
    () => (n: number, opts?: { withSign?: boolean }) => fmtMoney(n, currency, opts),
    [currency]
  );
  const formatMoneyK = useMemo(() => (n: number) => fmtMoneyK(n, currency), [currency]);
  const formatMoneyKUnsigned = useMemo(
    () => (n: number) => fmtMoneyKUnsigned(n, currency),
    [currency]
  );
  const currencySymbol = useMemo(() => fmtCurrencySymbol(currency), [currency]);

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

  const cashflow = useCashflowCalc(
    pricing.investment,
    system.year1SelfUseSavings,
    system.year1ExportEarnings,
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
      formatMoney,
      formatMoneyK,
      formatMoneyKUnsigned,
      currencySymbol,
      quotes,
      activeQuoteId,
      loadQuote,
      newQuote,
      deleteQuote,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inputs, location, realCost, system, pricing, cashflow, formatMoney, formatMoneyK, formatMoneyKUnsigned, currencySymbol, quotes, activeQuoteId, loadQuote, newQuote, deleteQuote]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCalculator(): CalculatorContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCalculator must be used inside CalculatorProvider");
  return v;
}
