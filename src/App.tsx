import { Activity, BarChart3, FileBarChart } from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { HistoryDashboard } from "./components/HistoryDashboard";
import { LiveDashboard } from "./components/LiveDashboard";
import { PrototypeControls } from "./components/PrototypeControls";
import { mockApuDataClient } from "./data/mockApuClient";
import { readPrototypeSettings, resetPrototypeSettings, writePrototypeSettings } from "./data/prototypeSettings";
import { clearStoredReasons } from "./data/reasonStore";
import { useApuFeed } from "./hooks/useApuFeed";
import type { HistoricalApuRecord, PrototypeSettings } from "./types";

type Tab = "live" | "history" | "reports";

const ReportsDashboard = lazy(() =>
  import("./components/ReportsDashboard").then((module) => ({ default: module.ReportsDashboard })),
);

function shouldShowPrototypeControls() {
  if (import.meta.env.DEV) return true;
  return new URLSearchParams(window.location.search).get("prototype") === "1";
}

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>("live");
  const [prototypeSettings, setPrototypeSettings] = useState<PrototypeSettings>(() => readPrototypeSettings());
  const [historicalRecords, setHistoricalRecords] = useState<HistoricalApuRecord[]>([]);
  const scenarios = useMemo(() => mockApuDataClient.listScenarios(), []);
  const {
    snapshots,
    events,
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
  } = useApuFeed({ dataClient: mockApuDataClient, prototypeSettings });

  useEffect(() => {
    let isCurrent = true;
    void mockApuDataClient
      .getHistoricalRecords({ scenarioId: prototypeSettings.scenarioId })
      .then((records) => {
        if (isCurrent) setHistoricalRecords(records);
      });
    return () => {
      isCurrent = false;
    };
  }, [prototypeSettings.scenarioId]);

  function handlePrototypeSettingsChange(settings: PrototypeSettings) {
    setPrototypeSettings(writePrototypeSettings(settings));
  }

  function handleResetPrototypeStorage() {
    clearStoredReasons();
    setPrototypeSettings(resetPrototypeSettings());
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand-lockup">
          <div>
            <h1>APU Alerting Dashboard</h1>
          </div>
        </div>
        <nav className="tab-nav" aria-label="Dashboard sections">
          <button className={activeTab === "live" ? "is-active" : ""} onClick={() => setActiveTab("live")}>
            <Activity size={17} />
            Live ops
          </button>
          <button className={activeTab === "history" ? "is-active" : ""} onClick={() => setActiveTab("history")}>
            <BarChart3 size={17} />
            History
          </button>
          <button className={activeTab === "reports" ? "is-active" : ""} onClick={() => setActiveTab("reports")}>
            <FileBarChart size={17} />
            Reports
          </button>
        </nav>
      </header>

      {shouldShowPrototypeControls() ? (
        <PrototypeControls
          settings={prototypeSettings}
          scenarios={scenarios}
          onSettingsChange={handlePrototypeSettingsChange}
          onRestartDemo={restartDemo}
          onResetStorage={handleResetPrototypeStorage}
        />
      ) : null}

      {activeTab === "live" ? (
        <LiveDashboard
          snapshots={snapshots}
          events={events}
          metrics={metrics}
          historicalRecords={historicalRecords}
          selectedPort={selectedPort}
          portOptions={portOptions}
          demoMinute={demoMinute}
          demoClockLabel={demoClockLabel}
          lastUpdated={lastUpdated}
          nextRefreshAt={nextRefreshAt}
          isRefreshing={isRefreshing}
          onRefresh={() => void refresh()}
          onRestartDemo={restartDemo}
          onPortChange={setSelectedPort}
          onReasonChange={updateReason}
        />
      ) : activeTab === "history" ? (
        <HistoryDashboard records={historicalRecords} />
      ) : (
        <Suspense fallback={<section className="loading-panel">Loading reports...</section>}>
          <ReportsDashboard records={historicalRecords} />
        </Suspense>
      )}
    </main>
  );
}
