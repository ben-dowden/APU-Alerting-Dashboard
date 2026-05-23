import { Card, CardContent } from "@/components/ui/card";
import type { HqReport } from "@/lib/read-models";

type ReasonBreakdownTableProps = {
  report: HqReport;
};

const formatCurrency = (currency: string, value: number) => `${currency} ${value.toFixed(2)}`;

export function ReasonBreakdownTable({ report }: ReasonBreakdownTableProps) {
  return (
    <section aria-label="Reason breakdown report">
      <Card>
        <CardContent className="p-0">
          <div className="border-b border-neutral-200 px-4 py-3">
            <p className="text-sm font-semibold text-neutral-950">Reason breakdown</p>
            <p className="text-xs font-medium text-neutral-500">Reason-tagged burn and unattributed runtime</p>
          </div>
          <div className="overflow-x-auto">
            <table aria-label="Reason breakdown" className="w-full min-w-[780px] text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-xs font-semibold uppercase tracking-normal text-neutral-500">
                  <th className="px-4 py-2">Category</th>
                  <th className="px-3 py-2">Detail</th>
                  <th className="px-3 py-2">Runtime</th>
                  <th className="px-3 py-2">Fuel</th>
                  <th className="px-3 py-2">Dollar</th>
                  <th className="px-3 py-2">Share</th>
                  <th className="px-4 py-2">Rows</th>
                </tr>
              </thead>
              <tbody>
                {report.reasonRows.map((row) => (
                  <tr
                    className="border-b border-neutral-100 last:border-b-0"
                    key={`${row.reasonCategoryId}:${row.reasonDetailId}`}
                  >
                    <th className="px-4 py-3 text-sm font-semibold text-neutral-950" scope="row">
                      {row.reasonCategoryLabel}
                    </th>
                    <td className="px-3 py-3 text-neutral-700">{row.reasonDetailLabel}</td>
                    <td className="px-3 py-3 font-medium text-neutral-800">{row.runtimeMinutes} min</td>
                    <td className="px-3 py-3 font-medium text-neutral-800">{row.fuelKg} kg</td>
                    <td className="px-3 py-3 font-medium text-neutral-800">
                      {formatCurrency(report.assumptionMetadata.fuelPriceCurrency, row.dollarImpact)}
                    </td>
                    <td className="px-3 py-3 font-medium text-neutral-800">{row.runtimePercentOfReport}%</td>
                    <td className="px-4 py-3 font-medium text-neutral-800">{row.rowCount}</td>
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
