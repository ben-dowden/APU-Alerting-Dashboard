# APU Management PR Breakdown Fidelity Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement the PR plans task-by-task. This file is the sequencing and fidelity guardrail for the ten PR implementation plans.

**Goal:** Keep the PR sequence aligned with `docs/superpowers/specs/2026-05-21-apu-management-system-next-phase-design.md` while rebuilding the app in-place from the Vite prototype to the Next.js/App Router, Tailwind, and shadcn-style architecture.

**Primary Fidelity Rule:** Optimize first for the Brisbane Senior Engineer workflow. HQ reporting and Admin are secondary; early HQ/Admin routes are navigation stubs only until the Senior Engineer command board, reason workflow, urgency/proximity/manual-off layer, and wallboard route are working from the event-derived read model.

---

## PR Sequence And Gates

1. **PR 01: Next.js Foundation And Design System**
   - Creates the active Next.js shell, Tailwind tokens, shadcn-style primitives, route stubs, and persona-visible app shell.
   - Gate: `/senior/bne` exists as the default route target, but remains a stub.

2. **PR 02: Event Contracts And Scenario Fixtures**
   - Creates source/domain event contracts and BNE event-shaped scenario packs.
   - Gate: fixtures validate independently of React.

3. **PR 03: Reducers And Read-Model Foundation**
   - Converts event-shaped fixtures into current board state, cards, scorecards, benchmarks, burn rows, and diagnostics.
   - Gate: read models are deterministic and UI-free.

4. **PR 04: Senior BNE Command Board Shell**
   - Builds the display shell for the Senior Engineer surface.
   - Gate: command bar, scorecard/benchmark band, aircraft board, and side table render from the PR 03 read model.

5. **PR 05: Aircraft Card Reason Workflow**
   - Adds the core reason-chain interaction on desktop cards.
   - Gate: two-click reason selection and card-attached drawer work.

6. **PR 06: Urgency, Proximity, Source Quality, And Manual-Off**
   - Adds priority sorting, nearby aircraft context, compact quality charms, data-quality flags, and manual-off pending state.
   - Gate: Senior Engineer desktop surface is operationally meaningful.

7. **PR 07: Wallboard Route**
   - Creates the fixed-frame, read-only TV surface from the same BNE read model.
   - Gate: 16:9 wallboard has no workflow actions, overlays, drawers, QR links, or prompts.

8. **PR 08: HQ Reporting And Exports**
   - Adds HQ reporting and reason-tagged export after the Senior Engineer workflow is proven.
   - Gate: export rows reconcile with HQ totals and include lineage/assumption metadata.

9. **PR 09: HQ/Admin Workbench**
   - Adds functional admin screens for reason settings, fuel assumptions, urgency tiebreakers, reference data, persona preview, and data quality.
   - Gate: staged save/discard/reset behavior emits settings snapshot events.

10. **PR 10: Migration Cleanup And Hardening**
    - Removes obsolete Vite paths and hardens scripts/docs only after the Next.js app is complete.
    - Gate: full test/build pass and no active dependency on old Vite UI-ready mock records.

---

## Non-Negotiable Product Constraints

- Senior Engineer surfaces show runtime and estimated kg fuel, never dollar impact.
- HQ may show dollar impact, but only through configured fuel price assumptions.
- APU-off is official only when the ACMS/off source event arrives or a low-confidence inferred closure is clearly marked; manual-off observation creates a pending neutral state, not official closure.
- Reason chains extend the current ground/APU event; they do not slice historical time for precision editing.
- Review intervals default to 30 minutes and are configurable by Admin/HQ settings.
- Current reason on a card shows only current category/detail and a `HH:MM` timer; full chain lives in the card-attached drawer.
- The timeline preview shows current plus previous two segments; "show all" keeps the viewport shape and enables horizontal scroll.
- Proximity is stand/bay-derived context, not live aircraft tracking or a digital twin claim.
- Fallback fuel assumptions are visible in drawer/HQ/export contexts, not as noisy collapsed-card markers.
- Urgency bucket order is fixed in MVP; Admin edits only weighted tiebreakers and keeps the settings contract ready for future port overrides.

---

## Implementation Discipline

- Each PR starts with failing tests for the behavior it introduces.
- Each PR ends with `npm run test` and `npm run build`.
- Domain-heavy PRs keep logic in `lib/domain` and `lib/read-models`; React components consume read-model fields.
- UI PRs use shadcn-style primitives under `components/ui`, Tailwind tokens, and lucide icons.
- No plan should add placeholder dashboards that compete with the Senior Engineer workflow before PR 07 is complete.
