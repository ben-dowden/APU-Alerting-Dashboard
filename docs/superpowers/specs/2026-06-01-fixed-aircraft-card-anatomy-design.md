# Fixed Aircraft Card Anatomy Design

## Summary

The senior BNE aircraft card will become a fixed-height operational card with a consistent internal anatomy. The card should support three visible rows in the board viewport, preserve the three-card board layout, and make each card easier to scan by separating identity, state, context, and actions.

## Scope

This design applies to the interactive senior-board aircraft cards. It does not change read models, workflow behavior, the ops rail, or wallboard carousel paging.

## Goals

- Make every senior-board aircraft card the same height.
- Preserve all current card information and workflow actions.
- Remove visual crowding by moving decisions into a consistent bottom action rail.
- Make APU state feel urgent without turning the whole card into an alert block.
- Reduce visible context to the highest-value details while keeping hover/focus detail available.

## Card Structure

Each card uses four stable zones.

### 1. Status Row

The top row contains identity on the left and live APU state on the right.

- Left side: tail, aircraft type, bay, and at most one source-quality chip.
- Right side: APU state badge.
- Source-quality chip shows only the strongest source issue. Priority order is Conflict, Stale, Low confidence, then Unknown.
- If multiple source issues exist, the single chip represents the strongest issue and the tooltip/title can expose the remaining detail.

APU state should mirror the ops rail LED language:

- APU On: pulsing red LED inside a white badge with red border/text.
- Pending off: pulsing amber LED inside a white badge with amber border/text.
- APU Off: solid green LED inside a white badge with green border/text.

The APU badge is status only. The decision to manually mark APU off belongs in the action rail.

### 2. Metric Row

The card keeps three equal metric tiles:

- APU Runtime
- Ground Time
- Est. Fuel Burn

All three tiles use the same width, height, typography, and spacing. The label "Fuel" is replaced with "Est. Fuel Burn".

### 3. Context Stack

The context area becomes reason-dominant, with nearby status tucked into the top-right of the stack.

Left side:

- Label: Reason
- Current reason category, clamped to fit the fixed card height.
- Elapsed reason time as a compact badge beside the category.
- Current reason detail on a compact secondary line.

Right side:

- Label: Nearby Tail
- Closest tail and distance, for example `VH-VUZ [33m]`.
- The distance appears as a small badge.
- Hover/focus exposes the existing richer nearby aircraft detail.

The visible Review section is removed from the card. Review due is expressed through the presence and emphasis of the keep-current-reason action.

### 4. Action Rail

The bottom row is a consistent action rail.

- The left action zone takes about 63% of the available width.
- Present actions slide left rather than reserving blank placeholders.
- The main reason action is the only text button: Select reason or Change reason.
- Keep current reason sits immediately beside the reason action as an icon button.
- Keep current reason should use a turnover or refresh-style icon rather than a checkmark.
- Mark APU off is an icon-only power control with tooltip/title text such as "Manually mark APU off".
- History and data-quality flag remain icon-only utility controls.
- Icon controls use consistent square sizing.

The action rail target order is:

1. Select/Change reason
2. Keep current reason, when review is due
3. Mark APU off, when available
4. Reason history, when available
5. Data-quality flag

## Fixed-Height Behavior

Cards should be designed for three visible rows in the senior board viewport. Long reason/category/detail text should be clamped rather than expanding card height. Full context remains available through existing drawer, hover, or focus interactions.

## Accessibility And Interaction

- Icon-only actions must keep accessible labels and titles.
- The APU state badge must expose the state text to assistive technology.
- The source-quality chip must expose the underlying issue detail through title or accessible text.
- Nearby hover detail must remain keyboard reachable through focus.
- Focus highlighting from the ops rail remains unchanged.

## Testing

- Update card tests to assert the action rail contains the reason workflow group and icon utilities.
- Update board tests to preserve the three-column card layout.
- Add or update assertions for the source-quality chip and APU state badge variants.
- Keep workflow tests focused on behavior, not visual implementation details.

## Risks

Fixed-height cards can hide long operational text if clamping is too aggressive. The implementation should keep the card readable first, then use hover/focus/drawer surfaces for overflow detail. The APU state badge must feel urgent without competing with reason and metric data.
