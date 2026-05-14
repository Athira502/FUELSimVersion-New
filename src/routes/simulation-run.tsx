import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/SimulationRun";

export const Route = createFileRoute("/simulation-run")({
  component: Page,
});
