import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { appChrome, appNavigationGroups } from "@/lib/app-routes";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-950 lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="border-b border-neutral-800 bg-neutral-950 text-white lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex flex-col gap-6 p-5">
          <div className="flex flex-col gap-3">
            <Badge variant="red" className="w-fit">
              {appChrome.portLabel}
            </Badge>
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-neutral-400">
                {appChrome.organizationName}
              </p>
              <p className="mt-2 text-xl font-semibold tracking-normal">{appChrome.productName}</p>
            </div>
          </div>

          <nav className="flex flex-col gap-5" aria-label="Primary navigation">
            {appNavigationGroups.map((group) => (
              <div className="flex flex-col gap-2" key={group.title}>
                <p className="text-xs font-semibold uppercase tracking-normal text-neutral-500">
                  {group.title}
                </p>
                <div className="flex flex-col gap-1">
                  {group.routes.map((item) => (
                    <Link
                      className="rounded-product px-3 py-2 text-sm font-medium text-neutral-200 transition-colors hover:bg-neutral-800 hover:text-white"
                      href={item.href}
                      key={item.href}
                    >
                      {item.navLabel}
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
              <p className="text-sm font-semibold text-virgin-purple">{appChrome.operationsLabel}</p>
              <p className="text-xs text-neutral-500">{appChrome.operationsDescription}</p>
            </div>
            <Badge variant="neutral">{appChrome.statusLabel}</Badge>
          </div>
        </div>
        <div className="p-5 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
