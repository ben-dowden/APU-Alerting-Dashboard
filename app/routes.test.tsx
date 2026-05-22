import { render, screen } from "@testing-library/react";
import type { ComponentType } from "react";
import { describe, expect, it } from "vitest";

import AdminPage from "@/app/admin/page";
import AdminFuelPage from "@/app/admin/fuel/page";
import AdminReasonsPage from "@/app/admin/reasons/page";
import AdminReferenceDataPage from "@/app/admin/reference-data/page";
import AdminUrgencyPage from "@/app/admin/urgency/page";
import HqPage from "@/app/hq/page";
import HqDataQualityPage from "@/app/hq/data-quality/page";
import HqReportsPage from "@/app/hq/reports/page";
import SeniorBnePage from "@/app/senior/bne/page";
import SeniorBneWallboardPage from "@/app/senior/bne/wallboard/page";
import { appRoutes, type AppRouteId } from "@/lib/app-routes";

const routeComponents: Record<AppRouteId, ComponentType> = {
  "senior-bne": SeniorBnePage,
  "senior-bne-wallboard": SeniorBneWallboardPage,
  hq: HqPage,
  "hq-reports": HqReportsPage,
  "hq-data-quality": HqDataQualityPage,
  admin: AdminPage,
  "admin-reasons": AdminReasonsPage,
  "admin-fuel": AdminFuelPage,
  "admin-urgency": AdminUrgencyPage,
  "admin-reference-data": AdminReferenceDataPage,
};

describe("route stubs", () => {
  it.each(appRoutes)("renders $title", ({ id, title }) => {
    const Component = routeComponents[id];

    render(<Component />);

    expect(screen.getByRole("heading", { name: title, level: 1 })).toBeVisible();
  });
});
