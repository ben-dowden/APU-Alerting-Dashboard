export const appChrome = {
  portLabel: "BNE",
  organizationName: "Virgin Australia",
  productName: "APU Management",
  operationsLabel: "Brisbane operations",
  operationsDescription: "Senior Engineer workflow first, HQ and Admin staged behind it",
  statusLabel: "Read Model Foundation",
} as const;

export const appRouteGroups = [
  { id: "senior-engineer", title: "Senior Engineer" },
  { id: "hq", title: "HQ" },
  { id: "admin", title: "Admin" },
] as const;

export type AppRouteGroupId = (typeof appRouteGroups)[number]["id"];

type AppRouteMetadata = {
  id: string;
  groupId: AppRouteGroupId;
  href: string;
  navLabel: string;
  eyebrow: string;
  title: string;
  description: string;
};

export const appRoutes = [
  {
    id: "senior-bne",
    groupId: "senior-engineer",
    href: "/senior/bne",
    navLabel: "BNE Command Board",
    eyebrow: "Senior Engineer",
    title: "BNE APU Command Board",
    description:
      "Brisbane Senior Engineer surface for current APU runtime, estimated fuel kg, source quality, and reason-chain workflow.",
  },
  {
    id: "senior-bne-wallboard",
    groupId: "senior-engineer",
    href: "/senior/bne/wallboard",
    navLabel: "BNE Wallboard",
    eyebrow: "Wallboard",
    title: "BNE Wallboard",
    description:
      "Read-only Brisbane operations display for the same APU-derived board state used by the Senior Engineer surface.",
  },
  {
    id: "hq",
    groupId: "hq",
    href: "/hq",
    navLabel: "Monitoring",
    eyebrow: "HQ",
    title: "HQ Monitoring",
    description: "Network-level monitoring surface staged after the Brisbane Senior Engineer workflow is operational.",
  },
  {
    id: "hq-reports",
    groupId: "hq",
    href: "/hq/reports",
    navLabel: "Reports",
    eyebrow: "HQ",
    title: "HQ Reports",
    description: "Reason-tagged reporting surface for reconciled operational totals and configured fuel assumptions.",
  },
  {
    id: "hq-data-quality",
    groupId: "hq",
    href: "/hq/data-quality",
    navLabel: "Data Quality",
    eyebrow: "HQ",
    title: "Data Quality",
    description: "Operational data quality review surface for source confidence, inferred closures, and assumption lineage.",
  },
  {
    id: "admin",
    groupId: "admin",
    href: "/admin",
    navLabel: "Workbench",
    eyebrow: "Admin",
    title: "Admin Workbench",
    description: "Staged settings workbench for governance around reason settings, assumptions, urgency, and reference data.",
  },
  {
    id: "admin-reasons",
    groupId: "admin",
    href: "/admin/reasons",
    navLabel: "Reason Settings",
    eyebrow: "Admin",
    title: "Reason Settings",
    description: "Reason taxonomy settings surface for current category, detail, and reason-chain governance.",
  },
  {
    id: "admin-fuel",
    groupId: "admin",
    href: "/admin/fuel",
    navLabel: "Fuel Settings",
    eyebrow: "Admin",
    title: "Fuel Settings",
    description: "Fuel-burn and price assumption settings surface for reporting and export calculations.",
  },
  {
    id: "admin-urgency",
    groupId: "admin",
    href: "/admin/urgency",
    navLabel: "Urgency Ranking",
    eyebrow: "Admin",
    title: "Urgency Ranking",
    description: "Weighted tiebreaker settings surface for the fixed MVP urgency bucket order.",
  },
  {
    id: "admin-reference-data",
    groupId: "admin",
    href: "/admin/reference-data",
    navLabel: "Reference Data",
    eyebrow: "Admin",
    title: "Reference Data",
    description: "Reference data settings surface for stands, aircraft metadata, and operational lookup values.",
  },
] as const satisfies readonly AppRouteMetadata[];

export type AppRoute = (typeof appRoutes)[number];
export type AppRouteId = AppRoute["id"];

export const appRouteById = Object.fromEntries(appRoutes.map((route) => [route.id, route])) as Record<
  AppRouteId,
  AppRoute
>;

export const appNavigationGroups = appRouteGroups.map((group) => ({
  ...group,
  routes: appRoutes.filter((route) => route.groupId === group.id),
}));
