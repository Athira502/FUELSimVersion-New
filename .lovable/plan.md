## Goal
Match the sidebar + header to the attached screenshot: dark navy background with light text, and align the logo to the left in the sidebar header.

## Changes

### 1. `src/styles.css` — dark sidebar tokens
Override the `--sidebar-*` variables in `:root` so the sidebar renders dark navy in light mode (like the screenshot):
- `--sidebar`: deep navy (~`oklch(0.18 0.04 260)`, equiv. `#0f1729`)
- `--sidebar-foreground`: near-white
- `--sidebar-accent` / `--sidebar-accent-foreground`: slightly lighter navy for hover, white text
- `--sidebar-primary`: active row background (a touch lighter navy, matching the highlighted "Overview"/"Upload File" rows)
- `--sidebar-primary-foreground`: white
- `--sidebar-border`: subtle white/10 divider
- `--sidebar-ring`: belize accent

This automatically themes the whole `AppSidebar` (no per-component color edits needed).

### 2. `src/routes/__root.tsx` — header color
Change the `<header>` from `bg-background` to the same dark navy as the sidebar (use `bg-sidebar text-sidebar-foreground` and a matching `border-sidebar-border`) so the title bar visually continues the sidebar.

### 3. `src/components/AppSidebar.tsx` — logo alignment
In `SidebarHeader`, change the wrapper from `flex items-center justify-center` to `flex items-center justify-start px-2` so the Tarento logo sits in the left corner. Keep collapsed-state sizing.

## Out of scope
No changes to main content area background, KPI cards, charts, or routes.