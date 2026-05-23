import { Power } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ManualApuOffActionProps = {
  tail: string;
  isPending: boolean;
  onMarkOff: () => void;
};

export function ManualApuOffAction({ tail, isPending, onMarkOff }: ManualApuOffActionProps) {
  if (isPending) {
    return (
      <Badge
        className="border-amber-200 bg-amber-50 text-amber-800"
        title="Source confirmation outstanding"
        variant="outline"
      >
        Pending off
      </Badge>
    );
  }

  return (
    <Button
      aria-label={`Mark APU off for ${tail}`}
      onClick={onMarkOff}
      size="sm"
      title="Mark APU off"
      type="button"
      variant="outline"
    >
      <Power data-icon="inline-start" />
      Mark APU off
    </Button>
  );
}
