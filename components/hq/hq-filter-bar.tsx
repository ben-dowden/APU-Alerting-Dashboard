import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { HqReport } from "@/lib/read-models";

type HqFilterBarProps = {
  report: HqReport;
};

const formatBrisbaneDateTime = (iso: string) =>
  new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Australia/Brisbane",
  }).format(new Date(iso));

export function HqFilterBar({ report }: HqFilterBarProps) {
  const ports = report.filters.ports?.length ? report.filters.ports : ["All ports"];

  return (
    <section aria-label="HQ report filters">
      <Card>
        <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-neutral-500">
              Reporting window
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-sm font-semibold text-neutral-950">
              <span>{formatBrisbaneDateTime(report.filters.startIso)}</span>
              <span className="text-neutral-400">to</span>
              <span>{formatBrisbaneDateTime(report.filters.endIso)}</span>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-neutral-500">
              Ports
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {ports.map((port) => (
                <Badge key={port} variant="neutral">
                  {port}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
