import type { HqReport } from "@/lib/read-models";

export const formatCurrency = (currency: string, value: number) => `${currency} ${value.toFixed(2)}`;

export const formatFuelPrice = (report: HqReport) =>
  `${report.assumptionMetadata.fuelPriceCurrency} ${report.assumptionMetadata.fuelPricePerKg}/kg`;

export const formatBrisbaneDateTime = (iso: string) =>
  new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Australia/Brisbane",
  }).format(new Date(iso));
