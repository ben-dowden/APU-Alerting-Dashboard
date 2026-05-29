"use client";

import Link from "next/link";
import { useState } from "react";
import { Clock3, Cog, Radio, Thermometer } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type CommandBarProps = {
  temperatureLabel: string;
  sourceFreshnessLabel: string;
  localTimeLabel: string;
};

const areaMenuLinks = [
  { href: "/senior/bne/wallboard", label: "Wallboard" },
  { href: "/hq", label: "HQ Monitoring" },
  { href: "/hq/reports", label: "HQ Reports" },
  { href: "/hq/data-quality", label: "Data Quality" },
  { href: "/admin", label: "Admin Workbench" },
  { href: "/admin/reasons", label: "Reason Settings" },
  { href: "/admin/fuel", label: "Fuel Settings" },
  { href: "/admin/urgency", label: "Urgency Ranking" },
  { href: "/admin/reference-data", label: "Reference Data" },
] as const;

export function CommandBar({
  temperatureLabel,
  sourceFreshnessLabel,
  localTimeLabel,
}: CommandBarProps) {
  const [isAreaMenuOpen, setIsAreaMenuOpen] = useState(false);

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold tracking-normal text-neutral-950 sm:text-xl">
            Daily APU Fuel Burn - Command
          </h1>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Badge variant="secondary" className="gap-2 px-3 py-1.5 text-sm">
            <Thermometer aria-hidden="true" className="size-4" data-icon />
            {temperatureLabel}
          </Badge>
          <Badge variant="outline" className="gap-2 px-3 py-1.5 text-sm">
            <Radio aria-hidden="true" className="size-4" data-icon />
            {sourceFreshnessLabel}
          </Badge>
          <Badge variant="neutral" className="gap-2 px-3 py-1.5 text-sm">
            <Clock3 aria-hidden="true" className="size-4" data-icon />
            {localTimeLabel}
          </Badge>
          <div className="relative">
            <Button
              aria-controls={isAreaMenuOpen ? "area-menu" : undefined}
              aria-expanded={isAreaMenuOpen}
              aria-label="Open area menu"
              className="bg-white"
              onClick={() => setIsAreaMenuOpen((isOpen) => !isOpen)}
              size="icon"
              type="button"
              variant="outline"
            >
              <Cog aria-hidden="true" data-icon />
            </Button>

            {isAreaMenuOpen ? (
              <nav
                aria-label="Area menu"
                className="absolute right-0 z-50 mt-2 w-56 rounded-product border border-neutral-200 bg-white p-2 text-sm font-semibold text-neutral-700 shadow-xl"
                id="area-menu"
              >
                {areaMenuLinks.map((link) => (
                  <Link
                    className="block rounded-product px-3 py-2 transition-colors hover:bg-neutral-100 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virgin-purple"
                    href={link.href}
                    key={link.href}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
