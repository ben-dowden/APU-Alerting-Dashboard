import { AlertTriangle, CheckCircle2, Clock3, DollarSign, Pencil } from "lucide-react";
import { useState } from "react";
import { formatDuration, reasonLabels } from "../domain/apuCalculations";
import type { AircraftApuSnapshot, ApuReasonCode } from "../types";
import { StatusDot } from "./StatusDot";

interface AircraftCardProps {
  snapshot: AircraftApuSnapshot;
  onReasonChange: (registration: string, code: ApuReasonCode, note: string) => void;
}

const reasonOptions = Object.entries(reasonLabels) as [ApuReasonCode, string][];

export function AircraftCard({ snapshot, onReasonChange }: AircraftCardProps) {
  const [isEditingReason, setIsEditingReason] = useState(false);
  const headerText = `Aircraft on bay for next ${formatDuration(snapshot.nextBayMinutes)}`;
  const hasCapturedReason = snapshot.reason.code !== "none";
  const showReasonForm = snapshot.apuRunning && (!hasCapturedReason || isEditingReason);
  const reasonStatus = hasCapturedReason
    ? "Reason captured"
    : snapshot.apuRunning
      ? "Awaiting reason"
      : "Reason not required";

  function handleReasonCodeChange(code: ApuReasonCode) {
    onReasonChange(snapshot.registration, code, snapshot.reason.note);
    if (code !== "none" && !hasCapturedReason) {
      setIsEditingReason(false);
    }
  }

  function handleReasonNoteChange(note: string) {
    onReasonChange(snapshot.registration, snapshot.reason.code, note);
  }

  return (
    <article className={`aircraft-card aircraft-card--${snapshot.severity}`}>
      <div className="aircraft-card__top">
        <div>
          <h3>{snapshot.registration}</h3>
          <span>{snapshot.port} | {snapshot.location}</span>
        </div>
        <div className="aircraft-card__meta">
          <span>Port temp: {snapshot.portTemperatureC}C</span>
          <span>{snapshot.aircraftType}</span>
        </div>
      </div>

      <div className="aircraft-card__bay">{headerText}</div>

      <div className="aircraft-card__body">
        <div className="burn-status">
          <div className={`burn-status__icon burn-status__icon--${snapshot.apuRunning ? snapshot.severity : "normal"}`}>
            {snapshot.apuRunning ? <AlertTriangle size={20} /> : <Clock3 size={20} />}
          </div>
          <div>
            <span>APU status</span>
            <strong>{snapshot.apuRunning ? `On (${formatDuration(snapshot.runtimeMinutes)})` : "Off"}</strong>
          </div>
        </div>

        <dl className="aircraft-card__facts">
          <div>
            <dt>Estimated fuel burned</dt>
            <dd>{snapshot.fuelBurnKg}kg / ${snapshot.estimatedCostAud}</dd>
          </div>
          <div>
            <dt>Likely avoidable cost</dt>
            <dd>${snapshot.avoidableCostAud}</dd>
          </div>
          <div>
            <dt>Live burn rate</dt>
            <dd>${snapshot.burnRateAudPerHour}/hr</dd>
          </div>
          <div>
            <dt>Bay</dt>
            <dd>{snapshot.bay}</dd>
          </div>
          <div>
            <dt>PCA availability</dt>
            <dd><StatusDot value={snapshot.pcaAvailability} /> PCA {snapshot.pcaAvailability}</dd>
          </div>
          <div>
            <dt>GPU availability</dt>
            <dd><StatusDot value={snapshot.gpuAvailability} /> GPU {snapshot.gpuAvailability}</dd>
          </div>
        </dl>
      </div>

      {showReasonForm ? (
        <div className="reason-panel">
          <label htmlFor={`${snapshot.registration}-reason`}>Reason for APU use</label>
          <select
            id={`${snapshot.registration}-reason`}
            value={snapshot.reason.code}
            onChange={(event) => handleReasonCodeChange(event.target.value as ApuReasonCode)}
          >
            {reasonOptions.map(([value, label]) => (
              <option value={value} key={value}>{label}</option>
            ))}
          </select>
          <input
            value={snapshot.reason.note}
            placeholder="Optional note for today's log"
            onChange={(event) => handleReasonNoteChange(event.target.value)}
          />
          {hasCapturedReason ? (
            <button type="button" onClick={() => setIsEditingReason(false)}>
              Done
            </button>
          ) : null}
        </div>
      ) : null}

      {snapshot.apuRunning && hasCapturedReason && !isEditingReason ? (
        <div className="reason-summary" aria-label={`Reason captured: ${reasonLabels[snapshot.reason.code]}`}>
          <div className="reason-summary__status">
            <CheckCircle2 size={18} />
            <div>
              <span>Reason captured</span>
              <strong>{reasonLabels[snapshot.reason.code]}</strong>
              {snapshot.reason.note ? <p>{snapshot.reason.note}</p> : null}
            </div>
          </div>
          <button type="button" onClick={() => setIsEditingReason(true)}>
            <Pencil size={14} />
            Edit
          </button>
        </div>
      ) : null}

      <div className="card-footer">
        <span><DollarSign size={14} /> ${snapshot.estimatedCostAud} current | ${snapshot.avoidableRateAudPerHour}/hr avoidable</span>
        <span>{reasonStatus}</span>
      </div>
    </article>
  );
}
