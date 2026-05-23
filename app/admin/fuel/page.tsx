import { AdminWorkbenchLayout } from "@/components/admin/admin-workbench-layout";
import { FuelSettingsPage } from "@/components/admin/fuel-settings-page";
import { fuelBurnAssumptionSettings } from "@/lib/fixtures/reference/fuel-assumptions";

export default function AdminFuelPage() {
  return (
    <AdminWorkbenchLayout
      activeRouteId="admin-fuel"
      description="Manage HQ fuel price and equipment burn assumptions used for reporting, export reconciliation, and BNE preview calculations."
      lastUpdatedAt={fuelBurnAssumptionSettings.payload.changedAt}
      scopeLabel="Global fuel defaults"
      title="Fuel Settings"
    >
      <FuelSettingsPage />
    </AdminWorkbenchLayout>
  );
}
