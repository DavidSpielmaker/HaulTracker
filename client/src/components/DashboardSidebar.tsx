import { Link, useLocation } from "wouter";
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
  SidebarFooter
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Calendar,
  Package,
  FileText,
  Settings,
  Users,
  DollarSign,
  Truck,
  LogOut
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "Calendar",
    url: "/dashboard/calendar",
    icon: Calendar
  },
  {
    title: "Bookings",
    url: "/dashboard/bookings",
    icon: FileText
  },
  {
    title: "Inventory",
    url: "/dashboard/inventory",
    icon: Package
  },
  {
    title: "Payments",
    url: "/dashboard/payments",
    icon: DollarSign
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings
  },
  {
    title: "Team",
    url: "/dashboard/team",
    icon: Users
  }
];

export default function DashboardSidebar() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setLocation("/dashboard/login");
  };

  // Get user initials
  const getInitials = () => {
    if (!user) return "U";
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.email[0].toUpperCase();
  };

  // Format role for display
  const getRoleDisplay = () => {
    if (!user) return "";
    switch (user.role) {
      case "org_owner":
        return "Owner";
      case "org_admin":
        return "Admin";
      case "super_admin":
        return "Super Admin";
      case "customer":
        return "Customer";
      default:
        return user.role;
    }
  };

  return (
    <Sidebar data-testid="dashboard-sidebar">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 px-2">
          <Truck className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold" data-testid="text-org-name">Business Dashboard</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url} className="flex items-center gap-3" data-testid={`link-${item.title.toLowerCase()}`}>
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs" data-testid="avatar-user">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" data-testid="text-user-name">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.email || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate" data-testid="text-user-role">
              {getRoleDisplay()}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
