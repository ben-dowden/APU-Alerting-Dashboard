import { AppShell } from "@/components/app/app-shell";
import { RouteStub } from "@/components/app/route-stub";

export default function HqReportsPage() {
  return (
    <AppShell>
      <RouteStub
        eyebrow="HQ"
        title="HQ Reports"
        description="Reason-tagged reporting surface for reconciled operational totals and configured fuel assumptions."
      />
    </AppShell>
  );
}
