import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/ViewLogs";

export const Route = createFileRoute("/view-logs")({
  component: Page,
});
