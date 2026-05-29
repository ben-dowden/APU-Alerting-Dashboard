# Production Navbar Design

Date: 2026-05-29

## Context

The current senior command board navbar reads like a generic prototype app header. It exposes route shortcuts for HQ, Admin, and Wallboard as first-class controls, and it gives prominent space to labels such as BNE and Senior Engineer. The product is moving toward role-specific production surfaces, so the chrome should make the user's current job clear while keeping cross-surface access available but secondary.

The wallboard header has a similar issue in a different form: it should support a passive display surface without becoming a feature itself.

## Goals

- Make the senior command board header feel like an all-access command user surface without cluttering the primary workflow.
- Keep weather, feed freshness, and local time visible and easier to scan.
- Move cross-surface navigation into a compact settings-style menu.
- Reduce wallboard header prominence so the board content remains the focus.
- Remove non-useful wallboard mode labeling, including the current read-only TV mode badge.

## Command Board Header

The command board header will use a compact left-side name: `Daily APU Fuel Burn - Command`.

The visible BNE badge and Senior Engineer text will be removed from the header. The route still represents the BNE senior command board, but that context should live in the surface content and data rather than taking up prime header space.

The right side will keep temperature, feed freshness, and local time as larger operational status chips. These should use the existing icon family, maintain accessible text, and avoid layout shifts when labels change.

Visible HQ, Admin, and Wallboard buttons will be replaced by one cog icon button. The cog opens a dropdown menu containing the available all-area links:

- Wallboard
- HQ Monitoring
- HQ Reports
- Data Quality
- Admin Workbench
- Reason Settings
- Fuel Settings
- Urgency Ranking
- Reference Data

The cog button should have an accessible label such as `Open area menu`. The dropdown should be keyboard reachable and should not obscure the live status chips.

## Wallboard Header

The wallboard header will be quieter than the command board header. Its left-side title will be `Daily APU Fuel Burn`.

It will not display BNE, Senior Engineer, Wallboard, or read-only TV mode labels in the header. These labels either duplicate the route or do not help the passive display user.

Temperature, feed freshness, and local time remain visible as larger status chips so the wallboard can still be checked at a glance from a distance.

## Component Scope

The implementation should stay focused on the existing command bar components:

- `components/senior/command-bar.tsx`
- `components/wallboard/wallboard-command-bar.tsx`
- Existing tests for the senior board and wallboard command bars

Shared helper data for the area menu may be added only if it avoids duplicated route labels between the two headers or follows an existing route metadata pattern.

## Testing

Update the component tests to assert:

- The command board title is `Daily APU Fuel Burn - Command`.
- The command board header no longer shows visible BNE or Senior Engineer labels.
- Temperature, feed freshness, and local time still render.
- Wallboard, HQ, and Admin links are no longer visible as top-level header controls.
- The cog/menu exposes the all-area links accessibly.
- The wallboard title is `Daily APU Fuel Burn`.
- The wallboard no longer shows `Read-only TV mode` or redundant wallboard persona labels.

Run the relevant Vitest suite and verify the running app visually on `localhost:3000` after implementation.
