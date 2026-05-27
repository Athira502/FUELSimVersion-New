import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/AssignedUsers";

export const Route = createFileRoute("/role-assigned-users/$roleId")({
  component: Page,
});