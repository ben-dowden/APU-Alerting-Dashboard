# APU Alerting Dashboard

Prototype dashboard for APU alerting, ops review, and reporting workflows.

This project is intentionally frontend-only. It is meant to look and behave like a future operational system while using local mock data, scenario packs, and data-streaming mimicry instead of backend APIs.

## Requirements

- Node.js 18 or newer
- npm

## Quick Start

```bash
git clone <your-fork-url>
cd "APU Alerting Dashboard"
npm ci
npm run dev
```

Open the local app:

```text
http://127.0.0.1:5173
```

## Common Scripts

```bash
npm run dev
```

Starts the local Vite dev server on `127.0.0.1`.

```bash
npm run dev:lan
```

Starts Vite on `0.0.0.0` so another device on the same network can view the prototype.

```bash
npm run build
```

Runs TypeScript checks and creates a production build in `dist/`.

```bash
npm run preview
```

Serves the production build locally.

```bash
npm run preview:lan
```

Serves the production build on the local network.

```bash
npm run test
```

Runs the lightweight Vitest suite.

```bash
npm run test:all
```

Runs unit tests and the production build.

## Prototype Controls

Prototype controls are visible by default in development. They let you switch demo stories without changing code:

- Scenario selector
- Pause/resume timeline
- Restart timeline
- Speed selector
- Reset local prototype storage

In production builds, prototype controls are hidden unless the URL includes:

```text
?prototype=1
```

## Scenario Packs

The mock data client currently supports these scenarios:

- `baseline-night`
- `bne-high-burn`
- `ground-service-outage`
- `quiet-night`
- `reporting-heavy`

The scenario layer feeds live dashboard data, historical records, reports, and reason-capture storage. This keeps demo stories isolated so changes in one scenario do not bleed into another.

## Data Model

There is no backend in this prototype. React talks to a local mock data client through a typed boundary:

- `ApuDataClient`
- `LiveFeedRequest`
- `HistoricalRecordsRequest`
- `PrototypeScenario`
- `PrototypeSettings`

This keeps the prototype close to a future API shape without requiring real API calls yet.

## Mobile Review

For phone or tablet review, run:

```bash
npm run dev:lan
```

Then open the LAN URL from another device on the same network. The terminal will show the local address Vite is serving.

If network access is blocked, check local firewall, VPN, and corporate network rules first.

## Windows And OneDrive Notes

The Vite cache is configured outside the project folder on Windows:

```text
%LOCALAPPDATA%\apu-alerting-dashboard\vite-cache
```

This avoids OneDrive file-locking issues where Vite can appear to start but fail to transform `.tsx` files.

The helper script also respects `HOST` and `PORT`:

```bash
HOST=0.0.0.0 PORT=5173 node scripts/start-dev-server.cjs
```

On Windows `cmd`, use:

```cmd
set HOST=0.0.0.0
set PORT=5173
node scripts\start-dev-server.cjs
```

## Lightweight By Design

This repo does not include Playwright or backend services. The intended development loop is:

```bash
npm run dev
npm run test
npm run build
```

Keep changes focused on fast stakeholder iteration: UI shape, scenario behavior, mock data realism, and reporting/export flows.
