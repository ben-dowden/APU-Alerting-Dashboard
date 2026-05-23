import { describe, expect, it } from "vitest";
import type { UrgencyBucket } from "@/lib/events";
import { rankAircraftCards, type RankableAircraftCard } from "./urgency-ranking";

const nowIso = "2026-05-22T09:00:00.000Z";

const card = (
  tail: string,
  overrides: Partial<RankableAircraftCard> = {},
): RankableAircraftCard => ({
  tail,
  urgencyBucket: "active_valid_reason",
  reviewState: {
    isReviewDue: false,
  },
  groundMinutes: 30,
  apuRuntimeMinutes: 30,
  estimatedFuelKg: 50,
  nearbyApuAircraft: [],
  sourceCharms: [],
  ...overrides,
});

const rankedTails = (cards: RankableAircraftCard[]) =>
  rankAircraftCards(cards, { nowIso }).map((ranked) => ranked.tail);

describe("rankAircraftCards", () => {
  it("applies the fixed MVP urgency bucket order", () => {
    const buckets: Array<[string, UrgencyBucket]> = [
      ["VH-OFF", "apu_off"],
      ["VH-MAN", "manual_off_pending"],
      ["VH-VALID", "active_valid_reason"],
      ["VH-OVER", "review_overdue"],
      ["VH-MISS", "missing_reason"],
    ];

    expect(rankedTails(buckets.map(([tail, urgencyBucket]) => card(tail, { urgencyBucket })))).toEqual([
      "VH-MISS",
      "VH-OVER",
      "VH-VALID",
      "VH-MAN",
      "VH-OFF",
    ]);
  });

  it("prioritises the most overdue review inside a bucket", () => {
    expect(
      rankedTails([
        card("VH-SHORT", {
          urgencyBucket: "review_overdue",
          reviewState: {
            isReviewDue: true,
            reviewDueAt: "2026-05-22T08:50:00.000Z",
          },
        }),
        card("VH-LONG", {
          urgencyBucket: "review_overdue",
          reviewState: {
            isReviewDue: true,
            reviewDueAt: "2026-05-22T08:20:00.000Z",
          },
        }),
      ]),
    ).toEqual(["VH-LONG", "VH-SHORT"]);
  });

  it("uses runtime minutes as a weighted tiebreaker", () => {
    expect(
      rankedTails([
        card("VH-SHORT", { apuRuntimeMinutes: 20 }),
        card("VH-LONG", { apuRuntimeMinutes: 80 }),
      ]),
    ).toEqual(["VH-LONG", "VH-SHORT"]);
  });

  it("uses fuel, nearby APU cluster, and total ground time tiebreakers before tail fallback", () => {
    const ranked = rankAircraftCards(
      [
        card("VH-AAA", { estimatedFuelKg: 50, groundMinutes: 20 }),
        card("VH-BBB", {
          estimatedFuelKg: 100,
          nearbyApuAircraft: [card("VH-N1"), card("VH-N2")],
          groundMinutes: 20,
        }),
        card("VH-CCC", {
          estimatedFuelKg: 100,
          nearbyApuAircraft: [card("VH-N3")],
          groundMinutes: 90,
        }),
        card("VH-DDD", {
          estimatedFuelKg: 100,
          nearbyApuAircraft: [card("VH-N4")],
          groundMinutes: 90,
        }),
      ],
      {
        nowIso,
        tiebreakerWeights: {
          runtimeMinutes: 0,
          overdueMinutes: 0,
          estimatedFuelKg: 1,
          proximityCount: 40,
          groundMinutes: 0.5,
          sourceStalenessMinutes: 0,
        },
      },
    );

    expect(ranked.map((entry) => entry.tail)).toEqual(["VH-BBB", "VH-CCC", "VH-DDD", "VH-AAA"]);
    expect(ranked[0]).toEqual(
      expect.objectContaining({
        urgencyRank: 1,
        urgencyScore: 190,
        urgencyTiebreakerBreakdown: expect.objectContaining({
          estimatedFuelKg: 100,
          proximityCount: 2,
        }),
      }),
    );
  });
});
