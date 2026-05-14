import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/ManageData";

export const Route = createFileRoute("/manage-data")({
  component: Page,
});
