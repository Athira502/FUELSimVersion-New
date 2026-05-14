import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/FueCalculation";

export const Route = createFileRoute("/fue-calculation")({
  component: Page,
});
