import { describe, expect, it } from "vitest";
import { createAircraftGroundEventId, createApuEventId, normalizeTail } from "./ids";

describe("canonical event id helpers", () => {
  it("creates stable aircraft ground event ids", () => {
    expect(createAircraftGroundEventId("BNE", "VH-8IA", "2026-05-22T08:14:00.000Z")).toBe(
      "BNE:VH-8IA:ground:2026-05-22T08:14:00.000Z",
    );
  });

  it("creates stable APU event ids", () => {
    expect(createApuEventId("BNE", "VH-8IA", "2026-05-22T08:37:00.000Z")).toBe(
      "BNE:VH-8IA:apu:2026-05-22T08:37:00.000Z",
    );
  });

  it("normalizes tails for deterministic ids", () => {
    expect(normalizeTail(" vh-8ia ")).toBe("VH-8IA");
  });
});
