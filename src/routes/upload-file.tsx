import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/UploadFile";

export const Route = createFileRoute("/upload-file")({
  component: Page,
});
