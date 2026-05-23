import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { defaultSettingsEvents } from "@/lib/prototype/settings-event-store";

const statusRows = [
  {
    label: "Reason taxonomy",
    version: defaultSettingsEvents.reason_taxonomy.payload.settingsVersion,
    summary: "Fast-capture categories, details, and review intervals.",
  },
  {
    label: "Fuel burn assumptions",
    version: defaultSettingsEvents.fuel_burn_assumptions.payload.settingsVersion,
    summary: "Equipment kg/hour rates and the configured fallback.",
  },
  {
    label: "Urgency tiebreakers",
    version: defaultSettingsEvents.urgency_ranking.payload.settingsVersion,
    summary: "Fixed MVP bucket order with editable global weights.",
  },
  {
    label: "Reference data",
    version: defaultSettingsEvents.tail_equipment_reference.payload.settingsVersion,
    summary: "Tail equipment and BNE stand coordinate lookup data.",
  },
];

export function AdminOverviewStatusList() {
  return (
    <section aria-label="Admin settings status">
      <Card>
        <CardContent className="p-0">
          <div className="grid divide-y divide-neutral-200">
            {statusRows.map((row) => (
              <div className="grid gap-3 p-4 md:grid-cols-[minmax(220px,0.4fr)_1fr_auto]" key={row.label}>
                <div>
                  <p className="text-sm font-semibold text-neutral-950">{row.label}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-normal text-neutral-500">
                    {row.version}
                  </p>
                </div>
                <p className="text-sm font-medium leading-6 text-neutral-600">{row.summary}</p>
                <Badge variant="neutral" className="h-fit w-fit">
                  Staged
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
