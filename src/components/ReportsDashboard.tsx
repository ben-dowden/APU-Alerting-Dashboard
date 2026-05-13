import { useMemo, useState } from "react";
import { portOptions, readPortPreference, type PortOption } from "../data/portPreference";
import { downloadReportWorkbook } from "../domain/reportExport";
import { createReportResult } from "../domain/reportingEngine";
import type { HistoricalApuRecord, ReportFilters, ReportView } from "../types";
import { OpsReportView } from "./reports/OpsReportView";
import { ReportControls } from "./reports/ReportControls";
import { SavingsReportView } from "./reports/SavingsReportView";

interface ReportsDashboardProps {
  records: HistoricalApuRecord[];
}

function defaultPort() {
  const preferred = readPortPreference();
  return preferred === "All" ? "All" : preferred;
}

export function ReportsDashboard({ records }: ReportsDashboardProps) {
  const [view, setView] = useState<ReportView>("ops");
  const [filters, setFilters] = useState<ReportFilters>({
    port: defaultPort(),
    period: "1m",
    metric: "cost",
  });
  const [exportError, setExportError] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const report = useMemo(() => createReportResult(records, filters), [filters, records]);

  function handleFiltersChange(nextFilters: ReportFilters) {
    setExportError("");
    setFilters(nextFilters);
  }

  async function handleExport() {
    setExportError("");
    setIsExporting(true);
    try {
      await downloadReportWorkbook(report, view);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Export failed");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <section className="reports-dashboard">
      <ReportControls
        view={view}
        filters={filters}
        portOptions={portOptions as readonly PortOption[]}
        exportDisabled={report.records.length === 0 || isExporting}
        exportError={exportError}
        isExporting={isExporting}
        onViewChange={setView}
        onFiltersChange={handleFiltersChange}
        onExport={handleExport}
      />
      {view === "ops" ? <OpsReportView report={report} /> : <SavingsReportView report={report} />}
    </section>
  );
}
