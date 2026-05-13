import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  Fuel,
  MapPin,
  RefreshCw,
  RotateCcw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { AircraftCard } from "./AircraftCard";
import { MetricCard } from "./MetricCard";
import type { PortOption } from "../data/portPreference";
import { burnBenchmarkLabels, createBurnRateBenchmark, type BurnBenchmarkHorizon } from "../domain/apuBenchmarks";
import type { AircraftApuSnapshot, ApuReasonCode, HistoricalApuRecord, LiveApuEvent } from "../types";

interface LiveDashboardProps {
  snapshots: AircraftApuSnapshot[];
  events: LiveApuEvent[];
  metrics: {
    aircraftOnGround: number;
    activeCount: number;
    criticalCount: number;
    totalCost: number;
    avoidableCost: number;
    fuelKg: number;
    burnRateAudPerHour: number;
    avoidableRateAudPerHour: number;
    costPerAircraftOnGround: number;
    costPerActiveApuHour: number;
    reasonCaptureRate: number;
  };
  historicalRecords: HistoricalApuRecord[];
  selectedPort: PortOption;
  portOptions: readonly PortOption[];
  demoMinute: number;
  demoClockLabel: string;
  lastUpdated: Date | null;
  nextRefreshAt: Date | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  onRestartDemo: () => void;
  onPortChange: (port: PortOption) => void;
  onReasonChange: (registration: string, code: ApuReasonCode, note: string) => void;
}

function eventToneLabel(tone: LiveApuEvent["tone"]) {
  if (tone === "critical") return "Priority";
  if (tone === "watch") return "Watch";
  if (tone === "success") return "Resolved";
  return "Info";
}

function groupSnapshotsByPort(snapshots: AircraftApuSnapshot[], portOptions: readonly PortOption[]) {
  const grouped = snapshots.reduce<Record<string, AircraftApuSnapshot[]>>((groups, snapshot) => {
    groups[snapshot.port] = [...(groups[snapshot.port] ?? []), snapshot];
    return groups;
  }, {});
  const orderedPorts = portOptions.filter((port) => port !== "All");
  return orderedPorts
    .map((port) => ({ port, snapshots: grouped[port] ?? [] }))
    .filter((group) => group.snapshots.length > 0);
}

export function LiveDashboard({
  snapshots,
  events,
  metrics,
  historicalRecords,
  selectedPort,
  portOptions,
  demoMinute,
  demoClockLabel,
  lastUpdated,
  nextRefreshAt,
  isRefreshing,
  onRefresh,
  onRestartDemo,
  onPortChange,
  onReasonChange,
}: LiveDashboardProps) {
  const [benchmarkHorizon, setBenchmarkHorizon] = useState<BurnBenchmarkHorizon>("1wk");
  const progress = `${Math.min(100, Math.round((demoMinute / 60) * 100))}%`;
  const benchmark = useMemo(
    () => createBurnRateBenchmark(historicalRecords, selectedPort, benchmarkHorizon, metrics.burnRateAudPerHour),
    [benchmarkHorizon, historicalRecords, metrics.burnRateAudPerHour, selectedPort],
  );
  const benchmarkTone = benchmark.status === "above" ? "negative" : benchmark.status === "below" ? "positive" : "neutral";
  const benchmarkCopy = benchmark.status === "above"
    ? `$${Math.abs(benchmark.deltaAudPerHour)}/hr above ${burnBenchmarkLabels[benchmarkHorizon].toLowerCase()} average`
    : benchmark.status === "below"
      ? `$${Math.abs(benchmark.deltaAudPerHour)}/hr below ${burnBenchmarkLabels[benchmarkHorizon].toLowerCase()} average`
      : `On ${burnBenchmarkLabels[benchmarkHorizon].toLowerCase()} average`;
  const portGroups = useMemo(() => groupSnapshotsByPort(snapshots, portOptions), [portOptions, snapshots]);
  const showPortGroups = selectedPort === "All";

  return (
    <>
      <section className="command-hero">
        <div className="command-hero__copy">
          <h2>{selectedPort === "All" ? "Night ops command centre" : `${selectedPort} night ops`}</h2>
          <span>Longest active APU runtime first</span>
        </div>
        <div className="command-hero__controls">
          <div className="demo-clock" aria-label="Compressed one-hour demo timeline">
            <div>
              <span>Demo clock</span>
              <strong>{demoClockLabel}</strong>
            </div>
            <div className="demo-clock__track">
              <div style={{ width: progress }} />
            </div>
            <button onClick={onRestartDemo} title="Restart one-hour demo">
              <RotateCcw size={15} />
              Restart
            </button>
          </div>
          <div className="refresh-panel">
            <span>Last updated at {lastUpdated ? lastUpdated.toLocaleTimeString() : "--"}</span>
            <span>Next refresh at {nextRefreshAt ? nextRefreshAt.toLocaleTimeString() : "--"}</span>
            <button onClick={onRefresh} disabled={isRefreshing}>
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </section>

      <section className={`burn-benchmark burn-benchmark--${benchmarkTone}`}>
        <div className="burn-benchmark__main">
          <div className="burn-benchmark__icon" aria-hidden="true">
            {benchmark.status === "below" ? <TrendingDown size={21} /> : <TrendingUp size={21} />}
          </div>
          <div>
            <p>Burn-rate benchmark</p>
            <strong>${metrics.burnRateAudPerHour}/hr</strong>
            <span>{benchmarkCopy}. Historical average: ${benchmark.baselineRateAudPerHour}/hr.</span>
          </div>
        </div>
        <div className="benchmark-toggle" aria-label="Benchmark time horizon">
          {(Object.keys(burnBenchmarkLabels) as BurnBenchmarkHorizon[]).map((horizon) => (
            <button
              key={horizon}
              className={benchmarkHorizon === horizon ? "is-active" : ""}
              onClick={() => setBenchmarkHorizon(horizon)}
            >
              {burnBenchmarkLabels[horizon]}
            </button>
          ))}
        </div>
      </section>

      <section className="port-slicer" aria-label="Port filter">
        <div className="port-slicer__label">
          <MapPin size={17} />
          Port filter
        </div>
        <div className="port-slicer__chips">
          {portOptions.map((port) => (
            <button
              key={port}
              className={selectedPort === port ? "is-active" : ""}
              onClick={() => onPortChange(port)}
            >
              {port}
            </button>
          ))}
        </div>
        <span>Port selection is saved for this browser</span>
      </section>

      <section className="metric-grid metric-grid--command">
        <MetricCard
          label="Aircraft with APU on"
          value={String(metrics.activeCount)}
          helper={`${metrics.criticalCount} priority opportunities`}
          tone="negative"
          icon={<AlertCircle size={22} />}
        />
        <MetricCard
          label="Cost per aircraft on ground"
          value={`$${metrics.costPerAircraftOnGround}/hr`}
          helper={`${metrics.aircraftOnGround} aircraft in current view`}
          tone="neutral"
          icon={<Banknote size={22} />}
        />
        <MetricCard
          label="Estimated fuel burned"
          value={`${metrics.fuelKg}kg`}
          helper={`$${metrics.totalCost} current estimated cost`}
          tone="negative"
          icon={<Fuel size={22} />}
        />
        <MetricCard
          label="Reasons captured"
          value={`${metrics.reasonCaptureRate}%`}
          helper={`$${metrics.avoidableCost} avoidable cost in view`}
          tone="positive"
          icon={<CheckCircle2 size={22} />}
        />
      </section>

      <div className="command-layout">
        {showPortGroups ? (
          <section className="port-alert-groups" aria-label="Aircraft grouped by port">
            {portGroups.map((group) => {
              const activeCount = group.snapshots.filter((snapshot) => snapshot.apuRunning).length;
              const priorityCount = group.snapshots.filter((snapshot) => snapshot.severity === "critical").length;
              return (
                <section className="port-alert-group" key={group.port}>
                  <div className="port-alert-group__header">
                    <div>
                      <p>{group.port}</p>
                      <h3>{group.snapshots[0]?.location ?? group.port}</h3>
                    </div>
                    <span>{activeCount} active APUs · {priorityCount} priority</span>
                  </div>
                  <div className="alert-board">
                    {group.snapshots.map((snapshot) => (
                      <AircraftCard key={snapshot.registration} snapshot={snapshot} onReasonChange={onReasonChange} />
                    ))}
                  </div>
                </section>
              );
            })}
          </section>
        ) : (
          <section className="alert-board">
            {snapshots.map((snapshot) => (
              <AircraftCard key={snapshot.registration} snapshot={snapshot} onReasonChange={onReasonChange} />
            ))}
          </section>
        )}

        <aside className="activity-rail">
          <div className="activity-rail__header">
            <p>Live activity</p>
            <strong>{selectedPort === "All" ? "All ports" : selectedPort}</strong>
          </div>
          <div className="activity-list">
            {events.map((event) => (
              <article className={`activity-item activity-item--${event.tone}`} key={event.id}>
                <div>
                  <time>{event.timeLabel}</time>
                  <span>{eventToneLabel(event.tone)}</span>
                </div>
                <h3>{event.message}</h3>
                <p>{event.registration ? `${event.registration} | ${event.port}. ` : ""}{event.detail}</p>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}
