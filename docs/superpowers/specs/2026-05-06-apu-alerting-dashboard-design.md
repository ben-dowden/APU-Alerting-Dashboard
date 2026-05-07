# APU Alerting Dashboard Design

## Product Intent

The dashboard helps front-line airport and engineering teams reduce avoidable aircraft APU burn. It combines live aircraft-on-bay status, timestamp-derived APU runtime, estimated fuel and dollar impact, PCA/GPU availability, and same-day reason capture so teams can act while the aircraft is still on the ground.

## MVP Direction

Use a hybrid layout: a slim management summary across the top, visually led by dense front-line aircraft alert cards underneath. The live dashboard should be fast to scan, refresh every 15 seconds, and highlight aircraft where the APU is running while ground power or air is available.

The next iteration uses the Port Ops Command Center direction. The primary user is a Senior Engineer on shift at the port or a Ramp Duty Leader monitoring long turnarounds at night. The app should default to their last selected port across sessions, because port context is part of the operator's working setup.

## Primary Screens

1. Live Ops
   - Persistent port slicer with `All`, `BNE`, `SYD`, `MEL`, `ADL`, and `PER`.
   - 1-hour demo mode that advances the operational timeline by 15 simulated seconds on each 15-second refresh so it behaves like a live aircraft timestamp feed.
   - KPI strip with active APU aircraft, avoidable burn estimate, estimated dollar burn, and aircraft at overnight risk.
   - Cost-rate metrics for `$ / hour`, `$ / aircraft on ground`, `$ / active APU aircraft / hour`, and avoidable `$ / hour`.
   - Aircraft cards showing registration, aircraft type, port temperature, bay, location, APU runtime, estimated fuel/cost, PCA/GPU availability, and departure/on-bay timing.
   - Reason capture on each active alert card, with a controlled reason list and optional note.
   - Live activity rail that explains what changed recently: threshold breaches, ground service changes, and missing reason prompts.
   - 15 second auto-refresh with visible last updated and next refresh timing.

2. History
   - Historical APU burn panel using timestamped sample records.
   - Port filter and metric summary for burn hours, estimated cost, avoidable portion, and top reason.
   - Daily trend chart and recent event table so users can see repeated ports, aircraft, and reasons.

## Data Model

Live aircraft data is represented as timestamp feed records with aircraft registration, location, bay, APU start timestamp, last seen timestamp, PCA/GPU availability, scheduled departure, and optional reason. Runtime, fuel burn, cost, and severity are computed in the app rather than stored directly.

Historical data uses the same timestamp concept with start/end pairs. This keeps the prototype aligned to future ACMS/GE-decoded integrations and avoids coupling the UI to mock-only fields.

## Interaction Rules

The Live Ops tab refreshes data every 15 seconds. Reasons entered by the user are stored in browser local storage for the current day and merged over new feed snapshots. A card becomes a critical opportunity when the APU has been running for at least 30 minutes and PCA or GPU is available. A card becomes a warning when the APU has been running for at least 15 minutes or when it is likely to continue into the overnight window.

The port slicer is also stored in browser local storage. A user who selects `MEL` returns to the dashboard with `MEL` still selected on a later session. The selected port filters live cards, live metrics, and the activity rail.

## Visual Direction

Use the source slides as conceptual guidance, not a literal copy. The prototype should keep the red/purple operational alert language, dense aircraft cards, green/red availability dots, and clear cost framing. It should feel like a working airline ops tool rather than a marketing page.

## Prototype Boundaries

The first build is a local TypeScript app with mock integration data. It does not authenticate users, call real aircraft feeds, send notifications, or integrate with AMCO/Nexus. The data access layer is shaped so those integrations can replace the mock feed later.
