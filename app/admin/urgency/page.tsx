import { AdminWorkbenchLayout } from "@/components/admin/admin-workbench-layout";
import { UrgencySettingsPage } from "@/components/admin/urgency-settings-page";
import { urgencyRankingSettings } from "@/lib/fixtures/reference/urgency-ranking";

export default function AdminUrgencyPage() {
  return (
    <AdminWorkbenchLayout
      activeRouteId="admin-urgency"
      description="Tune global weighted tiebreakers while the MVP bucket order remains fixed for operational consistency."
      lastUpdatedAt={urgencyRankingSettings.payload.changedAt}
      scopeLabel="Global urgency defaults"
      title="Urgency Ranking"
    >
      <UrgencySettingsPage />
    </AdminWorkbenchLayout>
  );
}
