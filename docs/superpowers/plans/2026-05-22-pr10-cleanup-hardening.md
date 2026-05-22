# PR 10 Migration Cleanup And Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the Next.js prototype as the only active app surface, remove retired browser-entry scaffolding, and harden the event-first domain/read-model code.

**Architecture:** This PR changes no product behavior except removal of inactive legacy files. The active app remains the Next.js route shell backed by `lib/` event contracts, reducers, fixtures, and read models.

**Tech Stack:** Next.js, TypeScript, Vitest, Testing Library.

---

## File Structure

- Delete: the inactive legacy `src/` application tree, old root browser entry, old standalone dev helper, and obsolete standalone config.
- Keep: `app/`, `components/`, `lib/`, `test/`, package metadata, and Next.js/Tailwind configuration.
- Modify: `README.md`, `package.json`, `package-lock.json`, and reducer files in `lib/domain/`.

---

### Task 1: Prove Active Imports

- [x] Confirm the Next app and shared modules do not import the retired legacy UI/data/domain tree.
- [x] Confirm package metadata and README do not depend on the retired standalone dev workflow.

---

### Task 2: Remove Retired Legacy Files

- [x] Delete the inactive legacy application tree and old standalone entry/config files.
- [x] Remove old tests that only covered retired modules.
- [x] Remove direct package dependencies that existed only for retired reporting/export code.
- [x] Run `npm run test`.

---

### Task 3: Consolidate Docs And Scripts

- [x] Keep package scripts on the Next.js workflow: `dev`, `dev:lan`, `build`, `start`, `test`, `test:all`.
- [x] Update README quick start, route list, data-model notes, and OneDrive guidance.
- [x] Keep ignore rules for generated folders and local artifacts.

---

### Task 4: Harden Reducers

- [x] Refactor APU event closure to create updated event objects instead of mutating existing ones.
- [x] Refactor reason-chain segment closure and telemetry accumulation to create updated arrays/objects.
- [x] Run targeted reducer tests.

---

### Task 5: Full Regression

- [x] Run full unit test suite.
- [x] Run TypeScript no-emit check.
- [x] Run production build in a clean temporary copy without stale build artifacts.
- [x] Rerun production build in this worktree after clearing the ignored locked `.next` output.
- [x] Inspect final diff for accidental unrelated changes.

---

## Self-Review

- Spec coverage: inactive legacy app removed, docs/scripts consolidated, direct unused dependencies removed, reducer mutation reduced.
- Public interfaces: Next.js routes and package scripts remain stable.
- Handoff checks: full tests and build are the final gates. Latest verification: `npm run test` passed with 99 tests and `npm run build` passed in this worktree after removing ignored `.next` artifacts.
