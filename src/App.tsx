import { CalculatorProvider } from "@/state/CalculatorContext";
import { SectionDivider } from "@/components/layout/SectionDivider";
import { Section1RealCost } from "@/components/sections/Section1RealCost";
import { Section2System } from "@/components/sections/Section2System";
import { Section3Investment } from "@/components/sections/Section3Investment";
import { Section4Savings } from "@/components/sections/Section4Savings";
import { FinalComparison } from "@/components/sections/FinalComparison";
import { theme } from "@/config/theme";

export default function App() {
  return (
    <CalculatorProvider>
      <main className="pt-16 md:pt-24 pb-24 md:pb-32">
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

      <footer className="border-t border-line/80 py-10 bg-surface">
        <div className="container-narrow flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-[13px] text-ink-subtle">
          <p>
            © {new Date().getFullYear()} {theme.brand.name}. All values are estimates for illustration.
          </p>
          <p>Calculations assume an indicative 8% annual electricity price increase.</p>
        </div>
      </footer>
    </CalculatorProvider>
  );
}
