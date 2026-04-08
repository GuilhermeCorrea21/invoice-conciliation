# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on port 8080
npm run build        # Production build
npm run lint         # Run ESLint
npm run test         # Run unit tests with Vitest (single run)
npm run test:watch   # Run unit tests in watch mode
```

To run a single test file:
```bash
npx vitest run src/test/example.test.ts
```

## Architecture

This is a **React + TypeScript + Vite** frontend app for invoice reconciliation (Portuguese UI). No backend — purely client-side.

**Entry points:**
- `src/main.tsx` → `src/App.tsx` (React Router) → `src/pages/Index.tsx` (main page)

**Key components:**
- `src/pages/Index.tsx` — Main reconciliation view: two side-by-side `TransactionPanel`s (pending vs. invoice transactions) with a `DropZone` for file uploads
- `src/components/TransactionPanel.tsx` — Filterable, selectable transaction list
- `src/components/DropZone.tsx` — File upload accepting PDF, XLSX, XLS
- `src/components/ui/` — 48 shadcn/ui Radix-based components; don't edit these directly

**State:** All local `useState` in components — no global state store. `@tanstack/react-query` is wired up via `QueryClientProvider` in `App.tsx` but not yet used for data fetching.

**Styling:** Tailwind CSS with HSL CSS variables for theming (light/dark). Design tokens are defined in `src/index.css`. The `cn()` utility from `src/lib/utils.ts` combines `clsx` + `tailwind-merge`.

**TypeScript paths:** `@/*` maps to `src/`.

**Testing:** Vitest with jsdom (`src/test/setup.ts`). Playwright is configured for E2E tests (`playwright.config.ts`) but no E2E tests exist yet.
