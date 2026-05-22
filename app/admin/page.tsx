import { AppShell } from "@/components/app/app-shell";
import { RouteStub } from "@/components/app/route-stub";

export default function AdminPage() {
  return (
    <AppShell>
      <RouteStub
        eyebrow="Admin"
        title="Admin Workbench"
        description="Staged settings workbench for governance around reason settings, assumptions, urgency, and reference data."
      />
    </AppShell>
  );
}
