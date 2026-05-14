import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  Upload,
  Database,
  FileText,
  ClipboardList,
  Users,
  UserCog,
  Calculator,
  Play,
  PlusSquare,
  Cpu,
  Server,
  ScrollText,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const sections: Array<{
  label: string;
  items: { title: string; url: string; icon: React.ComponentType<{ className?: string }> }[];
}> = [
  {
    label: "Overview",
    items: [{ title: "Overview", url: "/", icon: Home }],
  },
  {
    label: "Data Management",
    items: [
      { title: "Upload File", url: "/upload-file", icon: Upload },
      { title: "Manage Data", url: "/manage-data", icon: Database },
      { title: "Log Management", url: "/log-management", icon: ClipboardList },
      { title: "View Logs", url: "/view-logs", icon: ScrollText },
    ],
  },
  {
    label: "License Optimization",
    items: [
      { title: "Role Level Optimization", url: "/role-optimization", icon: Users },
      { title: "User Level Optimization", url: "/user-optimization", icon: UserCog },
      { title: "FUE Calculation", url: "/fue-calculation", icon: Calculator },
    ],
  },
  {
    label: "Simulation & Testing",
    items: [
      { title: "Simulation Run", url: "/simulation-run", icon: Play },
      { title: "Create New Simulation", url: "/create-simulation", icon: PlusSquare },
    ],
  },
  {
    label: "Configuration",
    items: [
      { title: "AI Config", url: "/ai-config", icon: Cpu },
      { title: "DB Config", url: "/db-config", icon: Server },
    ],
  },
];

export function AppSidebar() {
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath.startsWith(path);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-start py-2 px-2">
          <img
            src="/lovable-uploads/6127a027-5d08-4cb3-a06d-2bccd6710222.png"
            alt="FUE Optimizer Pro"
            className="h-10 w-auto group-data-[collapsible=icon]:h-7"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {sections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
