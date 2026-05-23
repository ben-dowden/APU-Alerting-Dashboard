import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import type { DataQualityFlagRow } from "./data-quality-flags-table";

export function DataQualityFlagDetailPanel({ flag }: { flag?: DataQualityFlagRow }) {
  return (
    <section aria-label="Data quality flag detail">
      <Card>
        <CardContent className="p-4">
          {flag ? (
            <div className="grid gap-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-normal text-virgin-purple">
                    {flag.issueLabel}
                  </p>
                  <h2 className="mt-1 text-base font-semibold text-neutral-950">{flag.tail}</h2>
                </div>
                <Badge variant={flag.severity === "critical" ? "red" : "neutral"}>
                  {flag.status}
                </Badge>
              </div>

              <dl className="grid gap-3 text-sm md:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-normal text-neutral-500">
                    Bay
                  </dt>
                  <dd className="mt-1 font-semibold text-neutral-950">
                    {flag.bay ?? "Bay not captured"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-normal text-neutral-500">
                    Source
                  </dt>
                  <dd className="mt-1 font-semibold text-neutral-950">{flag.sourceSystem}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-normal text-neutral-500">
                    Source event
                  </dt>
                  <dd className="mt-1 font-semibold text-neutral-950">{flag.sourceEventId}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-normal text-neutral-500">
                    User note
                  </dt>
                  <dd className="mt-1 font-semibold text-neutral-950">
                    {flag.note ?? "No user note captured"}
                  </dd>
                </div>
              </dl>

              <div>
                <p className="text-xs font-semibold uppercase tracking-normal text-neutral-500">
                  Related event ids
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {flag.relatedEventIds.map((eventId) => (
                    <Badge key={eventId} variant="outline">
                      {eventId}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm font-semibold text-neutral-600">Select a flag to inspect.</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
