import { HQReportsOverview } from "@/components/hq/hq-reports-overview";
import { bneHqReport } from "@/lib/fixtures/hq-reporting";

export default function HqReportsPage() {
  return (
    <HQReportsOverview
      description="Export-first HQ view for reconciled reason-tagged burn rows, downstream lineage, and assumption metadata."
      eyebrow="HQ"
      report={bneHqReport}
      title="HQ Reports"
      variant="export"
    />
  );
}
