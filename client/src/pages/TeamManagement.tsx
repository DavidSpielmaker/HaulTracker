import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/DashboardSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, Calendar } from "lucide-react";

export default function TeamManagement() {
  const { data: teamMembers, isLoading } = useQuery<User[]>({
    queryKey: ["/api/team"],
  });

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "org_owner":
        return "Owner";
      case "org_admin":
        return "Admin";
      case "customer":
        return "Customer";
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "org_owner":
        return "bg-purple-100 text-purple-800";
      case "org_admin":
        return "bg-blue-100 text-blue-800";
      case "customer":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.email[0].toUpperCase();
  };

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <ProtectedRoute requiredRoles={["super_admin", "org_owner", "org_admin"]}>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <DashboardSidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <header className="flex items-center justify-between p-4 border-b">
              <SidebarTrigger />
              <h1 className="text-2xl font-semibold">Team Management</h1>
              <div className="w-10"></div>
            </header>

            <main className="flex-1 overflow-auto p-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Team Members</CardTitle>
                      <CardDescription>
                        Manage your organization's team members
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {teamMembers && teamMembers.length > 0 ? (
                        <div className="space-y-4">
                          {teamMembers.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12">
                                  <AvatarFallback className="text-sm">
                                    {getInitials(member)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {member.firstName && member.lastName
                                      ? `${member.firstName} ${member.lastName}`
                                      : member.email}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="h-3 w-3" />
                                    {member.email}
                                  </div>
                                  {member.lastLogin && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                      <Calendar className="h-3 w-3" />
                                      Last login:{" "}
                                      {new Date(member.lastLogin).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={getRoleBadgeColor(member.role)}
                                  variant="secondary"
                                >
                                  {getRoleDisplay(member.role)}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground py-8">
                          No team members found
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Invite Team Members</CardTitle>
                      <CardDescription>
                        Team invitations feature coming soon
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        The ability to invite new team members via email will be available in a
                        future update. For now, team members can be added directly through the
                        database or by an administrator.
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
