import { useQuery, useMutation } from "@tanstack/react-query";
import { Redirect } from "wouter";
import { Settings, User, Shield, Activity, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User as UserType, Organization } from "@shared/schema";

export default function AdminSettings() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [defaultSubscriptionAmount, setDefaultSubscriptionAmount] = useState("");
  const [defaultBillingCycle, setDefaultBillingCycle] = useState<"monthly" | "quarterly" | "annual">("monthly");
  const [defaultTrialDays, setDefaultTrialDays] = useState("30");

  // Fetch platform-wide billing settings (we can store this in a settings table or use defaults)
  const { data: platformSettings } = useQuery({
    queryKey: ["/api/admin/platform-settings"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/admin/platform-settings");
        return await response.json();
      } catch (error) {
        // Return defaults if settings don't exist yet
        return {
          defaultSubscriptionAmount: "99.00",
          defaultBillingCycle: "monthly",
          defaultTrialDays: 30,
        };
      }
    },
  });

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

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { firstName?: string; lastName?: string; email?: string }) => {
      const response = await apiRequest("PATCH", "/api/auth/profile", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await apiRequest("POST", "/api/auth/change-password", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Password changed successfully",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <h1 className="text-xl font-semibold">Super Admin</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <a href="/admin">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Shield className="h-4 w-4" />
                Organizations
              </Button>
            </a>
            <a href="/admin/settings">
              <Button variant="default" className="w-full justify-start gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </a>
          </nav>

          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={logout}
            >
              <Activity className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-semibold">Settings</h1>
            <p className="text-muted-foreground mt-2">
              Manage your super admin account settings
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="billing">Billing Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        defaultValue={user?.firstName || ""}
                        onBlur={(e) => {
                          if (e.target.value !== user?.firstName) {
                            updateProfileMutation.mutate({ firstName: e.target.value });
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        defaultValue={user?.lastName || ""}
                        onBlur={(e) => {
                          if (e.target.value !== user?.lastName) {
                            updateProfileMutation.mutate({ lastName: e.target.value });
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={user?.email || ""}
                      onBlur={(e) => {
                        if (e.target.value !== user?.email) {
                          updateProfileMutation.mutate({ email: e.target.value });
                        }
                      }}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Role</Label>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="font-medium">Super Administrator</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      You have full access to all platform features and organizations
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Must be at least 8 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <Button
                    onClick={handleChangePassword}
                    disabled={
                      !currentPassword ||
                      !newPassword ||
                      !confirmPassword ||
                      changePasswordMutation.isPending
                    }
                  >
                    {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Details about your super admin account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Account Created</Label>
                    <p className="text-sm text-muted-foreground">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Last Login</Label>
                    <p className="text-sm text-muted-foreground">
                      {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Unknown"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Default Billing Configuration</CardTitle>
                  <CardDescription>
                    Set default billing terms for new organizations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subscriptionAmount">Default Subscription Amount</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          id="subscriptionAmount"
                          type="number"
                          step="0.01"
                          placeholder="99.00"
                          className="pl-7"
                          defaultValue={platformSettings?.defaultSubscriptionAmount}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Monthly subscription amount charged to organizations
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="billingCycle">Default Billing Cycle</Label>
                      <Select
                        defaultValue={platformSettings?.defaultBillingCycle || "monthly"}
                      >
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
                        How often organizations are billed
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="trialDays">Default Trial Period (days)</Label>
                      <Input
                        id="trialDays"
                        type="number"
                        placeholder="30"
                        defaultValue={platformSettings?.defaultTrialDays}
                      />
                      <p className="text-sm text-muted-foreground">
                        Number of days for trial period before billing begins
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Billing Cycle Pricing</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">Monthly</p>
                          <p className="text-sm text-muted-foreground">Billed every month</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${platformSettings?.defaultSubscriptionAmount || "99.00"}/mo</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">Quarterly</p>
                          <p className="text-sm text-muted-foreground">Billed every 3 months</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            ${(Number(platformSettings?.defaultSubscriptionAmount || 99) * 3 * 0.95).toFixed(2)}/quarter
                          </p>
                          <p className="text-sm text-green-600">Save 5%</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">Annual</p>
                          <p className="text-sm text-muted-foreground">Billed every 12 months</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            ${(Number(platformSettings?.defaultSubscriptionAmount || 99) * 12 * 0.85).toFixed(2)}/year
                          </p>
                          <p className="text-sm text-green-600">Save 15%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Save Billing Settings
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Billing Information</CardTitle>
                  <CardDescription>
                    Platform-wide billing statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Active Subscriptions</Label>
                      <p className="text-2xl font-bold">—</p>
                      <p className="text-sm text-muted-foreground">Organizations with active billing</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Trial Accounts</Label>
                      <p className="text-2xl font-bold">—</p>
                      <p className="text-sm text-muted-foreground">Organizations in trial period</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
