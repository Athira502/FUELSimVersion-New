import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/CreateSimulation";

export const Route = createFileRoute("/create-simulation")({
  component: Page,
});
