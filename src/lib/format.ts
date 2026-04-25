const AU = "en-AU";

export function formatMoney(n: number, opts?: { withSign?: boolean; signSymbol?: string }): string {
  const withSign = opts?.withSign ?? false;
  const sym = opts?.signSymbol ?? "−";
  const rounded = Math.round(n);
  const sign = rounded < 0 ? sym : withSign && rounded > 0 ? "+" : "";
  return sign + "$" + Math.abs(rounded).toLocaleString(AU);
}

export function formatMoneyK(n: number): string {
  const sign = n < 0 ? "−" : "+";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return sign + "$" + (abs / 1_000_000).toFixed(2) + "M";
  if (abs >= 1_000) return sign + "$" + Math.round(abs / 1_000) + "K";
  return sign + "$" + Math.round(abs);
}

export function formatMoneyKUnsigned(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return "$" + (abs / 1_000_000).toFixed(2) + "M";
  if (abs >= 1_000) return "$" + Math.round(abs / 1_000) + "K";
  return "$" + Math.round(abs);
}

export function formatKwh(n: number): string {
  return Math.round(n).toLocaleString(AU) + " kWh";
}

export function formatPercent(n: number, decimals = 1): string {
  return n.toFixed(decimals) + "%";
}
