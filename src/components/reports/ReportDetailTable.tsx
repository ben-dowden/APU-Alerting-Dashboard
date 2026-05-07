import { estimateCostAud, formatDuration, minutesBetween, reasonLabels } from "../../domain/apuCalculations";
import type { HistoricalApuRecord } from "../../types";

interface ReportDetailTableProps {
  records: HistoricalApuRecord[];
}

export function ReportDetailTable({ records }: ReportDetailTableProps) {
  return (
    <section className="report-table-panel">
      <h3>Event detail</h3>
      <div className="report-table report-table--detail">
        <div className="report-table__head">
          <span>Aircraft</span>
          <span>Port / bay</span>
          <span>Duration</span>
          <span>Reason</span>
          <span>Cost</span>
        </div>
        {records.length === 0 ? (
          <div className="report-table__empty">No event records for this filter.</div>
        ) : records.slice(0, 12).map((record) => {
          const minutes = minutesBetween(record.apuStartedAt, record.apuStoppedAt);
          return (
            <div className="report-table__row" key={record.id}>
              <span>{record.registration} <small>{record.aircraftType}</small></span>
              <span>{record.port} / {record.bay}</span>
              <span>{formatDuration(minutes)}</span>
              <span>{reasonLabels[record.reasonCode]}</span>
              <span>${estimateCostAud(minutes)}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
