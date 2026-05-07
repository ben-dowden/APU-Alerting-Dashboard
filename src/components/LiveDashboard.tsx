import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  Fuel,
  Gauge,
  MapPin,
  RefreshCw,
  RotateCcw,
  TimerReset,
} from "lucide-react";
import { AircraftCard } from "./AircraftCard";
import { MetricCard } from "./MetricCard";
import type { PortOption } from "../data/portPreference";
import type { AircraftApuSnapshot, ApuReasonCode, LiveApuEvent } from "../types";

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

export function LiveDashboard({
  snapshots,
  events,
  metrics,
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
  const progress = `${Math.min(100, Math.round((demoMinute / 60) * 100))}%`;

  return (
    <>
      <section className="command-hero">
        <div className="command-hero__copy">
          <p>APU Opportunity</p>
          <h2>{selectedPort === "All" ? "National night ops command center" : `${selectedPort} night ops command center`}</h2>
          <span>Live ACMS timestamp demo | ordered by longest active APU runtime</span>
        </div>
        <div className="command-hero__controls">
          <div className="demo-clock" aria-label="Compressed one hour demo timeline">
            <div>
              <span>Demo clock</span>
              <strong>{demoClockLabel}</strong>
            </div>
            <div className="demo-clock__track">
              <div style={{ width: progress }} />
            </div>
            <button onClick={onRestartDemo} title="Restart 1 hour demo">
              <RotateCcw size={15} />
              Restart
            </button>
          </div>
          <div className="refresh-panel">
            <span>Last updated {lastUpdated ? lastUpdated.toLocaleTimeString() : "--"}</span>
            <span>Next refresh {nextRefreshAt ? nextRefreshAt.toLocaleTimeString() : "--"}</span>
            <button onClick={onRefresh} disabled={isRefreshing}>
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </section>

      <section className="port-slicer" aria-label="Port filter">
        <div className="port-slicer__label">
          <MapPin size={17} />
          Port slicer
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
        <span>Selection persists across browser sessions</span>
      </section>

      <section className="metric-grid metric-grid--command">
        <MetricCard
          label="Active APU aircraft"
          value={String(metrics.activeCount)}
          helper={`${metrics.criticalCount} priority opportunities`}
          tone="red"
          icon={<AlertCircle size={22} />}
        />
        <MetricCard
          label="Live burn rate"
          value={`$${metrics.burnRateAudPerHour}/hr`}
          helper={`$${metrics.avoidableRateAudPerHour}/hr likely avoidable`}
          tone="purple"
          icon={<Gauge size={22} />}
        />
        <MetricCard
          label="$ / aircraft on ground"
          value={`$${metrics.costPerAircraftOnGround}/hr`}
          helper={`${metrics.aircraftOnGround} aircraft in current view`}
          tone="green"
          icon={<Banknote size={22} />}
        />
        <MetricCard
          label="$ / active APU aircraft / hr"
          value={`$${metrics.costPerActiveApuHour}`}
          helper="Comparison rate for active APU runs"
          tone="purple"
          icon={<TimerReset size={22} />}
        />
        <MetricCard
          label="Fuel likely burned"
          value={`${metrics.fuelKg}kg`}
          helper={`$${metrics.totalCost} current accumulated burn`}
          tone="red"
          icon={<Fuel size={22} />}
        />
        <MetricCard
          label="Reason capture"
          value={`${metrics.reasonCaptureRate}%`}
          helper={`$${metrics.avoidableCost} avoidable burn in view`}
          tone="green"
          icon={<CheckCircle2 size={22} />}
        />
      </section>

      <div className="command-layout">
        <section className="alert-board">
          {snapshots.map((snapshot) => (
            <AircraftCard key={snapshot.registration} snapshot={snapshot} onReasonChange={onReasonChange} />
          ))}
        </section>

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
