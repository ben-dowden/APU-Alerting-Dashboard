# APU Management PR Breakdown Fidelity Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement the PR plans task-by-task. This file is the sequencing and fidelity guardrail for the ten PR implementation plans.

**Goal:** Keep the PR sequence aligned with `docs/superpowers/specs/2026-05-21-apu-management-system-next-phase-design.md` while rebuilding the app in-place from the Vite prototype to the Next.js/App Router, Tailwind, and shadcn-style architecture.

**Primary Fidelity Rule:** Optimize first for the Brisbane Senior Engineer workflow. HQ reporting and Admin are secondary; early HQ/Admin routes are navigation stubs only until the Senior Engineer command board, reason workflow, urgency/proximity/manual-off layer, and wallboard route are working from the event-derived read model.

**Progress Snapshot (updated 2026-05-23 on `pr08-hq-reporting-exports`):** PR 01-03 are merged. PR 04-08 are complete on their feature branches in sequence, with PR 08 pushed to origin for manual PR creation/integration after PR 07. PR 09 is next and should build on the PR 08 HQ report/export read-model surfaces rather than recreating reporting derivation in Admin or HQ React components. Latest PR 08 verification passed with `npm run test` (32 files, 180 tests) and `npm run build`; on this Windows/OneDrive worktree, clear the ignored `.next` output and rerun if `next build` hits the known `.next` `EPERM` cleanup case.

---

## PR Sequence And Gates

1. **PR 01: Next.js Foundation And Design System** - **Merged 2026-05-22 via `df54f4e`**
   - Creates the active Next.js shell, Tailwind tokens, shadcn-style primitives, route stubs, and persona-visible app shell.
   - Gate: `/senior/bne` exists as the default route target, but remains a stub.
   - Follow-up: the large PR 01 left-hand sidebar is foundation-only and is not the desired product navigation. PR 04 must remove it from the Senior Engineer surface and replace page navigation with a far more discreet pattern.

2. **PR 02: Event Contracts And Scenario Fixtures** - **Merged 2026-05-22 via `51dd984`**
   - Creates source/domain event contracts and BNE event-shaped scenario packs.
   - Gate: fixtures validate independently of React.
   - Carry-forward from PR 01: run commands from the resolved repo path if Vitest path resolution behaves strangely through the workspace junction, keep the Next-generated TypeScript support intact, and avoid spending PR 02 effort on the foundation sidebar because the navigation correction is explicitly planned for PR 04.
   - Carry-forward from PR 02: event imports for PR 03 should come from `lib/events/index.ts` and scenario imports from `lib/fixtures/scenarios/index.ts`; `bneScenarios` is the intended replay pack array.
   - PR 02 implementation notes for later PRs: scenario fixtures use a shared local builder to enforce populated envelopes, `correlation.port`, and idempotency metadata; scenario event arrays are ordered by `receivedAt` while preserving `occurredAt` for replay/reporting calculations; reducers should sort primarily by `occurredAt` and use `receivedAt` for latency/staleness diagnostics.
   - PR 02 fixture semantics to preserve: manual APU-off is only `manual_apu_off_observed` domain telemetry until trusted ACMS off confirmation arrives; stale stand context is represented with low confidence plus `quality.isStale`/`quality.isPlanned` and must not be presented as live tracking; unmatched burn assumptions use the configured `UNKNOWN` fallback; equipment mismatch scenarios preserve both source/reference values through source events plus a data-quality flag.
   - Environment note: in this Windows/OneDrive worktree, `npm run test` and `npm run build` may need elevated execution permissions because esbuild can fail with `spawn EPERM` under the sandbox.

3. **PR 03: Reducers And Read-Model Foundation** - **Merged 2026-05-22 via `8559a66`**
   - Converts event-shaped fixtures into current board state, cards, scorecards, benchmarks, burn rows, and diagnostics.
   - Gate: read models are deterministic and UI-free.
   - Carry-forward from PR 03: UI PRs should import read-model surfaces from `lib/read-models/index.ts`; the main entry points are `deriveCurrentBoard`, `deriveAircraftCards`, `deriveDailyScorecard`, `deriveBenchmarkPanel`, `deriveReasonTaggedBurnRows`, and `deriveDataQualityTelemetry`.
   - PR 03 implementation notes for later PRs: current-board derivation replays BNE source/domain fixture events up to `nowIso`; APU events use source `occurredAt` transition order, with trusted ACMS off taking precedence and departed flight state only creating low-confidence inferred closure when no explicit off exists.
   - Clean-code carry-forward from PR 03: shared time/replay helpers live in `lib/domain/time.ts`; canonical and legacy fixture APU id matching lives in `lib/domain/ids.ts`; UI and prototype workflow code should not reimplement elapsed-minute math, event replay ordering, or APU id compatibility checks.
   - Clean-code framework used in PR 03: keep domain/read-model functions small and named by intent, split event-collection context from per-aircraft projection, centralize deterministic ordering helpers, and prefer table-driven mappings or registries over nested conditional label/telemetry/route/event-family logic.
   - Post-Vite cleanup carry-forward from PR 03: route metadata now lives in `lib/app-routes.ts`; current-board derivation is split across context/projection/type modules; event guards derive from source/domain event registries; BNE scenario defaults live in the scenario builder context. Later PRs should extend those registries and contexts instead of duplicating literals in UI, tests, or fixtures.
   - PR 03 fixture semantics to preserve: manual APU-off remains pending while the trusted source event is absent; reason-tagged burn rows keep unattributed runtime as its own bucket; fallback fuel assumptions retain assumption version/source metadata for HQ/export reconciliation; proximity is derived from stand coordinates only and must not be presented as live aircraft tracking.
   - Environment note: in this Windows/OneDrive worktree, `npm run test` and `npm run build` needed elevated execution permissions because esbuild/Next could fail with `spawn EPERM` under the sandbox. If `next build` fails on `.next` `EPERM` unlink/rmdir, remove the ignored `.next` output and rerun the build.

4. **PR 04: Senior BNE Command Board Shell** - **Complete 2026-05-22 on branch `pr04-senior-command-board`; pending PR integration**
   - Builds the display shell for the Senior Engineer surface.
   - Gate: command bar, scorecard/benchmark band, aircraft board, and side table render from the PR 03 read model.
   - PR 04 implementation notes for later PRs: `/senior/bne` renders `BneCommandBoard` directly instead of the foundation `AppShell` sidebar; the command bar carries compact HQ/Admin route shortcuts; the benchmark panel defaults to similar-temperature comparison; aircraft cards are display-only and intentionally contain no reason, drawer, manual-off, data-quality, or popover actions; the side-table focus action is a lightweight `data-focus-tail` placeholder for later refinement.
   - PR 04 carry-forward to PR 05/06/07: preserve `AircraftCardContent` as the shared display body, wrap it for workflow behavior in PR 05 rather than rebuilding the card contents, and keep the wallboard passive by reusing read-model data without bringing over desktop workflow actions. PR 06 has now replaced `Closest tail pending` with derived proximity fields.
   - Environment note: in this Windows/OneDrive worktree, `npm run test` and `npm run build` passed after elevated execution; if `next build` hits `.next` `EPERM` cleanup or rename errors, remove the ignored `.next` output and rerun with elevated file-write permission.

5. **PR 05: Aircraft Card Reason Workflow** - **Complete and ready for PR integration; no PR 06 implementation blockers remain**
   - Adds the core reason-chain interaction on desktop cards.
   - Gate: two-click reason selection and card-attached drawer work.
   - PR 05 implementation notes for later PRs: local workflow event persistence/actions, reason picker, card-attached drawer/timeline, and desktop card re-derivation are implemented. Clean-code hardening split reason-chain replay/review/segment logic and separated workflow event construction from persistence/hydration.
   - PR 05 handoff resolution: reason workflow surfaces are implemented, reason-chain/workflow clean-code hardening is complete, and the targeted PR 05 suite passed on 2026-05-23 with 9 files and 45 tests. PR 06 may start from the cleaned read-model/domain boundaries once PR 05 is integrated.

6. **PR 06: Urgency, Proximity, Source Quality, And Manual-Off** - **Complete 2026-05-23 on branch `pr06-urgency-proximity-quality-manual-off`; pending PR integration**
   - Adds priority sorting, nearby aircraft context, compact quality charms, data-quality flags, and manual-off pending state.
   - Gate: Senior Engineer desktop surface is operationally meaningful.
   - PR 06 implementation notes: `rankAircraftCards` owns fixed bucket ordering plus weighted tiebreakers; aircraft cards and the ground table consume derived rank/bucket/score/reason fields. Proximity is derived from stand coordinates, not live tracking, and the card hover affordance lists nearby APU-running aircraft within 100m.
   - Source-quality implementation notes: stale, unknown, conflicting, and low-confidence markers render as compact charms with tooltip detail. Fallback fuel-assumption lineage remains out of collapsed cards and is preserved for drawer/reporting/export contexts.
   - Workflow implementation notes: `data_quality_flag_created` captures tail, port, bay, derived card state, source freshness, related source event ids, user/persona, issue type, note, and timestamp. `manual_apu_off_observed` moves the card and table into neutral pending state, pauses review prompts, and does not close official burn durations until trusted source confirmation or governed inference.
   - Clean-code handoff: no larger decomposition is required before PR 07. Keep extending domain/read-model helpers rather than replaying events in React; the ranking cleanup consolidated proximity input to `card.proximity.nearbyApuAircraft`.

7. **PR 07: Wallboard Route** - **Complete 2026-05-23 on branch `pr07-wallboard-route`; pending PR integration**
   - Creates the fixed-frame, read-only TV surface from the same BNE read model.
   - Gate: 16:9 wallboard has no workflow actions, overlays, drawers, QR links, or prompts.
   - Carry-forward from PR 06: wallboard should consume the same urgency-sorted `AircraftCardReadModel` fields and passive card content for rank, bucket, proximity, source freshness, and manual-off pending status. It must not import prototype workflow actions, event stores, data-quality flag controls, drawer state, or desktop-only manual-off actions.
   - PR 07 implementation notes for later PRs: the wallboard is fixed-frame and read-only, using shared aircraft card display primitives without importing workflow controls. Later surfaces should keep wallboard data passive and continue deriving operational state from `lib/read-models/index.ts`.

8. **PR 08: HQ Reporting And Exports** - **Complete 2026-05-23 on branch `pr08-hq-reporting-exports`; pushed for manual PR creation/integration**
   - Adds HQ reporting and reason-tagged export after the Senior Engineer workflow is proven.
   - Gate: export rows reconcile with HQ totals and include lineage/assumption metadata.
   - Carry-forward from PR 06: `data_quality_flag_created` events now carry source freshness, related event ids, derived state, and actor/persona context that HQ data-quality views can surface. Manual APU-off observations remain operational telemetry only and must not close reason-tagged burn rows until trusted confirmation or governed inference.
   - PR 08 implementation notes: `deriveHqReport(events, settings, filters)` is exported through `lib/read-models/index.ts` and returns KPI totals, location/reason/unattributed rows, assumption metadata, data-quality summaries, and export-ready rows.
   - Export implementation notes: `lib/export/reason-tagged-burn-export.ts` builds an XLSX workbook with `Summary`, `Reason Tagged Burn`, `Assumptions`, and `Data Quality` sheets. Export rows include source event ids, `aircraftGroundEventId`, `apuEventId`, fuel price and burn assumption lineage, reason taxonomy lineage, `settingsVersion`, manual-off status, closure type/confidence, and fallback flags.
   - UI implementation notes: `/hq` and `/hq/reports` now render `HQReportsOverview`; shared BNE HQ report fixtures live in `lib/fixtures/hq-reporting.ts`, and shared HQ display formatting lives in `components/hq/format.ts`.
   - Clean-code handoff: three PR 08 cleanup passes extracted shared reporting fixtures/formatters, narrowed export/read-model helper boundaries, and removed duplicate route/component derivation. Full verification passed with `npm run test` (32 files, 180 tests) and `npm run build`.

9. **PR 09: HQ/Admin Workbench** - **Next after PR 08 integration**
   - Adds functional admin screens for reason settings, fuel assumptions, urgency tiebreakers, reference data, persona preview, and data quality.
   - Gate: staged save/discard/reset behavior emits settings snapshot events.
   - Carry-forward from PR 06: urgency bucket order remains fixed in product logic; Admin should edit only the weighted tiebreakers that feed `rankAircraftCards`. Keep the future settings contract compatible with global defaults first and port overrides later.
   - Carry-forward from PR 08: Admin previews should reuse `deriveHqReport`, `bneHqReportSettings`, and the report/export row contracts instead of replaying events in React or duplicating HQ fixtures.
   - Settings handoff from PR 08: preserve settings version/source metadata so future `settings_changed` snapshots can reconcile with HQ `assumptionMetadata`, workbook assumption rows, and export row lineage.
   - Data-quality handoff from PR 08: HQ/Admin diagnostics can combine existing `deriveDataQualityTelemetry` event flags with PR 08 export row fields for manual-off status, fallback burn assumptions, inferred closures, and source-event traceability.

10. **PR 10: Migration Cleanup And Hardening** - **Partially accelerated on PR 05 branch; final pass still sequenced after PR 09**
    - Removes obsolete Vite paths and hardens scripts/docs only after the Next.js app is complete.
    - Gate: full test/build pass and no active dependency on old Vite UI-ready mock records.
    - PR 10 progress notes from PR 05 cleanup: reducer/read-model hardening covered reason-chain replay, APU source-state closure helpers, reason-tagged burn slicing, workflow store hydration guards, board event indexing, and aircraft-card urgency policy. Revalidate final cleanup after PR 09 because later feature PRs may add new scripts, docs, and generated artifacts.

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
- Clean-code pass rule: before finishing a PR, scan key complex modules for duplicated time/event ordering, duplicated id matching, long mixed-abstraction functions, and nested conditional mappings that can become named helpers or table-driven mappings without changing behavior.
- Shared helper rule: use `lib/domain/time.ts` for elapsed minutes, ISO additions, and event replay ordering; use `lib/domain/ids.ts` for tail normalization, canonical ids, and PR 02 legacy fixture APU id compatibility.
- Read-model boundary rule: UI PRs should consume `lib/read-models/index.ts` outputs and extend read models when new derived facts are needed; React components should not replay source/domain events, sort operational events, or infer APU/reason state locally.
- UI PRs use shadcn-style primitives under `components/ui`, Tailwind tokens, and lucide icons.
- No plan should add placeholder dashboards that compete with the Senior Engineer workflow before PR 07 is complete.
