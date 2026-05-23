import { AdminWorkbenchLayout } from "@/components/admin/admin-workbench-layout";
import { ReasonSettingsPage } from "@/components/admin/reason-settings-page";
import { reasonTaxonomySettings } from "@/lib/fixtures/reference/reason-taxonomy";

export default function AdminReasonsPage() {
  return (
    <AdminWorkbenchLayout
      activeRouteId="admin-reasons"
      description="Govern the global reason taxonomy, active fast-capture details, review intervals, and the future BNE override contract."
      lastUpdatedAt={reasonTaxonomySettings.payload.changedAt}
      scopeLabel="Global reason defaults"
      title="Reason Settings"
    >
      <ReasonSettingsPage />
    </AdminWorkbenchLayout>
  );
}
