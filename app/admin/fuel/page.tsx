import { AppShell } from "@/components/app/app-shell";
import { RouteStub } from "@/components/app/route-stub";

export default function AdminFuelPage() {
  return (
    <AppShell>
      <RouteStub
        eyebrow="Admin"
        title="Fuel Settings"
        description="Fuel-burn and price assumption settings surface for reporting and export calculations."
      />
    </AppShell>
  );
}
