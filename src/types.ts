export type AvailabilityState = "available" | "unavailable" | "unknown";

export type ApuReasonCode =
  | "none"
  | "operational-requirement"
  | "pca-unavailable"
  | "gpu-unavailable"
  | "maintenance"
  | "weather-cabin-comfort"
  | "turnaround-pressure"
  | "crew-request"
  | "other";

export interface ApuReasonEntry {
  code: ApuReasonCode;
  note: string;
  updatedAt: string;
}

export interface AircraftApuFeedRecord {
  id: string;
  registration: string;
  aircraftType: string;
  port: string;
  location: string;
  bay: string;
  portTemperatureC: number;
  apuStartedAt: string | null;
  lastSeenAt: string;
  pcaAvailability: AvailabilityState;
  gpuAvailability: AvailabilityState;
  scheduledDepartureAt: string;
  nextBayMinutes: number;
}

export interface AircraftApuSnapshot extends AircraftApuFeedRecord {
  apuRunning: boolean;
  runtimeMinutes: number;
  fuelBurnKg: number;
  estimatedCostAud: number;
  avoidableCostAud: number;
  burnRateAudPerHour: number;
  avoidableRateAudPerHour: number;
  severity: "normal" | "watch" | "critical";
  reason: ApuReasonEntry;
}

export interface LiveApuEvent {
  id: string;
  minute: number;
  timeLabel: string;
  port: string;
  registration?: string;
  tone: "info" | "watch" | "critical" | "success";
  message: string;
  detail: string;
}

export interface LiveApuFeed {
  records: AircraftApuFeedRecord[];
  events: LiveApuEvent[];
  demoMinute: number;
  demoClockLabel: string;
}

export interface HistoricalApuRecord {
  id: string;
  registration: string;
  aircraftType: string;
  port: string;
  bay: string;
  apuStartedAt: string;
  apuStoppedAt: string;
  pcaAvailability: AvailabilityState;
  gpuAvailability: AvailabilityState;
  reasonCode: ApuReasonCode;
}

export type ReportView = "ops" | "savings";

export type ReportPeriod = "12m" | "3m" | "1m" | "1wk" | "1d";

export type ReportMetric = "cost" | "hours" | "fuel" | "events";

export interface ReportFilters {
  port: string;
  period: ReportPeriod;
  metric: ReportMetric;
}

export interface ReasonBreakdownRow {
  reasonCode: ApuReasonCode;
  reasonLabel: string;
  burnMinutes: number;
  burnHours: number;
  estimatedCostAud: number;
  fuelKg: number;
  eventCount: number;
  avoidableMinutes: number;
  avoidableCostAud: number;
  shareOfBurn: number;
  topPort: string;
}

export interface PortCostRow {
  port: string;
  estimatedCostAud: number;
  avoidableCostAud: number;
  burnHours: number;
  eventCount: number;
}

export interface TrendBucket {
  label: string;
  startIso: string;
  estimatedCostAud: number;
  avoidableCostAud: number;
  burnHours: number;
  eventCount: number;
}

export interface SavingsScenario {
  label: string;
  reductionPercent: number;
  reasonCode: ApuReasonCode;
  reasonLabel: string;
  estimatedSavingsAud: number;
}

export interface ReportResult {
  filters: ReportFilters;
  generatedAt: string;
  records: HistoricalApuRecord[];
  reasonRows: ReasonBreakdownRow[];
  portRows: PortCostRow[];
  trend: TrendBucket[];
  totalBurnHours: number;
  totalCostAud: number;
  totalFuelKg: number;
  totalEvents: number;
  avoidableCostAud: number;
  avoidableBurnHours: number;
  costPerBurnHour: number;
  topReasonCode: ApuReasonCode;
  topReasonLabel: string;
  savingsScenarios: SavingsScenario[];
}
