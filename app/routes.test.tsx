import { render, screen } from "@testing-library/react";
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

const routes = [
  { title: "BNE APU Command Board", Component: SeniorBnePage },
  { title: "BNE Wallboard", Component: SeniorBneWallboardPage },
  { title: "HQ Monitoring", Component: HqPage },
  { title: "HQ Reports", Component: HqReportsPage },
  { title: "Data Quality", Component: HqDataQualityPage },
  { title: "Admin Workbench", Component: AdminPage },
  { title: "Reason Settings", Component: AdminReasonsPage },
  { title: "Fuel Settings", Component: AdminFuelPage },
  { title: "Urgency Ranking", Component: AdminUrgencyPage },
  { title: "Reference Data", Component: AdminReferenceDataPage },
];

describe("route stubs", () => {
  it.each(routes)("renders $title", ({ title, Component }) => {
    render(<Component />);

    expect(screen.getByRole("heading", { name: title, level: 1 })).toBeVisible();
  });
});
