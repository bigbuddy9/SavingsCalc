/**
 * Small (?) info icon with a hover/focus tooltip. Pure CSS — no JS positioning,
 * no portals — so it's tiny but the trade-off is it can clip near container
 * edges. We keep tooltips short to avoid that.
 */
export function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex items-center align-middle">
      <button
        type="button"
        tabIndex={0}
        aria-label={text}
        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-line text-[10px] font-bold leading-none text-ink-faint hover:border-ink-muted hover:text-ink-muted focus:border-edit-ring focus:text-ink focus:outline-none focus:ring-2 focus:ring-edit-ring/30 transition-colors print:hidden"
      >
        ?
      </button>
      <span
        role="tooltip"
        className="pointer-events-none invisible absolute bottom-full left-1/2 z-50 mb-1.5 w-56 -translate-x-1/2 rounded-md bg-ink px-3 py-2 text-[12px] font-normal leading-snug text-white opacity-0 shadow-elev transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
      >
        {text}
        <span
          aria-hidden
          className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-x-transparent border-b-transparent border-t-ink"
        />
      </span>
    </span>
  );
}
