import { useMemo } from "react";

export type PricingInputs = {
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

    const systemValue =
      num(inputs.priceSystem) +
      num(inputs.priceInverter) +
      num(inputs.priceMetering) +
      num(inputs.priceSiteInspection) +
      num(inputs.priceSplitArray) +
      num(inputs.priceRoofHeight) +
      num(inputs.priceOther);

    const solarStcDeduction = num(inputs.solarStcs) * num(inputs.solarStcPrice);
    const batteryStcDeduction = num(inputs.batteryStcs) * num(inputs.batteryStcPrice);
    const discount = num(inputs.discount);
    const investment = systemValue - solarStcDeduction - batteryStcDeduction - discount;

    return { systemValue, solarStcDeduction, batteryStcDeduction, discount, investment };
  }, [inputs]);
}
