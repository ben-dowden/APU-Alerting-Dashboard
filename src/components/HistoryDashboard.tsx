import { useMemo, useState } from "react";
import { historicalApuRecords } from "../data/historicalApuRecords";
import { formatDuration, minutesBetween, reasonLabels, summarizeHistory } from "../domain/apuCalculations";

const ports = ["All ports", ...Array.from(new Set(historicalApuRecords.map((record) => record.port)))];

export function HistoryDashboard() {
  const [selectedPort, setSelectedPort] = useState("All ports");
  const summary = useMemo(() => summarizeHistory(historicalApuRecords, selectedPort), [selectedPort]);

  const dailyTotals = useMemo(() => {
    const totals = summary.records.reduce<Record<string, number>>((acc, record) => {
      const day = record.apuStartedAt.slice(0, 10);
      acc[day] = (acc[day] ?? 0) + minutesBetween(record.apuStartedAt, record.apuStoppedAt);
      return acc;
    }, {});
    const max = Math.max(...Object.values(totals), 1);
    return Object.entries(totals)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, minutes]) => ({ day, minutes, width: `${Math.max(8, (minutes / max) * 100)}%` }));
  }, [summary.records]);

  return (
    <section className="history-layout">
      <div className="history-header">
        <div>
          <p>Historical burn</p>
          <h2>APU burn trends from timestamped aircraft events</h2>
        </div>
        <label>
          Port
          <select value={selectedPort} onChange={(event) => setSelectedPort(event.target.value)}>
            {ports.map((port) => (
              <option key={port}>{port}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="history-summary">
        <div>
          <span>Total burn hours</span>
          <strong>{summary.totalHours}</strong>
        </div>
        <div>
          <span>Estimated cost</span>
          <strong>${summary.estimatedCostAud}</strong>
        </div>
        <div>
          <span>Likely avoidable</span>
          <strong>${summary.avoidableCostAud}</strong>
        </div>
        <div>
          <span>Top reason</span>
          <strong>{reasonLabels[summary.topReason]}</strong>
        </div>
      </div>

      <div className="history-content">
        <section className="trend-panel">
          <h3>Last recorded nights</h3>
          <div className="bar-chart">
            {dailyTotals.map((day) => (
              <div className="bar-row" key={day.day}>
                <span>{new Date(day.day).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: day.width }} />
                </div>
                <strong>{formatDuration(day.minutes)}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="history-table-panel">
          <h3>Recent APU burn records</h3>
          <div className="history-table">
            <div className="history-table__head">
              <span>Aircraft</span>
              <span>Port / bay</span>
              <span>Duration</span>
              <span>Reason</span>
            </div>
            {summary.records.map((record) => (
              <div className="history-table__row" key={record.id}>
                <span>{record.registration} <small>{record.aircraftType}</small></span>
                <span>{record.port} / {record.bay}</span>
                <span>{formatDuration(minutesBetween(record.apuStartedAt, record.apuStoppedAt))}</span>
                <span>{reasonLabels[record.reasonCode]}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
