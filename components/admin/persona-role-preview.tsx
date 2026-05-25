import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const personas = [
  {
    role: "HQ Admin",
    access: "Edit settings",
    note: "Owns staged settings snapshots and reset actions.",
  },
  {
    role: "HQ Reporting",
    access: "Read reports",
    note: "Sees dollar impact through configured assumptions.",
  },
  {
    role: "Senior Engineer",
    access: "Operate BNE",
    note: "Sees runtime and estimated kg fuel only.",
  },
  {
    role: "Apron Engineer",
    access: "Future role",
    note: "Reserved for mobile capture without auth buildout.",
  },
];

export function PersonaRolePreview() {
  return (
    <section aria-label="Persona role preview">
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-neutral-950">Persona preview</p>
          <div className="mt-4 grid gap-3">
            {personas.map((persona) => (
              <div className="grid gap-2 border-l-2 border-neutral-200 pl-3" key={persona.role}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-neutral-950">{persona.role}</p>
                  <Badge variant={persona.access === "Edit settings" ? "purple" : "neutral"}>
                    {persona.access}
                  </Badge>
                </div>
                <p className="text-xs font-medium leading-5 text-neutral-600">{persona.note}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
