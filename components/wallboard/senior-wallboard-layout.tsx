"use client";

import { useMemo } from "react";

import {
  useRecentlyActionedWorkflowTail,
  useWorkflowEvents,
} from "@/lib/prototype/use-workflow-events";
import {
  deriveBneBoardProjection,
} from "@/lib/read-models";
import { WallboardRotationShell } from "./wallboard-rotation-shell";

export function SeniorWallboardLayout() {
  const workflowEvents = useWorkflowEvents();
  const recentlyActionedTail = useRecentlyActionedWorkflowTail(workflowEvents);
  const projection = useMemo(
    () => deriveBneBoardProjection(workflowEvents),
    [workflowEvents],
  );

  return (
    <main className="min-h-screen bg-neutral-950 p-4 text-white">
      <div className="mx-auto flex aspect-video max-h-[calc(100vh-2rem)] min-h-[720px] w-full max-w-[1600px] flex-col overflow-hidden rounded-product border border-neutral-800 bg-neutral-100 text-neutral-950 shadow-2xl">
        <WallboardRotationShell
          aircraftCards={projection.aircraftCards}
          benchmarkBaselines={projection.benchmarkBaselines}
          benchmarkCurrent={projection.benchmarkCurrent}
          localTimeLabel={projection.localTimeLabel}
          recentlyActionedTail={recentlyActionedTail}
          scorecard={projection.scorecard}
          scorecardTrend={projection.scorecardTrend}
          sourceFreshnessLabel={projection.sourceFreshnessLabel}
          temperatureLabel={projection.temperatureLabel}
        />
      </div>
    </main>
  );
}
