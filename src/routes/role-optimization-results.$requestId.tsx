import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/RoleOptimizationResults";

export const Route = createFileRoute("/role-optimization-results/$requestId")({
  component: Page,
});
