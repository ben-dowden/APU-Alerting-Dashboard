import type { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string;
  helper: string;
  tone?: "negative" | "neutral" | "positive" | "warning" | "red" | "purple" | "green";
  icon: ReactNode;
}

export function MetricCard({ label, value, helper, tone = "neutral", icon }: MetricCardProps) {
  return (
    <section className={`metric-card metric-card--${tone}`}>
      <div className="metric-card__icon">{icon}</div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{helper}</span>
      </div>
    </section>
  );
}
