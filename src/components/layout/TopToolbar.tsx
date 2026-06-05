import { useEffect, useState } from "react";
import { useCalculator } from "@/state/CalculatorContext";
import { QuotesPanel } from "./QuotesPanel";

/**
 * Top-of-page toolbar: customer name, quotes library, print, and copy-link.
 * Hidden in the print stylesheet — only the customer name and timestamp survive in PDF.
 */
export function TopToolbar() {
  const { inputs, setInput, quotes, newQuote } = useCalculator();
  const customerName = inputs.customerName;
  const [panelOpen, setPanelOpen] = useState(false);

  // Keep document.title in sync — Save-as-PDF uses it as the default filename.
  useEffect(() => {
    const trimmed = customerName.trim();
    document.title = trimmed
      ? `${trimmed} — Solar Savings Analysis`
      : "Solar Savings Analysis";
  }, [customerName]);

  function handleCopyLink() {
    const url = window.location.href;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(url)
        .then(() => flash("Link copied"))
        .catch(() => flash("Couldn't copy link"));
    } else {
      flash(url);
    }
  }

  return (
    <>
      <div className="container-narrow mb-8 print:hidden">
        <div className="rounded-2xl border border-line bg-surface p-4 md:p-5 shadow-card flex flex-col md:flex-row md:items-center gap-3 md:gap-4">

          {/* Customer name */}
          <div className="flex-1 min-w-0">
            <label className="block">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle mb-1.5">
                Customer
              </span>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setInput("customerName", e.target.value)}
                placeholder="e.g. Smith family — 12 Elm Street"
                className="w-full rounded-lg bg-edit/40 hover:bg-edit border border-line px-3 py-2.5 text-base font-semibold text-ink focus:outline-none focus:bg-edit focus:border-edit-ring focus:ring-4 focus:ring-edit-ring/30 transition-all placeholder:text-ink-faint placeholder:font-normal"
              />
            </label>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Saved quotes */}
            <button
              type="button"
              onClick={() => setPanelOpen(true)}
              className="relative inline-flex items-center gap-2 rounded-lg border border-line bg-surface hover:bg-surface-alt px-3.5 py-2.5 text-[13px] font-semibold text-ink-soft transition-colors"
            >
              <FolderIcon />
              Saved quotes
              {quotes.length > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-ink text-white text-[10px] font-bold w-4 h-4 leading-none">
                  {quotes.length > 99 ? "99+" : quotes.length}
                </span>
              )}
            </button>

            {/* New quote */}
            <button
              type="button"
              onClick={newQuote}
              className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface hover:bg-surface-alt px-3.5 py-2.5 text-[13px] font-semibold text-ink-soft transition-colors"
            >
              <PlusIcon />
              New quote
            </button>

            {/* Copy link */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface hover:bg-surface-alt px-3.5 py-2.5 text-[13px] font-semibold text-ink-soft transition-colors"
            >
              <LinkIcon />
              Copy link
            </button>

            {/* Print */}
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg bg-ink hover:bg-ink-soft text-white px-3.5 py-2.5 text-[13px] font-semibold transition-colors"
            >
              <PrintIcon />
              Print / Save PDF
            </button>
          </div>
        </div>
      </div>

      {/* Print-only header */}
      <div className="hidden print:block container-narrow mb-6">
        <div className="border-b border-ink/30 pb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
            Solar Savings Analysis
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">
            {customerName.trim() || "Solar Savings Analysis"}
          </h1>
          <p className="mt-1 text-[12px] text-ink-muted">
            Generated {new Date().toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <QuotesPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </>
  );
}

function flash(msg: string) {
  const el = document.createElement("div");
  el.textContent = msg;
  el.className =
    "fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] rounded-lg bg-ink text-white px-4 py-2.5 text-[13px] font-semibold shadow-elev animate-fade-up";
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.transition = "opacity 250ms";
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 300);
  }, 1800);
}

function FolderIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M1.5 3.5A1 1 0 0 1 2.5 2.5H5l1.5 1.5H11.5a1 1 0 0 1 1 1V11a1 1 0 0 1-1 1H2.5a1 1 0 0 1-1-1V3.5z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M5.5 3H4a3 3 0 1 0 0 6h1.5M8.5 3H10a3 3 0 1 1 0 6H8.5M5 6h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PrintIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M3 5V2h8v3M3 10H1.5V6h11v4H11M4 8h6v4H4z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
