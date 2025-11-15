import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, Redirect } from "wouter";
import { Plus, Building2, Users, Settings, LogOut, UserPlus, Mail, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Organization, User } from "@shared/schema";

export default function AdminDashboard() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFirstName, setInviteFirstName] = useState("");
  const [inviteLastName, setInviteLastName] = useState("");
  const [inviteRole, setInviteRole] = useState<"org_owner" | "org_admin" | "org_member">("org_member");
  const [selectedOrgForUsers, setSelectedOrgForUsers] = useState<string | null>(null);
  const [billingDialogOpen, setBillingDialogOpen] = useState(false);
  const [selectedOrgForBilling, setSelectedOrgForBilling] = useState<Organization | null>(null);
  const [billingAmount, setBillingAmount] = useState("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "quarterly" | "annual">("monthly");
  const [trialDays, setTrialDays] = useState("30");

  // Debug logging
  console.log('Admin Dashboard - User:', user);
  console.log('Admin Dashboard - Auth Loading:', authLoading);

  // Queries must be called before any conditional returns
  const { data: organizations, isLoading: queryLoading, error: orgsError } = useQuery<Organization[]>({
    queryKey: ["/api/admin/organizations"],
    enabled: !authLoading && user?.role === "super_admin", // Only run when authenticated as super_admin
  });

  // Redirect if not authenticated or not super_admin
  if (!authLoading && (!user || user.role !== "super_admin")) {
    console.log('Redirecting - not super admin. User role:', user?.role);
    return <Redirect to="/dashboard/login" />;
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const { data: orgUsers, error: usersError, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/organizations", selectedOrgForUsers, "users"],
    queryFn: async () => {
      if (!selectedOrgForUsers) return [];
      console.log(`Fetching users for organization: ${selectedOrgForUsers}`);
      const response = await apiRequest("GET", `/api/admin/organizations/${selectedOrgForUsers}/users`);
      const users = await response.json();
      console.log(`Received ${users?.length || 0} users:`, users);
      return users;
    },
    enabled: !!selectedOrgForUsers,
  });

  // Log errors for debugging
  if (orgsError) {
    console.error("Error loading organizations:", orgsError);
  }
  if (usersError) {
    console.error("Error loading users:", usersError);
  }

  // Log users data for debugging
  console.log('Selected org for users:', selectedOrgForUsers);
  console.log('Org users data:', orgUsers);
  console.log('Users loading:', usersLoading);

  const inviteUserMutation = useMutation({
    mutationFn: async (data: {
      organizationId: string;
      email: string;
      firstName: string;
      lastName: string;
      role: "org_owner" | "org_admin" | "org_member";
    }) => {
      return await apiRequest("POST", `/api/admin/organizations/${data.organizationId}/users`, {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        password: "ChangeMe123!", // Temporary password
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/organizations"] });
      if (selectedOrgForUsers) {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/organizations", selectedOrgForUsers, "users"] });
      }
      toast({
        title: "Success",
        description: "User invitation sent successfully. Temporary password: ChangeMe123!",
      });
      setInviteDialogOpen(false);
      setInviteEmail("");
      setInviteFirstName("");
      setInviteLastName("");
      setInviteRole("org_member");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to invite user",
        variant: "destructive",
      });
    },
  });

  const handleInviteUser = (orgId: string) => {
    setSelectedOrgId(orgId);
    setInviteDialogOpen(true);
  };

  const handleSubmitInvite = () => {
    if (!selectedOrgId || !inviteEmail || !inviteFirstName || !inviteLastName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    inviteUserMutation.mutate({
      organizationId: selectedOrgId,
      email: inviteEmail,
      firstName: inviteFirstName,
      lastName: inviteLastName,
      role: inviteRole,
    });
  };

  const updateBillingMutation = useMutation({
    mutationFn: async (data: {
      organizationId: string;
      subscriptionAmount: string;
      billingCycle: "monthly" | "quarterly" | "annual";
      trialDays: number;
    }) => {
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + data.trialDays);

      const response = await apiRequest("PATCH", `/api/admin/organizations/${data.organizationId}`, {
        subscriptionAmount: data.subscriptionAmount,
        billingCycle: data.billingCycle,
        trialEndsAt: trialEndsAt.toISOString(),
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/organizations"] });
      toast({
        title: "Success",
        description: "Billing settings updated successfully",
      });
      setBillingDialogOpen(false);
      setSelectedOrgForBilling(null);
      setBillingAmount("");
      setBillingCycle("monthly");
      setTrialDays("30");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update billing settings",
        variant: "destructive",
      });
    },
  });

  const handleOpenBillingDialog = (org: Organization) => {
    setSelectedOrgForBilling(org);
    setBillingAmount(org.subscriptionAmount?.toString() || "");
    setBillingCycle(org.billingCycle || "monthly");
    setBillingDialogOpen(true);
  };

  const handleSubmitBilling = () => {
    if (!selectedOrgForBilling || !billingAmount) {
      toast({
        title: "Error",
        description: "Please enter a subscription amount",
        variant: "destructive",
      });
      return;
    }

    updateBillingMutation.mutate({
      organizationId: selectedOrgForBilling.id,
      subscriptionAmount: billingAmount,
      billingCycle,
      trialDays: parseInt(trialDays) || 30,
    });
  };

  if (queryLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (orgsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error Loading Organizations</h2>
          <p className="text-muted-foreground">{orgsError instanceof Error ? orgsError.message : 'Unknown error'}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  console.log('Organizations loaded:', organizations);

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
                      <TableHead>Contact</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organizations.map((org) => (
                      <TableRow key={org.id} data-testid={`row-org-${org.id}`}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{org.name}</div>
                            <code className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                              {org.slug}
                            </code>
                          </div>
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
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => handleOpenBillingDialog(org)}
                            >
                              <DollarSign className="h-3 w-3" />
                              Billing
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => handleInviteUser(org.id)}
                            >
                              <UserPlus className="h-3 w-3" />
                              Invite
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedOrgForUsers(
                                selectedOrgForUsers === org.id ? null : org.id
                              )}
                            >
                              <Users className="h-3 w-3 mr-1" />
                              Users
                            </Button>
                            <Link href={`/admin/organizations/${org.id}`} data-testid={`link-edit-org-${org.id}`}>
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Organization Users Section */}
          {selectedOrgForUsers && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {organizations?.find(o => o.id === selectedOrgForUsers)?.name} - Users
                    </CardTitle>
                    <CardDescription>
                      Manage users for this organization
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleInviteUser(selectedOrgForUsers)}
                    className="gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    Invite User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Loading users...</p>
                  </div>
                ) : usersError ? (
                  <div className="text-center py-8 text-destructive">
                    <p>Error loading users</p>
                    <p className="text-sm mt-1">{usersError instanceof Error ? usersError.message : 'Unknown error'}</p>
                  </div>
                ) : orgUsers && orgUsers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orgUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.firstName} {user.lastName}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {user.role === 'org_owner' ? 'Owner' :
                               user.role === 'org_admin' ? 'Admin' : 'Member'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.emailVerified ? "default" : "secondary"}>
                              {user.emailVerified ? 'Active' : 'Pending'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No users yet</p>
                    <p className="text-sm mt-1">Invite users to join this organization</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Invite User Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>
              Add a new user to {organizations?.find(o => o.id === selectedOrgId)?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={inviteFirstName}
                  onChange={(e) => setInviteFirstName(e.target.value)}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={inviteLastName}
                  onChange={(e) => setInviteLastName(e.target.value)}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="org_owner">Owner</SelectItem>
                  <SelectItem value="org_admin">Admin</SelectItem>
                  <SelectItem value="org_member">Member</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Temporary password: ChangeMe123!
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setInviteDialogOpen(false);
                setInviteEmail("");
                setInviteFirstName("");
                setInviteLastName("");
                setInviteRole("org_member");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitInvite}
              disabled={inviteUserMutation.isPending}
            >
              {inviteUserMutation.isPending ? "Inviting..." : "Invite User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Billing Settings Dialog */}
      <Dialog open={billingDialogOpen} onOpenChange={setBillingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Billing Settings</DialogTitle>
            <DialogDescription>
              Configure billing for {selectedOrgForBilling?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subscriptionAmount">Subscription Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="subscriptionAmount"
                  type="number"
                  step="0.01"
                  placeholder="99.00"
                  className="pl-7"
                  value={billingAmount}
                  onChange={(e) => setBillingAmount(e.target.value)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Monthly subscription amount
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingCycle">Billing Cycle</Label>
              <Select value={billingCycle} onValueChange={(value: any) => setBillingCycle(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly (3 months)</SelectItem>
                  <SelectItem value="annual">Annual (12 months)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                How often this organization is billed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trialDays">Trial Period (days)</Label>
              <Input
                id="trialDays"
                type="number"
                placeholder="30"
                value={trialDays}
                onChange={(e) => setTrialDays(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Days until billing begins (from today)
              </p>
            </div>

            {billingAmount && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Billing Summary</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">${billingAmount}/{billingCycle === "monthly" ? "mo" : billingCycle === "quarterly" ? "qtr" : "yr"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trial ends:</span>
                    <span className="font-medium">
                      {new Date(Date.now() + parseInt(trialDays || "0") * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </span>
                  </div>
                  {billingCycle === "quarterly" && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>5% off</span>
                    </div>
                  )}
                  {billingCycle === "annual" && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>15% off</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setBillingDialogOpen(false);
                setSelectedOrgForBilling(null);
                setBillingAmount("");
                setBillingCycle("monthly");
                setTrialDays("30");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitBilling}
              disabled={updateBillingMutation.isPending || !billingAmount}
            >
              {updateBillingMutation.isPending ? "Saving..." : "Save Billing Settings"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
