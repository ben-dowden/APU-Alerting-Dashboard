import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import SeniorBneWallboardPage from "@/app/senior/bne/wallboard/page";

describe("SeniorBneWallboardPage", () => {
  it("renders the read-only BNE wallboard shell", () => {
    render(<SeniorBneWallboardPage />);

    expect(screen.getByRole("heading", { name: "BNE Wallboard", level: 1 })).toBeVisible();
    expect(screen.getByText("APU on now")).toBeVisible();
    expect(screen.getByRole("region", { name: "Wallboard side index" })).toBeVisible();
  });
});
