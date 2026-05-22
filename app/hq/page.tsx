import { AppShell } from "@/components/app/app-shell";
import { RouteStub } from "@/components/app/route-stub";

export default function HqPage() {
  return (
    <AppShell>
      <RouteStub
        eyebrow="HQ"
        title="HQ Monitoring"
        description="Network-level monitoring surface staged after the Brisbane Senior Engineer workflow is operational."
      />
    </AppShell>
  );
}
