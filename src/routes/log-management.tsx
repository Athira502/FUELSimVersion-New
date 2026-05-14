import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/LogManagement";

export const Route = createFileRoute("/log-management")({
  component: Page,
});
