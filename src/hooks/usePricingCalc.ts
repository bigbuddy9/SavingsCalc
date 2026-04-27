import { useMemo } from "react";

export type PriceLineItem = {
  id: string;
  label: string;
  amount: number;
};

export type PricingInputs = {
  priceLineItems: PriceLineItem[];
  solarStcs: number;
  solarStcPrice: number;
  batteryStcs: number;
  batteryStcPrice: number;
  discount: number;
};

export type PricingResult = {
  systemValue: number;
  solarStcDeduction: number;
  batteryStcDeduction: number;
  discount: number;
  investment: number;
};

export function usePricingCalc(inputs: PricingInputs): PricingResult {
  return useMemo(() => {
    const num = (n: number) => (Number.isFinite(n) ? n : 0);

    const systemValue = inputs.priceLineItems.reduce(
      (sum, item) => sum + num(item.amount),
      0
    );

    const solarStcDeduction = num(inputs.solarStcs) * num(inputs.solarStcPrice);
    const batteryStcDeduction = num(inputs.batteryStcs) * num(inputs.batteryStcPrice);
    const discount = num(inputs.discount);
    const investment = systemValue - solarStcDeduction - batteryStcDeduction - discount;

    return { systemValue, solarStcDeduction, batteryStcDeduction, discount, investment };
  }, [inputs]);
}
