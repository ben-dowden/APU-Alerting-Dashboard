import { AppShell } from "@/components/app/app-shell";
import { RouteStub } from "@/components/app/route-stub";

export default function SeniorBneWallboardPage() {
  return (
    <AppShell>
      <RouteStub
        eyebrow="Wallboard"
        title="BNE Wallboard"
        description="Read-only Brisbane operations display for the same APU-derived board state used by the Senior Engineer surface."
      />
    </AppShell>
  );
}
