import { CalculatorProvider } from "@/state/CalculatorContext";
import { PageHeader } from "@/components/layout/PageHeader";
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
      <PageHeader />

      <main className="pb-24 md:pb-32">
        <Hero />
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

      <footer className="border-t border-line/80 py-10">
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

function Hero() {
  return (
    <section className="container-narrow pt-14 md:pt-24 pb-14 md:pb-20">
      <div className="max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-subtle">
          Solar savings analysis
        </p>
        <h1 className="mt-4 text-display font-bold tracking-tightest text-ink">
          The full financial picture of going solar — over 25 years.
        </h1>
        <p className="mt-5 text-lg text-ink-muted leading-relaxed max-w-2xl">
          A line-by-line breakdown of what power costs you today, what your custom system saves,
          and the cashflow story year-by-year. Every number updates as you adjust the inputs.
        </p>
      </div>
    </section>
  );
}
