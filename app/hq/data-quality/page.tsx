import { DataQualityFlagsTable } from "@/components/hq/data-quality-flags-table";
import { bneScenarios } from "@/lib/fixtures/scenarios";

export default function HqDataQualityPage() {
  const events = bneScenarios.flatMap((scenario) => scenario.events);

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-950">
      <main className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 px-4 py-5 sm:px-6 lg:py-7">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-virgin-purple">
            HQ data quality
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-normal text-neutral-950">Data Quality</h1>
          <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-neutral-600">
            Source-confidence, stale-data, reference mismatch, and fallback-assumption flags from the BNE event replay.
          </p>
        </div>
        <DataQualityFlagsTable events={events} />
      </main>
    </div>
  );
}
