# APU Management System Next Phase Design

## Product Intent

The next phase moves the APU Alerting Dashboard from a local proof of concept toward a multi-user APU management system. The primary business outcome is to reduce total APU runtime. The primary product mechanism is to increase explained and attributable APU runtime through low-friction reason-chain capture.

The prototype should prove operational relevance before integration complexity. It uses dummy operational data, realistic data contracts, and Brisbane-focused workflow detail. Live API endpoints are out of scope for this phase.

## Primary User Surface

The principal v1 surface is the Brisbane Senior Engineer workflow. HQ reporting and HQ admin settings are secondary surfaces. Apron engineer prompts are a future role and should be represented only enough to preserve the intended direction.

The Senior Engineer surface is a widescreen command board designed to work on a 70-inch TV display in an engineering break-room environment, while remaining usable on a laptop or desktop.

## Visual System

The UI should use Virgin Australia colour cues as the visual source of truth: white/black operational surfaces, indigo structure, purple actions, and red for urgent or missing-reason states. It should feel like a working engineering tool, not a marketing dashboard.

Use this Virgin Australia palette:

- Indigo / structural navigation: `#1F1A4F`
- Purple / primary action buttons: `#511C98`
- Red / urgent or missing-reason states: `#E10A0A`
- Black / primary text: `#000000`
- White / main surfaces: `#FFFFFF`

Purple (`#511C98`) is the default colour for primary action buttons, selected controls, and active interactive emphasis. Indigo (`#1F1A4F`) is for structural areas such as navigation, high-level headers, and deep background accents. Red (`#E10A0A`) is for operational urgency, missing-reason states, and critical alert cues.

Use neutral black/white/grey treatments for calm states. Avoid adding a broad secondary palette unless a specific operational state cannot be communicated clearly with the Virgin palette. If a non-brand semantic colour is introduced later, it should be deliberate, minimal, and documented as a semantic exception rather than a brand colour.

Cards, panels, popovers, tables, and controls should use 6-8px border radius. Avoid nested decorative cards. Use cards only for aircraft, repeated summary panels, popovers, drawers, and settings rows. Page sections should be unframed layout regions or full-width operational bands.

Use icons from `lucide-react` for actions. Avoid verbose action labels where a standard icon plus tooltip is clearer, but the first missing-reason action must be a clear text button.

Default desktop typography should stay compact; the wallboard aircraft-card wrapper has its own larger scan-distance typography rules:

- Header title: 22-26px
- Metric values: 24-30px
- Aircraft tail: 22-24px
- Card body: 12-14px
- Table text: 12-13px
- No viewport-width font scaling
- No negative letter spacing

## Senior Engineer Command Board

The main screen uses a command board layout:

1. Header with BNE context, persona, current time, and feed status.
2. Daily scorecard with four fixed headline metrics.
3. Benchmark panel that shows one comparison at a time.
4. Urgency-sorted aircraft card board.
5. Compact side table listing all BNE aircraft currently on ground.

The daily scorecard shows:

- Active APU aircraft now
- Total APU runtime today
- Estimated kg fuel burned today
- Attributed runtime percentage

The benchmark panel supports:

- Similar-temperature days
- Weekly average
- Monthly average
- Annual average

Only one benchmark is visible at a time. In wallboard mode, the benchmark cycles every five seconds. On desktop, users can manually select a benchmark; after 20 seconds of no benchmark interaction, the panel resumes cycling.

Benchmark deltas show exact absolute and percentage values. The Senior Engineer surface uses runtime and estimated kg fuel, not dollar impact.

### Command Board Layout Details

Target the primary wallboard layout at 16:9 widescreen. The board should fill the available viewport without vertical scrolling. Desktop and laptop users may scroll, but the wallboard route should behave like a staged information screen rather than a scrollable dashboard.

Use this hierarchy:

```text
Header: 60-72px
Scorecard and benchmark band: 180-240px
Main content: remaining height
```

The wallboard scorecard/benchmark band should be visually larger than the desktop version. Topline metric numbers should be readable at TV distance and can take more vertical space than a laptop dashboard would normally allow. The benchmark rotator remains directly connected to the scorecard band so the screen still feels like one command board, not a pile of separate widgets.

Wallboard main content uses two regions:

```text
Aircraft carousel stage: flexible width, one row, two large cards per page
Ground aircraft index rail: 380-460px fixed rail
```

The wallboard aircraft stage should show one row with two large aircraft cards. If more active cards exist, the stage rotates through carousel pages in urgency order. The carousel should use calm motion, such as a quick fade or short horizontal slide around 180-220ms, and should avoid attention-grabbing animation. A prototype default of about 10 seconds per page is appropriate unless testing shows the room needs a slower cadence.

When a new urgent aircraft appears or an existing aircraft becomes more urgent, the wallboard carousel should keep its timing steady. It should not immediately jump to a new page. Instead, the enlarged side index should show a subtle urgency cue on the affected row, such as a short red pulse, intensified left status strip, or brief glow. The new urgency order should affect the next scheduled carousel page calculation, while the current page finishes its normal interval.

The wallboard side index should stay visible at all times and should be large enough to function as the full aircraft inventory. It should list all BNE ground aircraft, including APU-off aircraft, with enlarged row height and text compared with the desktop side table. The side index is sorted by the same urgency ranking that drives the carousel, not by bay or stand. This prevents the carousel from hiding the existence of other aircraft while still letting the main cards breathe.

When side-index order changes, use a basic, restrained reorder animation so the shift is legible: rows can move with a short transform transition around 140-180ms and a soft highlight on rows whose rank changed. Urgency cues in the side index should be visible but restrained: no flashing, no alarm-style animation, and no repeated motion loops.

Desktop layout can keep the denser board behaviour: at large widescreen widths, the aircraft board can use three card columns if each card can remain at least 340px wide. At normal desktop widths, use two columns. At narrow widths, collapse to one column and move the side table below the card board.

The header contains:

- Product title: `BNE APU Command Board`
- Persona/role control on the right, implemented as a compact persona switcher for the POC
- Feed status chip: `Mock feed`, `Last event`, or `APU feed delay`
- Temperature chip, such as `BNE 31°C`
- Current time
- Optional wallboard/desktop mode indicator

Temperature is a port-level condition from METAR, not an aircraft-level fact. It belongs in the command bar or benchmark area rather than on each aircraft card.

The header should not include the old generic tab-first mental model for the Senior Engineer surface. The role should determine the starting surface.

The scorecard row uses four metric cards:

1. `APU on now`
2. `Runtime today`
3. `Fuel burned today`
4. `Attributed runtime`

Metric cards should be visually even in size and should not contain more than one helper line. Use icons, but keep them secondary to the number:

- `Activity` or `Power` for APU on
- `Timer` for runtime
- `Fuel` for kg fuel
- `CheckCircle2` for attributed runtime

Metric helper text examples:

- `3 active aircraft`
- `Across BNE ground events`
- `Estimated from runtime`
- `Current reason-chain coverage`

On the wallboard route, these four scorecard metrics should be visually amplified: larger numbers, stronger status icons, and enough spacing that each metric can be read from across the room. The wallboard should not shrink the metrics to make room for more aircraft cards; the side index and carousel carry the aircraft density.

The benchmark panel is a single horizontal band below the scorecard. It shows:

```text
Similar-temp benchmark
+42kg / +6.1% vs matched 3°C temperature bands
[Similar temp] [Week] [Month] [Year]
```

On wallboard mode, the active benchmark segment changes every five seconds. The active segment should be indicated by the purple selected state and a subtle progress bar along the bottom edge of the selected chip. Manual benchmark selection and pause/resume behaviour belong to the desktop route only.

Use colour semantics for deltas:

- Worse than baseline: red icon or delta marker
- Better than baseline: indigo or black positive marker
- Flat/near-neutral: grey marker

Do not use dollars in this panel.

## Aircraft Board

The aircraft board shows all aircraft currently on ground at Brisbane based on OOOI or a future flight-state source. APU-off aircraft remain visible in a calm neutral complete state. Aircraft leave the board when they are no longer on ground or otherwise out of operational scope.

Cards are not visually grouped. They are sorted as a work queue using fixed operational buckets first, then weighted tiebreakers inside each bucket:

1. Missing reason
2. Overdue reason review
3. Active APU with current/valid reason
4. Manual APU-off pending source confirmation
5. APU-off or OK aircraft

Bucket order is the first-order priority. A long-running aircraft with a valid current reason should not outrank an aircraft with no reason captured. Within each bucket, use a weighted tiebreaker score so the ordering still feels operationally intelligent.

Initial weighted tiebreaker factors:

- Minutes overdue for reason review
- APU runtime minutes
- Estimated kg fuel burned
- Proximity cluster signal, such as nearby APU-running aircraft within 100 metres
- Total ground time, as a low-weight context signal
- Stable deterministic fallback, such as tail or APU event id, to avoid jitter when scores are tied

The design supports a global default urgency-weight set with future port-specific overrides. The first implementation should edit only the global default weights, while keeping the settings model shaped so BNE or other port overrides can be added later without redesigning the ranking contract. The bucket order remains fixed in the product logic for MVP; HQ Admin edits only the weighted tiebreakers inside each bucket. The ranking settings should still be represented as a small read-model settings object with clear names, default values, and validation. The first Senior Engineer implementation slice may seed these defaults without building the admin editor immediately, but the prototype target includes the editable admin screen. For real integration, the ranking should move into the backend or integration read model so every consuming surface receives the same rank, bucket, and explanation.

Urgency ranking should be calculated by the domain/read-model layer, not ad hoc in React components. Each aircraft card/table row should receive ranking fields such as:

- `urgencyRank`
- `urgencyBucket`
- `urgencyScore`
- `urgencyReason`
- `urgencyTiebreakerBreakdown`
- `previousUrgencyRank` when useful for animation

The `urgencyReason` should be human-readable enough for debugging and future telemetry, such as `Missing reason`, `Review overdue by 18m`, or `Valid reason, high runtime and nearby APU cluster`. The UI does not need to show this prominently, but tooltips, tests, and HQ product telemetry should be able to inspect it.

For the prototype, this ranking can be derived from event-shaped fixtures. For real integration, the same ranking should come from the backend or integration read model so the desktop board, wallboard carousel, side index, and exports all agree on why an aircraft is being prioritized.

On the desktop board, cards may move as urgency changes. Movement should use very light and quick animation suitable for an operational display.

On the wallboard route, urgency changes should not interrupt the current carousel page. Use the enlarged side index to show the urgency change immediately, then let the carousel order update on the next scheduled page turn.

Each active APU card shows:

- Tail and aircraft type
- Bay or stand
- APU runtime
- Total ground time
- Estimated kg fuel burned
- Ground service availability when known
- Closest tail and distance
- Nearby APU-running aircraft within 100 metres, shown only in a tooltip/list when the user hovers or focuses the proximity row
- Current reason and elapsed time in `HH:MM` format

The compact side table lists all BNE ground aircraft with:

- Tail
- Bay
- APU on/off state
- APU elapsed minutes
- Total ground minutes
- A small ghost action that scrolls to and focuses the aircraft card

### Aircraft Card UI Details

Each aircraft card should have a stable, scannable structure:

```text
┌──────────────────────────────────────┐
│ VH-8IA                 B737-8 / Bay43│
│ BNE · Domestic remote stand          │
├──────────────────────────────────────┤
│ APU ON  1h 24m        Ground 1h 52m  │
│ Fuel 312kg            Closest 42m    │
│ PCA available         GPU unavailable│
│ Closest tail: VH-YIB · 42m       [?] │
├──────────────────────────────────────┤
│ Current reason                       │
│ Cleaning in progress · cleaner aboard│
│ 00:24                                │
│ [↻] [ Change reason ]        [chain] │
│ Review due in 00:06                  │
└──────────────────────────────────────┘
```

Desktop card layout should prioritize three clear bands:

1. Header: tail, equipment, bay/stand, and state badges.
2. Aircraft facts: APU runtime, ground time, estimated kg fuel, support availability, proximity, and source charms.
3. Current-reason workflow: current reason, elapsed `HH:MM` timer, review due state, reason actions, and drawer trigger.

Desktop and wallboard cards should use shared aircraft-card content and a shared card read model, but separate wrappers:

- `AircraftCardContent`: shared presentational subparts and field formatting for tail, equipment, bay, APU state, current reason, timers, fuel estimate, proximity summary, and source charms.
- `DesktopAircraftCard`: active workflow wrapper for `/senior/bne`; includes reason actions, drawer trigger, manual APU-off, data issue flagging, and pointer-focused density.
- `WallboardAircraftCard`: passive display wrapper for `/senior/bne/wallboard`; uses the same content/read model and near-parity visible facts, but increases card size, spacing, and typography for a 70-inch display.

Aircraft card shadcn composition:

- Root: shadcn `Card` with custom Tailwind state strip. Use a 3-4px left border or top strip for state, not a heavy coloured card background.
- Header: `CardHeader` or custom header layout with tail as the largest text, equipment and bay/stand as secondary facts, and compact `Badge`s for `APU on`, `Reason missing`, `Review due`, `Pending confirmation`, or `APU off`.
- Body: `CardContent` with a compact fact grid: APU runtime, total ground time, estimated kg fuel, ground support availability, closest tail/distance, and source freshness charms where allowed.
- Proximity: closest-tail row uses `HoverCard` when there are nearby APU-running aircraft within 100 metres, listing tail, bay, and distance from the selected aircraft. If no richer detail is needed, use `Tooltip`.
- Current reason block: a product subcomponent inside `CardContent`, visually separated with a light divider or soft neutral band. It shows only current category/detail and elapsed timer in `HH:MM`.
- Reason action cluster: placed inside the current-reason block, aligned with the current reason and timer. It contains the primary reason action, keep-current icon action when relevant, change reason action, and the card-attached reason-drawer trigger.
- Footer: do not use `CardFooter` for reason actions. If a footer is used at all, keep it for quiet utility actions and make sure the card still reads as an aircraft status surface, not a form.

The wallboard card should keep nearly all desktop aircraft facts visible, but render them larger and non-interactive. It should include tail, equipment type, bay/stand context, APU state, APU runtime, total ground time, estimated kg fuel, ground service availability when known, closest tail and distance, current reason and `HH:MM` timer, review due state, and compact source/freshness charms where useful. The main difference from the desktop card is interaction, not information: remove reason action buttons, drawer triggers, manual APU-off action, data issue action, editable notes, QR/deep links, and other workflow affordances. Drawer-only detail, such as the full reason timeline and fallback fuel-assumption explanation, remains out of the wallboard card.

Wallboard typography should be visibly larger than the desktop card without using viewport-width font scaling. Use fixed responsive Tailwind sizes so the tail, status, and current-reason timer can be read at TV distance, while preserving stable card dimensions and preventing timer/reason text from shifting the board.

Card state styling:

- Missing reason: red left border, light red top cue, primary purple `Select reason` button, red status label `Reason missing`.
- Review due: indigo or purple left border, `Review due` status label, primary icon action to keep current reason, secondary `Change reason` button.
- Current reason valid: neutral/purple cue, current reason block visible, no urgent red pressure.
- APU off: calm neutral/white complete treatment, `APU off` label, no reason actions.

The card should not display dollar impact. Replace existing frontline dollar fields with time and kg fuel. HQ views can still use dollar conversion.

Card controls:

- Missing reason: show a clear filled shadcn `Button` labelled `Select reason`, using purple `#511C98`, with a small reason/list icon if it helps communicate action.
- Review due: show an icon-only shadcn `Button` with `Repeat2`, `RefreshCcw`, or similar to keep the current reason. The visual label is the icon; tooltip text is `Keep current reason`.
- Change reason: show a secondary shadcn `Button` labelled `Change reason`, using `outline` or `secondary` styling. It opens the same anchored reason `Popover`.
- Current reason valid: still allow `Change reason`, but keep it quieter than the missing/review-due actions.
- Manual APU-off observation: show a restrained secondary or ghost shadcn `Button` labelled `Mark APU off`. Tooltip: `Mark as off pending source confirmation`. Keep this near APU state context rather than the main reason action group where possible.
- Reason chain drawer: show a light ghost icon shadcn `Button`, preferably `PanelRightOpen`, `History`, or `ListTree`. Tooltip: `View reason chain`. It opens the card-attached reason drawer.
- Side table focus action: use a ghost button with an arrow or target-style icon. Tooltip: `Show aircraft card`.

Reason actions should sit inside the current-reason block, aligned with the current reason and chain icon. They should not sit as a dominant global footer that makes the whole aircraft card feel like it exists only to collect a reason. The card hierarchy is aircraft state first, current reason second, actions third.

The drawer-closed aircraft card state, when an APU is on, shows only the current active reason and its elapsed timer in `HH:MM` format. Previous reasons are not shown on the card. The reason chain is available only from the drawer.

Fallback-derived fuel-estimate markers should not appear on the collapsed aircraft card. The card can still show the kg estimate, but the assumption-quality detail belongs in the drawer so the main board stays clean.

The closest-tail row is always visible when spatial data is available. Nearby APU-running aircraft within 100 metres appear in a hover/focus tooltip from the closest-tail row or proximity icon. Tooltip content should list tail, bay, and distance from the selected aircraft:

```text
Nearby APU-running aircraft
VH-YIO · Bay 44 · 78m
VH-8IC · Bay 45 · 95m
```

Card movement animation should be subtle and fast:

- Use transform/opacity transitions around 140-180ms.
- No bouncing or decorative motion.
- Movement should help users notice priority changes without making the wallboard feel restless.

When a side-table row focuses a card, scroll the card into view and apply a brief focus ring or soft purple glow for about one second. Do not open the drawer automatically.

### Ground Aircraft Side Table

The side table is an index, not a second workflow. It should be compact enough to stay visible on a TV:

```text
Tail    Bay   APU   APU min   Ground   ↗
VH-8IA  43    On    84        112      ↗
VH-YIB  44    Off   0         76       ↗
VH-YIO  02    On    31        58       ↗
```

Rows should use understated state cues:

- APU on: small red or purple status dot depending on reason/review state
- APU off: small neutral complete-status dot or outline
- Missing reason: red `Missing` micro-label if space allows

The table should not show benchmark deltas, dollars, or long reason text. Its job is complete ground-aircraft awareness and quick navigation.

## Spatial Context

There is no map in v1.

Spatial data is an invisible calculation layer. BNE bay or stand coordinates are supplied as dummy/static data initially, likely sourced manually from Google Maps. The app uses those coordinates to calculate:

- Closest tail and distance
- APU-running aircraft within 100 metres

The UI must not imply live aircraft position, live towing, or digital twin accuracy. Stand assignment data should be presented as stand or bay context, not live location telemetry.

## APU Event Model

The APU source is treated as timestamped event data:

- APU-on timestamp opens an APU event.
- APU-off timestamp closes the APU event.
- The app does not claim the APU is off until the off message arrives.

Review prompts are product workflow events, not feed-interval events. While an APU event is open, the app prompts for reason review based on the configured review interval for the current reason detail. The default review interval is 30 minutes.

When the APU-off timestamp arrives, the app closes the ground-time event, stops review prompts, finalizes reason segment durations, and locks the reason chain for normal users.

## Reason Chain

The reason-chain model is diagnostic, not forensic. The goal is to understand why APU runtime persists over time, not to reconstruct a perfect minute-by-minute operational record.

Each open APU event has an ordered reason chain. A visible reason segment includes:

- Category
- Detail
- Start timestamp
- End timestamp when replaced or when the APU event closes
- Optional note

If review is due and the user keeps the current reason, the current segment extends. If the user changes the reason, a new segment starts.

Cards show a collapsed reason-chain summary:

- Current reason and elapsed time
- A light icon button to open the full reason-chain drawer

Example collapsed pattern, drawer closed:

```text
Current reason
Cleaning in progress · cleaner onboard        00:24
```

The drawer allows users to:

- View the full reason chain
- Update the current reason
- Add an optional note
- Correct the category/detail on a previous segment when the original selection was wrong

The drawer does not support slicing segments, inserting retrospective segments, editing timestamps, or gamifying retrospective cleanup.

### Reason Chain UI Details

The collapsed card reason block should always show the current reason when an APU is on:

```text
Current reason
Cleaning in progress · cleaner aboard
00:24
```

The collapsed card does not show prior reason segments, history pills, or timeline fragments. Keeping prior reasons out of the card prevents the reason-chain feature from dominating the whole aircraft card. The full chain appears only in the drawer.

The desktop drawer is not the stock shadcn full-screen `Sheet` pattern. It is a custom `CardReasonDrawer`: a below-card detail tray that expands downward from the selected aircraft card and overlays board content beneath it. It should feel attached to the card that opened it.

Desktop drawer behaviour:

- Opens from the card's reason-chain icon, attached to the bottom edge of the selected card with an 8-12px vertical offset.
- Width should usually match the selected card width. It may widen up to about 520px if the card column and viewport allow, but it should remain visually owned by that card.
- The drawer overlays cards or board content beneath the selected card. It should not push the grid, resize other cards, or cause board reflow.
- If there is not enough space below the card, it can clamp height with internal scroll or open above the card as a collision fallback. It should still behave like a card-attached tray, not a side sheet.
- It should not dim the whole screen, take over the full viewport, or feel like a separate modal workflow.
- It collapses on outside click, Escape, or focus leaving the drawer/trigger region.
- Clicking or tabbing inside the drawer keeps it open.
- Closing returns focus to the drawer trigger button.
- It should float above the board content with a clear border, subtle shadow, and white surface.
- On narrow screens only, the same content may fall back to a full-width drawer/sheet pattern for usability.

Drawer closed state:

```text
Aircraft card
- Aircraft state facts
- Current reason only
- Reason actions embedded in current-reason block
- Ghost icon: View reason chain
```

Drawer open state should be compact by default. The visible tray content before scrolling should show only the workflow-critical items:

```text
Header
- Tail, bay, APU runtime, ground time
- Current state: Missing reason / Review due / Current / Closed

Current reason section
- Current category/detail
- Elapsed time
- Review due time
- Change reason action
- Optional note field

Recent timeline preview
- Current segment highlighted
- Previous two segments, if they exist
```

The timeline preview should render as a horizontal left-to-right reason strip inside the drawer viewport. Each segment appears as a compact pill/card. The first line is the time range in small muted text. The main label is the reason detail in compact black semi-bold text. Category can appear as a small muted context label or badge when needed, but it should not dominate the segment. Duration can sit as a small secondary value.

The current segment should be visually emphasized with an indigo `#1F1A4F` top bar and a small `Current` badge. It should not use scale, lift, bounce, or heavy background treatment. Previous segments use neutral styling.

Example segment hierarchy:

```text
09:40-10:10
Cleaner onboard
Current · Cleaning in progress · 30m
```

Default timeline strip:

- Show the current segment plus the previous two segments.
- Keep all visible segments inside the same drawer viewport without requiring scrolling for the default state.
- Use a restrained ghost icon `Button` when more segments exist. Suggested icon: `ListTree` or `MoreHorizontal`. Tooltip text: `Show all reasons`.

When the user selects the `Show all reasons` icon button, the drawer viewport stays the same size and position. The reason strip becomes horizontally scrollable, or otherwise internally scrollable within the same tray, so the user can inspect the full reason chain without expanding the drawer or reflowing the board.

Fuel-estimate detail, equipment type, burn assumption version, fallback explanation, and admin/HQ telemetry should stay below the compact workflow content or inside quiet collapsed sections. The first visible drawer view should not feel like a report.

Normal Senior Engineer users can see the chain and add a note to the current segment. They can correct the category/detail on a previous segment only through a tiny edit icon on that segment. The segment itself should not be fully clickable. The edit icon should be hidden by default and appear only on hover or keyboard focus. It should use a restrained ghost `Button` with a `Pencil` or `PencilLine` icon, and have tooltip text such as `Correct reason`. On touch devices, the same icon can be visible when the segment receives focus.

The previous-segment edit action opens the reason picker in correction mode, anchored to the tiny edit icon or segment. It changes only the selected segment's category/detail. It does not edit timestamps, split segments, insert retrospective segments, or create a new reason segment. The current segment should use the main `Change reason` action rather than a tiny timeline edit icon. Closed APU events remain read-only for normal users.

If the fuel estimate uses a fallback rate because the equipment type did not match an active burn assumption, show a tiny charm in the drawer's lower fuel-detail section or collapsed detail header. The charm should be visually quiet, support hover/focus, and use a tooltip such as `Fuel estimate uses fallback burn rate because no active equipment-type assumption matched this aircraft`. Do not show this charm on the collapsed card or in the default top of the drawer.

Closed APU events show the drawer in read-only mode for normal users. The reason chain is locked when the APU-off message arrives.

## Reason Capture Interaction

Reason capture must be fast and clearly actionable.

When no reason exists, the card shows a clear action button such as `Select reason`.

When review is due, the primary quick action is an icon button to keep the current reason. A secondary action lets the user change the reason. The drawer expansion remains a light icon action.

Reason selection uses a compact anchored popover:

1. User clicks the reason action button.
2. A small popover opens with reason categories.
3. User clicks a category.
4. A right-side detail panel opens.
5. User clicks a detail and the reason is saved.

The fast path is a two-click process after opening the picker: category, then detail. It must not require scrolling. Each category should have no more than four detail options. Free-text notes are exception-only and live in the drawer, not in the fast path.

Initial top-level reason categories are:

- Infrastructure unavailable
- Cleaning in progress
- Engineering requirement
- Flight operations / pilot discretion
- Logistics / agent on the way

Initial BNE detail options should be:

| Category | Detail options |
| --- | --- |
| Infrastructure unavailable | PCA unavailable; GPU unavailable; Bay service unavailable; Remote stand / no support |
| Cleaning in progress | Cleaner onboard; Cleaning not yet attended; Cabin preparation in progress; Cleaning complete / awaiting follow-up |
| Engineering requirement | Maintenance task in progress; Defect investigation; Engineer not available at aircraft; Return to aircraft not practical |
| Flight operations / pilot discretion | Pilot discretion; Crew comfort request; Pre-departure operational requirement; Operational instruction |
| Logistics / agent on the way | Agent on the way; Equipment on the way; Awaiting tow / stand move; Turnaround sequencing |

These labels are starting content for the prototype. HQ/Admin must be able to rename, deactivate, reorder, and adjust review intervals without code changes.

### Reason Popover UI Details

The reason picker is a cascading popover anchored to the card action button. It should not use a modal for the fast path.

Interaction:

1. User clicks `Select reason` or `Change reason`.
2. A category panel opens directly under or beside the button.
3. User hovers or clicks a category.
4. A detail panel opens to the right of the category panel.
5. User clicks a detail.
6. The popover closes, the card reason updates, and the card returns to its valid/current state.

The category panel should be about 220-260px wide. The detail panel should be about 240-300px wide. Each row should be large enough to hit comfortably on the desktop workflow surface: roughly 36-42px high.

Use icons sparingly in the category list:

- Infrastructure: `PlugZap` or `Cable`
- Cleaning: `Sparkles` or `Brush`
- Engineering: `Wrench`
- Flight operations: `Plane`
- Logistics: `Truck` or `Route`

The detail list must show no more than four choices for the selected category. If HQ config creates more than four active details, the admin screen should flag that the reason set is not valid for Senior Engineer fast capture.

After reason selection:

- If this is the first reason, the card leaves `Missing reason`.
- If this replaces the current reason, a new reason segment starts.
- If this is a correction on a past segment from the drawer, only the selected segment category/detail changes; timestamps remain unchanged.

The keep-current-reason icon does not create a new visible timeline item. It extends the current segment and records review telemetry behind the scenes.

## Reason Configuration

Reason taxonomy is governed by HQ/admin users, not by frontline users. The system should support port-specific configuration within that governance model.

HQ Admin settings manage:

- Reason categories
- Up to four detail options per category
- Default review interval, defaulting to 30 minutes
- Optional per-detail review interval override
- Port applicability or port-specific override
- Active/inactive status
- Display ordering
- Urgency-ranking tiebreaker weights

The Senior Engineer workflow consumes this configuration. The taxonomy should not be hard-coded into backend logic.

### Admin Settings UI Details

HQ Admin should have a simple settings area, not a complex enterprise configuration suite.

Settings navigation should include:

- Reason taxonomy
- Port overrides
- Urgency ranking
- Fuel price
- Fuel-burn assumptions
- Reference data
- Persona/role preview for the POC

Reason taxonomy screen:

```text
Category table on left
Detail editor on right
```

Category rows show:

- Category name
- Icon
- Active/inactive
- Port applicability summary
- Number of active details

The detail editor for the selected category shows up to four detail rows per port/default configuration:

- Detail label
- Review interval in minutes
- Active/inactive
- Tags such as `infrastructure`, `provider-related`, `valid operational need`, or `avoidable`
- Display order controls

If more than four active details are configured for a category, show an inline warning: `Fast capture allows a maximum of 4 active details`.

Port overrides should inherit the global category/detail set by default. BNE can override labels, active details, review intervals, and ordering, but HQ/Admin owns the change.

Urgency ranking screen:

- Show the fixed bucket order as read-only: missing reason, overdue reason review, active APU with valid reason, manual APU-off pending source confirmation, then APU-off or OK.
- Allow HQ Admin to edit the global default weighted tiebreaker factors used inside each bucket.
- Keep the screen and settings contract compatible with future port-specific overrides, but do not implement port-specific urgency overrides in the first slice.
- Editable factors should include overdue review minutes, APU runtime minutes, estimated kg fuel burned, proximity cluster signal, and total ground time.
- Show a non-editable deterministic fallback tiebreaker, such as tail or APU event id, so users understand why tied rows remain stable.
- Provide a small BNE preview table showing how the current BNE board would rank under the configured weights. In the mock-driven prototype, this means the currently loaded BNE mock board state, not a library of saved scenario examples.
- Include reset-to-default behaviour for the prototype so ranking experiments can be safely undone.
- Capture a ranking settings version label and last-updated metadata.

Validation rules:

- Weights must be numeric and non-negative.
- At least one active tiebreaker weight must be greater than zero.
- Bucket order is not editable in MVP.
- The preview should flag when a change materially reorders current aircraft so HQ Admin understands the operational effect before saving.
- The MVP urgency preview should not include a saved-scenario selector or scenario comparison suite.

Fuel price screen:

- Input for fuel price
- Currency
- Effective date
- Source/note
- Last updated by/persona in POC

Fuel-burn calculation screen:

- Lightweight fuel-burn assumptions table or listing by aircraft equipment type
- Equipment type code, such as `B738`, `B737`, or `B38M`
- Equipment type label, such as `737-800`
- APU fuel-burn rate assumption used for estimated kg calculations
- Unit, such as kg per minute
- Effective from date
- Calculation version label or assumption set version
- Active/inactive state
- Configured fallback rate for unmatched equipment types
- Source/note
- Last updated by/persona in POC

The prototype should include enough equipment-type specificity to distinguish likely material differences, especially 737 MAX 8 / MAX 10 aircraft versus 737-800 NG aircraft. The current expectation is that the difference may be around +/- 20kg per hour, which is meaningful enough for reporting and operational insight.

The prototype table should be simple and low-burden. It can be seeded/config-backed if a fully editable admin table would slow the prototype down. A richer HQ/Admin maintenance table for equipment-type assumptions is a roadmap item unless it can be delivered cheaply.

Validation rules:

- Each active equipment type should have one active burn-rate assumption for the relevant effective period.
- The table should warn when an equipment type used by current aircraft has no active burn-rate assumption.
- If the app uses the configured fallback rate for an unknown equipment type, the aircraft drawer, HQ reporting, and export data should mark that estimate as fallback-derived.

HQ reports should show the active fuel price assumption used for dollar conversion and the active fuel-burn calculation version or assumption set used for estimated kg.

The MVP should not include a full calculation model-management UI. Admin configuration only needs to store and expose the active assumptions well enough for reporting transparency and reconciliation.

## Roles And Permissions

The POC uses a lightweight persona switcher rather than real authentication. The app model should still treat identity as a real concept so Microsoft Entra authentication and group assignment can replace the persona switcher later.

Prototype roles:

- Senior Engineer - BNE: primary operational command board, BNE aircraft cards, reason-chain capture, daily scorecard, proximity signals.
- HQ Viewer: secondary reporting surface for cross-location scorecards, trends, annual and daily performance, dollar reporting, and monitoring. No write-back.
- HQ Admin: HQ reporting plus admin settings for reason taxonomy, port-specific configuration, review intervals, fuel price assumptions, fuel-burn calculation assumptions, and urgency-ranking weights.
- Apron Engineer: future role for iPad/mobile prompts, targeted aircraft actions, and reason entry from the line.

Future enterprise mapping should allow Entra groups to map to app roles and port scopes.

### Persona Switcher UI

The POC persona switcher lives in the app header as a compact dropdown. It should feel like a demo utility, not a fake username/password login screen.

Example personas:

- `Senior Engineer - BNE`
- `HQ Viewer`
- `HQ Admin`
- `Apron Engineer (future preview)`

Switching persona changes:

- Default landing surface
- Available navigation items
- Port scope
- Write permissions
- Whether admin settings are visible
- Whether HQ dollar reporting is visible

The implementation should still use real app concepts: `currentUser`, `role`, `portScopes`, and `permissions`. Entra group mapping can later supply those values.

## HQ Reporting

HQ reporting is a secondary view and has no operational write-back except for HQ Admin settings. HQ can view:

- Run rates
- Location performance
- Daily and annual scorecards
- Trends
- Cross-location reporting
- Dollar impact
- Product/process telemetry such as reason review response time

Dollar conversion uses a configurable fuel price from HQ/Admin settings. It must not be hard-coded. Reports should show which fuel price assumption was used.

Estimated kg fuel uses configurable aircraft equipment-type fuel-burn assumptions and a calculation version from HQ/Admin settings. It must not be hard-coded into reporting outputs. Reports should show the active calculation version or assumption set so HQ totals, exports, and future EDP datasets can reconcile against the same assumptions.

Frontline surfaces should not show dollar impact as a primary metric.

### HQ Viewer UI Details

HQ Viewer should feel like a monitoring and reporting dashboard, not an action queue.

Primary layout:

- Top filters: date range, port/location, metric, fuel price assumption
- KPI row: total runtime, fuel kg, dollar impact, attributed runtime, avoidable/runtime opportunity
- Trend panel: daily/weekly run-rate trend
- Location performance table: ports/locations, runtime, kg fuel, dollar conversion, attribution percentage
- Reason breakdown: category/detail contribution

HQ can compare locations. The Senior Engineer surface should not show port-by-port comparison.

HQ charts and tables can use dollars, but they should also keep kg fuel visible so the conversion assumption remains transparent.

Review response-time telemetry belongs in HQ/product diagnostics. It should be aggregated and framed as process insight, not individual monitoring.

## Scorecard Tone And Gamification

The Senior Engineer experience should avoid individual scoring, port-by-port comparison, and compliance-feeling metrics. The app should not present a `reviewed on time` scorecard to frontline users.

Gamification is primarily card cleanliness:

- Clear missing-reason states
- Satisfying current/complete states
- Visible attributed runtime percentage
- Self-comparison against BNE baselines
- Calm neutral APU-off cards

The app should help the team keep the board clean without making the Senior Engineer feel personally monitored.

## Review Telemetry

The system may capture review-response telemetry for HQ/product diagnostics:

- `reviewDueAt`
- `reviewResolvedAt`
- `reviewResolutionType`
- `responseMinutes`

Resolution types include:

- Reason changed
- Current reason kept
- APU-off message received

This data should support product management and process analysis, not individual performance scoring in the frontline UI.

## Temperature Benchmarking

Temperature is a key benchmarking slicer. Temperature comes from METAR or a future weather/airport observation source. It is a port-level condition, not an aircraft-level value. Similar-temperature comparison uses 3 degree Celsius temperature bands.

The comparison should be time/event-weighted across the day as temperature changes. Long runtime events in a temperature band should affect the benchmark more than short events.

The Senior Engineer display should show exact absolute and percentage deltas, but only one benchmark at a time to avoid overcrowding the command board.

## Data Contracts

The prototype should use dummy data with realistic boundaries:

### Aircraft Ground State

- Tail
- Resolved aircraft type / equipment type code
- Source event aircraft type / equipment type code when supplied
- Reference aircraft type / equipment type code when available
- Equipment type source, such as flight-state event, tail/equipment reference, or derived enrichment
- Equipment type mismatch flag when source and reference disagree
- Bay or stand
- On-ground state
- Ground start timestamp
- Ground end timestamp if known

### Aircraft Equipment Reference

- Tail
- Equipment type code
- Equipment type label
- Effective from date
- Effective to date if known
- Source system or reference owner
- Last updated timestamp

For the prototype, this should be dummy reference data. For future integration, the app should use the equipment type supplied by the flight or ground-state event when present, then enrich and validate it against the tail/equipment reference table. If the live flight/ground-state event and the reference table disagree, the prototype should resolve to the live flight/ground-state value, preserve both values, and flag the mismatch. IT may define a stronger enterprise precedence rule later.

### APU Event

- APU-on timestamp
- APU-off timestamp if known
- Open/closed state
- Linked aircraft ground event
- Estimated runtime
- Estimated kg fuel burned

### Reason Segment

- Linked APU event
- Category
- Detail
- Started timestamp
- Ended timestamp if known
- Optional note
- Review due timestamp
- Review resolved timestamp
- Review resolution type

### Stand Coordinate

- Port
- Bay or stand identifier
- Latitude
- Longitude
- Optional apron/zone metadata

### METAR / Weather Observation

- Port
- Observation timestamp
- Temperature in Celsius
- Source, such as METAR
- Optional raw observation text
- Derived 3 degree Celsius temperature band

### Fuel Price Assumption

- Effective date
- Unit price
- Currency
- Source or note

### Fuel Burn Calculation Assumption

- Assumption id
- Calculation version label
- Effective from date
- Active/inactive state
- Equipment type code
- Equipment type label
- APU fuel-burn rate assumption
- Unit, such as kg per minute
- Fallback flag, if used for unknown equipment types
- Fallback reason, such as unmatched equipment type
- Source or note

### Urgency Ranking Settings

- Ranking settings id
- Version label
- Effective from date
- Port applicability or override, such as global default initially and BNE override later
- Fixed bucket order identifier
- Weight for overdue review minutes
- Weight for APU runtime minutes
- Weight for estimated kg fuel burned
- Weight for proximity cluster signal
- Weight for total ground time
- Deterministic fallback field, such as tail or APU event id
- Last updated by/persona in POC
- Last updated timestamp
- Source or note

## Real API Feasibility Discovery

The main integration risk is not whether the UI can show the workflow. It is whether real source systems can be combined into a coherent operational state without overstating data quality.

The implementation should keep the following concepts separate:

- Aircraft currently on ground
- Aircraft assigned to a bay or stand
- Aircraft physically confirmed at that location
- APU on/off state
- APU event timestamps
- Reason-chain workflow state

The likely source of truth for `aircraft currently on ground` is unresolved. It may come from an OOOI or flight-state engine, FSE, A-CDM, Aerobahn, FIDs/iFIDS, or another operational system. The prototype should assume this is feasible but not settled.

Aircraft equipment type should use the flight or ground-state event value when that value is supplied. The system should enrich and validate that value against a tail/equipment reference table. If the event value and reference value disagree, the prototype should trust the live flight/ground-state event for operational display and burn-rate selection, while flagging the mismatch for diagnostics. This gives the command board and burn estimates a real-time operational value while still catching cases where source data is missing, stale, or inconsistent with known tail configuration.

The prototype should use dummy tail/equipment reference data. Future IT discovery should identify the proper enterprise source for tail-to-equipment mapping, whether that comes from fleet planning, engineering systems, FSE, iFIDS, Sabre/GDW, or another reference-data owner.

Discovery questions for FSE / A-CDM:

- Does FSE expose current aircraft bay or stand, or only flight-state milestones?
- Does FSE expose aircraft equipment type on the live flight or ground-state event?
- Does Aerobahn expose current bay or stand in a way Virgin Australia can consume?
- Are A-CDM return fields visible in iFIDS or iGO?
- Which A-CDM fields are available, and are they available historically or only in the live operational view?

Discovery questions for FIDs / iFIDS / iGO:

- Can iFIDS provide current aircraft bay or stand assignment through an API or extract?
- Does iFIDS distinguish planned stand assignment from actual current aircraft position?
- Are iFIDS/iGO fields sufficient to determine when an aircraft should enter and leave the BNE ground-aircraft board?
- Can assigned stand data be linked reliably to tail registration and flight number?
- Does iFIDS/iGO expose equipment type, and is it scheduled type or confirmed tail/equipment type?

Discovery questions for Hermes / ACARS / OOOI:

- Do inbound ACARS or OOOI messages include position, bay, terminal, stand, or only event timestamps?
- Are position or stand fields stored in Hermes, GDW, Sabre IX, or another system?
- Are these fields persisted for query, or only passed through operationally?
- Can OOOI events reliably determine aircraft on-ground and off-ground state for the board?

Discovery questions for GE / ACMS:

- Does decoded ACMS contain latitude/longitude, airport, bay, stand, or any other location indicator?
- What is the refresh cadence for decoded ACMS APU state?
- Does the feed work while aircraft are parked, being towed, or powered down?
- Is coverage limited to 737-700/737-800, with 737 MAX requiring a separate data path?
- Are APU-on and APU-off messages available as timestamped events, or only as sampled state snapshots?

Discovery questions for towing:

- Is there a system of record for tow movements?
- If there is no tow system, can the app safely assume assigned bay only while aircraft remain on assigned stand?
- Should the app mark aircraft location as `assigned stand` rather than `current position` whenever tow state is unknown?

The system should carry source and confidence metadata for location-like fields:

- `locationSource`, such as `iFIDS`, `FSE`, `Aerobahn`, or `manual_mock`
- `locationMeaning`, such as `assigned_stand`, `reported_position`, or `unknown`
- `locationConfidence`, such as `high`, `medium`, or `low`
- `locationUpdatedAt`

If real integration cannot prove live position, the UI should continue to use stand assignment language and should not introduce a map or digital twin view.

## Data Quality And Staleness UX

When source events are missing, late, stale, or low-confidence, the app should continue to show useful operational cards where possible. It should not suppress aircraft simply because one field is uncertain. Instead, uncertainty should be represented at the field level using compact charms and tooltips.

Data-quality behaviour should be governed by rules per source:

- ACMS/APU state freshness rules
- Flight-state/OOOI freshness rules
- Stand assignment freshness rules
- Weather observation freshness rules
- Reason-chain workflow freshness rules

The Senior Engineer UI should use compact charms, icons, and hover/focus tooltips rather than large warning banners. Examples:

```text
Stand: Bay 43  [?]
APU: On 1h24m  [stale]
Closest tail: VH-YIB · 42m  [?]
BNE 31°C  [updated 12m ago]
```

Charm examples:

- `?`: source meaning or confidence is limited
- Clock/stale icon: source event is older than the freshness threshold
- Link/broken-link icon: correlation is incomplete
- Dot status: fresh, stale, or unknown state

Tooltip examples:

```text
Stand assignment from iFIDS. This is assigned stand, not live aircraft position.
```

```text
Last ACMS APU event received 28 minutes ago. APU off has not been confirmed.
```

```text
Closest-tail distance is calculated from stand coordinates, not live aircraft movement.
```

```text
Temperature from latest BNE observation, updated 12 minutes ago.
```

The UI should distinguish between:

- Unknown: no source value is available.
- Stale: a previous value exists but is outside the freshness threshold.
- Low confidence: a value exists, but the source meaning is limited.
- Conflicting: sources disagree and the derived state uses a precedence rule.

Detailed data-quality diagnostics belong in tooltips, drawers, or admin/HQ diagnostics. The main Senior Engineer board should stay compact and calm.

On the desktop Senior Engineer surface, users should be able to flag a data issue from an aircraft card or drawer. This does not change source-derived state and does not manually close or alter APU events. It creates a data-quality flag for review.

Data issue flag examples:

- APU state looks wrong
- Stand or bay looks wrong
- Aircraft should not be on board
- Aircraft missing from board
- Duplicate or conflicting aircraft
- Timing looks wrong

On the desktop surface, the flag action should be compact, such as a small `Flag data issue` ghost action in the drawer or a charm action in the card source tooltip. It should not be a dominant card control.

Each data issue flag should capture:

- Tail
- Flight number when available
- Port
- Bay or stand
- Current derived aircraft/APU state
- Source freshness and confidence metadata visible at the time
- User/persona id
- Role
- Timestamp
- Selected issue type
- Optional note
- Related source event ids or derived read-model version when available

HQ dashboard should include a data-quality flags section. This section shows flagged issues with telemetry explaining the situation that triggered or surrounded the flag:

- Flag count by issue type
- Flag count by source system
- Recent flags table
- Source freshness at time of flag
- Conflicting/stale/unknown markers present at time of flag
- Tail, bay, flight, and APU event context
- Optional user note

The HQ section is for source-data diagnostics and IT/product follow-up. It should not become an individual performance scoreboard.

Equipment-type mismatches between live flight/ground-state events and the tail/equipment reference table should automatically create data-quality telemetry for HQ diagnostics. This should be aggregated and non-noisy:

- Do not create a prominent Senior Engineer card alert only because of an equipment-type mismatch.
- Preserve the resolved value, source event value, and reference value.
- Count mismatch occurrences by source system, tail, equipment type, and scenario.
- Include mismatch examples in the HQ data-quality section.
- Allow manual data-quality flags to add context, but do not require a user to flag these mismatches manually.

## Source Freshness And Latency Expectations

The board should not use one global freshness standard. Different source fields have different realistic latency expectations. The UX is deliberately designed to make ACMS/APU lag operationally tolerable while still being honest about freshness.

Freshness should be evaluated per source and field:

- APU state / ACMS: may lag around 25 minutes depending on source behaviour. The UI should show the last known APU state, elapsed runtime based on the latest event model, and a compact stale/source charm when the last APU event is older than the configured threshold.
- Flight-state / OOOI / FSE / A-CDM: expected to be fresher than ACMS where available, but the actual SLA is a discovery item.
- Stand assignment / iFIDS / Aerobahn: may represent planned or assigned stand rather than live position. Freshness and meaning must both be shown through compact source/confidence metadata.
- Weather / temperature: should use the latest available BNE observation and show compact freshness where stale.
- Reason-chain state: should update immediately within the APU app because it is authored by the app.

The event orchestration layer is important to the user experience. The system should combine streams so the board feels coherent even when APU data arrives later than flight-state or stand data.

Example behaviour:

- If the APU-on event is known but the APU-off event has not arrived, the card remains APU-on and may show `APU off not confirmed` in a tooltip.
- If flight-state says the aircraft has departed but ACMS has not sent an APU-off event, the derived state should follow a documented precedence rule and show compact conflict/freshness metadata.
- If stand assignment changes but tow state is unknown, the card should use assigned-stand wording and avoid live-position claims.
- If reason-chain actions are current but ACMS is stale, the card can still show the latest reason-chain state while marking APU source freshness separately.

Missing APU-off behaviour:

- Explicit APU-off event is the preferred close signal.
- If explicit APU-off never arrives, other strong operational signals may infer closure, such as flight-state departure, off-ground state, aircraft leaving the BNE ground board, or another IT-confirmed source.
- Inferred closure must be marked as inferred/low-confidence in the derived event data.
- The UI should not show noisy warnings for inferred closure, but tooltips/admin diagnostics should preserve the source and confidence trail.
- The full list of acceptable inference sources and precedence rules is an IT discovery item.

Manual APU-off observation behaviour:

- On `/senior/bne`, a Senior Engineer may mark an APU as turned off from the card or drawer when they believe the APU has been shut down.
- This action does not create an authoritative APU-off event and does not overwrite ACMS/source state.
- It creates a user-authored observation event, such as `manual_apu_off_observed`.
- The card moves into a neutral pending state, such as `APU off pending confirmation`.
- In pending state, the card should look calmer than an active APU-running alert but not as complete/calm as a confirmed APU-off card.
- Reason review prompts pause while pending confirmation, but the chain is not finalized until a trusted APU-off or closure source arrives.
- If ACMS or another trusted source later confirms APU-off, the system finalizes the APU event using the trusted source timestamp as the official APU-off timestamp. The manual observation timestamp remains as workflow telemetry.
- If ACMS or another trusted source later indicates the APU is still running, the card reopens as APU-running, preserves the manual observation in telemetry, and resumes reason review logic based on the active reason state.
- Pending manual-off cards should include a compact charm/tooltip explaining that source confirmation is still outstanding.
- Manual APU-off observations affect the operational UI only. They do not close reason-tagged burn reporting and do not change official segment durations until confirmed by a trusted source or governed inference rule.

The prototype should model these differences using dummy source timestamps and freshness charms, so stakeholders understand how the real board will behave under imperfect data.

## Event-Sourced Integration Direction

The future real-data architecture should be event-sourced. Operational source systems should publish events onto Kafka topics or equivalent enterprise streaming infrastructure. The APU Management System should consume those topics and derive its current read models from the event history.

This direction fits the product because APU management depends on timestamped changes over time:

- APU on/off events
- Aircraft on-ground/off-ground transitions
- Stand assignment changes
- Weather/temperature observations
- Reason-chain user actions
- Review due and review resolved workflow events

The UI should not depend on synchronous point-to-point API calls as the primary truth for the command board. Synchronous APIs may still be useful for admin settings, lookup/reference data, user permissions, and historical report queries.

Candidate Kafka topic families:

- `aircraft.flight-state.events`: OOOI, arrival, departure, on-ground/off-ground, flight-state changes.
- `aircraft.stand-assignment.events`: bay/stand assignment, reassignment, source and confidence.
- `aircraft.apu-state.events`: APU on/off messages, decoded ACMS state changes, source timestamp, received timestamp.
- `aircraft.reference-data.events`: tail-to-equipment mapping and aircraft reference metadata.
- `airport.weather.events`: BNE temperature observations and derived 3 degree Celsius bands.
- `apu.reason-chain.events`: reason selected, reason changed, current reason kept, note added, event closed.
- `apu.review-workflow.events`: review due, review resolved, resolution type, response-time telemetry.
- `apu.data-quality-flag.events`: Senior Engineer data issue flags, source freshness context, and related source-event metadata.
- `apu.manual-observation.events`: user-authored operational observations such as manual APU-off pending confirmation.
- `apu.reference-data.events`: governed reason taxonomy, port overrides, fuel price assumptions, and equipment-type fuel-burn assumptions.

Every consumed event should include:

- Source system
- Source event timestamp
- Ingestion timestamp
- Correlation keys, such as tail, flight number, port, bay, and APU event id when available
- Source event id or idempotency key
- Confidence or meaning metadata where the event could be interpreted too strongly

Event correlation strategy is an unresolved IT/orchestration discovery item. The product should not assume that tail registration, flight number, stand assignment, or ACMS identifiers alone are sufficient to join events safely. The future integration design should be worked through with the IT/data teams who understand source-system identifiers, latency, replay, and operational edge cases.

Discovery questions for event correlation:

- Which identifiers are consistently available across FSE/A-CDM, Aerobahn, iFIDS/iGO, Hermes/ACARS/OOOI, and GE/ACMS?
- Can tail registration be treated as reliable during swaps, towing, maintenance movements, and multi-sector turnarounds?
- Is flight number/date reliable enough when aircraft remain on ground across service days or move to maintenance/hangar states?
- Do source systems provide stable event ids, message ids, or transaction ids?
- What source timestamps should win when events arrive late or out of order?
- How should duplicate events, corrected events, and missing off/on messages be handled?
- Should the derived APU event id be generated by the APU app, by an integration layer, or by an enterprise event orchestration service?

The app should maintain derived read models for:

- Current BNE command board
- Current aircraft cards
- Ground-aircraft side table
- Open APU events
- Reason chains
- Daily scorecards
- HQ reports and benchmark aggregations

Replay should be possible for testing and operational correction. If a source event arrives late or out of order, the event model should allow the derived read model to be recalculated rather than manually patched.

For the prototype, Kafka does not need to be running. Dummy data should be shaped like events so that replacing mock arrays with topic consumers later is a natural step.

## Testability And Real-Feed Readiness

The MVP prototype should use event-shaped fixtures and replayable scenario packs rather than direct replacement of dummy data with live endpoints.

This means dummy data should be structured as realistic source events, not only UI-ready card objects. The prototype can then derive aircraft cards, reason chains, scorecards, and reporting rows from those fixtures in the same shape that a real integration layer would later provide.

Minimum MVP testability requirements:

- Event-shaped fixture files for source inputs such as flight state, stand assignment, APU state, weather, reason-chain events, manual observations, tail/equipment reference data, and APU app reference data.
- Scenario packs for key operational cases, including normal APU on/off, delayed ACMS off messages, manual APU-off pending confirmation, contradicted manual observations, missing APU-off inferred closure, stale stand assignment, and missing equipment-type burn assumptions.
- A simple replay mechanism in the prototype data layer so the same scenario can be run repeatedly and inspected.
- Clear separation between raw mock source events, derived read models, and UI components.
- Contract-like TypeScript types or schemas for fixture events so IT can map real feeds into the same structures during discovery.

The MVP should not build a full local Kafka or enterprise integration test platform. That level of infrastructure becomes useful when IT begins formal integration work and source-system contracts are known. At that point, the replayable fixtures should evolve into a proper integration test harness connected to Kafka topics, schema registry or equivalent contracts, and real source-system adapters.

This keeps the prototype lightweight while still making the path from dummy data to real endpoints credible.

## Reason-Chain Event Ownership

The APU Management System should own reason-chain authoring initially. When a Senior Engineer selects a reason, keeps the current reason, changes a reason, adds a note, or when an APU-off event closes the chain, the APU app creates the corresponding reason-chain or review-workflow event.

This is the right initial ownership model because reason-chain capture is a new product workflow rather than a field already owned by an existing operational system.

The app should still publish reason-chain data in an enterprise-readable event contract so that other systems can consume it later. Publishing should not be a large incremental step beyond local app ownership if the prototype event model is shaped correctly.

Reason-chain events should include:

- APU event id
- Tail
- Flight number when available
- Port
- Bay or stand
- Category id and label
- Detail id and label
- Segment start and end timestamps
- User/persona id
- Role
- Source UI action, such as `select_reason`, `change_reason`, `keep_current_reason`, `add_note`, or `close_on_apu_off`
- Source event timestamp
- Ingestion timestamp
- Idempotency key

The future integration posture is:

1. APU app owns and validates the reason-chain workflow.
2. APU app emits governed events to Kafka or equivalent streaming infrastructure.
3. Enterprise reporting, data warehouse, or operational analytics consumers subscribe to those events.
4. If a broader operations platform later becomes the system of record for reason chains, the event contract should be stable enough to migrate ownership without redesigning the frontline UX.

The app should not depend on write-back into an external operational system for v1 feasibility. Write-back may be useful later, but it is not required to prove the Senior Engineer workflow.

## Event And Reporting Consumers

The first consumers of APU Management System data should be both internal and enterprise-facing:

1. HQ views inside the APU app consume the app's own derived read models.
2. EDP/data platform receives published events or reason-tagged burn datasets for broader reporting and analysis.

This means the app does not need to wait for EDP to build every report before HQ users can see useful monitoring views. It also means the app should not become a reporting silo. Events and datasets should be clean enough for EDP, SQL, or other enterprise consumers to reuse.

Internal app consumers:

- HQ Viewer dashboard
- HQ Admin settings and diagnostics
- Data-quality flags section
- Lightweight reason/burn reports
- Prototype XLSX exports

Enterprise consumers:

- EDP/data platform
- SQL/reporting tables or views
- Enterprise dashboards
- Product/process analytics
- Future operational consumers that may use reason-chain events

The app read model and the published dataset do not need to be identical, but they must reconcile. A reason-tagged burn total shown in the HQ app should match the exported or published reason-tagged burn dataset for the same filters, source assumptions, and fuel-burn calculation version.

## MVP Real-Integrated Backend Requirements

The first real-integrated version does not need a full enterprise reporting backend, but it must do more than show a live board. It must persist the APU app-owned workflow events and produce a reason-tagged APU burn dataset.

Minimum backend capabilities:

- Consume operational source events from Kafka topics or integration adapters.
- Derive the current BNE command board read model.
- Enrich and validate aircraft equipment type using flight/ground-state events and tail/equipment reference data.
- Persist APU app-owned reason-chain events.
- Publish reason-chain and review-workflow events for enterprise consumption.
- Persist or derive enough APU event state to allocate burn time and estimated fuel kg to reason segments.
- Apply the active configured equipment-type fuel-burn calculation assumption when deriving estimated kg.
- Preserve source timestamp, ingestion timestamp, source system, and data-quality metadata needed by the UI.

Reason-tagged burn allocation:

- Each APU event has an APU-on timestamp and, once received, an APU-off timestamp.
- Each APU event has zero or more reason segments.
- Segment duration is calculated from segment start to segment end, capped within the APU event window.
- If a user keeps the current reason, the current segment continues rather than creating a new visible segment.
- If a user changes reason, the previous segment closes and a new segment starts.
- If no reason has been captured, burn time is tagged as unattributed.
- When the APU-off event arrives, the current segment closes and the APU event is finalized.
- Estimated fuel kg should be calculated at segment level so reporting can show APU burn by reason category/detail.
- Estimated fuel kg should use the active configured equipment-type fuel-burn calculation assumption and store the calculation version or assumption set used.
- If an APU event's aircraft equipment type cannot be matched to an active burn-rate assumption, the system should use the configured fallback rate and mark the estimate as fallback-derived in the aircraft drawer, HQ reporting, and export data.

Unattributed burn is a first-class reporting bucket. Reporting should not hide unattributed APU burn or exclude it from totals. The system should also show attribution coverage as a headline quality metric:

```text
Attributed runtime % = attributed APU runtime / total APU runtime
Unattributed runtime % = unattributed APU runtime / total APU runtime
```

Senior Engineer surfaces use attribution coverage to support card cleanliness and operational follow-up. HQ surfaces can show unattributed burn as a reason bucket and as a data-quality/process metric.

Minimum reporting output:

The MVP must make reason-tagged burn data available for reporting, but the delivery mechanism is flexible. Acceptable early outputs include:

- Direct XLSX export from the app.
- SQL table or view.
- EDP/data-platform write or publish path.
- A simple file/export produced from the backend read model.

The minimum reason-tagged burn dataset should include:

- APU event id
- Reason segment id
- Source event ids used to derive the row
- Reason-chain event ids used to derive the row
- Tail
- Flight number when available
- Resolved aircraft type / equipment type code
- Source event aircraft type / equipment type code
- Reference aircraft type / equipment type code
- Aircraft type / equipment type source
- Aircraft type / equipment type mismatch flag
- Port
- Bay or stand
- APU-on timestamp
- APU-off timestamp when known
- Segment start timestamp
- Segment end timestamp
- Segment duration minutes
- Estimated fuel kg for the segment
- Fuel-burn calculation version
- Fuel-burn rate assumption used
- Fuel-burn assumption id
- Fuel-burn assumption fallback flag
- Fuel-burn assumption fallback reason
- Reason category id and label
- Reason detail id and label
- Attributed/unattributed flag
- Temperature band when available
- Location source and meaning metadata
- Source-system freshness/confidence metadata
- Manual APU-off observation timestamp when present
- Official APU-off timestamp source, such as ACMS, inferred closure, or another trusted source

Manual APU-off observations should be excluded from official reason-tagged burn closure until confirmed. They may appear in operational telemetry, but reporting should not treat them as official APU-off timestamps.

MVP reconciliation and lineage:

- Each reason-tagged burn row should be traceable to the source event ids and reason-chain event ids that produced it.
- Published/exported totals should reconcile with HQ app totals for the same filters, source assumptions, and fuel-burn calculation version.
- The MVP does not need a full audit lineage UI for every number.
- Lineage fields should exist in the data model/export so IT, EDP, or product diagnostics can investigate mismatches.

Not required for MVP:

- Full report builder
- Rich audit UI
- Historical rebuild UI
- Advanced report scheduling
- Enterprise admin analytics dashboards
- Full equipment fuel-burn model governance or advanced assumption maintenance workflow

These may be future-state capabilities, but v1 feasibility is satisfied when the system can create a credible reason-tagged burn dataset and export or publish it through at least one practical path.

## Prototype Scenarios For Lag Management

The prototype should include dummy scenarios that demonstrate how the product handles ACMS/APU lag and manual APU-off observations.

Required scenarios:

1. Manual off, then confirmed
   - Aircraft card starts as APU-running.
   - User marks APU off manually.
   - Card moves to neutral `APU off pending confirmation`.
   - A delayed trusted APU-off event arrives.
   - Card becomes confirmed APU-off / calm neutral complete.
   - Reason-tagged burn reporting uses the trusted source off timestamp, not the manual observation timestamp.

2. Manual off, then contradicted
   - Aircraft card starts as APU-running.
   - User marks APU off manually.
   - Card moves to neutral pending state.
   - A later trusted source event indicates APU is still running.
   - Card reopens as APU-running.
   - Reason review logic resumes.
   - The manual observation remains in telemetry.

3. APU-off missing, inferred closure
   - Aircraft card starts as APU-running.
   - No explicit APU-off event arrives.
   - A strong operational signal, such as aircraft departure or leaving BNE ground scope, triggers inferred closure.
   - Card leaves the active board or becomes closed according to the derived state.
   - Reporting marks the off timestamp source as inferred/low-confidence.

These scenarios should be accessible through prototype controls or scenario packs. They should use dummy timestamps and source freshness charms so reviewers can see the operational effect of delayed and imperfect data.

## Prototype Boundaries

This phase does not include:

- Live API endpoints
- Real Entra authentication
- Real push notifications
- Real iPad location/beaconing
- Map or digital twin display
- Live towing/aircraft movement tracking
- Backend persistence
- Individual performance scorecards

The prototype should remain mock-driven while making future API replacement straightforward.

## Technical Architecture Direction

The current application is a Vite React prototype with custom CSS, a single tabbed app shell, mock data clients, local reason capture, and reporting/domain helpers. It has useful product learning and some reusable domain ideas, but the UI shape no longer matches the target Senior Engineer workflow.

Current-state gaps against this spec:

- The app uses custom CSS rather than Tailwind/shadcn primitives.
- The live surface is still tabbed around `Live ops`, `History`, and `Reports` rather than role-based surfaces.
- Aircraft cards still show frontline dollar impact and per-card temperature.
- Reason capture is still a single select/input rather than a reason-chain workflow with a cascading popover and drawer.
- Mock data is mostly UI-ready records rather than event-shaped fixtures and replayable scenario packs.
- The data model still treats reason capture as one reason per aircraft/day rather than an event-linked reason chain.

### Framework Options Considered

Option 1: Keep Vite and progressively add Tailwind/shadcn-style components.

- Lowest short-term disruption.
- Keeps the existing prototype running.
- Still leaves routing, persona surfaces, server/client boundaries, and future API replacement less aligned with the desired enterprise app shape.

Option 2: Migrate the current Vite app into Next.js gradually.

- Preserves more existing code during transition.
- Reduces perceived restart risk.
- Creates a temporary mixed architecture where old UI assumptions and new workflow assumptions compete.

Option 3: Start a clean Next.js App Router rebuild and port only useful domain/reporting logic.

- Best fit for the new role-based product surface.
- Allows shadcn/Tailwind design primitives to shape the app from the beginning.
- Makes event-shaped fixtures, read models, route structure, and future Entra/API integration cleaner.
- Requires rebuilding the UI rather than migrating existing components one-for-one.

Recommended approach: Option 3. The next implementation should treat the existing app as a reference prototype, not as the final component architecture. Preserve useful calculations, tests, report export ideas, and mock scenario learnings, but rebuild the application shell and components in Next.js with Tailwind and shadcn/ui.

### Next.js App Structure

Use the Next.js App Router with route groups for the product surfaces:

```text
app/
  layout.tsx
  globals.css
  (app)/
    layout.tsx
    page.tsx
    senior/
      bne/page.tsx
      bne/wallboard/page.tsx
    hq/
      page.tsx
      reports/page.tsx
      data-quality/page.tsx
    admin/
      page.tsx
      reasons/page.tsx
      fuel/page.tsx
      urgency/page.tsx
      reference-data/page.tsx
    future/
      apron-engineer/page.tsx
  api/
    exports/reason-burn/route.ts
components/
  ui/
  app-shell/
  senior/
  hq/
  admin/
  reason-chain/
  data-quality/
lib/
  events/
  fixtures/
  read-models/
  domain/
  settings/
  reporting/
  auth/
```

Primary routes:

- `/senior/bne`: Brisbane Senior Engineer desktop/laptop command board. This is the default POC landing surface for the Senior Engineer persona.
- `/senior/bne/wallboard`: Brisbane Senior Engineer wallboard display route for the 70-inch TV / 16:9 break-room use case.
- `/hq`: HQ monitoring overview.
- `/hq/reports`: lightweight reporting and reason-tagged burn export surface.
- `/hq/data-quality`: source/freshness/mismatch/data-quality telemetry.
- `/admin/reasons`: governed reason taxonomy and review intervals.
- `/admin/fuel`: fuel price and equipment-type burn assumptions.
- `/admin/urgency`: urgency-ranking tiebreaker weights and ranking preview.
- `/admin/reference-data`: tail/equipment reference data and stand-coordinate reference data.
- `/future/apron-engineer`: non-primary preview surface only if useful for stakeholder storytelling.

### Server And Client Component Boundaries

Use Server Components for surfaces that can be derived from fixtures, settings, or report queries without live browser interaction:

- HQ reports
- Admin settings screens
- Initial board data load
- Export preparation
- Static reference-data views

Use Client Components for the operational interaction layer:

- Wallboard timer, benchmark rotation, and aircraft carousel rotation
- Urgency-sorted aircraft board with subtle movement animation
- Reason picker popover
- Reason-chain drawer
- Manual APU-off pending confirmation action
- Scenario replay controls
- Persona switcher for the POC
- Tooltip/charm interactions

Pure domain functions should not depend on React or Next.js. They should live under `lib/domain`, `lib/events`, or `lib/read-models` and be directly testable.

### Event-First Data Layer

The rebuild should move from UI-ready mock records to event-shaped fixtures:

```text
lib/fixtures/scenarios/
  bne-baseline.ts
  bne-acms-lag.ts
  bne-manual-off-confirmed.ts
  bne-manual-off-contradicted.ts
  bne-equipment-mismatch.ts
  bne-missing-burn-assumption.ts
```

Fixture event families:

- `flightStateEvents`
- `standAssignmentEvents`
- `apuStateEvents`
- `weatherEvents`
- `reasonChainEvents`
- `reviewWorkflowEvents`
- `manualObservationEvents`
- `dataQualityEvents`
- `tailEquipmentReference`
- `standCoordinateReference`
- `reasonTaxonomyReference`
- `fuelAssumptionReference`
- `urgencyRankingSettingsReference`

Read-model functions:

- `deriveCurrentBoard(events, settings)`
- `deriveAircraftCards(boardState)`
- `deriveGroundAircraftTable(boardState)`
- `deriveAircraftUrgencyRanking(boardState, urgencyRankingSettings)`
- `deriveReasonChain(apuEventId, events)`
- `deriveDailyScorecard(events, settings)`
- `deriveBenchmarkPanel(events, historicalBaseline, activeBenchmark)`
- `deriveReasonTaggedBurnRows(events, settings)`
- `deriveDataQualityTelemetry(events)`

The UI should consume read models, not raw fixture arrays. That creates a credible path to replacing fixtures with Kafka consumers, route handlers, or backend APIs later.

The `/senior/bne` and `/senior/bne/wallboard` routes should consume the same BNE command-board read model. They should share display components where practical, such as aircraft card content, scorecard metrics, benchmark state, status badges, and proximity indicators. Mutation controls should belong to the desktop route unless a later design explicitly adds wallboard interaction. Route-specific layout wrappers should handle the ergonomic differences:

- `/senior/bne`: optimized for active desktop/laptop use, pointer interaction, drawer work, reason updates, and scenario controls.
- `/senior/bne/wallboard`: optimized for passive shared display, 16:9 composition, stable density, larger scan targets, auto-rotating benchmark emphasis, and reduced chrome.

For the first slice, `/senior/bne/wallboard` is read-only:

- No reason selection.
- No keep-current-reason action.
- No reason changing.
- No manual APU-off action.
- No data issue flagging.
- No editable notes.
- No reason-chain drawer.
- No detail overlay or card expansion.
- No drawer/open-state client state.

The wallboard route may show current reason state, review due state, manual-off pending state, and source/freshness charms on passive aircraft cards only. It should not include prompts, links, QR codes, or deep links back to the desktop workflow surface. The wallboard is a passive information surface; users know to use the desktop workflow through operational practice, not in-app prompting.

### State Management

Keep state deliberately boring for the prototype:

- Server-side fixture/read-model loading for initial data.
- Small client context or hooks for scenario replay, persona selection, route-scoped selected-aircraft focus, desktop-only drawer open state, benchmark rotation, and wallboard carousel rotation.
- URL search params for shareable prototype scenario/role state where useful.
- Local storage only for POC persona/scenario preferences and mock reason-chain persistence if needed.

Do not introduce a heavy global state library unless the implementation becomes hard to reason about without it.

### Prototype Mutation Strategy

Use a hybrid mutation model for the prototype.

Initial board data, settings, reference data, and reports should be derived server-side from event-shaped fixtures and read models. Operational workflow mutations should stay client-side while the app is still mock-driven:

- Select reason
- Change current reason
- Keep current reason
- Add note in the reason-chain drawer
- Correct previous reason category/detail
- Mark APU off pending source confirmation
- Flag data issue
- Change scenario/persona prototype controls

These client-side actions should still create event-shaped records, such as `apu.reason-chain.events`, `apu.review-workflow.events`, `apu.manual-observation.events`, and `apu.data-quality-flag.events`. The prototype can store those events in memory or local storage so the workflow feels real without requiring a backend.

Do not build server actions or route-handler persistence just for mock workflow state unless it materially improves the prototype. The important design constraint is that the client-side event shape should match the future server/API event contract.

When formal integration begins, move these mutations behind server/API contracts:

- Next.js Server Actions or Route Handlers for app-owned workflow events if the app remains the backend-for-frontend.
- Dedicated backend APIs if enterprise architecture requires a separate service.
- Kafka publishing or equivalent event emission from the server-side mutation boundary.

The UI components should call narrow action functions, not write directly to storage. That keeps the later move from local prototype events to server/API mutations mostly behind an adapter.

### shadcn/Tailwind Component Strategy

Use shadcn/ui primitives as the base interaction kit and compose app-specific components around them. Keep `components/ui` close to standard shadcn output, and put product components under feature folders.

Primitive usage rules:

- `Button` is the main action primitive. Primary action buttons use purple `#511C98`; destructive or critical actions use red `#E10A0A`; quiet navigation and utility actions use `ghost` or `outline` variants with indigo/black text. Icon-only buttons must have `Tooltip`.
- `Card` is used for aircraft cards, repeated KPI panels, wallboard aircraft cards, and admin row groups only. Do not nest cards. State cues should come from Tailwind left borders, top strips, badges, and small icon charms rather than heavy card background colour.
- `Badge` is for compact state labels, source/fallback charms, and metric qualifiers. Use restrained outline or soft treatments for normal states, red treatment for missing/urgent states, and purple treatment for active selected workflow states.
- `Tooltip` is the default disclosure primitive for icon buttons, source/freshness charms, fallback burn-rate markers, and nearby-APU context. `HoverCard` is reserved for richer hover content such as the nearby APU-running aircraft list.
- `Popover` is the fast workflow primitive. The reason picker should be a small anchored popover with category buttons in the first pane and detail buttons in the second pane. It should complete the common path in two clicks, without scrolling.
- `CardReasonDrawer` is a product component rather than a stock shadcn primitive. It should reuse shadcn/Radix overlay, focus, and outside-click behaviours where useful, but it must render as a below-card attached drawer rather than a full-screen side `Sheet`.
- `Sheet` is only a narrow-screen fallback for the reason-chain drawer, not the default desktop interaction.
- `Table` is for compact operational inventory and admin configuration. It should use dense row height, sticky headers where useful, and ghost buttons for row actions such as focusing an aircraft card.
- `ToggleGroup` is for benchmark mode selection, with auto-rotation on wallboard. It should make the current benchmark obvious without looking like a segmented marketing control.
- `Alert` is for validation, data-quality warnings, and admin save feedback. It should not be used as the normal Senior Engineer prompting pattern.
- `Dialog` should be rare in the Senior Engineer workflow. Use it only for destructive confirmations or exceptional admin tasks, not for reason capture.

Core app shell:

- `Sidebar` or custom rail using shadcn `Sidebar` for HQ/Admin navigation on desktop.
- `DropdownMenu` for persona switcher and port scope preview.
- `Button` for explicit actions.
- `Tooltip` for icon-only controls and data-quality charms.
- `Badge` for compact operational states.
- `Separator` for dense section boundaries.

Senior Engineer command board:

- `CommandBar`: custom Tailwind layout with shadcn `DropdownMenu`, `Button`, `Badge`, and `Tooltip`.
- `ScorecardStrip`: repeated shadcn `Card` or custom metric panels; use cards only for individual KPI panels.
- `BenchmarkRotator`: shadcn `ToggleGroup` for manual benchmark selection plus a client timer for 5-second auto-rotation.
- `AircraftBoard`: CSS grid with Tailwind responsive tracks and stable card dimensions.
- `WallboardAircraftCarousel`: large-format carousel stage for `/senior/bne/wallboard`; one row, two aircraft cards per page, rotating through urgency-sorted aircraft while the side index remains visible. Urgency changes do not interrupt the current page interval.
- `WallboardSideIndex`: enlarged passive aircraft index for `/senior/bne/wallboard`; sorted by the shared urgency ranking and animated lightly when row order changes.
- `AircraftCardContent`: shared aircraft-card content and formatting helpers consumed by both desktop and wallboard cards.
- `DesktopAircraftCard`: shadcn `Card` composed with `Badge`, `Button`, `Tooltip`, reason actions, drawer trigger, and small custom status strips.
- `WallboardAircraftCard`: shadcn `Card` composed from shared card content, using larger typography, near-parity visible facts, passive state display, and no action controls.
- `GroundAircraftTable`: shadcn `Table` inside `ScrollArea`; compact row density and a ghost `Button` to focus the card.
- `SeniorDesktopLayout`: route wrapper for `/senior/bne`, optimized for active work and drawer interactions.
- `SeniorWallboardLayout`: route wrapper for `/senior/bne/wallboard`, optimized for 16:9 display, reduced chrome, and read-only large-format passive card status display with no drawer or overlay.

Reason-chain workflow:

- `ReasonPicker`: shadcn `Popover` anchored to the card action button.
- Category/detail selection: custom two-pane popover using `Button`, `Command` or simple list rows, `Separator`, and Tailwind grid. Do not use a modal for the fast path.
- `CardReasonDrawer`: custom below-card drawer with `ScrollArea`, `Separator`, `Badge`, `Textarea`, and action `Button`s. It opens from the aircraft card, floats over board content beneath the card, and collapses on outside click, Escape, or focus leaving the drawer/trigger region.
- Optional note field: `Textarea` in the drawer only.
- Current-reason quick action: icon `Button` with `Tooltip`.

Data-quality charms:

- Tiny `Badge` or icon-only `Button` plus `Tooltip`.
- Use `HoverCard` only for richer diagnostics that need more than one or two lines.
- Keep source/freshness/fallback/equipment-mismatch markers out of the collapsed card unless the spec explicitly says they belong there.

HQ views:

- KPI row: shadcn `Card`.
- Trends and reason breakdown: chart component if added, otherwise custom SVG or table-first views.
- Data-quality flags: shadcn `Table`, `Badge`, `Tooltip`, `Select`, and `Tabs`.
- Filters: `Select`, `Popover` plus `Calendar` for date range if date selection is needed.

Admin settings:

- Reason taxonomy: shadcn `Table` or `Data Table` pattern for categories, with a side editor using `Input`, `Switch`, `Select`, `Button`, and `Alert` for validation.
- Fuel assumptions: shadcn `Table` for equipment-type burn assumptions; `Input` for kg/min and fuel price; `Switch` for active state; `Badge` for fallback/default rows.
- Urgency ranking: shadcn `Table` for editable tiebreaker weights; `Input` or `Slider` for weight values; `Alert` for validation; `Button` for reset defaults; preview table using only the current BNE board/current mock board order.
- Reference data: shadcn `Table` for tail/equipment and stand coordinates; keep it simple for prototype.
- Forms should use a validation approach such as React Hook Form plus schema validation when the implementation needs robust admin validation.

### Styling And Tokens

Tailwind should own layout, spacing, density, and responsive behavior. shadcn theme variables should be configured to match the operational Virgin-style palette already described in this spec:

- Indigo `#1F1A4F` for navigation and structural surfaces.
- Purple `#511C98` for primary action buttons, selected controls, and interactive emphasis.
- Red `#E10A0A` for urgent and missing-reason states.
- White surfaces with black text; neutral greys should be derived from black opacity for borders, dividers, muted labels, and disabled states.
- 6-8px radius for panels, cards, popovers, tables, and controls.
- No decorative hero sections, floating page-section cards, gradient orbs, or marketing composition.

Aircraft cards, side tables, and command-board panels should use stable dimensions with Tailwind grid/flex constraints so timers, badges, and reason labels do not shift layout on the wallboard.

### Migration Plan At Design Level

The implementation plan should replace the Vite shell in-place with a Next.js app rather than create a side-by-side application or separate repo. The current Vite app remains useful as a working reference before the rebuild starts, but the target codebase should become a single Next.js application.

In-place replacement means:

- Remove Vite-specific entry points and configuration once the Next.js scaffold is established.
- Replace the tabbed `App.tsx` shell with route-based Next.js surfaces.
- Replace custom CSS component styling with Tailwind and shadcn/ui composition.
- Preserve and port useful domain calculations, report export logic, tests, and mock scenario learnings only where they still match the event-chain model.
- Keep the existing docs/spec history in the same repo.
- Avoid maintaining parallel Vite and Next.js apps after the rebuild begins.

Migration sequence:

1. Scaffold Next.js, Tailwind, shadcn/ui, and the design token theme in the existing app repo.
2. Create event-shaped fixture contracts and read-model functions.
3. Build the new Senior Engineer BNE command board as the first usable screen.
4. Build the desktop aircraft-card workflow, reason picker, and reason-chain drawer as part of that first usable screen; keep the wallboard card variant large-format, passive, and scan-first.
5. Add scorecard strip, benchmark rotator, and ground-aircraft side table to complete the first Senior Engineer slice.
6. Add HQ viewer, HQ data-quality diagnostics, and lightweight reports.
7. Add HQ admin settings for reasons, review intervals, fuel price, burn assumptions, urgency ranking weights, and reference data.
8. Port or rewrite export/reporting logic against the new reason-tagged burn rows.
9. Remove obsolete Vite files and any old UI modules that no longer map to the Next.js component architecture.

The first implementation slice should optimize for the value-driving Senior Engineer workflow rather than old Vite behavior parity. HQ/Admin routes should exist only as simple navigation stubs during the first slice. They should make the app architecture and persona switcher visible, but they should not include placeholder dashboards, read-only shells, or mock reporting that steals effort from `/senior/bne`.

First slice acceptance target:

- Next.js app boots from the in-place repo.
- `/senior/bne` is the default desktop/laptop working surface for the Senior Engineer persona.
- `/senior/bne/wallboard` is available as the TV-focused route using the same BNE read model.
- `/senior/bne/wallboard` is read-only in the first slice; workflow actions stay on `/senior/bne`.
- HQ/Admin routes exist as stubs reachable from navigation/persona switching.
- The Senior Engineer board is designed and verified for both 16:9 wallboard display and desktop/laptop interaction from the first slice.
- Event-shaped BNE fixtures derive the command board read model.
- Top command bar shows BNE context, current temperature, persona switcher, and scenario controls.
- Daily scorecard strip shows the agreed Senior Engineer metrics.
- Benchmark panel auto-rotates comparison mode every 5 seconds.
- Aircraft cards show all BNE ground aircraft, with APU-off aircraft in calm neutral complete state.
- Aircraft card implementation uses shared card content/read-model fields with separate desktop and wallboard wrappers.
- Aircraft urgency ranking is derived in the read-model/domain layer using fixed buckets with weighted tiebreakers, and exposed to both desktop and wallboard components.
- Wallboard aircraft cards use larger typography and retain nearly all desktop-visible aircraft facts while removing action controls and drawer-only detail.
- `/senior/bne/wallboard` uses a two-card carousel stage for large aircraft cards when the active set exceeds two visible cards.
- `/senior/bne/wallboard` uses an enlarged urgency-sorted side index that keeps all BNE ground aircraft visible while the card carousel rotates.
- `/senior/bne/wallboard` amplifies the topline scorecard metrics and benchmark band rather than shrinking them to fit more aircraft cards.
- `/senior/bne/wallboard` keeps carousel timing steady when urgency changes; the side index shows the immediate subtle urgency cue.
- `/senior/bne/wallboard` animates side-index order changes with a restrained row movement/highlight treatment.
- Reason capture uses the shadcn popover two-click category/detail flow.
- On `/senior/bne`, the card-attached `CardReasonDrawer` opens below the aircraft card and shows a compact default view: current reason, note field, and recent timeline preview. Full chain, fuel estimate detail, assumption version, and fallback charms remain available lower in the tray or through quiet disclosure.
- On `/senior/bne/wallboard`, large-format passive aircraft cards show only passive reason/review/manual-off/source state; no drawer, overlay, or expansion is available.
- Manual APU-off pending confirmation state is represented in the desktop card/drawer workflow and displayed passively on the wallboard where relevant.
- On `/senior/bne`, the ground-aircraft side table can focus the selected aircraft card.
- On `/senior/bne/wallboard`, the ground-aircraft side index is passive and enlarged for TV readability.

First-slice layout checks:

- `/senior/bne/wallboard` at a 16:9 viewport keeps command bar, enlarged scorecard/benchmark band, two-card carousel stage, and enlarged side index visible without awkward crowding.
- `/senior/bne` at desktop/laptop viewport remains comfortable for pointer interaction, card-attached drawer use, reason popover selection, and side-table focus.
- The wallboard route can prioritize scanability with reduced chrome; the side index preserves full aircraft context while the carousel stages two large cards at a time.
- Wallboard aircraft card typography, spacing, and content parity must be verified visually so the cards read as deliberate TV cards, not cramped or merely enlarged desktop cards.
- Both routes must preserve stable card dimensions so timers, status badges, tooltips, and reason text do not reflow the board unexpectedly.

The old Vite components should not constrain the new component hierarchy. Reuse domain calculations only when they still match the event-chain model.

### Testing Strategy

Testing should focus on the event/read-model layer and the high-risk UI workflows:

- Unit tests for event reducers, reason-chain segmentation, review due logic, equipment-type precedence, fallback burn-rate handling, and reason-tagged burn row generation.
- Unit tests for benchmark calculations, especially temperature-banded comparisons.
- Unit tests for urgency-ranking settings validation, fixed bucket-order enforcement, and editable tiebreaker weights.
- Component tests or Playwright checks for reason picker two-click flow, desktop `CardReasonDrawer` below-card positioning, compact default content before scrolling, horizontal timeline preview showing current plus previous two segments, timeline segment hierarchy with small muted time range and stronger black semi-bold reason detail, current segment highlighted with indigo top bar plus `Current` badge, previous-segment correction hidden by default and available only through tiny hover/focus edit icon, correction mode preserving timestamps, `Show all reasons` exposed as a ghost icon button with tooltip and enabling internal scrolling without resizing the drawer, open/closed states, outside-click/Escape/focus-leave collapse behaviour, no grid reflow while open, manual APU-off pending flow, benchmark auto-rotation, urgency ranking bucket precedence, weighted tiebreaker ordering, admin urgency preview using only the current BNE board, wallboard carousel rotation, steady carousel timing during urgency changes, side-index urgency sorting/reorder animation, side-index urgency cues, and absence of drawer/action controls, workflow prompts, QR codes, or deep links on `/senior/bne/wallboard`.
- Screenshot checks for the Senior Engineer wallboard at widescreen desktop, normal desktop, and narrow viewports, including card readability and desktop-fact parity checks.
- Export tests confirming HQ app totals reconcile with exported reason-tagged burn rows.

The implementation should keep the prototype mock-driven while making the mock layer look like the future integration layer.
