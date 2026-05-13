import { Activity, BarChart3, FileBarChart } from "lucide-react";
import { useState } from "react";
import { HistoryDashboard } from "./components/HistoryDashboard";
import { LiveDashboard } from "./components/LiveDashboard";
import { ReportsDashboard } from "./components/ReportsDashboard";
import { useApuFeed } from "./hooks/useApuFeed";

type Tab = "live" | "history" | "reports";

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>("live");
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
  } = useApuFeed();

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

      {activeTab === "live" ? (
        <LiveDashboard
          snapshots={snapshots}
          events={events}
          metrics={metrics}
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
        <HistoryDashboard />
      ) : (
        <ReportsDashboard />
      )}
    </main>
  );
}
