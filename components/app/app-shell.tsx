import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

type NavItem = {
  href: string;
  label: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: "Senior Engineer",
    items: [
      { href: "/senior/bne", label: "BNE Command Board" },
      { href: "/senior/bne/wallboard", label: "BNE Wallboard" },
    ],
  },
  {
    title: "HQ",
    items: [
      { href: "/hq", label: "Monitoring" },
      { href: "/hq/reports", label: "Reports" },
      { href: "/hq/data-quality", label: "Data Quality" },
    ],
  },
  {
    title: "Admin",
    items: [
      { href: "/admin", label: "Workbench" },
      { href: "/admin/reasons", label: "Reason Settings" },
      { href: "/admin/fuel", label: "Fuel Settings" },
      { href: "/admin/urgency", label: "Urgency Ranking" },
      { href: "/admin/reference-data", label: "Reference Data" },
    ],
  },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-950 lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="border-b border-neutral-800 bg-neutral-950 text-white lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex flex-col gap-6 p-5">
          <div className="flex flex-col gap-3">
            <Badge variant="red" className="w-fit">
              BNE
            </Badge>
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-neutral-400">Virgin Australia</p>
              <p className="mt-2 text-xl font-semibold tracking-normal">APU Management</p>
            </div>
          </div>

          <nav className="flex flex-col gap-5" aria-label="Primary navigation">
            {navGroups.map((group) => (
              <div className="flex flex-col gap-2" key={group.title}>
                <p className="text-xs font-semibold uppercase tracking-normal text-neutral-500">{group.title}</p>
                <div className="flex flex-col gap-1">
                  {group.items.map((item) => (
                    <Link
                      className="rounded-product px-3 py-2 text-sm font-medium text-neutral-200 transition-colors hover:bg-neutral-800 hover:text-white"
                      href={item.href}
                      key={item.href}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      <main className="min-w-0">
        <div className="border-b border-neutral-200 bg-white px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-virgin-purple">Brisbane operations</p>
              <p className="text-xs text-neutral-500">Senior Engineer workflow first, HQ and Admin staged behind it</p>
            </div>
            <Badge variant="neutral">PR 01 Shell</Badge>
          </div>
        </div>
        <div className="p-5 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
