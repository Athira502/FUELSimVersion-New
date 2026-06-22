

import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/RoleOptimizationResults";

export const Route = createFileRoute("/role-optimization-results/$requestId")({
  component: Page,
  validateSearch: (search: Record<string, unknown>) => ({
    systemId: (search.systemId as string) ?? "",
  }),
});
