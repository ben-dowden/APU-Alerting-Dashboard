# APU Command Metric Bar Design

## Purpose

The next iteration of the BNE command metric bar should make the operational state easier to scan without turning the top of the command board into an analyst dashboard. The bar should answer four distinct questions:

1. How widespread is APU use right now?
2. Which current turns have run long enough to deserve attention?
3. How much of today's runtime still lacks a reason?
4. Is today's APU use unusually intense after normalizing for ground exposure?

The wallboard should follow intuitively from this command space, but remain a higher-level summary. The command board is allowed to be more actionable; the wallboard should summarize consequence and trend.

## Approved Direction

Use four stable tiles:

```text
+----------------------------------------------------------------------------------+
| ACTIVE NOW        | LONG RUNNERS        | EXPLANATION GAP    | APU INTENSITY      |
| 16 / 21           | 4 aircraft          | 351 min            | 58%                |
| ground aircraft   | over 45 min         | untagged today     | APU-on ground time |
| live              | current turns       | 51.7% of runtime   | vs similar temp +12 pts |
+----------------------------------------------------------------------------------+
```

The first three tiles do not rotate. Only the APU Intensity comparison rotates across benchmark periods.

Do not add explanatory header lines such as:

- `Today so far: 00:00-18:55 AEST`
- `Normal: similar-temp days, same elapsed window, per ground aircraft hour`

Those concepts may exist in tooltips, detail views, tests, and documentation, but they should not occupy primary metric-bar space.

## Tile Definitions

### Active Now

Question answered: how widespread is APU use at this moment?

Primary value:

- `activeApuCount / groundAircraftCount`

Supporting copy:

- `ground aircraft`
- `live`

Scope:

- Live snapshot from the current board state.

Notes:

- This replaces the current `APU on now` tile with a denominator so the count is interpretable.
- The denominator should be aircraft currently on ground at the board's port, not the total fleet.

### Long Runners

Question answered: how many current aircraft should be reviewed because their APU has been running too long?

Primary value:

- Count of active APU aircraft with current runtime above the configured long-runner threshold.

Supporting copy:

- `over 45 min`
- `current turns`

Scope:

- Current ground sessions only.

Notes:

- The initial threshold should be 45 minutes unless existing business rules already define another value.
- The threshold should be centralized so it can later become configurable.
- This tile should remain an operational action signal, not a historical benchmark.

### Explanation Gap

Question answered: how much APU runtime today still lacks an operational reason?

Primary value:

- Untagged runtime minutes.

Supporting copy:

- `untagged today`
- `% of runtime`, for example `51.7% of runtime`

Scope:

- The same daily scorecard window currently used by `deriveDailyScorecard`.

Notes:

- This tile replaces `Attributed runtime`.
- The negative framing is intentional: it points to work remaining rather than a passive data-quality percentage.
- The existing attributed runtime percent can still be derived, but the tile should foreground untagged minutes.

### APU Intensity

Question answered: is APU use high after accounting for how much aircraft ground time exists?

Primary value:

- Percentage of ground aircraft time with APU running.

Supporting copy:

- `APU-on ground time`
- Rotating benchmark comparison, for example `vs similar temp +12 pts`

Scope:

- Daily scorecard window for the primary value.
- Benchmark comparison uses the same elapsed operational window and the same normalization basis.

Normalization:

- Calculate total APU runtime minutes divided by total ground aircraft minutes.
- Render as a percentage.
- Example: if aircraft collectively spent 1,170 minutes on ground and 679 of those minutes had APU running, intensity is `58%`.

Benchmark rotation:

```text
vs similar temp +12 pts
vs last week +9 pts
vs last month +15 pts
vs last year +18 pts
```

Notes:

- Benchmark rotation belongs only inside this tile.
- Avoid a separate benchmark panel in the metric bar.
- Prefer percentage-point deltas if possible, for example `vs last week +12 pts`, because this is easier to interpret than a percent change of a percent.
- If the baseline is unavailable, show a calm fallback such as `baseline pending`.

## Data Model Changes

Extend the scorecard read model to include:

- `groundAircraftCount`
- `longRunnerCount`
- `longRunnerThresholdMinutes`
- `untaggedRuntimeMinutes`
- `untaggedRuntimePercent`
- `groundAircraftMinutes`
- `apuIntensityPercent`

Extend the benchmark model to support APU intensity baselines:

- `similar_temperature`
- `weekly_average`
- `monthly_average`
- `annual_average`

Each benchmark should provide:

- `apuIntensityPercent`
- Optional `sampleSize`
- Optional `basisLabel`
- Optional `temperatureBandLabel`

The visible benchmark copy in the metric bar should stay short. More detailed benchmark metadata can be exposed later through a tooltip or expanded detail panel.

## UI Behaviour

- The metric bar uses four equal tiles on desktop.
- The first three tiles are stable and do not rotate.
- The APU Intensity tile rotates only its benchmark comparison line.
- Rotation should reuse the wallboard benchmark interval where appropriate, but should not force the full wallboard benchmark panel onto the command board.
- Numeric text should use tabular figures.
- Labels should remain short and plain English.
- Do not add slicer controls to this iteration.
- Do not add a written interpretation row under the cards.

## Wallboard Relationship

The wallboard should inherit the same metric concepts but present them at a higher level.

Command board emphasis:

- Active operational state
- Review candidates
- Missing explanations
- Normalized APU intensity

Wallboard emphasis:

- Active APU count
- Long-runner pressure
- Estimated fuel consequence
- Explanation coverage or gap
- APU intensity benchmark trend

The wallboard may rotate benchmark context more visibly, but should still feel like a summary of the command board rather than a separate analytical surface.

## Testing

Add focused coverage for:

- Scorecard derivation of ground aircraft count, long runners, untagged minutes, and APU intensity.
- Benchmark derivation of intensity comparisons.
- Command-board rendering of the four tile labels and stable first-three-tile content.
- Rotation state affecting only the APU Intensity comparison line.
- Fallback rendering when benchmark baselines are missing.

## Open Follow-Ups

- Confirm whether `45 min` is the correct long-runner threshold.
- Decide whether the APU Intensity benchmark delta should display as percentage points, absolute percentage, or qualitative label when values are close.
- Decide whether the wallboard should show `Explanation Gap` or a more positive `Explained` tile.
