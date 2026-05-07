import { useMemo, useState } from "react";
import { historicalApuRecords } from "../data/historicalApuRecords";
import { portOptions, readPortPreference, type PortOption } from "../data/portPreference";
import { downloadReportWorkbook } from "../domain/reportExport";
import { createReportResult } from "../domain/reportingEngine";
import type { ReportFilters, ReportView } from "../types";
import { OpsReportView } from "./reports/OpsReportView";
import { ReportControls } from "./reports/ReportControls";
import { SavingsReportView } from "./reports/SavingsReportView";

function defaultPort() {
  const preferred = readPortPreference();
  return preferred === "All" ? "All" : preferred;
}

export function ReportsDashboard() {
  const [view, setView] = useState<ReportView>("ops");
  const [filters, setFilters] = useState<ReportFilters>({
    port: defaultPort(),
    period: "1m",
    metric: "cost",
  });
  const [exportError, setExportError] = useState("");

  const report = useMemo(() => createReportResult(historicalApuRecords, filters), [filters]);

  function handleFiltersChange(nextFilters: ReportFilters) {
    setExportError("");
    setFilters(nextFilters);
  }

  function handleExport() {
    setExportError("");
    try {
      downloadReportWorkbook(report, view);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Export failed");
    }
  }

  return (
    <section className="reports-dashboard">
      <ReportControls
        view={view}
        filters={filters}
        portOptions={portOptions as readonly PortOption[]}
        exportDisabled={report.records.length === 0}
        exportError={exportError}
        onViewChange={setView}
        onFiltersChange={handleFiltersChange}
        onExport={handleExport}
      />
      {view === "ops" ? <OpsReportView report={report} /> : <SavingsReportView report={report} />}
    </section>
  );
}
