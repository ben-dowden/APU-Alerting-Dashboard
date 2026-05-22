import { AppShell } from "@/components/app/app-shell";
import { RouteStub } from "@/components/app/route-stub";

export default function AdminReasonsPage() {
  return (
    <AppShell>
      <RouteStub
        eyebrow="Admin"
        title="Reason Settings"
        description="Reason taxonomy settings surface for current category, detail, and reason-chain governance."
      />
    </AppShell>
  );
}
