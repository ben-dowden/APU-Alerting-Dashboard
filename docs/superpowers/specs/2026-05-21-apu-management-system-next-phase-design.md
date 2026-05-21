# APU Management System Next Phase Design

## Product Intent

The next phase moves the APU Alerting Dashboard from a local proof of concept toward a multi-user APU management system. The primary business outcome is to reduce total APU runtime. The primary product mechanism is to increase explained and attributable APU runtime through low-friction reason-chain capture.

The prototype should prove operational relevance before integration complexity. It uses dummy operational data, realistic data contracts, and Brisbane-focused workflow detail. Live API endpoints are out of scope for this phase.

## Primary User Surface

The principal v1 surface is the Brisbane Senior Engineer workflow. HQ reporting and HQ admin settings are secondary surfaces. Apron engineer prompts are a future role and should be represented only enough to preserve the intended direction.

The Senior Engineer surface is a widescreen command board designed to work on a 70-inch TV display in an engineering break-room environment, while remaining usable on a laptop or desktop.

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
- Nearby APU-running aircraft within 100 metres, shown in a compact tooltip or list
- Current reason and elapsed time
- Compact history pills for previous reason segments

The compact side table lists all BNE ground aircraft with:

- Tail
- Bay
- APU on/off state
- APU elapsed minutes
- Total ground minutes
- A small ghost action that scrolls to and focuses the aircraft card

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
- Compact history pills for prior segments
- A light icon button to open the full reason-chain drawer

Example collapsed pattern:

```text
Current reason
Cleaning in progress · cleaner onboard        24m

+30m Infrastructure unavailable   +30m Logistics / agent on the way
```

The drawer allows users to:

- View the full reason chain
- Update the current reason
- Add an optional note
- Correct the category/detail on a previous segment when the original selection was wrong

The drawer does not support slicing segments, inserting retrospective segments, editing timestamps, or gamifying retrospective cleanup.

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

## Roles And Permissions

The POC uses a lightweight persona switcher rather than real authentication. The app model should still treat identity as a real concept so Microsoft Entra authentication and group assignment can replace the persona switcher later.

Prototype roles:

- Senior Engineer - BNE: primary operational command board, BNE aircraft cards, reason-chain capture, daily scorecard, proximity signals.
- HQ Viewer: secondary reporting surface for cross-location scorecards, trends, annual and daily performance, dollar reporting, and monitoring. No write-back.
- HQ Admin: HQ reporting plus admin settings for reason taxonomy, port-specific configuration, review intervals, and fuel price assumptions.
- Apron Engineer: future role for iPad/mobile prompts, targeted aircraft actions, and reason entry from the line.

Future enterprise mapping should allow Entra groups to map to app roles and port scopes.

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

Temperature is a key benchmarking slicer. Similar-temperature comparison uses 3 degree Celsius temperature bands.

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

### Fuel Price Assumption

- Effective date
- Unit price
- Currency
- Source or note

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

The current port selector should become role/port scope aware, with BNE as the primary Senior Engineer prototype port.
