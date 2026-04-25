# Solar Savings Analysis

A premium solar sales analysis tool. Walks an Australian prospect through:

1. **The real cost of power** — what 25 years of doing nothing costs them.
2. **Their custom solar system** — sized to their roof, with monthly production vs daily usage.
3. **Investment breakdown** — line-item pricing with STC rebate math.
4. **25-year savings story** — loan amortization, year-by-year cashflow, and the break-even year.
5. **Final comparison** — without solar vs. with solar vs. lifetime difference.

Every input updates every downstream value reactively.

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS 3
- Recharts
- Inter (Google Fonts)
- Vitest for the calculation hooks

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
npm test         # run calculation parity tests
```

## White-labeling

Single source of truth: `src/config/theme.ts` (brand name + copy) and `tailwind.config.js` (colors). Swap colors and brand name there; nothing else needs to change.

## Architecture

- All inputs live in `src/state/CalculatorContext.tsx`
- All math lives in `src/hooks/use*Calc.ts` (pure, memoized)
- Each section is its own folder under `src/components/sections/`

## Deploy

`netlify.toml` is committed. Connect the repo in Netlify and the build is automatic (`npm run build` → `dist/`).
