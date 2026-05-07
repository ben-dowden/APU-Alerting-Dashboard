import type { ReportResult } from "../../types";
import { ReasonBreakdownChart } from "./ReasonBreakdownChart";
import { ReportKpiStrip } from "./ReportKpiStrip";

interface SavingsReportViewProps {
  report: ReportResult;
}

export function SavingsReportView({ report }: SavingsReportViewProps) {
  const maxPortCost = Math.max(...report.portRows.map((row) => row.estimatedCostAud), 1);
  const maxTrendCost = Math.max(...report.trend.map((row) => row.estimatedCostAud), 1);

  return (
    <section className="report-view">
      <ReportKpiStrip report={report} mode="savings" />
      <div className="savings-grid">
        <section className="report-chart-panel">
          <div className="report-chart-panel__header">
            <h3>Cost by port</h3>
            <span>$ cost</span>
          </div>
          <div className="reason-chart">
            {report.portRows.length === 0 ? <div className="empty-state">No port records match this report.</div> : report.portRows.map((row) => (
              <div className="reason-chart__row" key={row.port}>
                <span>{row.port}</span>
                <div className="reason-chart__track">
                  <div style={{ width: `${Math.max(4, (row.estimatedCostAud / maxPortCost) * 100)}%` }} />
                </div>
                <strong>${row.estimatedCostAud}</strong>
              </div>
            ))}
          </div>
        </section>

        <ReasonBreakdownChart rows={report.reasonRows} metric="cost" title="Cost by reason" />

        <section className="report-chart-panel">
          <div className="report-chart-panel__header">
            <h3>Trend</h3>
            <span>$ cost</span>
          </div>
          <div className="trend-strip">
            {report.trend.length === 0 ? <div className="empty-state">No trend records match this report.</div> : report.trend.map((bucket) => (
              <div className="trend-strip__bar" key={bucket.label}>
                <div style={{ height: `${Math.max(8, (bucket.estimatedCostAud / maxTrendCost) * 100)}%` }} />
                <span>{bucket.label.slice(5)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="report-table-panel">
          <h3>Savings scenarios</h3>
          <div className="scenario-list">
            {report.savingsScenarios.length === 0 ? <div className="empty-state">No savings scenarios for this report.</div> : report.savingsScenarios.map((scenario) => (
              <div className="scenario-item" key={scenario.label}>
                <span>{scenario.label}</span>
                <strong>${scenario.estimatedSavingsAud}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
