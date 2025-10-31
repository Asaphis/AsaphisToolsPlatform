"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Wrench,
  DollarSign,
  Megaphone,
  FolderTree,
  BarChart3,
  CreditCard,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Donations", url: "/donations", icon: DollarSign },
  { title: "Revenue & Payouts", url: "/withdrawals", icon: CreditCard },
  { title: "Ads Management", url: "/ads", icon: Megaphone },
  { title: "Tools Management", url: "/tools", icon: Wrench },
  { title: "Categories", url: "/categories", icon: FolderTree },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "User Management", url: "/users", icon: Users },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="none" className="border-r border-sidebar-border">
      <SidebarHeader className="p-6 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <Wrench className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground">AsaphsTool</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground px-4">MAIN MENU</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    data-testid={`link-${item.title.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 p-3 rounded-lg hover-elevate active-elevate-2">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground" data-testid="text-admin-name">Admin User</p>
            <p className="text-xs text-muted-foreground truncate">admin@asaphs.com</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
