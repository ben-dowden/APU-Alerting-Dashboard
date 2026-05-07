# APU Reporting Module Design

## Product Intent

The reporting module explains historical APU burn by reason so engineering, ramp, and leadership teams can see why APUs are being left running, where the cost is concentrated, and which operational interventions are worth pursuing. It extends the current History tab into a proper reporting engine with reusable aggregations, visual charts, and Excel export.

## Users

The primary operational users are Senior Engineers on shift and Ramp Duty Leaders reviewing APU burn patterns at their port. The secondary users are managers and leaders who need a cost and savings view across ports and time periods.

## Navigation

Add a new top-level `Reports` tab beside `Live Ops` and `History`. Inside `Reports`, use a segmented control with two views:

1. `Ops View`
2. `Savings View`

Both views use the same report filters and reporting engine so the numbers remain consistent.

## Filters

The module supports:

- Port: `All`, `BNE`, `SYD`, `MEL`, `ADL`, `PER`
- Time period: `12m`, `3m`, `1m`, `1wk`, `1 day`
- Metric: `$ cost`, `burn hours`, `fuel kg`, `event count`

The default report state is:

- View: `Ops View`
- Port: use the same persisted port preference as Live Ops when available; otherwise `All`
- Time period: `1m`
- Metric: `$ cost`

## Reporting Engine

Create a reporting engine that accepts historical APU records and report filters, then returns a normalized report result. The engine groups records by reason for APU burn and calculates:

- burn minutes and burn hours
- estimated cost
- estimated fuel kg
- event count
- avoidable burn minutes
- avoidable cost
- share of total burn
- top port for each reason
- trend buckets for the selected time period

The reporting engine should be independent of React components. Components consume report results rather than reimplementing aggregation logic.

## Ops View

Ops View answers: “Why are APUs being left running, and where should we intervene?”

It includes:

- KPI strip: total burn hours, estimated cost, avoidable cost, top reason
- Main chart: reason breakdown using the selected metric
- Reason table with reason, burn hours, estimated cost, fuel kg, event count, avoidable cost, share of total, and top port
- Detail table of filtered historical APU events

The default chart is estimated cost by reason. The metric toggle changes the chart and reason table emphasis without changing the underlying filter set.

## Savings View

Savings View answers: “Where is the money going, and what is the size of the prize?”

It includes:

- KPI strip: total estimated APU cost, avoidable cost, cost per burn hour, and projected savings opportunity
- Cost by port chart
- Cost by reason chart
- Trend over the selected time period
- Savings scenarios showing the impact of reducing the top reason by 25% and 50%

Savings calculations use the same avoidable-cost logic already used in the live dashboard: when PCA or GPU is available, APU burn is treated as fully avoidable; when neither service is available, only 25% is treated as avoidable.

## Chart Behavior

Charts should be SVG or HTML/CSS based for the prototype so we do not introduce a heavy charting dependency yet. The design should support swapping to a charting library later if the prototype matures.

The main reason chart should:

- sort reasons by the selected metric descending
- use consistent reason colours across Ops View, Savings View, and Excel export
- show labels that are readable at common desktop dashboard sizes
- handle empty data with a clear empty state

## Excel Export

The Reports tab includes an `Export Excel` button. For the local prototype, the export should generate an `.xlsx` file in the browser.

The workbook includes:

1. `Summary`
   - report filters
   - generated timestamp
   - KPI values
   - savings scenarios when exported from Savings View

2. `Reason Breakdown`
   - one row per reason
   - burn hours
   - estimated cost
   - fuel kg
   - event count
   - avoidable cost
   - share of total burn
   - top port

3. `Event Detail`
   - source historical records after filtering
   - aircraft registration
   - aircraft type
   - port
   - bay
   - APU start
   - APU stop
   - duration
   - reason
   - PCA availability
   - GPU availability
   - estimated cost
   - avoidable cost

Use the `xlsx` package for workbook generation. The expected prototype output is an `.xlsx` workbook. CSV export is only an emergency fallback if package installation is unavailable during implementation, and should preserve the same `Summary`, `Reason Breakdown`, and `Event Detail` data as separate files.

## Data Requirements

The current mock historical dataset needs to be expanded to include enough records across ports, reasons, and dates to make the time period filters meaningful. The prototype should include records that span at least 12 months and cover every reason code used by the live dashboard.

Future real-data integration should map ACMS/decoded historical APU records into the same historical record shape used by the reporting engine.

## Error And Empty States

If no records match the selected filters, the module shows:

- zeroed KPIs
- an empty chart state
- an empty table message
- a disabled or no-data Excel export state

If export fails, show a visible inline error near the export button and keep the report visible.

## Prototype Boundaries

This design covers a local browser prototype. It does not include server-side scheduled report generation, email distribution, user permissions, or enterprise data warehouse integration. Those can be added later without changing the reporting engine contract.
