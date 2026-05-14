import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/SimulationDetails";

export const Route = createFileRoute("/simulation-details/$clientName/$systemName/$simulationRunId")({
  component: Page,
});
