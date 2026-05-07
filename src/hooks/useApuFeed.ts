import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchLiveApuFeed } from "../data/mockApuFeed";
import { portOptions, readPortPreference, type PortOption, writePortPreference } from "../data/portPreference";
import { readReason, writeReason } from "../data/reasonStore";
import { orderSnapshotsByApuRuntime, summarizeSnapshots, toSnapshot } from "../domain/apuCalculations";
import type { AircraftApuSnapshot, ApuReasonCode, LiveApuEvent } from "../types";

const REFRESH_MS = 15000;
const DEMO_STEP_MINUTES = REFRESH_MS / 60000;
const DEMO_LENGTH_MINUTES = 60;

interface RefreshOptions {
  advanceDemo?: boolean;
}

export function useApuFeed() {
  const [snapshots, setSnapshots] = useState<AircraftApuSnapshot[]>([]);
  const [events, setEvents] = useState<LiveApuEvent[]>([]);
  const [selectedPort, setSelectedPortState] = useState<PortOption>(() => readPortPreference());
  const [demoMinute, setDemoMinute] = useState(0);
  const [demoClockLabel, setDemoClockLabel] = useState("21:00:00");
  const nextDemoMinuteRef = useRef(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [nextRefreshAt, setNextRefreshAt] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async ({ advanceDemo = false }: RefreshOptions = {}) => {
    setIsRefreshing(true);
    const now = new Date();
    const currentDemoMinute = advanceDemo
      ? nextDemoMinuteRef.current >= DEMO_LENGTH_MINUTES
        ? 0
        : Math.min(DEMO_LENGTH_MINUTES, nextDemoMinuteRef.current + DEMO_STEP_MINUTES)
      : nextDemoMinuteRef.current;
    nextDemoMinuteRef.current = currentDemoMinute;
    const feed = await fetchLiveApuFeed(now, currentDemoMinute);
    const nextSnapshots = feed.records.map((record) =>
      toSnapshot(record, now.toISOString(), readReason(record.registration)),
    );
    setSnapshots(nextSnapshots);
    setEvents(feed.events);
    setDemoMinute(feed.demoMinute);
    setDemoClockLabel(feed.demoClockLabel);
    setLastUpdated(now);
    setNextRefreshAt(new Date(now.getTime() + REFRESH_MS));
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    void refresh({ advanceDemo: false });
    const interval = window.setInterval(() => {
      void refresh({ advanceDemo: true });
    }, REFRESH_MS);
    return () => window.clearInterval(interval);
  }, [refresh]);

  const updateReason = useCallback((registration: string, code: ApuReasonCode, note: string) => {
    const reason = writeReason(registration, code, note);
    setSnapshots((current) =>
      current.map((snapshot) => (snapshot.registration === registration ? { ...snapshot, reason } : snapshot)),
    );
  }, []);

  const setSelectedPort = useCallback((port: PortOption) => {
    writePortPreference(port);
    setSelectedPortState(port);
  }, []);

  const filteredSnapshots = useMemo(
    () => (selectedPort === "All" ? snapshots : snapshots.filter((snapshot) => snapshot.port === selectedPort)),
    [selectedPort, snapshots],
  );

  const orderedSnapshots = useMemo(() => orderSnapshotsByApuRuntime(filteredSnapshots), [filteredSnapshots]);

  const filteredEvents = useMemo(
    () =>
      events
        .filter((event) => selectedPort === "All" || event.port === selectedPort || event.port === "All")
        .slice(0, 8),
    [events, selectedPort],
  );

  const metrics = useMemo(() => summarizeSnapshots(filteredSnapshots), [filteredSnapshots]);

  const restartDemo = useCallback(() => {
    nextDemoMinuteRef.current = 0;
    setDemoMinute(0);
    void refresh({ advanceDemo: false });
  }, [refresh]);

  return {
    snapshots: orderedSnapshots,
    events: filteredEvents,
    metrics,
    selectedPort,
    portOptions,
    demoMinute,
    demoClockLabel,
    lastUpdated,
    nextRefreshAt,
    isRefreshing,
    refresh,
    restartDemo,
    setSelectedPort,
    updateReason,
  };
}
