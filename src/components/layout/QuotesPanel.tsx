import { useCalculator } from "@/state/CalculatorContext";
import type { SavedQuote } from "@/state/quotesStore";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function QuotesPanel({ open, onClose }: Props) {
  const { quotes, activeQuoteId, loadQuote, newQuote, deleteQuote } = useCalculator();

  function handleLoad(quote: SavedQuote) {
    loadQuote(quote);
    onClose();
  }

  function handleNew() {
    newQuote();
    onClose();
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-[2px]"
          onClick={onClose}
          aria-hidden
        />
      )}

      {/* Drawer */}
      <div
        className={[
          "fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-surface shadow-elev flex flex-col",
          "transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
        role="dialog"
        aria-label="Saved quotes"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
              Library
            </p>
            <h2 className="text-base font-bold text-ink leading-tight">Saved Quotes</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-ink-muted hover:bg-surface-alt hover:text-ink transition-colors"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {/* New quote button */}
        <div className="px-5 pt-4 pb-3 border-b border-line">
          <button
            type="button"
            onClick={handleNew}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line hover:border-ink-faint bg-surface-alt hover:bg-surface px-4 py-3 text-[13px] font-semibold text-ink-soft hover:text-ink transition-all"
          >
            <PlusIcon />
            New quote — fresh slate
          </button>
        </div>

        {/* Quote list */}
        <div className="flex-1 overflow-y-auto">
          {quotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2 text-center px-6">
              <p className="text-sm font-semibold text-ink-soft">No saved quotes yet</p>
              <p className="text-[13px] text-ink-subtle leading-snug">
                Quotes auto-save once you enter a customer name.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {quotes.map((quote) => {
                const isActive = quote.id === activeQuoteId;
                return (
                  <li
                    key={quote.id}
                    className={[
                      "flex items-start gap-3 px-5 py-4 transition-colors",
                      isActive ? "bg-edit/40" : "hover:bg-surface-alt",
                    ].join(" ")}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[14px] font-semibold text-ink truncate">
                          {quote.customerName}
                        </p>
                        {isActive && (
                          <span className="shrink-0 inline-flex items-center rounded-full bg-gain-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gain-ink">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-ink-subtle mt-0.5">
                        {formatDate(quote.savedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 mt-0.5">
                      {!isActive && (
                        <button
                          type="button"
                          onClick={() => handleLoad(quote)}
                          className="rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-ink-soft bg-surface-alt hover:bg-line hover:text-ink transition-colors"
                        >
                          Load
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteQuote(quote.id)}
                        className="rounded-lg p-1.5 text-ink-faint hover:text-pain hover:bg-pain-soft transition-colors"
                        aria-label={`Delete ${quote.customerName}`}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
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

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.8 7.5h6.4L11 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
