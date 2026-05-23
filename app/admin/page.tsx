import { AdminOverviewStatusList } from "@/components/admin/admin-overview-status-list";
import { AdminPreviewPanel } from "@/components/admin/admin-preview-panel";
import { AdminWorkbenchLayout } from "@/components/admin/admin-workbench-layout";
import { PersonaRolePreview } from "@/components/admin/persona-role-preview";
import { reasonTaxonomySettings } from "@/lib/fixtures/reference/reason-taxonomy";

export default function AdminPage() {
  return (
    <AdminWorkbenchLayout
      activeRouteId="admin"
      description="Settings governance for APU reason capture, fuel assumptions, urgency ranking, reference data, and persona-aware previews."
      lastUpdatedAt={reasonTaxonomySettings.payload.changedAt}
      scopeLabel="Global defaults"
      title="Admin Workbench"
    >
      <AdminOverviewStatusList />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.85fr)_minmax(360px,0.55fr)]">
        <PersonaRolePreview />
        <AdminPreviewPanel />
      </div>
    </AdminWorkbenchLayout>
  );
}
