import { Download, SlidersHorizontal } from "lucide-react";
import type { PortOption } from "../../data/portPreference";
import { metricLabels } from "../../domain/reportingEngine";
import type { ReportFilters, ReportMetric, ReportPeriod, ReportView } from "../../types";

const periods: { value: ReportPeriod; label: string }[] = [
  { value: "12m", label: "12m" },
  { value: "3m", label: "3m" },
  { value: "1m", label: "1m" },
  { value: "1wk", label: "1wk" },
  { value: "1d", label: "1 day" },
];

const metrics = Object.entries(metricLabels) as [ReportMetric, string][];

interface ReportControlsProps {
  view: ReportView;
  filters: ReportFilters;
  portOptions: readonly PortOption[];
  exportDisabled: boolean;
  exportError: string;
  onViewChange: (view: ReportView) => void;
  onFiltersChange: (filters: ReportFilters) => void;
  onExport: () => void;
}

export function ReportControls({
  view,
  filters,
  portOptions,
  exportDisabled,
  exportError,
  onViewChange,
  onFiltersChange,
  onExport,
}: ReportControlsProps) {
  return (
    <section className="report-controls">
      <div className="report-controls__title">
        <SlidersHorizontal size={18} />
        <div>
          <p>Reports</p>
          <h2>Historical APU burn by reason</h2>
        </div>
      </div>

      <div className="report-control-group" aria-label="Report view">
        <button className={view === "ops" ? "is-active" : ""} onClick={() => onViewChange("ops")}>Ops view</button>
        <button className={view === "savings" ? "is-active" : ""} onClick={() => onViewChange("savings")}>Savings view</button>
      </div>

      <label>
        Port
        <select value={filters.port} onChange={(event) => onFiltersChange({ ...filters, port: event.target.value })}>
          {portOptions.map((port) => <option key={port}>{port}</option>)}
        </select>
      </label>

      <label>
        Time period
        <select
          value={filters.period}
          onChange={(event) => onFiltersChange({ ...filters, period: event.target.value as ReportPeriod })}
        >
          {periods.map((period) => <option value={period.value} key={period.value}>{period.label}</option>)}
        </select>
      </label>

      <label>
        Metric
        <select
          value={filters.metric}
          onChange={(event) => onFiltersChange({ ...filters, metric: event.target.value as ReportMetric })}
        >
          {metrics.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
        </select>
      </label>

      <div className="report-export">
        <button onClick={onExport} disabled={exportDisabled}>
          <Download size={16} />
          Export to Excel
        </button>
        {exportError ? <span role="alert">{exportError}</span> : null}
      </div>
    </section>
  );
}
