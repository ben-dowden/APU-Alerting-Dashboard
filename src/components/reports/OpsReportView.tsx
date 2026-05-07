import type { ReportResult } from "../../types";
import { ReasonBreakdownChart } from "./ReasonBreakdownChart";
import { ReasonBreakdownTable } from "./ReasonBreakdownTable";
import { ReportDetailTable } from "./ReportDetailTable";
import { ReportKpiStrip } from "./ReportKpiStrip";

interface OpsReportViewProps {
  report: ReportResult;
}

export function OpsReportView({ report }: OpsReportViewProps) {
  return (
    <section className="report-view">
      <ReportKpiStrip report={report} mode="ops" />
      <div className="report-view__grid">
        <ReasonBreakdownChart rows={report.reasonRows} metric={report.filters.metric} title="APU burn by reason" />
        <ReasonBreakdownTable rows={report.reasonRows} />
      </div>
      <ReportDetailTable records={report.records} />
    </section>
  );
}
