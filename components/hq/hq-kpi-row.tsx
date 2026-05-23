import { Card, CardContent } from "@/components/ui/card";
import type { HqReport } from "@/lib/read-models";

type HqKpiRowProps = {
  report: HqReport;
};

const formatCurrency = (currency: string, value: number) => `${currency} ${value.toFixed(2)}`;

export function HqKpiRow({ report }: HqKpiRowProps) {
  const metrics = [
    {
      label: "Runtime",
      value: `${report.totalRuntimeMinutes} min`,
      detail: "event-derived APU runtime",
    },
    {
      label: "Fuel",
      value: `${report.totalFuelKg} kg`,
      detail: "estimated from burn assumptions",
    },
    {
      label: "Dollar impact",
      value: formatCurrency(report.assumptionMetadata.fuelPriceCurrency, report.totalDollarImpact),
      detail: `${report.assumptionMetadata.fuelPriceCurrency} ${report.assumptionMetadata.fuelPricePerKg}/kg`,
    },
    {
      label: "Attribution",
      value: `${report.attributedRuntimePercent}%`,
      detail: "reason-tagged runtime",
    },
  ];

  return (
    <section aria-label="HQ report KPIs" className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.label}>
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-normal text-neutral-500">
              {metric.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-normal text-neutral-950">
              {metric.value}
            </p>
            <p className="mt-1 text-xs font-medium text-neutral-500">{metric.detail}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
