## Goal

Bring the uploaded `FUELicenseOptmizerSimulatorversionFrontend-main` codebase into this Lovable project, then apply the requested redesign: fixed left sidebar nav, centered header with logo, and a new Overview dashboard as the landing page. All existing pages keep their internal logic and behavior — only the shell and landing page change.

## Step 1 — Port the uploaded zip into this project

The zip is a Vite + `react-router-dom` app; this project is TanStack Start. I'll convert it without changing page logic.

- Copy every file from `src/api/`, `src/components/` (except `Layout.tsx`), `src/hooks/`, `src/integrations/`, `src/lib/`, `src/services/`, `src/types/` into the matching paths here.
- Copy each file in `src/pages/` into a TanStack Start route under `src/routes/`, mapping URLs 1-to-1:
  - `/` → `src/routes/index.tsx` (will become the new Overview dashboard, not the old Index)
  - `/upload-file` → `src/routes/upload-file.tsx`
  - `/upload-status` → `src/routes/upload-status.tsx`
  - `/manage-data` → `src/routes/manage-data.tsx`
  - `/role-optimization`, `/user-optimization`, `/fue-calculation`
  - `/role-optimization-results/:requestId` → `src/routes/role-optimization-results.$requestId.tsx`
  - `/user-optimization-results/:requestId` → `src/routes/user-optimization-results.$requestId.tsx`
  - `/simulation-run`, `/create-simulation`
  - `/simulation-details/:clientName/:systemName/:simulationRunId` → `src/routes/simulation-details.$clientName.$systemName.$simulationRunId.tsx`
  - `/role-details/:roleId`, `/simulation-role-details/:roleId`
  - `/log-management`, `/view-logs`, `/ai-config`, `/db-config`
- Replace `react-router-dom` imports inside each ported page:
  - `useNavigate` → `useNavigate` from `@tanstack/react-router`
  - `useParams` → `Route.useParams()`
  - `useLocation` → `useLocation` from `@tanstack/react-router`
  - `<Link to="...">` → `<Link to="...">` from `@tanstack/react-router`
- The old `Layout` wrapper is removed from each page (the new sidebar shell wraps everything via `__root.tsx`). Page bodies stay identical otherwise.
- Copy the two PNGs from `public/lovable-uploads/` into this project's `public/lovable-uploads/`.
- Add the deps the zip uses but this project doesn't yet (e.g. `recharts`, anything in their `package.json` that's missing). I'll diff `package.json` and run `bun add` for the gaps.
- Bring over their `tailwind`/`index.css` utility classes (`page-container`, `page-title`, `back-button`, etc.) into `src/styles.css` so ported pages render correctly.

Pages keep their existing data flow, API calls, and behavior — no functional changes.

## Step 2 — New app shell (fixed left sidebar + centered header)

Edit `src/routes/__root.tsx` to render a `SidebarProvider` shell:

- **Left sidebar** (`collapsible="icon"`, fixed, non-scrollable internally — content fits without scroll):
  - Top: logo image (`/lovable-uploads/6127a027-5d08-4cb3-a06d-2bccd6710222.png`) — no "FUE Optimizer Pro / Powered by AI" text.
  - Stacked sections (each section label always visible, items below it):
    - **Overview** → `/`
    - **Data Management** → Upload File, Manage Data, Log Management, View Logs
    - **License Optimization** → Role Level Optimization, User Level Optimization, FUE Calculation
    - **Simulation & Testing** → Simulation Run, Create New Simulation
    - **Configuration** → AI Config, DB Config
  - Active route highlighted via `useRouterState`.
  - `SidebarTrigger` lives in the top header so the bar can collapse/expand.

- **Header bar** (top of main content area):
  - Left: `SidebarTrigger`.
  - Center: `FUE Optimizer Pro` title (centered using `flex-1 text-center`).
  - Right: empty spacer to balance the trigger so the title stays truly centered.

- **Main content**: `<Outlet />` for the route content.

## Step 3 — Overview dashboard (`src/routes/index.tsx`)

New landing page with mock data. Layout, top to bottom:

1. **Page header row**: "Overview" title on the left, **System filter dropdown** on the far right (options: All Systems, plus sample systems like `PRD-100`, `QAS-200`, `DEV-300`). The filter state lives on this page and feeds the User chart and KPIs.

2. **KPI tiles row** (compact — smaller than current default sizes; `h` ≈ 90–100px, smaller numbers):
   - Current FUE Count
   - Overall FUE
   - GB Advanced Use
   - GC Core Use
   - GD Self-Service Use

3. **Users by License Type — grouped bar chart** (recharts `BarChart`):
   - X axis: `GB Advanced Use`, `GC Core Use`, `GD Self-Service Use`.
   - 4 bars per group, side by side: `Active`, `Dormant`, `Expired but not Locked`, `Locked but not Expired`.
   - No system filter inside this card (the page-level filter at the top right controls it).
   - Card sized smaller (height ~280px) per "make KPIs/graphs a little smaller".

4. **FUE Trend — last 12 months** (recharts `LineChart`):
   - 4 lines on one chart: Overall FUE, Advanced Use, Core Use, Self-Service Use.
   - X axis ticks formatted as `MMM YY` (e.g. `Jul 25`, `Aug 25`, … `Jun 26`) using a small date-formatting helper.
   - Card height ~280px, legend below.

All values are realistic mock data generated client-side so the design is reviewable end-to-end.

## Step 4 — Cleanup

- Delete the placeholder image/markup from the current `src/routes/index.tsx`.
- Remove the old `Layout.tsx` import sites (the new shell replaces it).
- Verify nav links resolve to existing route files (build will fail otherwise).

## Technical details

- Routing: TanStack Router file-based routes; `routeTree.gen.ts` is regenerated automatically.
- Charts: `recharts` (already used in the zip).
- Sidebar: existing `src/components/ui/sidebar.tsx` (shadcn) with `collapsible="icon"` so it stays visible when collapsed.
- Styling: semantic tokens from `src/styles.css` only — no hard-coded colors in components.
- Mock data lives in `src/lib/overview-mock.ts` so it's easy to swap for a real API later.
- Logo path `/lovable-uploads/6127a027-5d08-4cb3-a06d-2bccd6710222.png` (copied to `public/`).

## Out of scope

- No backend wiring for the Overview (mock data only, per your answer).
- No changes to the internal behavior, layout, or styling of any ported page beyond removing the old `Layout` wrapper and swapping `react-router-dom` imports.
- No auth, no Lovable Cloud changes.
