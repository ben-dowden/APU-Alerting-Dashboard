import { Gauge, Pause, Play, RotateCcw, Trash2 } from "lucide-react";
import { speedOptions } from "../data/prototypeSettings";
import type { PrototypeScenario, PrototypeScenarioId, PrototypeSettings } from "../types";

interface PrototypeControlsProps {
  settings: PrototypeSettings;
  scenarios: PrototypeScenario[];
  onSettingsChange: (settings: PrototypeSettings) => void;
  onRestartDemo: () => void;
  onResetStorage: () => void;
}

export function PrototypeControls({
  settings,
  scenarios,
  onSettingsChange,
  onRestartDemo,
  onResetStorage,
}: PrototypeControlsProps) {
  const activeScenario = scenarios.find((scenario) => scenario.id === settings.scenarioId);

  return (
    <section className="prototype-controls" aria-label="Prototype controls">
      <div className="prototype-controls__title">
        <Gauge size={18} />
        <div>
          <p>Prototype mode</p>
          <strong>{activeScenario?.name ?? "Baseline night"}</strong>
        </div>
      </div>

      <label>
        Scenario
        <select
          value={settings.scenarioId}
          onChange={(event) =>
            onSettingsChange({
              ...settings,
              scenarioId: event.target.value as PrototypeScenarioId,
            })
          }
        >
          {scenarios.map((scenario) => (
            <option key={scenario.id} value={scenario.id}>
              {scenario.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Speed
        <select
          value={settings.speedMultiplier}
          onChange={(event) =>
            onSettingsChange({
              ...settings,
              speedMultiplier: Number(event.target.value),
            })
          }
        >
          {speedOptions.map((speed) => (
            <option key={speed} value={speed}>
              {speed}x
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        onClick={() => onSettingsChange({ ...settings, isPaused: !settings.isPaused })}
        title={settings.isPaused ? "Resume demo timeline" : "Pause demo timeline"}
      >
        {settings.isPaused ? <Play size={15} /> : <Pause size={15} />}
        {settings.isPaused ? "Resume" : "Pause"}
      </button>

      <button type="button" onClick={onRestartDemo} title="Restart demo timeline">
        <RotateCcw size={15} />
        Restart
      </button>

      <button type="button" onClick={onResetStorage} title="Reset prototype settings and reason capture">
        <Trash2 size={15} />
        Reset
      </button>

      <span>{activeScenario?.description}</span>
    </section>
  );
}
