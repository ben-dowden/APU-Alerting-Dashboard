import { AppShell } from "@/components/app/app-shell";
import { RouteStub } from "@/components/app/route-stub";

export default function HqDataQualityPage() {
  return (
    <AppShell>
      <RouteStub
        eyebrow="HQ"
        title="Data Quality"
        description="Operational data quality review surface for source confidence, inferred closures, and assumption lineage."
      />
    </AppShell>
  );
}
