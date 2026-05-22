# PR 01 Next.js Foundation And Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the active Vite runtime with a Next.js App Router shell, Tailwind styling, Virgin Australia tokens, and route stubs for every approved surface.

**Architecture:** Keep this PR focused on platform foundation only. The new active app lives under `app/`, shared UI primitives live under `components/ui/`, and old `src/` Vite code remains in the repo as reference but is no longer reached by package scripts.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS, Vitest, Testing Library, lucide-react, class-variance-authority, clsx, tailwind-merge.

---

## File Structure

- Modify: `package.json` for Next scripts and dependencies.
- Modify: `package-lock.json` from dependency installation.
- Modify: `tsconfig.json` for Next-compatible JSX/module settings and path alias.
- Create: `next.config.mjs`.
- Create: `postcss.config.mjs`.
- Create: `tailwind.config.ts`.
- Create: `components.json`.
- Create: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`.
- Create: `app/senior/bne/page.tsx`, `app/senior/bne/wallboard/page.tsx`.
- Create: `app/hq/page.tsx`, `app/hq/reports/page.tsx`, `app/hq/data-quality/page.tsx`.
- Create: `app/admin/page.tsx`, `app/admin/reasons/page.tsx`, `app/admin/fuel/page.tsx`, `app/admin/urgency/page.tsx`, `app/admin/reference-data/page.tsx`.
- Create: `components/ui/button.tsx`, `components/ui/badge.tsx`, `components/ui/card.tsx`.
- Create: `components/app/app-shell.tsx`, `components/app/route-stub.tsx`.
- Create: `lib/utils/cn.ts`.
- Create: `vitest.config.ts`, `test/setup.ts`, `app/routes.test.tsx`.

---

### Task 1: Install Next.js And Test Dependencies

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Install dependencies**

Run:

```bash
npm install next tailwindcss postcss autoprefixer class-variance-authority clsx tailwind-merge
npm install -D @testing-library/react @testing-library/jest-dom jsdom
```

Expected: `next`, `tailwindcss`, `postcss`, `autoprefixer`, `class-variance-authority`, `clsx`, and `tailwind-merge` appear in dependencies or devDependencies, and Testing Library packages appear in devDependencies.

- [ ] **Step 2: Replace package scripts**

Set `package.json` scripts to:

```json
{
  "dev": "next dev -H 127.0.0.1",
  "dev:lan": "next dev -H 0.0.0.0",
  "build": "next build",
  "start": "next start -H 127.0.0.1",
  "test": "vitest run",
  "test:all": "npm run test && npm run build"
}
```

- [ ] **Step 3: Commit dependency foundation**

Run:

```bash
git add package.json package-lock.json
git commit -m chore-add-nextjs-foundation-dependencies
```

---

### Task 2: Add Next, TypeScript, Tailwind, And Test Config

**Files:**
- Modify: `tsconfig.json`
- Create: `next.config.mjs`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `components.json`
- Create: `vitest.config.ts`
- Create: `test/setup.ts`

- [ ] **Step 1: Update `tsconfig.json`**

Use this structure, preserving any compiler options that are stricter in the existing file:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    },
    "plugins": [
      { "name": "next" }
    ]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "dist", ".vite-cache"]
}
```

- [ ] **Step 2: Create framework config files**

Create `next.config.mjs`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
```

Create `postcss.config.mjs`:

```js
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
```

Create `tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        virgin: {
          indigo: "#1F1A4F",
          purple: "#511C98",
          red: "#E10A0A",
          black: "#000000",
          white: "#FFFFFF",
        },
      },
      borderRadius: {
        product: "8px",
      },
    },
  },
  plugins: [],
};

export default config;
```

Create `components.json` so future shadcn additions use the same aliases and tokens:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib"
  }
}
```

- [ ] **Step 3: Create Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
  },
});
```

Create `test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: Commit config**

Run:

```bash
git add tsconfig.json next.config.mjs postcss.config.mjs tailwind.config.ts components.json vitest.config.ts test/setup.ts
git commit -m chore-configure-next-tailwind-tests
```

---

### Task 3: Add App Shell, Route Stubs, And UI Primitives

**Files:**
- Create: files listed in this task.

- [ ] **Step 1: Create utility and primitives**

Create `lib/utils/cn.ts`:

```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Create `components/ui/button.tsx`, `components/ui/badge.tsx`, and `components/ui/card.tsx` as shadcn-style typed wrappers using `cn`, `class-variance-authority`, Virgin purple/red/neutral variants, and 6-8px radius. Export `Button`, `Badge`, `Card`, `CardHeader`, `CardContent`, and `CardTitle`. Keep these primitives composable; product-specific intent belongs in variants or consuming components, not one-off inline class strings.

- [ ] **Step 2: Create layout and global styles**

Create `app/globals.css` with Tailwind directives, CSS variables for Virgin colours, white/black surfaces, neutral borders, and body defaults.

Create `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "APU Management System",
  description: "Prototype APU reason-chain and command-board system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Create shell and route stub components**

Create `components/app/route-stub.tsx` with props `{ title, eyebrow, description }` and render a plain operational panel.

Create `components/app/app-shell.tsx` with a left nav linking to `/senior/bne`, `/senior/bne/wallboard`, `/hq`, `/hq/reports`, `/hq/data-quality`, `/admin`, `/admin/reasons`, `/admin/fuel`, `/admin/urgency`, and `/admin/reference-data`.

- [ ] **Step 4: Create all route pages**

Each route page should render `AppShell` plus `RouteStub`. Use these titles:

```text
/senior/bne: BNE APU Command Board
/senior/bne/wallboard: BNE Wallboard
/hq: HQ Monitoring
/hq/reports: HQ Reports
/hq/data-quality: Data Quality
/admin: Admin Workbench
/admin/reasons: Reason Settings
/admin/fuel: Fuel Settings
/admin/urgency: Urgency Ranking
/admin/reference-data: Reference Data
```

Create `app/page.tsx` that redirects to `/senior/bne` using `redirect` from `next/navigation`.

- [ ] **Step 5: Commit shell**

Run:

```bash
git add app components lib
git commit -m feat-add-next-app-shell-routes
```

---

### Task 4: Add Route Smoke Tests And Verify

**Files:**
- Create: `app/routes.test.tsx`

- [ ] **Step 1: Add route smoke tests**

Create tests that import each page component except `app/page.tsx`, render it with Testing Library, and assert the route title is visible. Include at least `/senior/bne`, `/senior/bne/wallboard`, `/hq`, `/hq/reports`, `/hq/data-quality`, and `/admin`.

- [ ] **Step 2: Run tests**

Run:

```bash
npm run test
```

Expected: PASS.

- [ ] **Step 3: Run build**

Run:

```bash
npm run build
```

Expected: PASS and Next emits a production build.

- [ ] **Step 4: Commit tests**

Run:

```bash
git add app/routes.test.tsx
git commit -m test-add-next-route-smoke-tests
```

---

## Self-Review

- Spec coverage: active Next.js shell, Tailwind tokens, route stubs, base UI primitives, and route tests are covered.
- Public interfaces: route paths and UI primitive exports are stable for later PRs.
- Handoff checks: `npm run test` and `npm run build` must pass before moving to PR 02.
