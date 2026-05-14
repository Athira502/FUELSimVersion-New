import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/AIConfig";

export const Route = createFileRoute("/ai-config")({
  component: Page,
});
