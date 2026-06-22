

import { createFileRoute } from "@tanstack/react-router";
import SimulationRun from "@/pages/SimulationRun";

export const Route = createFileRoute("/simulation-run")({
  component: SimulationRun,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      system: (search.system as string) || undefined,
      highlight: (search.highlight as string) || undefined,
    };
  },
});