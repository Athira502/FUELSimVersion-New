import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/UserOptimizationResults";

export const Route = createFileRoute("/user-optimization-results/$requestId")({
  component: Page,
});
