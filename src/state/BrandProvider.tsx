import { createContext, useContext, useLayoutEffect, useMemo, type ReactNode } from "react";
import { type Brand, resolveBrandFromLocation } from "@/config/brands";

const BrandContext = createContext<Brand | null>(null);

export function BrandProvider({ children }: { children: ReactNode }) {
  const brand = useMemo(() => resolveBrandFromLocation(), []);

  // Push the brand's primary colour into a CSS custom property so Tailwind's
  // `accent-*` utilities pick it up (see tailwind.config.js).
  useLayoutEffect(() => {
    document.documentElement.style.setProperty("--color-accent", brand.primaryRgb);
  }, [brand]);

  return <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>;
}

export function useBrand(): Brand {
  const ctx = useContext(BrandContext);
  if (!ctx) throw new Error("useBrand must be used inside <BrandProvider>");
  return ctx;
}
