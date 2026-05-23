"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { downloadReasonTaggedBurnWorkbook } from "@/lib/export/reason-tagged-burn-export";
import type { HqReport } from "@/lib/read-models";

type ExportButtonProps = {
  report: HqReport;
};

export function ExportButton({ report }: ExportButtonProps) {
  return (
    <Button
      onClick={() => downloadReasonTaggedBurnWorkbook(report)}
      type="button"
    >
      <Download aria-hidden="true" data-icon />
      Export reason-tagged burn workbook
    </Button>
  );
}
