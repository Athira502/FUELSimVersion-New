// import { createFileRoute } from "@tanstack/react-router";
// import Page from "@/pages/SimulationDetails";

// export const Route = createFileRoute("/simulation-details/$clientName/$systemName/$simulationRunId")({
//   component: Page,
// });



import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/SimulationDetails";
// import SimulationDetails from "@/pages/SimulationDetails";

export const Route = createFileRoute("/simulation-details/$systemName/$simulationRunId")({
  component: Page,
});

