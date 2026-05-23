# BNE 21-Aircraft Baseline Design

## Goal

Replace the default BNE baseline scenario with a realistic 21-aircraft overnight load so the senior command board, wallboard, reporting, data-quality, and admin preview surfaces all exercise high-density ground operations by default.

The target reflects real overnight operating conditions where roughly 20 aircraft can be on ground at one airport. The baseline should make UI crowding, ranking, pagination, source-quality indicators, and workflow controls visible during normal development without requiring a separate stress scenario.

## Scope

This change updates the active `pr09-admin-workbench` app. The default `bneBaselineScenario` remains the canonical import used by current BNE surfaces, but its event pack expands from two aircraft to twenty-one.

The fixture should cover:

- APU off aircraft that stay visible but low urgency.
- Active APU aircraft with valid reasons.
- Active APU aircraft with missing reasons.
- Review-overdue reason chains.
- Manual APU-off pending confirmation.
- Stale or lower-confidence stand assignment.
- Unassigned or incomplete stand context.
- ACMS source latency.
- Varied aircraft types, flight numbers, bays, runtime, ground time, and fuel assumptions.

This change does not add a scenario selector, backend API, live data integration, or new airport model.

## Data Design

The baseline remains event-shaped rather than UI-shaped. Each aircraft should be represented by source/domain events that the existing reducers can replay:

- `flight_state_event` for ground presence.
- `stand_assignment_event` where a current, stale, or lower-confidence bay/stand exists.
- `apu_state_event` for APU on or off state.
- `reason_selected` for aircraft with captured reasons.
- `manual_apu_off_observed` for at least one pending manual-off workflow.

Events should use deterministic timestamps around the existing board time of `2026-05-22T08:55:00.000Z`, with enough variation to produce meaningful runtime, ground-time, review, urgency, and fuel differences. Event IDs and source event IDs should be stable and readable.

## UI Design

The default BNE desktop board should handle the 21-aircraft load without overlapping controls or losing important context. The aircraft card grid should remain the primary work queue. The ground-aircraft table should become a useful high-density companion rather than a page-length trap, with its row list constrained to an internal scroll area on large screens.

The wallboard should continue showing two large aircraft cards per carousel page. With 21 aircraft, it should render eleven pages and keep its page marker stable. The side index should fit inside the wallboard frame with its own vertical overflow instead of forcing the wallboard shell beyond the viewport.

The UI should preserve the operational priority order from the read model. No manual sorting should be added inside components.

## Data Flow

Existing imports continue to point at `bneBaselineScenario`. The flow remains:

`bneBaselineScenario.events` -> `deriveCurrentBoard` -> `deriveAircraftCards` and scorecards -> Senior board, wallboard, HQ reports, data-quality views, and admin previews.

Workflow actions still append local domain events from `workflow-event-store`; the larger baseline should not change the action contracts.

## Error Handling And Edge Cases

The read models should keep aircraft visible when some optional source context is absent. Missing stand data should show as unassigned. Missing reasons should remain workflow-ready. Stale stand assignments should surface source quality without being treated as live certainty. Manual-off pending state should pause reason review until trusted ACMS confirmation arrives.

The UI should avoid assumptions that the baseline contains only one active APU aircraft, one off aircraft, or a small number of rows.

## Testing

Tests should verify the default baseline has 21 ground aircraft and includes representative states across the fixture. Existing tests that assert only two baseline aircraft should be updated to check key tails and counts instead.

Component tests should cover:

- Senior board renders many aircraft cards and the side table without losing workflow controls.
- Ground-aircraft table includes 21 rows.
- Wallboard carousel still displays two cards per page and shows an eleven-page marker for the default baseline.
- Wallboard side index renders all 21 rows in urgency order and remains passive.

Read-model tests should continue covering port filtering, future-event exclusion, source ordering, manual-off pending behavior, APU-off calm state, and active card facts.

## Acceptance Criteria

- The default `bneBaselineScenario` yields exactly 21 BNE ground aircraft at the existing board time.
- The baseline includes mixed APU and workflow states that exercise urgency ordering and high-density UI conditions.
- The Senior BNE page and Wallboard route render without text/control overlap at desktop and mobile widths supported by the app.
- Relevant Vitest suites pass.
- The production build passes unless an unrelated local environment issue blocks it.
