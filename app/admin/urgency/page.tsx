import { AppShell } from "@/components/app/app-shell";
import { RouteStub } from "@/components/app/route-stub";

export default function AdminUrgencyPage() {
  return (
    <AppShell>
      <RouteStub
        eyebrow="Admin"
        title="Urgency Ranking"
        description="Weighted tiebreaker settings surface for the fixed MVP urgency bucket order."
      />
    </AppShell>
  );
}
