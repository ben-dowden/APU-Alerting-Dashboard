import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { fuelBurnAssumptionSettings, fuelPriceSettings } from "@/lib/fixtures/reference/fuel-assumptions";
import { reasonTaxonomySettings } from "@/lib/fixtures/reference/reason-taxonomy";
import { standCoordinateReferenceEvents } from "@/lib/fixtures/reference/stand-coordinates";
import { bneBaselineScenario } from "@/lib/fixtures/scenarios";
import { deriveHqReport, type HqReportSettings } from "@/lib/read-models";

import { HQReportsOverview } from "./hq-reports-overview";

const settings: HqReportSettings = {
  reasonTaxonomy: reasonTaxonomySettings,
  fuelBurnAssumptions: fuelBurnAssumptionSettings,
  fuelPrice: fuelPriceSettings,
  standCoordinates: standCoordinateReferenceEvents,
};

const report = deriveHqReport(bneBaselineScenario.events, settings, {
  startIso: "2026-05-22T00:00:00.000Z",
  endIso: "2026-05-22T08:55:00.000Z",
  ports: ["BNE"],
});

describe("HQReportsOverview", () => {
  it("renders filters, KPI cards, report tables, assumption metadata, and export action", () => {
    render(<HQReportsOverview report={report} />);

    const filters = screen.getByRole("region", { name: "HQ report filters" });
    expect(within(filters).getByText("BNE")).toBeVisible();
    expect(within(filters).getByText("22 May 2026, 10:00")).toBeVisible();
    expect(within(filters).getByText("22 May 2026, 18:55")).toBeVisible();

    const kpis = screen.getByRole("region", { name: "HQ report KPIs" });
    expect(within(kpis).getByText("Runtime")).toBeVisible();
    expect(within(kpis).getByText("46 min")).toBeVisible();
    expect(within(kpis).getByText("Fuel")).toBeVisible();
    expect(within(kpis).getByText("85.9 kg")).toBeVisible();
    expect(within(kpis).getByText("Dollar impact")).toBeVisible();
    expect(within(kpis).getByText("AUD 101.36")).toBeVisible();
    expect(within(kpis).getByText("Attribution")).toBeVisible();
    expect(within(kpis).getByText("76.1%")).toBeVisible();

    const locationTable = screen.getByRole("table", { name: "Location performance" });
    expect(within(locationTable).getByText("BNE")).toBeVisible();
    expect(within(locationTable).getByText("85.9 kg")).toBeVisible();
    expect(within(locationTable).getByText("AUD 101.36")).toBeVisible();

    const reasonTable = screen.getByRole("table", { name: "Reason breakdown" });
    expect(within(reasonTable).getByText("Cleaning in progress")).toBeVisible();
    expect(within(reasonTable).getByText("Unattributed")).toBeVisible();

    const assumptions = screen.getByRole("region", { name: "HQ report assumptions" });
    expect(within(assumptions).getByText("Fuel price")).toBeVisible();
    expect(within(assumptions).getByText("fuel-price-v1")).toBeVisible();
    expect(within(assumptions).getByText("AUD 1.18/kg")).toBeVisible();
    expect(screen.getByRole("button", { name: "Export reason-tagged burn workbook" })).toBeVisible();
  });

  it("can render the export-first layout for the reports route", () => {
    render(<HQReportsOverview report={report} variant="export" />);

    expect(screen.getByRole("heading", { name: "Reason-tagged burn export" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Export reason-tagged burn workbook" })).toBeVisible();
    expect(screen.getByRole("table", { name: "Reason breakdown" })).toBeVisible();
  });
});
