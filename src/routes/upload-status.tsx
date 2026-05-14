import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/UploadStatus";

export const Route = createFileRoute("/upload-status")({
  component: Page,
});
