# PR 10 Migration Cleanup And Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove obsolete Vite-era active paths, consolidate scripts/docs, and harden the completed Next.js prototype with full regression checks.

**Architecture:** This PR changes no product behavior except removal of obsolete code paths. It proves the Next.js/event-first implementation is the only active app.

**Tech Stack:** Next.js, TypeScript, Vitest, Testing Library, existing export tooling.

---

## File Structure

- Delete: Vite-only active files `index.html`, `vite.config.ts`, `src/main.tsx`, `src/App.tsx`, old `src/components/*` only after confirming no imports from `app/`, `components/`, or `lib/`.
- Keep: reusable domain code only if imported by new code.
- Modify: `.gitignore`, `README.md`, `package.json`, `tsconfig.json` if needed.
- Create: `docs/superpowers/plans/2026-05-22-implementation-summary.md` only if the execution team wants a final checklist.

---

### Task 1: Identify Active Imports And Obsolete Files

**Files:**
- Verify: entire repo.

- [ ] **Step 1: Generate import evidence**

Run:

```bash
rg "from \"\\./src|from \"\\.\\./src|from \"src/|from '@/src" app components lib
rg "vite|Vite|index.html|src/main.tsx|src/App.tsx" .
```

Expected: New app code does not import Vite app entrypoints. Any remaining references are docs, old files, package lock metadata, or planned deletion targets.

- [ ] **Step 2: Commit nothing**

This is an inspection task only.

---

### Task 2: Remove Obsolete Vite Entrypoints

**Files:**
- Delete: `index.html`, `vite.config.ts`, `src/main.tsx`, `src/App.tsx`
- Delete: `.vite-cache` from disk if present and untracked.

- [ ] **Step 1: Delete obsolete entrypoints**

Remove Vite entry files only after Task 1 confirms no new app imports them.

- [ ] **Step 2: Run build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 3: Commit**

Run:

```bash
git add -A index.html vite.config.ts src/main.tsx src/App.tsx
git commit -m chore-remove-obsolete-vite-entrypoints
```

---

### Task 3: Remove Old UI Modules Not Used By Next App

**Files:**
- Delete old `src/components`, `src/hooks`, and `src/data` files only when `rg` confirms they are unused by new imports.
- Keep old domain/reporting files only if they are still imported; otherwise migrate or delete them.

- [ ] **Step 1: Inspect imports**

Run:

```bash
rg "src/components|src/data|src/hooks|src/domain" app components lib
```

Expected: No active imports from old UI directories unless explicitly preserved.

- [ ] **Step 2: Delete unused old UI directories**

Remove unused files with native shell deletion only after confirming targets are under the repo root.

- [ ] **Step 3: Run tests and build**

Run:

```bash
npm run test
npm run build
```

Expected: PASS.

- [ ] **Step 4: Commit**

Run:

```bash
git add -A src
git commit -m chore-remove-obsolete-vite-ui-modules
```

---

### Task 4: Consolidate Scripts, Ignore Rules, And README

**Files:**
- Modify: `package.json`
- Modify: `.gitignore`
- Modify: `README.md`

- [ ] **Step 1: Verify scripts**

Ensure scripts are:

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

- [ ] **Step 2: Update `.gitignore`**

Ensure it ignores:

```text
.next
node_modules
dist
.vite-cache
*.local
```

- [ ] **Step 3: Update README**

README must state:

```text
npm install
npm run dev
npm run test
npm run build
```

It must list primary routes: `/senior/bne`, `/senior/bne/wallboard`, `/hq`, `/hq/reports`, `/hq/data-quality`, `/admin`.

- [ ] **Step 4: Commit**

Run:

```bash
git add package.json .gitignore README.md
git commit -m docs-update-nextjs-prototype-instructions
```

---

### Task 5: Full Regression And Visual Sanity Pass

**Files:**
- Verify: entire repo.

- [ ] **Step 1: Full automated checks**

Run:

```bash
npm run test
npm run build
```

Expected: PASS.

- [ ] **Step 2: Manual route smoke test**

Start dev server:

```bash
npm run dev
```

Verify these routes load without blank screens:

```text
http://127.0.0.1:3000/senior/bne
http://127.0.0.1:3000/senior/bne/wallboard
http://127.0.0.1:3000/hq
http://127.0.0.1:3000/hq/reports
http://127.0.0.1:3000/hq/data-quality
http://127.0.0.1:3000/admin
```

- [ ] **Step 3: Verify critical flows**

Check:

```text
Senior board renders aircraft cards and side table.
Reason picker can select a reason.
Reason drawer opens and closes.
Manual APU off creates pending state.
Wallboard shows no workflow actions.
HQ report export downloads workbook.
Admin settings save creates settings snapshot event.
```

- [ ] **Step 4: Commit final fixes if any**

If adjustments were needed:

```bash
git add -A
git commit -m fix-final-prototype-hardening
```

If no adjustments were needed, no commit is required.

---

## Self-Review

- Spec coverage: old Vite active paths removed, scripts/docs consolidated, and final regression path defined.
- Public interfaces: Next.js routes and package scripts are final.
- Handoff checks: full tests, build, and manual smoke route checks pass.
