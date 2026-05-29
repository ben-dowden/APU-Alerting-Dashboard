# Compact Card System Design

## Summary

The senior BNE command board will move to a denser aircraft card system that supports three cards per row while keeping the right-side ops rail visible. The wallboard will retain its two-card carousel viewport and receive only light spacing and hierarchy improvements.

## Goals

- Show three senior-board aircraft cards per row on desktop with the existing ops rail still visible.
- Preserve all current aircraft information and workflow controls.
- Make the card easier to scan by grouping status, metrics, reason, review, nearby, and actions more deliberately.
- Keep wallboard carousel behavior unchanged at two cards per viewport.

## Non-Goals

- No workflow behavior changes.
- No new data fields or read-model changes.
- No carousel page-size change for the wallboard.
- No redesign of the right-side ops rail.

## Senior Board Layout

The aircraft board grid will use three columns at the desktop width where the ops rail is present. The page shell will keep the ops rail visible, so the card grid and card internals need to become more compact rather than relying on extra page width.

Each senior-board aircraft card will use a compact operational layout:

- Header: tail, aircraft type, and bay remain left aligned. APU state, manual APU-off control, and data quality flag remain grouped to the right.
- Metrics: APU runtime, ground time, and fuel remain visible as three compact KPI tiles with reduced padding and slightly smaller values.
- Detail strip: Current reason, review, and nearby remain visible in a three-column strip with tighter spacing and stable wrapping.
- Workflow actions: reason selection/change, keep-current, and reason history stay inside the Current reason area, arranged as a tidy action row.
- Drawer behavior: the existing reason drawer and correction controls remain unchanged.

## Wallboard Layout

The wallboard carousel keeps two aircraft cards per page and the two-column stage. The card internals can be tightened slightly by reducing padding, spacing, and oversized type where it does not hurt TV readability. The wallboard remains passive and must not expose workflow controls.

## Accessibility And Interaction

- Text-bearing critical controls stay text-bearing where the action is operationally important.
- Icon-only controls keep accessible labels and titles.
- Focus highlighting for aircraft selected from the ops rail remains intact.
- Reason picker and data-quality popovers keep their existing keyboard affordances.

## Testing

- Update component tests for the senior card action placement and three-column board layout where useful.
- Keep existing tests that assert wallboard carousel two-card paging.
- Run the relevant Vitest suite after implementation.

## Risks

The main risk is over-compression: controls could become too small or reason text could wrap awkwardly. The implementation should prioritize stable card dimensions, readable operational text, and clear action grouping over maximum density.
