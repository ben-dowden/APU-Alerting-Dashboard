import { AlertTriangle, Clock3, DollarSign } from "lucide-react";
import { formatDuration, reasonLabels } from "../domain/apuCalculations";
import type { AircraftApuSnapshot, ApuReasonCode } from "../types";
import { StatusDot } from "./StatusDot";

interface AircraftCardProps {
  snapshot: AircraftApuSnapshot;
  onReasonChange: (registration: string, code: ApuReasonCode, note: string) => void;
}

const reasonOptions = Object.entries(reasonLabels) as [ApuReasonCode, string][];

export function AircraftCard({ snapshot, onReasonChange }: AircraftCardProps) {
  const headerText = snapshot.nextBayMinutes >= 60
    ? `Aircraft on bay for next ${formatDuration(snapshot.nextBayMinutes)}`
    : `Aircraft on bay for next ${snapshot.nextBayMinutes} minutes`;

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
            <dt>Estimated fuel burn</dt>
            <dd>{snapshot.fuelBurnKg}kg / ${snapshot.estimatedCostAud}</dd>
          </div>
          <div>
            <dt>Likely avoidable tonight</dt>
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

      <div className="reason-panel">
        <label htmlFor={`${snapshot.registration}-reason`}>Reason for operation</label>
        <select
          id={`${snapshot.registration}-reason`}
          value={snapshot.reason.code}
          onChange={(event) => onReasonChange(snapshot.registration, event.target.value as ApuReasonCode, snapshot.reason.note)}
        >
          {reasonOptions.map(([value, label]) => (
            <option value={value} key={value}>{label}</option>
          ))}
        </select>
        <input
          value={snapshot.reason.note}
          placeholder="Optional note for today's ops log"
          onChange={(event) => onReasonChange(snapshot.registration, snapshot.reason.code, event.target.value)}
        />
      </div>

      <div className="card-footer">
        <span><DollarSign size={14} /> ${snapshot.estimatedCostAud} current | ${snapshot.avoidableRateAudPerHour}/hr avoidable</span>
        <span>{snapshot.reason.updatedAt ? "Reason captured" : "Awaiting reason"}</span>
      </div>
    </article>
  );
}
