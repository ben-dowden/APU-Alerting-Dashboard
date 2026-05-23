import { Card, CardContent } from "@/components/ui/card";
import type { HqReport } from "@/lib/read-models";

import { ExportButton } from "./export-button";
import { HqFilterBar } from "./hq-filter-bar";
import { HqKpiRow } from "./hq-kpi-row";
import { LocationPerformanceTable } from "./location-performance-table";
import { ReasonBreakdownTable } from "./reason-breakdown-table";

type HQReportsOverviewProps = {
  report: HqReport;
  variant?: "overview" | "export";
  title?: string;
  eyebrow?: string;
  description?: string;
};

const formatFuelPrice = (report: HqReport) =>
  `${report.assumptionMetadata.fuelPriceCurrency} ${report.assumptionMetadata.fuelPricePerKg}/kg`;

function AssumptionMetadata({ report }: { report: HqReport }) {
  const metadata = report.assumptionMetadata;
  const rows = [
    { label: "Fuel price", version: metadata.fuelPriceVersion, value: formatFuelPrice(report) },
    { label: "Fuel burn", version: metadata.fuelBurnAssumptionVersion, value: "active burn table" },
    { label: "Reason taxonomy", version: metadata.reasonTaxonomyVersion, value: "active taxonomy" },
    { label: "Settings", version: metadata.settingsVersion, value: "report contract" },
  ];

  return (
    <section aria-label="HQ report assumptions">
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-neutral-950">Assumptions</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {rows.map((row) => (
              <div className="border-l-2 border-neutral-200 pl-3" key={row.label}>
                <p className="text-xs font-semibold uppercase tracking-normal text-neutral-500">
                  {row.label}
                </p>
                <p className="mt-1 text-sm font-semibold text-neutral-950">{row.version}</p>
                <p className="mt-1 text-xs font-medium text-neutral-500">{row.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export function HQReportsOverview({
  report,
  variant = "overview",
  title,
  eyebrow = "HQ reporting",
  description = "Event-derived runtime, estimated fuel, dollar conversion, and reason attribution for headquarters review.",
}: HQReportsOverviewProps) {
  const isExport = variant === "export";
  const heading = title ?? (isExport ? "Reason-tagged burn export" : "HQ reporting overview");

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-950">
      <main className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 px-4 py-5 sm:px-6 lg:py-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-virgin-purple">
              {eyebrow}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-normal text-neutral-950">
              {heading}
            </h1>
            <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-neutral-600">
              {description}
            </p>
          </div>
          <ExportButton report={report} />
        </div>

        {isExport ? (
          <>
            <HqFilterBar report={report} />
            <ReasonBreakdownTable report={report} />
            <AssumptionMetadata report={report} />
            <HqKpiRow report={report} />
            <LocationPerformanceTable report={report} />
          </>
        ) : (
          <>
            <HqFilterBar report={report} />
            <HqKpiRow report={report} />
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(460px,0.75fr)]">
              <LocationPerformanceTable report={report} />
              <ReasonBreakdownTable report={report} />
            </div>
            <AssumptionMetadata report={report} />
          </>
        )}
      </main>
    </div>
  );
}
