// import { createFileRoute } from "@tanstack/react-router";
// import Page from "@/pages/FueCalculation";

// export const Route = createFileRoute("/fue-calculation")({
//   component: Page,
// });


import { createFileRoute } from "@tanstack/react-router";
import FueCalculation from "@/pages/FueCalculation";

export const Route = createFileRoute("/fue-calculation")({
  component: FueCalculation,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      system: (search.system as string) || undefined,
    };
  },
});