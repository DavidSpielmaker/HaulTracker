import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/DashboardSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import type { Organization, OrganizationSettings, ServiceArea } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newZipCode, setNewZipCode] = useState("");
  const [newDeliveryFee, setNewDeliveryFee] = useState("");

  const { data: organization } = useQuery<Organization>({
    queryKey: ["/api/organization/current"],
  });

  const { data: settings, isLoading: settingsLoading } = useQuery<OrganizationSettings>({
    queryKey: ["/api/settings"],
  });

  const { data: serviceAreas } = useQuery<ServiceArea[]>({
    queryKey: ["/api/service-areas"],
  });

  const updateOrgMutation = useMutation({
    mutationFn: async (data: Partial<Organization>) => {
      return await apiRequest("PATCH", `/api/admin/organizations/${organization?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organization/current"] });
      toast({
        title: "Success",
        description: "Organization updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update organization",
        variant: "destructive",
      });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<OrganizationSettings>) => {
      return await apiRequest("PATCH", "/api/settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const addServiceAreaMutation = useMutation({
    mutationFn: async (data: { zipCode: string; deliveryFee: string }) => {
      return await apiRequest("POST", "/api/service-areas", {
        zipCode: data.zipCode,
        deliveryFee: data.deliveryFee,
        isActive: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-areas"] });
      toast({
        title: "Success",
        description: "Service area added successfully",
      });
      setNewZipCode("");
      setNewDeliveryFee("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add service area",
        variant: "destructive",
      });
    },
  });

  const deleteServiceAreaMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/service-areas/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-areas"] });
      toast({
        title: "Success",
        description: "Service area deleted successfully",
      });
    },
  });

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
              <h1 className="text-2xl font-semibold">Settings</h1>
              <div className="w-10"></div>
            </header>

            <main className="flex-1 overflow-auto p-6">
              {settingsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <Tabs defaultValue="general" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="business">Business Rules</TabsTrigger>
                    <TabsTrigger value="service-areas">Service Areas</TabsTrigger>
                  </TabsList>

                  <TabsContent value="general" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Organization Profile</CardTitle>
                        <CardDescription>
                          Update your organization's basic information
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Business Name</Label>
                            <Input
                              id="name"
                              defaultValue={organization?.name}
                              onBlur={(e) => {
                                if (e.target.value !== organization?.name) {
                                  updateOrgMutation.mutate({ name: e.target.value });
                                }
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              defaultValue={organization?.phone || ""}
                              onBlur={(e) => {
                                if (e.target.value !== organization?.phone) {
                                  updateOrgMutation.mutate({ phone: e.target.value });
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
                            defaultValue={organization?.email || ""}
                            onBlur={(e) => {
                              if (e.target.value !== organization?.email) {
                                updateOrgMutation.mutate({ email: e.target.value });
                              }
                            }}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="address">Street Address</Label>
                          <Input
                            id="address"
                            defaultValue={organization?.streetAddress || ""}
                            onBlur={(e) => {
                              if (e.target.value !== organization?.streetAddress) {
                                updateOrgMutation.mutate({ streetAddress: e.target.value });
                              }
                            }}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              defaultValue={organization?.city || ""}
                              onBlur={(e) => {
                                if (e.target.value !== organization?.city) {
                                  updateOrgMutation.mutate({ city: e.target.value });
                                }
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input
                              id="state"
                              defaultValue={organization?.state || ""}
                              onBlur={(e) => {
                                if (e.target.value !== organization?.state) {
                                  updateOrgMutation.mutate({ state: e.target.value });
                                }
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="zipCode">ZIP Code</Label>
                            <Input
                              id="zipCode"
                              defaultValue={organization?.zipCode || ""}
                              onBlur={(e) => {
                                if (e.target.value !== organization?.zipCode) {
                                  updateOrgMutation.mutate({ zipCode: e.target.value });
                                }
                              }}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="taxRate">Tax Rate (%)</Label>
                          <Input
                            id="taxRate"
                            type="number"
                            step="0.01"
                            defaultValue={organization?.taxRate ? Number(organization.taxRate) : ""}
                            onBlur={(e) => {
                              const value = e.target.value;
                              if (value !== String(organization?.taxRate)) {
                                updateOrgMutation.mutate({ taxRate: value });
                              }
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="business" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Booking Rules</CardTitle>
                        <CardDescription>
                          Configure rental periods and scheduling requirements
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="minDays">Minimum Rental Days</Label>
                            <Input
                              id="minDays"
                              type="number"
                              defaultValue={settings?.minimumRentalDays}
                              onBlur={(e) => {
                                const value = parseInt(e.target.value);
                                if (value !== settings?.minimumRentalDays) {
                                  updateSettingsMutation.mutate({ minimumRentalDays: value });
                                }
                              }}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="leadTime">Lead Time (hours)</Label>
                            <Input
                              id="leadTime"
                              type="number"
                              defaultValue={settings?.leadTimeHours}
                              onBlur={(e) => {
                                const value = parseInt(e.target.value);
                                if (value !== settings?.leadTimeHours) {
                                  updateSettingsMutation.mutate({ leadTimeHours: value });
                                }
                              }}
                            />
                            <p className="text-sm text-muted-foreground">
                              How far in advance customers must book
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="turnaround">Turnaround Time (hours)</Label>
                            <Input
                              id="turnaround"
                              type="number"
                              defaultValue={settings?.turnaroundHours}
                              onBlur={(e) => {
                                const value = parseInt(e.target.value);
                                if (value !== settings?.turnaroundHours) {
                                  updateSettingsMutation.mutate({ turnaroundHours: value });
                                }
                              }}
                            />
                            <p className="text-sm text-muted-foreground">
                              Time needed between pickup and next delivery
                            </p>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Customer Options</h3>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Require Customer Account</Label>
                              <p className="text-sm text-muted-foreground">
                                Customers must create an account to book
                              </p>
                            </div>
                            <Switch
                              checked={settings?.requireCustomerAccount}
                              onCheckedChange={(checked) => {
                                updateSettingsMutation.mutate({ requireCustomerAccount: checked });
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Allow Same-Day Pickup</Label>
                              <p className="text-sm text-muted-foreground">
                                Customers can request pickup on the same day
                              </p>
                            </div>
                            <Switch
                              checked={settings?.allowSameDayPickup}
                              onCheckedChange={(checked) => {
                                updateSettingsMutation.mutate({ allowSameDayPickup: checked });
                              }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Email Notifications</CardTitle>
                        <CardDescription>
                          Configure automated email settings
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Booking Confirmation Email</Label>
                            <p className="text-sm text-muted-foreground">
                              Send email when booking is confirmed
                            </p>
                          </div>
                          <Switch
                            checked={settings?.bookingConfirmationEmail}
                            onCheckedChange={(checked) => {
                              updateSettingsMutation.mutate({ bookingConfirmationEmail: checked });
                            }}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="reminderHours">Reminder Email (hours before)</Label>
                          <Input
                            id="reminderHours"
                            type="number"
                            defaultValue={settings?.reminderEmailHoursBefore}
                            onBlur={(e) => {
                              const value = parseInt(e.target.value);
                              if (value !== settings?.reminderEmailHoursBefore) {
                                updateSettingsMutation.mutate({ reminderEmailHoursBefore: value });
                              }
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="service-areas" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Service Areas</CardTitle>
                        <CardDescription>
                          Manage ZIP codes where you deliver
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex gap-2">
                          <Input
                            placeholder="ZIP Code"
                            value={newZipCode}
                            onChange={(e) => setNewZipCode(e.target.value)}
                            className="flex-1"
                          />
                          <Input
                            placeholder="Delivery Fee"
                            type="number"
                            step="0.01"
                            value={newDeliveryFee}
                            onChange={(e) => setNewDeliveryFee(e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            onClick={() => {
                              if (newZipCode && newDeliveryFee) {
                                addServiceAreaMutation.mutate({
                                  zipCode: newZipCode,
                                  deliveryFee: newDeliveryFee,
                                });
                              }
                            }}
                            disabled={!newZipCode || !newDeliveryFee}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add
                          </Button>
                        </div>

                        <div className="border rounded-lg">
                          <div className="max-h-96 overflow-y-auto">
                            {serviceAreas && serviceAreas.length > 0 ? (
                              <div className="divide-y">
                                {serviceAreas.map((area) => (
                                  <div
                                    key={area.id}
                                    className="flex items-center justify-between p-3"
                                  >
                                    <div>
                                      <div className="font-medium">{area.zipCode}</div>
                                      <div className="text-sm text-muted-foreground">
                                        Delivery Fee: ${Number(area.deliveryFee).toFixed(2)}
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        if (window.confirm("Delete this service area?")) {
                                          deleteServiceAreaMutation.mutate(area.id);
                                        }
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-8 text-center text-muted-foreground">
                                No service areas configured
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
