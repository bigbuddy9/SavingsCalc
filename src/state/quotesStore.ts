import type { CalculatorInputs } from "./CalculatorContext";

export type SavedQuote = {
  id: string;
  customerName: string;
  savedAt: string; // ISO 8601
  inputs: CalculatorInputs;
};

const QS_KEY = "savingscalc_quotes";

export function loadQuotes(): SavedQuote[] {
  try {
    const raw = localStorage.getItem(QS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function upsertQuote(quote: SavedQuote): void {
  const quotes = loadQuotes();
  const idx = quotes.findIndex((q) => q.id === quote.id);
  if (idx >= 0) {
    quotes[idx] = quote;
  } else {
    quotes.unshift(quote);
  }
  try {
    localStorage.setItem(QS_KEY, JSON.stringify(quotes));
  } catch {
    // Storage quota exceeded — fail silently.
  }
}

export function removeQuote(id: string): void {
  const quotes = loadQuotes().filter((q) => q.id !== id);
  try {
    localStorage.setItem(QS_KEY, JSON.stringify(quotes));
  } catch {}
}

export function generateQuoteId(): string {
  return `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
