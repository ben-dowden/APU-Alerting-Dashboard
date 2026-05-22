import { AppShell } from "@/components/app/app-shell";
import { RouteStub } from "@/components/app/route-stub";

export default function AdminReferenceDataPage() {
  return (
    <AppShell>
      <RouteStub
        eyebrow="Admin"
        title="Reference Data"
        description="Reference data settings surface for stands, aircraft metadata, and operational lookup values."
      />
    </AppShell>
  );
}
