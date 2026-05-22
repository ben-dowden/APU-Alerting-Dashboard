import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BneCommandBoard } from "./bne-command-board";

describe("BneCommandBoard", () => {
  it("renders the compact command bar", () => {
    render(<BneCommandBoard />);

    expect(screen.getByRole("heading", { name: "BNE APU Command Board", level: 1 })).toBeVisible();
    expect(screen.getAllByText("BNE")[0]).toBeVisible();
    expect(screen.getByText("Senior Engineer")).toBeVisible();
    expect(screen.getByText("24°C")).toBeVisible();
    expect(screen.queryByText(/METAR/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Feed fresh/i)).toBeVisible();
    expect(screen.getByText("18:55 AEST")).toBeVisible();
    expect(screen.getByRole("link", { name: /Wallboard/i })).toHaveAttribute(
      "href",
      "/senior/bne/wallboard",
    );
  });
});
