import { Power } from "lucide-react";

import { Button } from "@/components/ui/button";

type ManualApuOffActionProps = {
  tail: string;
  isPending: boolean;
  onMarkOff: () => void;
};

export function ManualApuOffAction({ tail, isPending, onMarkOff }: ManualApuOffActionProps) {
  if (isPending) {
    return null;
  }

  return (
    <Button
      aria-label={`Manually mark APU off for ${tail}`}
      className="size-8 text-virgin-red"
      onClick={onMarkOff}
      size="icon"
      title="Manually mark APU off"
      type="button"
      variant="ghost"
    >
      <Power data-icon="inline-start" />
    </Button>
  );
}
