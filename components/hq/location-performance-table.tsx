import { Card, CardContent } from "@/components/ui/card";
import type { HqReport } from "@/lib/read-models";

type LocationPerformanceTableProps = {
  report: HqReport;
};

const formatCurrency = (currency: string, value: number) => `${currency} ${value.toFixed(2)}`;

export function LocationPerformanceTable({ report }: LocationPerformanceTableProps) {
  return (
    <section aria-label="Location performance report">
      <Card>
        <CardContent className="p-0">
          <div className="border-b border-neutral-200 px-4 py-3">
            <p className="text-sm font-semibold text-neutral-950">Location performance</p>
            <p className="text-xs font-medium text-neutral-500">Runtime, fuel, and attributed coverage by port</p>
          </div>
          <div className="overflow-x-auto">
            <table aria-label="Location performance" className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-xs font-semibold uppercase tracking-normal text-neutral-500">
                  <th className="px-4 py-2">Port</th>
                  <th className="px-3 py-2">Aircraft</th>
                  <th className="px-3 py-2">APU events</th>
                  <th className="px-3 py-2">Runtime</th>
                  <th className="px-3 py-2">Fuel</th>
                  <th className="px-3 py-2">Dollar</th>
                  <th className="px-3 py-2">Attributed</th>
                  <th className="px-4 py-2">Fallback rows</th>
                </tr>
              </thead>
              <tbody>
                {report.locationRows.map((row) => (
                  <tr className="border-b border-neutral-100 last:border-b-0" key={row.port}>
                    <th className="px-4 py-3 text-sm font-semibold text-neutral-950" scope="row">
                      {row.port}
                    </th>
                    <td className="px-3 py-3 font-medium text-neutral-800">{row.aircraftCount}</td>
                    <td className="px-3 py-3 font-medium text-neutral-800">{row.apuEventCount}</td>
                    <td className="px-3 py-3 font-medium text-neutral-800">{row.runtimeMinutes} min</td>
                    <td className="px-3 py-3 font-medium text-neutral-800">{row.fuelKg} kg</td>
                    <td className="px-3 py-3 font-medium text-neutral-800">
                      {formatCurrency(report.assumptionMetadata.fuelPriceCurrency, row.dollarImpact)}
                    </td>
                    <td className="px-3 py-3 font-medium text-neutral-800">{row.attributedRuntimePercent}%</td>
                    <td className="px-4 py-3 font-medium text-neutral-800">{row.fallbackFuelRowCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
