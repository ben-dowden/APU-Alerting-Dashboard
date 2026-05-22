# APU Management System Next Phase Design

## Product Intent

The next phase moves the APU Alerting Dashboard from a local proof of concept toward a multi-user APU management system. The primary business outcome is to reduce total APU runtime. The primary product mechanism is to increase explained and attributable APU runtime through low-friction reason-chain capture.

The prototype should prove operational relevance before integration complexity. It uses dummy operational data, realistic data contracts, and Brisbane-focused workflow detail. Live API endpoints are out of scope for this phase.

## Primary User Surface

The principal v1 surface is the Brisbane Senior Engineer workflow. HQ reporting and HQ admin settings are secondary surfaces. Apron engineer prompts are a future role and should be represented only enough to preserve the intended direction.

The Senior Engineer surface is a widescreen command board designed to work on a 70-inch TV display in an engineering break-room environment, while remaining usable on a laptop or desktop.

## Visual System

The UI should keep the existing operational Virgin-style language already present in the prototype: white and soft-grey surfaces, deep purple navigation, red/amber/green operational states, dense information, and restrained card styling. It should feel like a working engineering tool, not a marketing dashboard.

Use the current app palette as the starting point:

- Red / missing reason: `#e42a1c`
- Dark red text: `#b71912`
- Purple / primary action: `#4d0c9a`
- Dark purple / structural headers: `#21104d`
- Green / APU off or complete: `#42a463`
- Amber / review due: `#d88b00`
- Ink: `#171726`
- Muted text: `#626a7a`
- Border: `#dfe3eb`
- Page background: `#eef1f5`
- Panel background: `#ffffff`
- Soft panel background: `#f7f8fb`

Cards, panels, popovers, tables, and controls should use 6-8px border radius. Avoid nested decorative cards. Use cards only for aircraft, repeated summary panels, popovers, drawers, and settings rows. Page sections should be unframed layout regions or full-width operational bands.

Use icons from `lucide-react` for actions. Avoid verbose action labels where a standard icon plus tooltip is clearer, but the first missing-reason action must be a clear text button.

Typography should stay compact:

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

Target the primary wallboard layout at 16:9 widescreen. The board should fill the available viewport without requiring vertical scrolling for the first page of active aircraft on a 70-inch display. Desktop and laptop users may scroll, but the top scorecard and active queue should remain immediately visible.

Use this hierarchy:

```text
Header: 60-72px
Scorecard row: 96-116px
Benchmark panel: 64-82px
Main content: remaining height
```

Main content uses two regions:

```text
Aircraft board: flexible width
Ground aircraft table: 300-360px fixed rail
```

At large widescreen widths, the aircraft board can use three card columns if each card can remain at least 340px wide. At normal desktop widths, use two columns. At narrow widths, collapse to one column and move the side table below the card board.

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

The benchmark panel is a single horizontal band below the scorecard. It shows:

```text
Similar-temp benchmark
+42kg / +6.1% vs matched 3°C temperature bands
[Similar temp] [Week] [Month] [Year]
```

On wallboard mode, the active benchmark segment changes every five seconds. The active segment should be indicated by the purple selected state and a subtle progress bar along the bottom edge of the selected chip. Manual selection pauses the loop; after 20 seconds of no benchmark interaction, cycling resumes.

Use colour semantics for deltas:

- Worse than baseline: red icon or delta marker
- Better than baseline: green icon or delta marker
- Flat/near-neutral: grey marker

Do not use dollars in this panel.

## Aircraft Board

The aircraft board shows all aircraft currently on ground at Brisbane based on OOOI or a future flight-state source. APU-off aircraft remain visible in a calm green state. Aircraft leave the board when they are no longer on ground or otherwise out of operational scope.

Cards are not grouped. They are sorted as a work queue:

1. Missing reason
2. Overdue reason review
3. Longest APU runtime
4. APU-off or OK aircraft

Cards may move as urgency changes. Movement should use very light and quick animation suitable for a TV display.

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
├──────────────────────────────────────┤
│ Review due in 00:06                  │
└──────────────────────────────────────┘
```

Card state styling:

- Missing reason: red left border, light red top cue, primary purple `Select reason` button, red status label `Reason missing`.
- Review due: amber left border, amber status label `Review due`, primary icon action to keep current reason, secondary `Change reason` button.
- Current reason valid: neutral/purple cue, current reason block visible, no urgent red/amber pressure.
- APU off: green left border or green status pill, calm `APU off` label, no reason actions.

The card should not display dollar impact. Replace existing frontline dollar fields with time and kg fuel. HQ views can still use dollar conversion.

Card controls:

- Missing reason: show a clear filled primary button labelled `Select reason`.
- Review due: show an icon button with `Repeat2` or similar to keep the current reason. Tooltip: `Keep current reason`.
- Change reason: show a clear secondary text button labelled `Change reason`.
- Manual APU-off observation: show a restrained secondary or ghost action labelled `Mark APU off`. Tooltip: `Mark as off pending source confirmation`.
- Reason chain drawer: show a light ghost icon button, preferably `PanelRightOpen`, `History`, or `ListTree`. Tooltip: `View reason chain`.
- Side table focus action: use a ghost button with an arrow or target-style icon. Tooltip: `Show aircraft card`.

Reason actions should sit inside the current-reason block, aligned with the current reason and chain icon. They should not sit as a dominant global footer that makes the whole aircraft card feel like it exists only to collect a reason. The card hierarchy is aircraft state first, current reason second, actions third.

The drawer-closed aircraft card state, when an APU is on, shows only the current active reason and its elapsed timer in `HH:MM` format. Previous reasons are not shown on the card. The reason chain is available only from the drawer.

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

- APU on: small red or amber status dot depending on reason/review state
- APU off: small green status dot
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

The drawer opens from the right side of the screen. It should be around 420-520px wide on desktop. On smaller screens it can become a full-height sheet. Opening the drawer should not navigate away from the board.

Drawer closed state:

```text
Aircraft card
- Aircraft state facts
- Current reason only
- Reason actions embedded in current-reason block
- Ghost icon: View reason chain
```

Drawer open state:

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

Timeline section
- Segment 1: category/detail, start-end, duration
- Segment 2: category/detail, start-end, duration
- Current segment highlighted

Telemetry section, admin/HQ only if shown
- Review due/resolved timestamps
- Response time
```

Normal Senior Engineer users can see the chain and add a note to the current segment. They can correct the category/detail on a previous segment only through a restrained `Correct reason` action. They cannot edit start/end times.

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

The category panel should be about 220-260px wide. The detail panel should be about 240-300px wide. Each row should be large enough to hit comfortably on desktop and a wallboard-connected mouse: roughly 36-42px high.

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

The Senior Engineer workflow consumes this configuration. The taxonomy should not be hard-coded into backend logic.

### Admin Settings UI Details

HQ Admin should have a simple settings area, not a complex enterprise configuration suite.

Settings navigation should include:

- Reason taxonomy
- Port overrides
- Fuel price
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

Fuel price screen:

- Input for fuel price
- Currency
- Effective date
- Source/note
- Last updated by/persona in POC

HQ reports should show the active fuel price assumption used for dollar conversion.

## Roles And Permissions

The POC uses a lightweight persona switcher rather than real authentication. The app model should still treat identity as a real concept so Microsoft Entra authentication and group assignment can replace the persona switcher later.

Prototype roles:

- Senior Engineer - BNE: primary operational command board, BNE aircraft cards, reason-chain capture, daily scorecard, proximity signals.
- HQ Viewer: secondary reporting surface for cross-location scorecards, trends, annual and daily performance, dollar reporting, and monitoring. No write-back.
- HQ Admin: HQ reporting plus admin settings for reason taxonomy, port-specific configuration, review intervals, and fuel price assumptions.
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
- Calm green APU-off cards

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
- Aircraft type
- Bay or stand
- On-ground state
- Ground start timestamp
- Ground end timestamp if known

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

Discovery questions for FSE / A-CDM:

- Does FSE expose current aircraft bay or stand, or only flight-state milestones?
- Does Aerobahn expose current bay or stand in a way Virgin Australia can consume?
- Are A-CDM return fields visible in iFIDS or iGO?
- Which A-CDM fields are available, and are they available historically or only in the live operational view?

Discovery questions for FIDs / iFIDS / iGO:

- Can iFIDS provide current aircraft bay or stand assignment through an API or extract?
- Does iFIDS distinguish planned stand assignment from actual current aircraft position?
- Are iFIDS/iGO fields sufficient to determine when an aircraft should enter and leave the BNE ground-aircraft board?
- Can assigned stand data be linked reliably to tail registration and flight number?

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

Senior Engineers should be able to flag a data issue from an aircraft card or drawer. This does not change source-derived state and does not manually close or alter APU events. It creates a data-quality flag for review.

Data issue flag examples:

- APU state looks wrong
- Stand or bay looks wrong
- Aircraft should not be on board
- Aircraft missing from board
- Duplicate or conflicting aircraft
- Timing looks wrong

The flag action should be compact, such as a small `Flag data issue` ghost action in the drawer or a charm action in the card source tooltip. It should not be a dominant card control.

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

- A Senior Engineer may mark an APU as turned off from the card or drawer when they believe the APU has been shut down.
- This action does not create an authoritative APU-off event and does not overwrite ACMS/source state.
- It creates a user-authored observation event, such as `manual_apu_off_observed`.
- The card moves into a neutral pending state, such as `APU off pending confirmation`.
- In pending state, the card should look calmer than an active APU-running alert but not as complete/green as a confirmed APU-off card.
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
- `airport.weather.events`: BNE temperature observations and derived 3 degree Celsius bands.
- `apu.reason-chain.events`: reason selected, reason changed, current reason kept, note added, event closed.
- `apu.review-workflow.events`: review due, review resolved, resolution type, response-time telemetry.
- `apu.data-quality-flag.events`: Senior Engineer data issue flags, source freshness context, and related source-event metadata.
- `apu.manual-observation.events`: user-authored operational observations such as manual APU-off pending confirmation.
- `apu.reference-data.events`: governed reason taxonomy, port overrides, fuel price assumptions.

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
- Persist APU app-owned reason-chain events.
- Publish reason-chain and review-workflow events for enterprise consumption.
- Persist or derive enough APU event state to allocate burn time and estimated fuel kg to reason segments.
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
- Port
- Bay or stand
- APU-on timestamp
- APU-off timestamp when known
- Segment start timestamp
- Segment end timestamp
- Segment duration minutes
- Estimated fuel kg for the segment
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

These may be future-state capabilities, but v1 feasibility is satisfied when the system can create a credible reason-tagged burn dataset and export or publish it through at least one practical path.

## Prototype Scenarios For Lag Management

The prototype should include dummy scenarios that demonstrate how the product handles ACMS/APU lag and manual APU-off observations.

Required scenarios:

1. Manual off, then confirmed
   - Aircraft card starts as APU-running.
   - User marks APU off manually.
   - Card moves to neutral `APU off pending confirmation`.
   - A delayed trusted APU-off event arrives.
   - Card becomes confirmed APU-off / calm green.
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

## Open Implementation Notes

The existing app already has Live Ops, History, Reports, mock data clients, local reason capture, and reporting exports. The next implementation should evolve those surfaces rather than rebuild from scratch.

The current reason model is a single reason per aircraft/day. It will need to become an event-linked reason-chain model.

The current cost-oriented cards and reports should split frontline and HQ units more clearly:

- Senior Engineer: time and estimated kg fuel
- HQ: kg fuel plus configurable dollar conversion

The current aircraft card temperature display should move out of the aircraft card. Temperature should be shown once in the command bar as the current BNE METAR temperature and used in benchmark calculations.

The current port selector should become role/port scope aware, with BNE as the primary Senior Engineer prototype port.
