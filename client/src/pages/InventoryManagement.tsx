import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/DashboardSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { DumpsterInventory, DumpsterType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  available: "bg-green-100 text-green-800",
  rented: "bg-blue-100 text-blue-800",
  maintenance: "bg-yellow-100 text-yellow-800",
  retired: "bg-gray-100 text-gray-800",
};

type InventoryWithType = DumpsterInventory & {
  type?: DumpsterType;
};

export default function InventoryManagement() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DumpsterInventory | null>(null);
  const [newItem, setNewItem] = useState({
    unitNumber: "",
    dumpsterTypeId: "",
    status: "available" as const,
    currentLocation: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inventory, isLoading: inventoryLoading } = useQuery<DumpsterInventory[]>({
    queryKey: ["/api/inventory"],
  });

  const { data: dumpsterTypes } = useQuery<DumpsterType[]>({
    queryKey: ["/api/dumpster-types"],
  });

  // Merge inventory with dumpster types
  const inventoryWithTypes: InventoryWithType[] =
    inventory?.map((item) => ({
      ...item,
      type: dumpsterTypes?.find((t) => t.id === item.dumpsterTypeId),
    })) || [];

  const createInventoryMutation = useMutation({
    mutationFn: async (data: typeof newItem) => {
      return await apiRequest("POST", "/api/inventory", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({
        title: "Success",
        description: "Inventory item created successfully",
      });
      setIsAddDialogOpen(false);
      setNewItem({
        unitNumber: "",
        dumpsterTypeId: "",
        status: "available",
        currentLocation: "",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create inventory item",
        variant: "destructive",
      });
    },
  });

  const updateInventoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DumpsterInventory> }) => {
      return await apiRequest("PATCH", `/api/inventory/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({
        title: "Success",
        description: "Inventory item updated successfully",
      });
      setEditingItem(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update inventory item",
        variant: "destructive",
      });
    },
  });

  const deleteInventoryMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/inventory/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({
        title: "Success",
        description: "Inventory item deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete inventory item",
        variant: "destructive",
      });
    },
  });

  const filteredInventory = inventoryWithTypes.filter((item) => {
    return statusFilter === "all" || item.status === statusFilter;
  });

  // Group by status for stats
  const stats = {
    available: inventoryWithTypes.filter((i) => i.status === "available").length,
    rented: inventoryWithTypes.filter((i) => i.status === "rented").length,
    maintenance: inventoryWithTypes.filter((i) => i.status === "maintenance").length,
    retired: inventoryWithTypes.filter((i) => i.status === "retired").length,
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
              <h1 className="text-2xl font-semibold">Inventory Management</h1>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Unit
              </Button>
            </header>

            <main className="flex-1 overflow-auto p-6">
              <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">Available</div>
                    <div className="text-2xl font-bold text-green-600">{stats.available}</div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">Rented</div>
                    <div className="text-2xl font-bold text-blue-600">{stats.rented}</div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">Maintenance</div>
                    <div className="text-2xl font-bold text-yellow-600">{stats.maintenance}</div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">Retired</div>
                    <div className="text-2xl font-bold text-gray-600">{stats.retired}</div>
                  </div>
                </div>

                {/* Filter */}
                <div className="flex gap-4 items-center">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="rented">Rented</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Inventory Table */}
                {inventoryLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Unit Number</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInventory.length > 0 ? (
                          filteredInventory.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.unitNumber}</TableCell>
                              <TableCell>{item.type?.name || "Unknown"}</TableCell>
                              <TableCell>{item.type?.size} yard</TableCell>
                              <TableCell>
                                <Badge
                                  className={statusColors[item.status] || ""}
                                  variant="secondary"
                                >
                                  {item.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{item.currentLocation || "Yard"}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setEditingItem(item)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      if (window.confirm("Delete this unit?")) {
                                        deleteInventoryMutation.mutate(item.id);
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                              No inventory items found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>

      {/* Add Inventory Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Unit</DialogTitle>
            <DialogDescription>Add a new dumpster unit to your inventory</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="unitNumber">Unit Number</Label>
              <Input
                id="unitNumber"
                value={newItem.unitNumber}
                onChange={(e) => setNewItem({ ...newItem, unitNumber: e.target.value })}
                placeholder="e.g., 001, 002, etc."
              />
            </div>
            <div>
              <Label htmlFor="dumpsterType">Dumpster Type</Label>
              <Select
                value={newItem.dumpsterTypeId}
                onValueChange={(value) => setNewItem({ ...newItem, dumpsterTypeId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {dumpsterTypes?.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name} ({type.size} yard)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Current Location</Label>
              <Input
                id="location"
                value={newItem.currentLocation}
                onChange={(e) => setNewItem({ ...newItem, currentLocation: e.target.value })}
                placeholder="e.g., Yard, Bay 3, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createInventoryMutation.mutate(newItem)}
              disabled={!newItem.unitNumber || !newItem.dumpsterTypeId}
            >
              Add Unit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Inventory Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Unit</DialogTitle>
            <DialogDescription>Unit #{editingItem?.unitNumber}</DialogDescription>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editingItem.status}
                  onValueChange={(value) =>
                    setEditingItem({ ...editingItem, status: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="rented">Rented</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-location">Current Location</Label>
                <Input
                  id="edit-location"
                  value={editingItem.currentLocation || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, currentLocation: e.target.value })
                  }
                  placeholder="e.g., Yard, Bay 3, etc."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (editingItem) {
                  updateInventoryMutation.mutate({
                    id: editingItem.id,
                    data: {
                      status: editingItem.status,
                      currentLocation: editingItem.currentLocation,
                    },
                  });
                }
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}
