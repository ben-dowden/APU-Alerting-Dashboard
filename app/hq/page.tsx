import { HQReportsOverview } from "@/components/hq/hq-reports-overview";
import { bneHqReport } from "@/lib/fixtures/hq-reporting";

export default function HqPage() {
  return (
    <HQReportsOverview
      description="Network monitoring for event-derived runtime, estimated fuel, dollar impact, reason attribution, and assumption lineage."
      eyebrow="HQ"
      report={bneHqReport}
      title="HQ Monitoring"
    />
  );
}
