import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface Booking {
  id: string;
  bookingNumber: string;
  customerName: string;
  dumpsterType: string;
  deliveryDate: string;
  pickupDate: string;
  status: string;
  total: number;
}

interface BookingTableProps {
  bookings: Booking[];
  onView?: (id: string) => void;
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  confirmed: "secondary",
  delivered: "default",
  picked_up: "secondary",
  completed: "default",
  cancelled: "destructive"
};

export default function BookingTable({ bookings, onView }: BookingTableProps) {
  return (
    <div className="rounded-md border" data-testid="table-bookings">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead data-testid="header-booking-number">Booking #</TableHead>
            <TableHead data-testid="header-customer">Customer</TableHead>
            <TableHead data-testid="header-dumpster">Dumpster</TableHead>
            <TableHead data-testid="header-delivery">Delivery</TableHead>
            <TableHead data-testid="header-pickup">Pickup</TableHead>
            <TableHead data-testid="header-status">Status</TableHead>
            <TableHead data-testid="header-total">Total</TableHead>
            <TableHead data-testid="header-actions">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id} data-testid={`row-booking-${booking.id}`}>
              <TableCell className="font-medium" data-testid={`text-booking-number-${booking.id}`}>
                {booking.bookingNumber}
              </TableCell>
              <TableCell data-testid={`text-customer-${booking.id}`}>
                {booking.customerName}
              </TableCell>
              <TableCell data-testid={`text-dumpster-${booking.id}`}>
                {booking.dumpsterType}
              </TableCell>
              <TableCell data-testid={`text-delivery-${booking.id}`}>
                {booking.deliveryDate}
              </TableCell>
              <TableCell data-testid={`text-pickup-${booking.id}`}>
                {booking.pickupDate}
              </TableCell>
              <TableCell>
                <Badge variant={statusColors[booking.status]} data-testid={`badge-status-${booking.id}`}>
                  {booking.status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell data-testid={`text-total-${booking.id}`}>
                ${booking.total.toFixed(2)}
              </TableCell>
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onView?.(booking.id)}
                  data-testid={`button-view-${booking.id}`}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
