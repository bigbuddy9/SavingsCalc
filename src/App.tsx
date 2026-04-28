import { CalculatorProvider } from "@/state/CalculatorContext";
import { SectionDivider } from "@/components/layout/SectionDivider";
import { TopToolbar } from "@/components/layout/TopToolbar";
import { Section1RealCost } from "@/components/sections/Section1RealCost";
import { Section2System } from "@/components/sections/Section2System";
import { Section3Investment } from "@/components/sections/Section3Investment";
import { Section4Savings } from "@/components/sections/Section4Savings";
import { FinalComparison } from "@/components/sections/FinalComparison";
import { theme } from "@/config/theme";

export default function App() {
  return (
    <CalculatorProvider>
      <main className="pt-8 md:pt-10 pb-24 md:pb-32 print:pt-0 print:pb-0">
        <TopToolbar />
        <Section1RealCost />
        <SectionDivider />
        <Section2System />
        <SectionDivider />
        <Section3Investment />
        <SectionDivider />
        <Section4Savings />
        <SectionDivider />
        <FinalComparison />
      </main>

      <footer className="border-t border-line/80 py-10 bg-surface print:hidden">
        <div className="container-narrow text-[13px] text-ink-subtle">
          <p>
            © {new Date().getFullYear()} {theme.brand.name}. All values are estimates for illustration.
          </p>
        </div>
      </footer>
    </CalculatorProvider>
  );
}
