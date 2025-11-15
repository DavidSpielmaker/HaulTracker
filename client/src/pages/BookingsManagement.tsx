import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/DashboardSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Booking, DumpsterType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Loader2, Search, Eye, Edit, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  picked_up: "bg-purple-100 text-purple-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function BookingsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state for creating booking
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryState, setDeliveryState] = useState("");
  const [deliveryZip, setDeliveryZip] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [rentalDays, setRentalDays] = useState("7");
  const [dumpsterTypeId, setDumpsterTypeId] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const { data: dumpsterTypes } = useQuery<DumpsterType[]>({
    queryKey: ["/api/dumpster-types"],
  });

  const updateBookingMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest("PATCH", `/api/bookings/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Success",
        description: "Booking updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update booking",
        variant: "destructive",
      });
    },
  });

  const deleteBookingMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/bookings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Success",
        description: "Booking deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete booking",
        variant: "destructive",
      });
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest("POST", "/api/bookings", bookingData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Success",
        description: "Booking created successfully",
      });
      setCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create booking",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setDeliveryAddress("");
    setDeliveryCity("");
    setDeliveryState("");
    setDeliveryZip("");
    setDeliveryDate("");
    setRentalDays("7");
    setDumpsterTypeId("");
    setSpecialInstructions("");
  };

  const handleCreateBooking = () => {
    if (!customerName || !customerEmail || !customerPhone || !deliveryAddress ||
        !deliveryCity || !deliveryState || !deliveryZip || !deliveryDate || !dumpsterTypeId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createBookingMutation.mutate({
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      deliveryCity,
      deliveryState,
      deliveryZip,
      deliveryDate,
      rentalDays: parseInt(rentalDays),
      dumpsterTypeId,
      specialInstructions,
    });
  };

  // Filter bookings
  const filteredBookings = bookings?.filter((booking) => {
    const matchesSearch =
      booking.customerFirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerLastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
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
              <h1 className="text-2xl font-semibold">Bookings Management</h1>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Booking
              </Button>
            </header>

            <main className="flex-1 overflow-auto p-6">
              <div className="space-y-4">
                {/* Filters */}
                <div className="flex gap-4 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by customer name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="picked_up">Picked Up</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bookings Table */}
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Booking ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Delivery Date</TableHead>
                          <TableHead>Pickup Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBookings && filteredBookings.length > 0 ? (
                          filteredBookings.map((booking) => (
                            <TableRow key={booking.id}>
                              <TableCell className="font-medium">BK-{booking.id}</TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {booking.customerFirstName} {booking.customerLastName}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {booking.customerEmail}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {new Date(booking.deliveryDate).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                {booking.pickupDate
                                  ? new Date(booking.pickupDate).toLocaleDateString()
                                  : "TBD"}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={statusColors[booking.status] || ""}
                                  variant="secondary"
                                >
                                  {booking.status.replace("_", " ")}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                ${Number(booking.totalAmount).toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSelectedBooking(booking)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      if (window.confirm("Delete this booking?")) {
                                        deleteBookingMutation.mutate(booking.id);
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
                            <TableCell colSpan={7} className="text-center text-muted-foreground">
                              No bookings found
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

      {/* Booking Details Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>BK-{selectedBooking?.id}</DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Customer Information</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">Name:</span>{" "}
                      {selectedBooking.customerFirstName} {selectedBooking.customerLastName}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Email:</span>{" "}
                      {selectedBooking.customerEmail}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Phone:</span>{" "}
                      {selectedBooking.customerPhone}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Delivery Address</h3>
                  <div className="space-y-1 text-sm">
                    <p>{selectedBooking.deliveryStreetAddress}</p>
                    <p>
                      {selectedBooking.deliveryCity}, {selectedBooking.deliveryState}{" "}
                      {selectedBooking.deliveryZipCode}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Dates</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">Delivery:</span>{" "}
                      {new Date(selectedBooking.deliveryDate).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Pickup:</span>{" "}
                      {selectedBooking.pickupDate
                        ? new Date(selectedBooking.pickupDate).toLocaleDateString()
                        : "TBD"}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Pricing</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">Subtotal:</span> $
                      {Number(selectedBooking.subtotal).toFixed(2)}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Tax:</span> $
                      {Number(selectedBooking.taxAmount).toFixed(2)}
                    </p>
                    <p className="font-semibold">
                      <span className="text-muted-foreground">Total:</span> $
                      {Number(selectedBooking.totalAmount).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Status</h3>
                <Select
                  value={selectedBooking.status}
                  onValueChange={(value) => {
                    updateBookingMutation.mutate({ id: selectedBooking.id, status: value });
                    setSelectedBooking({ ...selectedBooking, status: value as any });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="picked_up">Picked Up</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedBooking.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-sm text-muted-foreground">{selectedBooking.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Booking Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Booking</DialogTitle>
            <DialogDescription>
              Add a new booking to the system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Customer Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    placeholder="John Doe"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone *</Label>
                  <Input
                    id="customerPhone"
                    placeholder="(555) 123-4567"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  placeholder="john@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Delivery Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Delivery Information</h3>
              <div className="space-y-2">
                <Label htmlFor="deliveryAddress">Street Address *</Label>
                <Input
                  id="deliveryAddress"
                  placeholder="123 Main St"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryCity">City *</Label>
                  <Input
                    id="deliveryCity"
                    placeholder="Dallas"
                    value={deliveryCity}
                    onChange={(e) => setDeliveryCity(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryState">State *</Label>
                  <Input
                    id="deliveryState"
                    placeholder="TX"
                    maxLength={2}
                    value={deliveryState}
                    onChange={(e) => setDeliveryState(e.target.value.toUpperCase())}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryZip">ZIP Code *</Label>
                  <Input
                    id="deliveryZip"
                    placeholder="75001"
                    value={deliveryZip}
                    onChange={(e) => setDeliveryZip(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Rental Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Rental Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dumpsterType">Dumpster Type *</Label>
                  <Select value={dumpsterTypeId} onValueChange={setDumpsterTypeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select dumpster type" />
                    </SelectTrigger>
                    <SelectContent>
                      {dumpsterTypes?.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name} - ${Number(type.weeklyRate).toFixed(2)}/week
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rentalDays">Rental Days *</Label>
                  <Input
                    id="rentalDays"
                    type="number"
                    min="1"
                    value={rentalDays}
                    onChange={(e) => setRentalDays(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryDate">Delivery Date *</Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialInstructions">Special Instructions</Label>
                <Textarea
                  id="specialInstructions"
                  placeholder="Any special delivery instructions..."
                  rows={3}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateBooking}
              disabled={createBookingMutation.isPending}
            >
              {createBookingMutation.isPending ? "Creating..." : "Create Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}
