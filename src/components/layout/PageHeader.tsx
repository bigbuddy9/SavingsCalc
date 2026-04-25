import { theme } from "@/config/theme";

export function PageHeader() {
  return (
    <header className="border-b border-line/80 bg-surface/80 backdrop-blur supports-[backdrop-filter]:bg-surface/60 sticky top-0 z-40">
      <div className="container-narrow flex items-center justify-between py-4">
        <div className="flex items-center gap-2.5">
          <BrandMark />
          <span className="text-[15px] font-semibold tracking-tight text-ink">
            {theme.brand.name}
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-[13px] font-medium text-ink-muted">
          <a href="#section-1" className="hover:text-ink transition-colors">Cost</a>
          <a href="#section-2" className="hover:text-ink transition-colors">System</a>
          <a href="#section-3" className="hover:text-ink transition-colors">Investment</a>
          <a href="#section-4" className="hover:text-ink transition-colors">Savings</a>
        </div>
      </div>
    </header>
  );
}

function BrandMark() {
  return (
    <div className="h-7 w-7 rounded-md bg-ink text-white grid place-items-center">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="4.5" fill="#FACC15" />
        <g stroke="#FACC15" strokeWidth="1.8" strokeLinecap="round">
          <line x1="12" y1="2.5" x2="12" y2="5" />
          <line x1="12" y1="19" x2="12" y2="21.5" />
          <line x1="2.5" y1="12" x2="5" y2="12" />
          <line x1="19" y1="12" x2="21.5" y2="12" />
          <line x1="5.2" y1="5.2" x2="7" y2="7" />
          <line x1="17" y1="17" x2="18.8" y2="18.8" />
          <line x1="5.2" y1="18.8" x2="7" y2="17" />
          <line x1="17" y1="7" x2="18.8" y2="5.2" />
        </g>
      </svg>
    </div>
  );
}
