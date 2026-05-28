# Ground Aircraft Ops Rail Design

## Context

The Senior Engineer board currently has a right-side `Ground aircraft` table that starts below the scorecard band. The wallboard route has a larger side index with list-card styling. Both surfaces need a clearer operational scan pattern for current BNE ground aircraft.

The intent is not to make the rail more spacious or decorative. The rail should become more compact, closer to a spreadsheet-sized operations table, while staying aligned with the existing command-board hierarchy.

## Goals

- Keep the scorecard and benchmark band as a full-width operational summary below the command bar.
- Place the ground-aircraft rail below the scorecard band on the right side of the lower workspace.
- Make the desktop rail substantially denser than the current table.
- Use the same rail structure on the wallboard route at a larger display scale.
- Replace APU `On` / `Off` badges with small LED-style indicators.
- Remove the separate row focus button from the desktop table.
- Let clicking or keyboard-activating a desktop row snap to the matching aircraft card.

## Non-Goals

- Do not move the rail beside the scorecard band.
- Do not add a separate focus action column or visible focus button.
- Do not turn the rail into a dashboard card, ticker, or status-strip list.
- Do not add new filtering, sorting, or workflow actions as part of this change.
- Do not change the aircraft urgency order or read-model ranking rules.

## Desktop Layout

The desktop `/senior/bne` layout should keep this vertical structure:

1. Command bar.
2. Full-width scorecard and benchmark band.
3. Lower workspace split into aircraft cards on the left and the ground-aircraft rail on the right.

The ground-aircraft rail starts under the scorecard band, aligned with the aircraft-card area. It should take the full right side of the lower workspace. The rail should be sticky within the lower workspace and scroll internally so the current operations table remains visible while the aircraft board is reviewed.

Recommended lower-workspace track:

```text
minmax(0, 1fr) | 360-420px ops rail
```

The exact rail width should be chosen during implementation based on column fit, but the rail should remain compact enough that aircraft cards keep a useful working area.

## Desktop Table Density

The rail should read as a dense operational spreadsheet:

- Row height target: about 24-28px.
- Header text: about 11px.
- Body text: about 12px.
- Use tabular figures for elapsed and ground-minute columns.
- Reduce vertical and horizontal padding compared with the current table.
- Use thin dividers and a sticky table header.
- Keep a squared, plain white table surface rather than a high-padding card treatment.

The visible columns should remain focused on operational scanning:

- Tail
- Bay
- APU indicator
- Elapsed
- Ground
- Reason or review signal

The reason column can truncate when needed, but the row should remain readable and stable.

## APU LED Indicator

The APU column should use a small LED-style indicator instead of a text badge.

- APU on: red LED with a restrained pulse.
- APU off: steady green LED.
- Manual APU-off pending confirmation: steady amber LED.

The LED must not rely on color alone. It should expose an accessible label and title such as `APU on`, `APU off`, or `Pending manual off confirmation`. The table header `APU` also anchors the meaning of the indicator.

The red pulse should be subtle and should respect reduced-motion preferences. Under `prefers-reduced-motion: reduce`, the LED should become steady.

## Desktop Row Interaction

The table row itself is the focus target. There should be no separate `Focus` column and no visible `Focus {tail}` button.

Clicking a row, or activating it from the keyboard, should snap the main aircraft area to the matching aircraft card. The matched card should receive visible focus or a brief highlight so the user can orient quickly.

Rows should preserve table semantics while still being operable. The implementation can use a button-like control inside the row if needed for accessibility, but the visible result should remain a dense table row, not a list of buttons.

The row interaction applies to the desktop route only.

## Wallboard Layout

The wallboard `/senior/bne/wallboard` route should use the same structure at display scale:

1. Wallboard command bar.
2. Full-width amplified scorecard and benchmark band.
3. Lower workspace split into aircraft carousel on the left and ops rail on the right.

The wallboard rail starts below the scorecard band and takes the full right side of the lower workspace. It should be larger than the desktop rail for distance viewing, but it should still use dense table language rather than the current list-card side index.

Recommended wallboard behavior:

- Passive, read-only rows.
- Larger row height and type than desktop.
- Same LED status language.
- Sticky header and internal scrolling if the aircraft list exceeds the visible rail.
- No row-click snap behavior.
- No focus action button.

## Component Direction

`GroundAircraftTable` should become the desktop compact ops rail. It should remove the `Badge`-based APU state and the visible focus button. It can keep receiving the prioritized ground aircraft collection used today.

`WallboardSideIndex` should shift from large list-card rows to a wallboard-scale table that mirrors the desktop rail. It can consume the wallboard aircraft read model, but should present the same core columns and LED status language.

Extract the LED indicator into a small shared component so desktop and wallboard use consistent state semantics while allowing different sizes.

## Testing And Verification

Implementation should include focused coverage for:

- Desktop rail renders below the full-width scorecard band.
- Wallboard rail renders below the full-width scorecard band.
- Desktop table no longer renders a separate focus column or focus button.
- Desktop row activation targets the matching aircraft card.
- LED indicators expose accessible labels for on, off, and pending states.
- Red pulsing is disabled under reduced-motion preferences.
- Row density is materially tighter than the current table.

Visual verification should check `/senior/bne` at the current desktop review size and `/senior/bne/wallboard` at a 16:9 wallboard viewport.
