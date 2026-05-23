import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

type AdminRoute = {
  id: "admin" | "admin-reasons" | "admin-fuel" | "admin-urgency" | "admin-reference-data";
  label: string;
  href: string;
};

type AdminWorkbenchLayoutProps = {
  activeRouteId: AdminRoute["id"];
  children: ReactNode;
  description: string;
  lastUpdatedAt: string;
  scopeLabel: string;
  title: string;
};

const adminRoutes: AdminRoute[] = [
  { id: "admin", label: "Overview", href: "/admin" },
  { id: "admin-reasons", label: "Reason Settings", href: "/admin/reasons" },
  { id: "admin-fuel", label: "Fuel Settings", href: "/admin/fuel" },
  { id: "admin-urgency", label: "Urgency Ranking", href: "/admin/urgency" },
  { id: "admin-reference-data", label: "Reference Data", href: "/admin/reference-data" },
];

const formatBrisbaneDateTime = (iso: string) =>
  new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "short",
    timeZone: "Australia/Brisbane",
    year: "numeric",
  }).format(new Date(iso));

export function AdminWorkbenchLayout({
  activeRouteId,
  children,
  description,
  lastUpdatedAt,
  scopeLabel,
  title,
}: AdminWorkbenchLayoutProps) {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-950">
      <main className="mx-auto grid w-full max-w-[1500px] gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:py-7">
        <aside className="border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-normal text-virgin-purple">
              Admin
            </p>
            <p className="mt-1 text-sm font-semibold text-neutral-950">Workbench</p>
          </div>
          <nav className="flex flex-col p-2" aria-label="Admin workbench navigation">
            {adminRoutes.map((route) => (
              <Link
                className={cn(
                  "rounded-product px-3 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-950",
                  route.id === activeRouteId && "bg-neutral-950 text-white hover:bg-neutral-950 hover:text-white",
                )}
                href={route.href}
                key={route.id}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </aside>

        <section className="min-w-0">
          <header className="border border-neutral-200 bg-white p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="purple">{scopeLabel}</Badge>
                  <Badge variant="neutral">BNE preview</Badge>
                </div>
                <h1 className="mt-3 text-2xl font-semibold tracking-normal text-neutral-950">
                  {title}
                </h1>
                <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-neutral-600">
                  {description}
                </p>
              </div>
              <p className="text-sm font-semibold text-neutral-600">
                Last updated {formatBrisbaneDateTime(lastUpdatedAt)}
              </p>
            </div>
          </header>

          <div className="mt-5 flex flex-col gap-5">{children}</div>
        </section>
      </main>
    </div>
  );
}
