import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/DBConfig";

export const Route = createFileRoute("/db-config")({
  component: Page,
});
