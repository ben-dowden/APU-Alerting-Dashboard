import { metricLabels, reasonColours } from "../../domain/reportingEngine";
import type { ReasonBreakdownRow, ReportMetric } from "../../types";

interface ReasonBreakdownChartProps {
  rows: ReasonBreakdownRow[];
  metric: ReportMetric;
  title: string;
}

function valueFor(row: ReasonBreakdownRow, metric: ReportMetric) {
  if (metric === "hours") return row.burnHours;
  if (metric === "fuel") return row.fuelKg;
  if (metric === "events") return row.eventCount;
  return row.estimatedCostAud;
}

function displayValue(value: number, metric: ReportMetric) {
  if (metric === "cost") return `$${value}`;
  if (metric === "hours") return `${value}h`;
  if (metric === "fuel") return `${value}kg`;
  return String(value);
}

export function ReasonBreakdownChart({ rows, metric, title }: ReasonBreakdownChartProps) {
  const max = Math.max(...rows.map((row) => valueFor(row, metric)), 1);

  return (
    <section className="report-chart-panel">
      <div className="report-chart-panel__header">
        <h3>{title}</h3>
        <span>{metricLabels[metric]}</span>
      </div>
      {rows.length === 0 ? (
        <div className="empty-state">No APU burn records match this report.</div>
      ) : (
        <div className="reason-chart">
          {rows.map((row) => {
            const value = valueFor(row, metric);
            return (
              <div className="reason-chart__row" key={row.reasonCode}>
                <span>{row.reasonLabel}</span>
                <div className="reason-chart__track">
                  <div
                    style={{
                      width: `${Math.max(4, (value / max) * 100)}%`,
                      background: reasonColours[row.reasonCode],
                    }}
                  />
                </div>
                <strong>{displayValue(value, metric)}</strong>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
