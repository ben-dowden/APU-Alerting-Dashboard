import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { appRouteById, type AppRoute, type AppRouteId } from "@/lib/app-routes";

import { AppShell } from "./app-shell";

type RouteStubProps = Pick<AppRoute, "title" | "eyebrow" | "description">;

export function RouteStub({ title, eyebrow, description }: RouteStubProps) {
  return (
    <section className="flex max-w-5xl flex-col gap-5">
      <div className="flex flex-col gap-3">
        <Badge variant="neutral" className="w-fit">
          {eyebrow}
        </Badge>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-normal text-neutral-950">{title}</h1>
          <p className="max-w-3xl text-sm leading-6 text-neutral-600">{description}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Foundation Surface</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-product border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-normal text-neutral-500">Runtime</p>
              <p className="mt-2 text-2xl font-semibold tracking-normal">--:--</p>
            </div>
            <div className="rounded-product border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-normal text-neutral-500">Fuel kg</p>
              <p className="mt-2 text-2xl font-semibold tracking-normal">--</p>
            </div>
            <div className="rounded-product border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-normal text-neutral-500">Source</p>
              <p className="mt-2 text-2xl font-semibold tracking-normal">Pending</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export function RouteStubPage({ routeId }: { routeId: AppRouteId }) {
  const route = appRouteById[routeId];

  return (
    <AppShell>
      <RouteStub eyebrow={route.eyebrow} title={route.title} description={route.description} />
    </AppShell>
  );
}
