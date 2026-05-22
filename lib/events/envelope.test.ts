import { describe, expect, it } from "vitest";
import { buildEventId, buildIdempotencyKey } from "./envelope";

describe("event envelope helpers", () => {
  it("creates stable ids and idempotency keys from event facts", () => {
    expect(buildEventId("apu_state_event", "BNE", "VH-8IA", "2026-05-22T00:00:00.000Z")).toBe(
      "apu_state_event:BNE:VH-8IA:2026-05-22T00:00:00.000Z",
    );
    expect(buildIdempotencyKey("ACMS", "MSG-1")).toBe("ACMS:MSG-1");
  });
});
