import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/UserOptimization";

export const Route = createFileRoute("/user-optimization")({
  component: Page,
});
