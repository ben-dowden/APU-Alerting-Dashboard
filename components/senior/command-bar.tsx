import Link from "next/link";
import { Clock3, Monitor, Radio, Thermometer } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type CommandBarProps = {
  port: string;
  temperatureLabel: string;
  sourceFreshnessLabel: string;
  localTimeLabel: string;
};

export function CommandBar({
  port,
  temperatureLabel,
  sourceFreshnessLabel,
  localTimeLabel,
}: CommandBarProps) {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <Badge variant="red">{port}</Badge>
          <span className="text-sm font-semibold text-neutral-700">Senior Engineer</span>
          <h1 className="text-xl font-semibold tracking-normal text-neutral-950 sm:text-2xl">
            BNE APU Command Board
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="gap-1.5">
            <Thermometer aria-hidden="true" className="size-3.5" data-icon />
            {temperatureLabel}
          </Badge>
          <Badge variant="outline" className="gap-1.5">
            <Radio aria-hidden="true" className="size-3.5" data-icon />
            {sourceFreshnessLabel}
          </Badge>
          <Badge variant="neutral" className="gap-1.5">
            <Clock3 aria-hidden="true" className="size-3.5" data-icon />
            {localTimeLabel}
          </Badge>
          <Link
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 bg-white")}
            href="/senior/bne/wallboard"
          >
            <Monitor aria-hidden="true" data-icon />
            Wallboard
          </Link>
          <nav
            className="flex items-center gap-1 pl-1 text-xs font-semibold text-neutral-600"
            aria-label="Route shortcuts"
          >
            <Link className="rounded-product px-2 py-1 hover:bg-neutral-100 hover:text-neutral-950" href="/hq">
              HQ
            </Link>
            <Link
              className="rounded-product px-2 py-1 hover:bg-neutral-100 hover:text-neutral-950"
              href="/admin"
            >
              Admin
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
