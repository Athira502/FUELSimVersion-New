import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/RoleDetails";

export const Route = createFileRoute("/role-details/$roleId")({
  component: Page,
});
