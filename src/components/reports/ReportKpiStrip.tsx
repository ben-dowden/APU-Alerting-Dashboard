import { Banknote, Clock3, Fuel, Target } from "lucide-react";
import type { ReportResult } from "../../types";
import { MetricCard } from "../MetricCard";

interface ReportKpiStripProps {
  report: ReportResult;
  mode: "ops" | "savings";
}

export function ReportKpiStrip({ report, mode }: ReportKpiStripProps) {
  const fourthLabel = mode === "ops" ? "Top reason" : "Projected savings";
  const fourthValue = mode === "ops"
    ? report.topReasonLabel
    : `$${report.savingsScenarios[1]?.estimatedSavingsAud ?? 0}`;
  const fourthHelper = mode === "ops" ? "Largest reason by selected metric" : "If top reason reduced by 50%";

  return (
    <section className="metric-grid metric-grid--reports">
      <MetricCard label="Burn hours" value={String(report.totalBurnHours)} helper={`${report.totalEvents} records`} tone="purple" icon={<Clock3 size={22} />} />
      <MetricCard label="Estimated cost" value={`$${report.totalCostAud}`} helper={`$${report.costPerBurnHour}/burn hr`} tone="red" icon={<Banknote size={22} />} />
      <MetricCard label="Avoidable cost" value={`$${report.avoidableCostAud}`} helper={`${report.avoidableBurnHours} avoidable hrs`} tone="green" icon={<Fuel size={22} />} />
      <MetricCard label={fourthLabel} value={fourthValue} helper={fourthHelper} tone="purple" icon={<Target size={22} />} />
    </section>
  );
}
