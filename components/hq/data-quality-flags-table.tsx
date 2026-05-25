"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { DataQualityFlagCreatedEvent, DataQualityFlagCategory } from "@/lib/events";
import { isDomainEvent } from "@/lib/events";

import { DataQualityFlagDetailPanel } from "./data-quality-flag-detail-panel";

export type DataQualityFlagRow = {
  flagId: string;
  tail: string;
  port: string;
  bay?: string;
  sourceSystem: string;
  sourceEventId: string;
  issueType: DataQualityFlagCategory;
  issueLabel: string;
  severity: DataQualityFlagCreatedEvent["payload"]["severity"];
  status: "open";
  createdAt: string;
  summary: string;
  note?: string;
  relatedEventIds: string[];
};

type FilterState = {
  issueType: "all" | DataQualityFlagCategory;
  port: "all" | string;
  recency: "all" | "last_day";
  source: "all" | string;
  status: "all" | "open";
};

const issueLabels: Record<DataQualityFlagCategory, string> = {
  equipment_mismatch: "Equipment mismatch",
  manual_user_flag: "Manual user flag",
  missing_reference_data: "Missing reference data",
  source_stale: "Source stale",
  state_conflict: "State conflict",
};

const defaultFilters: FilterState = {
  issueType: "all",
  port: "all",
  recency: "all",
  source: "all",
  status: "all",
};

const isDataQualityFlag = (
  event: unknown,
): event is DataQualityFlagCreatedEvent =>
  isDomainEvent(event) && event.eventType === "data_quality_flag_created";

export const dataQualityRowsFromEvents = (events: readonly unknown[]): DataQualityFlagRow[] =>
  events.filter(isDataQualityFlag).map((event) => ({
    flagId: event.payload.flagId,
    tail: event.payload.tail ?? "Unknown tail",
    port: event.payload.port ?? event.correlation.port,
    bay: event.payload.bay ?? event.correlation.bay,
    sourceSystem: event.sourceSystem,
    sourceEventId: event.sourceEventId,
    issueType: event.payload.issueType ?? event.payload.category,
    issueLabel: issueLabels[event.payload.issueType ?? event.payload.category],
    severity: event.payload.severity,
    status: "open",
    createdAt: event.payload.createdAt,
    summary: event.payload.summary,
    note: event.payload.note,
    relatedEventIds: event.payload.relatedEventIds,
  }));

const uniqueValues = (values: string[]) => [...new Set(values)].sort();

const isRecent = (createdAt: string) =>
  Date.parse(createdAt) >= Date.parse("2026-05-21T13:00:00.000Z");

const matchesFilters = (row: DataQualityFlagRow, filters: FilterState) =>
  (filters.port === "all" || row.port === filters.port) &&
  (filters.source === "all" || row.sourceSystem === filters.source) &&
  (filters.issueType === "all" || row.issueType === filters.issueType) &&
  (filters.status === "all" || row.status === filters.status) &&
  (filters.recency === "all" || isRecent(row.createdAt));

export function DataQualityFlagsTable({ events }: { events: readonly unknown[] }) {
  const rows = useMemo(() => dataQualityRowsFromEvents(events), [events]);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const filteredRows = rows.filter((row) => matchesFilters(row, filters));
  const [selectedFlagId, setSelectedFlagId] = useState<string | undefined>(filteredRows[0]?.flagId);
  const selectedFlag =
    filteredRows.find((row) => row.flagId === selectedFlagId) ?? filteredRows[0];

  const updateFilter = <TKey extends keyof FilterState>(key: TKey, value: FilterState[TKey]) => {
    setFilters((currentFilters) => ({ ...currentFilters, [key]: value }));
    setSelectedFlagId(undefined);
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.5fr)]">
      <div className="grid gap-5">
        <Card>
          <CardContent className="grid gap-3 p-4 md:grid-cols-5">
            <label className="text-xs font-semibold uppercase tracking-normal text-neutral-500">
              Port
              <select
                className="mt-1 h-10 w-full rounded-product border border-neutral-300 bg-white px-2 text-sm font-semibold text-neutral-950"
                onChange={(event) => updateFilter("port", event.target.value)}
                value={filters.port}
              >
                <option value="all">All ports</option>
                {uniqueValues(rows.map((row) => row.port)).map((port) => (
                  <option key={port} value={port}>
                    {port}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold uppercase tracking-normal text-neutral-500">
              Source
              <select
                className="mt-1 h-10 w-full rounded-product border border-neutral-300 bg-white px-2 text-sm font-semibold text-neutral-950"
                onChange={(event) => updateFilter("source", event.target.value)}
                value={filters.source}
              >
                <option value="all">All sources</option>
                {uniqueValues(rows.map((row) => row.sourceSystem)).map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold uppercase tracking-normal text-neutral-500">
              Issue type
              <select
                className="mt-1 h-10 w-full rounded-product border border-neutral-300 bg-white px-2 text-sm font-semibold text-neutral-950"
                onChange={(event) =>
                  updateFilter("issueType", event.target.value as FilterState["issueType"])
                }
                value={filters.issueType}
              >
                <option value="all">All issues</option>
                {Object.entries(issueLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold uppercase tracking-normal text-neutral-500">
              Status
              <select
                className="mt-1 h-10 w-full rounded-product border border-neutral-300 bg-white px-2 text-sm font-semibold text-neutral-950"
                onChange={(event) => updateFilter("status", event.target.value as FilterState["status"])}
                value={filters.status}
              >
                <option value="all">All statuses</option>
                <option value="open">Open</option>
              </select>
            </label>
            <label className="text-xs font-semibold uppercase tracking-normal text-neutral-500">
              Recency
              <select
                className="mt-1 h-10 w-full rounded-product border border-neutral-300 bg-white px-2 text-sm font-semibold text-neutral-950"
                onChange={(event) => updateFilter("recency", event.target.value as FilterState["recency"])}
                value={filters.recency}
              >
                <option value="all">All</option>
                <option value="last_day">Last day</option>
              </select>
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <table className="w-full border-collapse text-left text-sm" aria-label="Data quality flags">
              <thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-normal text-neutral-500">
                <tr>
                  <th className="px-4 py-3">Tail</th>
                  <th className="px-4 py-3">Issue</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredRows.map((row) => (
                  <tr key={row.flagId}>
                    <td className="px-4 py-3 font-semibold text-neutral-950">{row.tail}</td>
                    <td className="px-4 py-3 text-neutral-700">{row.issueLabel}</td>
                    <td className="px-4 py-3 text-neutral-700">{row.sourceSystem}</td>
                    <td className="px-4 py-3">
                      <Badge variant="neutral">{row.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        onClick={() => setSelectedFlagId(row.flagId)}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        View {row.flagId}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <DataQualityFlagDetailPanel flag={selectedFlag} />
    </div>
  );
}
