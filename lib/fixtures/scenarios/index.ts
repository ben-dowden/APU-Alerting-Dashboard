export type { ScenarioEvent, ScenarioFixture } from "./builders";
export { bneAcmsLagScenario } from "./bne-acms-lag";
export { bneBaselineScenario } from "./bne-baseline";
export { bneEquipmentMismatchScenario } from "./bne-equipment-mismatch";
export { bneManualOffConfirmedScenario } from "./bne-manual-off-confirmed";
export { bneManualOffContradictedScenario } from "./bne-manual-off-contradicted";
export { bneMissingBurnAssumptionScenario } from "./bne-missing-burn-assumption";
export { bneStaleStandAssignmentScenario } from "./bne-stale-stand-assignment";

import { bneAcmsLagScenario } from "./bne-acms-lag";
import { bneBaselineScenario } from "./bne-baseline";
import { bneEquipmentMismatchScenario } from "./bne-equipment-mismatch";
import { bneManualOffConfirmedScenario } from "./bne-manual-off-confirmed";
import { bneManualOffContradictedScenario } from "./bne-manual-off-contradicted";
import { bneMissingBurnAssumptionScenario } from "./bne-missing-burn-assumption";
import { bneStaleStandAssignmentScenario } from "./bne-stale-stand-assignment";

export const bneScenarios = [
  bneBaselineScenario,
  bneAcmsLagScenario,
  bneManualOffConfirmedScenario,
  bneManualOffContradictedScenario,
  bneEquipmentMismatchScenario,
  bneMissingBurnAssumptionScenario,
  bneStaleStandAssignmentScenario,
] as const;
