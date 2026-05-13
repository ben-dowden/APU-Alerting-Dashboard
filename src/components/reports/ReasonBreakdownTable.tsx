import type { ReasonBreakdownRow } from "../../types";

interface ReasonBreakdownTableProps {
  rows: ReasonBreakdownRow[];
}

export function ReasonBreakdownTable({ rows }: ReasonBreakdownTableProps) {
  return (
    <section className="report-table-panel">
      <h3>Reason breakdown</h3>
      <div className="report-table report-table--reason">
        <div className="report-table__head">
          <span>Reason</span>
          <span>Hours</span>
          <span>Cost</span>
          <span>Fuel</span>
          <span>Events</span>
          <span>Avoidable</span>
          <span>Share</span>
          <span>Top port</span>
        </div>
        {rows.length === 0 ? (
          <div className="report-table__empty">No reason records match the selected filters.</div>
        ) : rows.map((row) => (
          <div className="report-table__row" key={row.reasonCode}>
            <span>{row.reasonLabel}</span>
            <span>{row.burnHours}</span>
            <span>${row.estimatedCostAud}</span>
            <span>{row.fuelKg}kg</span>
            <span>{row.eventCount}</span>
            <span>${row.avoidableCostAud}</span>
            <span>{row.shareOfBurn}%</span>
            <span>{row.topPort}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
