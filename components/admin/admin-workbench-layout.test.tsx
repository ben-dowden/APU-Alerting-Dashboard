import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { reasonTaxonomySettings } from "@/lib/fixtures/reference/reason-taxonomy";

import { AdminActionBar } from "./admin-action-bar";
import { AdminOverviewStatusList } from "./admin-overview-status-list";
import { AdminPreviewPanel } from "./admin-preview-panel";
import { AdminWorkbenchLayout } from "./admin-workbench-layout";
import { PersonaRolePreview } from "./persona-role-preview";

describe("AdminWorkbenchLayout", () => {
  it("renders the workbench navigation, header metadata, status list, and previews", () => {
    render(
      <AdminWorkbenchLayout
        activeRouteId="admin"
        description="Settings governance for APU reason capture and reporting assumptions."
        lastUpdatedAt={reasonTaxonomySettings.payload.changedAt}
        scopeLabel="Global defaults"
        title="HQ/Admin Workbench"
      >
        <AdminOverviewStatusList />
        <div className="grid gap-4 lg:grid-cols-2">
          <PersonaRolePreview />
          <AdminPreviewPanel />
        </div>
      </AdminWorkbenchLayout>,
    );

    const nav = screen.getByRole("navigation", { name: "Admin workbench navigation" });
    expect(within(nav).getByRole("link", { name: "Overview" })).toHaveAttribute("href", "/admin");
    expect(within(nav).getByRole("link", { name: "Reason Settings" })).toHaveAttribute(
      "href",
      "/admin/reasons",
    );
    expect(within(nav).getByRole("link", { name: "Fuel Settings" })).toHaveAttribute(
      "href",
      "/admin/fuel",
    );
    expect(within(nav).getByRole("link", { name: "Urgency Ranking" })).toHaveAttribute(
      "href",
      "/admin/urgency",
    );
    expect(within(nav).getByRole("link", { name: "Reference Data" })).toHaveAttribute(
      "href",
      "/admin/reference-data",
    );

    expect(screen.getByRole("heading", { name: "HQ/Admin Workbench" })).toBeVisible();
    expect(screen.getByText("Global defaults")).toBeVisible();
    expect(screen.getByText("Last updated 22 May 2026, 10:00")).toBeVisible();

    const status = screen.getByRole("region", { name: "Admin settings status" });
    expect(within(status).getByText("Reason taxonomy")).toBeVisible();
    expect(within(status).getByText("Fuel burn assumptions")).toBeVisible();
    expect(within(status).getByText("Urgency tiebreakers")).toBeVisible();
    expect(within(status).getByText("Reference data")).toBeVisible();

    const personaPreview = screen.getByRole("region", { name: "Persona role preview" });
    expect(within(personaPreview).getByText("HQ Admin")).toBeVisible();
    expect(within(personaPreview).getByText("HQ Reporting")).toBeVisible();
    expect(within(personaPreview).getByText("Senior Engineer")).toBeVisible();
    expect(within(personaPreview).getByText("Apron Engineer")).toBeVisible();

    const boardPreview = screen.getByRole("region", { name: "BNE read model preview" });
    expect(within(boardPreview).getByText("BNE")).toBeVisible();
    expect(within(boardPreview).getByText("Ground aircraft")).toBeVisible();
  });

  it("renders save, discard, and reset controls for settings pages", () => {
    render(
      <AdminActionBar
        hasValidationErrors={false}
        isDirty
        onDiscard={() => undefined}
        onReset={() => undefined}
        onSave={() => undefined}
      />,
    );

    expect(screen.getByRole("button", { name: "Save staged settings" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Discard staged settings" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Reset to defaults" })).toBeEnabled();
  });
});
