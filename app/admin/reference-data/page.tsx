import { AdminWorkbenchLayout } from "@/components/admin/admin-workbench-layout";
import { ReferenceDataPage } from "@/components/admin/reference-data-page";
import { defaultSettingsEvents } from "@/lib/prototype/settings-event-store";

export default function AdminReferenceDataPage() {
  return (
    <AdminWorkbenchLayout
      activeRouteId="admin-reference-data"
      description="Inspect the prototype tail equipment and BNE stand-coordinate reference snapshots used by operational read models."
      lastUpdatedAt={defaultSettingsEvents.stand_coordinates.payload.changedAt}
      scopeLabel="Reference snapshots"
      title="Reference Data"
    >
      <ReferenceDataPage />
    </AdminWorkbenchLayout>
  );
}
