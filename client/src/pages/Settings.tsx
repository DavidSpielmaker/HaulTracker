import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/DashboardSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import type { Organization, OrganizationSettings, ServiceArea, ApiKey, Webhook } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Plus, Trash2, Key, Copy, Check, AlertCircle, Webhook as WebhookIcon } from "lucide-react";
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
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newZipCode, setNewZipCode] = useState("");
  const [newDeliveryFee, setNewDeliveryFee] = useState("");
  const [showNewApiKeyDialog, setShowNewApiKeyDialog] = useState(false);
  const [newApiKeyName, setNewApiKeyName] = useState("");
  const [newApiKeyExpires, setNewApiKeyExpires] = useState("");
  const [createdApiKey, setCreatedApiKey] = useState<{ key: string; rawKey: string } | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [showNewWebhookDialog, setShowNewWebhookDialog] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [newWebhookEvents, setNewWebhookEvents] = useState<string[]>(["booking.created"]);

  const { data: organization } = useQuery<Organization>({
    queryKey: ["/api/organization/current"],
  });

  const { data: settings, isLoading: settingsLoading } = useQuery<OrganizationSettings>({
    queryKey: ["/api/settings"],
  });

  const { data: serviceAreas } = useQuery<ServiceArea[]>({
    queryKey: ["/api/service-areas"],
  });

  const { data: apiKeys } = useQuery<ApiKey[]>({
    queryKey: ["/api/api-keys"],
  });

  const { data: webhooks } = useQuery<Webhook[]>({
    queryKey: ["/api/webhooks"],
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

  const createApiKeyMutation = useMutation({
    mutationFn: async (data: { name: string; expiresAt?: string }) => {
      return await apiRequest("POST", "/api/api-keys", data);
    },
    onSuccess: (data: ApiKey & { rawKey: string }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-keys"] });
      setCreatedApiKey({ key: data.id, rawKey: data.rawKey });
      setShowNewApiKeyDialog(false);
      setNewApiKeyName("");
      setNewApiKeyExpires("");
      toast({
        title: "Success",
        description: "API key created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create API key",
        variant: "destructive",
      });
    },
  });

  const deleteApiKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/api-keys/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-keys"] });
      toast({
        title: "Success",
        description: "API key deleted successfully",
      });
    },
  });

  const copyToClipboard = async (text: string, keyId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKeyId(keyId);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString();
  };

  const createWebhookMutation = useMutation({
    mutationFn: async (data: { url: string; events: string[] }) => {
      return await apiRequest("POST", "/api/webhooks", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
      setShowNewWebhookDialog(false);
      setNewWebhookUrl("");
      setNewWebhookEvents(["booking.created"]);
      toast({
        title: "Success",
        description: "Webhook created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create webhook",
        variant: "destructive",
      });
    },
  });

  const updateWebhookMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return await apiRequest("PATCH", `/api/webhooks/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
      toast({
        title: "Success",
        description: "Webhook updated successfully",
      });
    },
  });

  const deleteWebhookMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/webhooks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
      toast({
        title: "Success",
        description: "Webhook deleted successfully",
      });
    },
  });

  const toggleWebhookEvent = (event: string) => {
    setNewWebhookEvents(prev =>
      prev.includes(event)
        ? prev.filter(e => e !== event)
        : [...prev, event]
    );
  };

  const availableEvents = [
    { value: "booking.created", label: "Booking Created" },
    { value: "booking.updated", label: "Booking Updated" },
    { value: "booking.cancelled", label: "Booking Cancelled" },
    { value: "booking.completed", label: "Booking Completed" },
  ];

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
                    <TabsTrigger value="api">API & Integrations</TabsTrigger>
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

                  <TabsContent value="api" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>API Keys</CardTitle>
                            <CardDescription>
                              Manage API keys for integrating HaulTracker with your website
                            </CardDescription>
                          </div>
                          <Button
                            onClick={() => setShowNewApiKeyDialog(true)}
                            disabled={createApiKeyMutation.isPending}
                          >
                            <Key className="h-4 w-4 mr-2" />
                            Create API Key
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {createdApiKey && (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              <div className="space-y-2">
                                <p className="font-medium">Your new API key has been created!</p>
                                <p className="text-sm">Make sure to copy it now. You won't be able to see it again!</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono break-all">
                                    {createdApiKey.rawKey}
                                  </code>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(createdApiKey.rawKey, createdApiKey.key)}
                                  >
                                    {copiedKeyId === createdApiKey.key ? (
                                      <Check className="h-4 w-4" />
                                    ) : (
                                      <Copy className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setCreatedApiKey(null)}
                                  className="mt-2"
                                >
                                  Got it, dismiss
                                </Button>
                              </div>
                            </AlertDescription>
                          </Alert>
                        )}

                        <div className="border rounded-lg">
                          <div className="max-h-96 overflow-y-auto">
                            {apiKeys && apiKeys.length > 0 ? (
                              <div className="divide-y">
                                {apiKeys.map((key) => (
                                  <div
                                    key={key.id}
                                    className="flex items-center justify-between p-4"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <p className="font-medium">{key.name}</p>
                                        {!key.isActive && (
                                          <Badge variant="secondary">Inactive</Badge>
                                        )}
                                        {key.expiresAt && new Date(key.expiresAt) < new Date() && (
                                          <Badge variant="destructive">Expired</Badge>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                        <span>Key: {key.keyPrefix}...</span>
                                        {key.lastUsedAt && (
                                          <span>Last used: {formatDate(key.lastUsedAt)}</span>
                                        )}
                                        {key.expiresAt && (
                                          <span>Expires: {formatDate(key.expiresAt)}</span>
                                        )}
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        if (window.confirm("Are you sure you want to delete this API key? This action cannot be undone.")) {
                                          deleteApiKeyMutation.mutate(key.id);
                                        }
                                      }}
                                      disabled={deleteApiKeyMutation.isPending}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-8 text-center text-muted-foreground">
                                <Key className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p className="font-medium">No API keys yet</p>
                                <p className="text-sm mt-1">Create an API key to integrate HaulTracker with your website</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Webhooks</CardTitle>
                            <CardDescription>
                              Receive real-time notifications when events occur
                            </CardDescription>
                          </div>
                          <Button
                            onClick={() => setShowNewWebhookDialog(true)}
                            disabled={createWebhookMutation.isPending}
                          >
                            <WebhookIcon className="h-4 w-4 mr-2" />
                            Add Webhook
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="border rounded-lg">
                          <div className="max-h-96 overflow-y-auto">
                            {webhooks && webhooks.length > 0 ? (
                              <div className="divide-y">
                                {webhooks.map((webhook) => (
                                  <div
                                    key={webhook.id}
                                    className="flex items-start justify-between p-4"
                                  >
                                    <div className="flex-1 min-w-0 space-y-2">
                                      <div className="flex items-center gap-2">
                                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                          {webhook.url}
                                        </code>
                                        {!webhook.isActive && (
                                          <Badge variant="secondary">Inactive</Badge>
                                        )}
                                      </div>
                                      <div className="flex flex-wrap gap-1">
                                        {(webhook.events as string[]).map((event) => (
                                          <Badge key={event} variant="outline" className="text-xs">
                                            {event}
                                          </Badge>
                                        ))}
                                      </div>
                                      {webhook.lastTriggeredAt && (
                                        <p className="text-sm text-muted-foreground">
                                          Last triggered: {formatDate(webhook.lastTriggeredAt)}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Switch
                                        checked={webhook.isActive}
                                        onCheckedChange={(checked) => {
                                          updateWebhookMutation.mutate({
                                            id: webhook.id,
                                            isActive: checked,
                                          });
                                        }}
                                        disabled={updateWebhookMutation.isPending}
                                      />
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          if (window.confirm("Are you sure you want to delete this webhook?")) {
                                            deleteWebhookMutation.mutate(webhook.id);
                                          }
                                        }}
                                        disabled={deleteWebhookMutation.isPending}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-8 text-center text-muted-foreground">
                                <WebhookIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p className="font-medium">No webhooks configured</p>
                                <p className="text-sm mt-1">Add webhooks to receive real-time notifications</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>API Documentation</CardTitle>
                        <CardDescription>
                          Learn how to integrate HaulTracker with your website
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" asChild>
                          <a href="/api-docs" target="_blank">
                            View API Documentation
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}
            </main>
          </div>
        </div>

        {/* Create API Key Dialog */}
        <Dialog open={showNewApiKeyDialog} onOpenChange={setShowNewApiKeyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>
                Create a new API key to integrate HaulTracker with your website. The key will be shown only once.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="keyName">Name</Label>
                <Input
                  id="keyName"
                  placeholder="Production Website"
                  value={newApiKeyName}
                  onChange={(e) => setNewApiKeyName(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  A friendly name to identify this API key
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="keyExpires">Expiration Date (optional)</Label>
                <Input
                  id="keyExpires"
                  type="date"
                  value={newApiKeyExpires}
                  onChange={(e) => setNewApiKeyExpires(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Leave blank for no expiration
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewApiKeyDialog(false);
                  setNewApiKeyName("");
                  setNewApiKeyExpires("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (newApiKeyName.trim()) {
                    createApiKeyMutation.mutate({
                      name: newApiKeyName.trim(),
                      expiresAt: newApiKeyExpires || undefined,
                    });
                  }
                }}
                disabled={!newApiKeyName.trim() || createApiKeyMutation.isPending}
              >
                {createApiKeyMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Key"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Webhook Dialog */}
        <Dialog open={showNewWebhookDialog} onOpenChange={setShowNewWebhookDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Webhook</DialogTitle>
              <DialogDescription>
                Configure a webhook endpoint to receive real-time notifications when events occur.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  placeholder="https://your-website.com/webhooks/haultracker"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  The URL that will receive POST requests with event data
                </p>
              </div>
              <div className="space-y-2">
                <Label>Events to Subscribe</Label>
                <div className="space-y-2">
                  {availableEvents.map((event) => (
                    <div key={event.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={event.value}
                        checked={newWebhookEvents.includes(event.value)}
                        onChange={() => toggleWebhookEvent(event.value)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor={event.value} className="font-normal cursor-pointer">
                        {event.label}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Select which events should trigger this webhook
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewWebhookDialog(false);
                  setNewWebhookUrl("");
                  setNewWebhookEvents(["booking.created"]);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (newWebhookUrl.trim() && newWebhookEvents.length > 0) {
                    createWebhookMutation.mutate({
                      url: newWebhookUrl.trim(),
                      events: newWebhookEvents,
                    });
                  }
                }}
                disabled={!newWebhookUrl.trim() || newWebhookEvents.length === 0 || createWebhookMutation.isPending}
              >
                {createWebhookMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Add Webhook"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
