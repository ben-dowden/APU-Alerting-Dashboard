# APU Alerting Dashboard

Next.js prototype for APU alerting, reason-chain workflows, command-board views, HQ monitoring, and admin settings surfaces.

This project is intentionally frontend-only. It is meant to look and behave like a future operational system while using local fixtures and event replay instead of backend APIs.

## Requirements

- Node.js 18 or newer
- npm

## Quick Start

```bash
git clone <your-fork-url>
cd APU-Alerting-Dashboard
npm ci
npm run dev
```

Open the local app:

```text
http://127.0.0.1:3000
```

## Common Scripts

```bash
npm run dev
```

Starts the local Next.js dev server on `127.0.0.1`.

```bash
npm run dev:lan
```

Starts Next.js on `0.0.0.0` so another device on the same network can view the prototype.

```bash
npm run build
```

Runs the production Next.js build.

```bash
npm run test
```

Runs the lightweight Vitest suite.

```bash
npm run test:all
```

Runs unit tests and the production build.

## Primary Routes

- `/senior/bne`
- `/senior/bne/wallboard`
- `/hq`
- `/hq/reports`
- `/hq/data-quality`
- `/admin`
- `/admin/reasons`
- `/admin/fuel`
- `/admin/urgency`
- `/admin/reference-data`

## Data Model

There is no backend in this prototype. The active app uses typed event contracts, local scenario fixtures, domain reducers, and read models under `lib/`.

## Mobile Review

For phone or tablet review, run:

```bash
npm run dev:lan
```

Then open the LAN URL from another device on the same network. The terminal will show the local address Next.js is serving.

If network access is blocked, check local firewall, VPN, and corporate network rules first.

## Windows And OneDrive Notes

If `next build` fails with an `EPERM` unlink inside `.next`, stop any running dev server and retry after OneDrive or antivirus releases the locked build artifact.

## Lightweight By Design

This repo does not include Playwright or backend services. The intended development loop is:

```bash
npm run dev
npm run test
npm run build
```

Keep changes focused on fast stakeholder iteration: route shape, event contracts, reducer behavior, read models, and staged workflow surfaces.
