import { useQuery } from "@tanstack/react-query";
import { Link, Redirect } from "wouter";
import { Plus, Building2, Users, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import type { Organization } from "@shared/schema";

export default function AdminDashboard() {
  const { user, logout, isLoading: authLoading } = useAuth();
  
  // Redirect if not authenticated or not super_admin
  if (!authLoading && (!user || user.role !== "super_admin")) {
    return <Redirect to="/dashboard/login" />;
  }
  
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  const { data: organizations, isLoading: queryLoading } = useQuery<Organization[]>({
    queryKey: ["/api/admin/organizations"],
  });

  if (queryLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 border-r bg-card">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <h1 className="text-xl font-semibold">Super Admin</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <Link href="/admin" data-testid="link-organizations">
              <Button variant="default" className="w-full justify-start gap-2">
                <Building2 className="h-4 w-4" />
                Organizations
              </Button>
            </Link>
            <Link href="/admin/settings" data-testid="link-settings">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </Link>
          </nav>

          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={logout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Organizations</h1>
              <p className="text-muted-foreground mt-2">
                Manage dumpster rental companies on the platform
              </p>
            </div>
            <Link href="/admin/organizations/new" data-testid="link-create-organization">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Organization
              </Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Organizations</CardTitle>
              <CardDescription>
                {organizations?.length || 0} organization{organizations?.length !== 1 ? 's' : ''} total
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!organizations || organizations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No organizations yet</p>
                  <p className="text-sm mt-2">Create your first organization to get started</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organizations.map((org) => (
                      <TableRow key={org.id} data-testid={`row-org-${org.id}`}>
                        <TableCell className="font-medium">{org.name}</TableCell>
                        <TableCell>
                          <code className="text-sm bg-muted px-2 py-1 rounded">{org.slug}</code>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{org.email}</div>
                            <div className="text-muted-foreground">{org.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {org.city && org.state ? `${org.city}, ${org.state}` : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">Active</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/admin/organizations/${org.id}`} data-testid={`link-edit-org-${org.id}`}>
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
