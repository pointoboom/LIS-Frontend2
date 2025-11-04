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
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useLocation } from "wouter";
import {
  LayoutDashboard,
  FlaskConical,
  FileText,
  Boxes,
} from "lucide-react";

export default function AppSidebar() {
  const [location, setLocation] = useLocation();

  const goto = (path: string) => () => setLocation(path);

  return (
    <Sidebar collapsible="offcanvas" className="bg-sidebar">
      <SidebarHeader className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-500" />
          <div>
            <div className="text-base font-semibold tracking-tight">LIS Dashboard</div>
            <div className="text-xs text-muted-foreground">Laboratory System</div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location === "/dashboard"}
                >
                  <a onClick={goto("/dashboard")}>
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location === "/dashboard/reports"}
                >
                  <a onClick={goto("/dashboard/reports")}>
                    <FileText />
                    <span>Reports</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem> */}
              {/* <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location === "/dashboard/category"}
                >
                  <a onClick={goto("/dashboard/category")}>
                    <Boxes />
                    <span>Category</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem> */}
              {/* <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location === "/dashboard/blood"}
                >
                  <a onClick={goto("/dashboard/blood")}>
                    <FlaskConical />
                    <span>Blood</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem> */}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

