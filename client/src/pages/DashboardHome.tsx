import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/DashboardSidebar";
import KPICard from "@/components/KPICard";
import BookingTable from "@/components/BookingTable";
import { Truck, Calendar, Package, DollarSign } from "lucide-react";

// TODO: remove mock functionality
const mockBookings = [
  {
    id: "1",
    bookingNumber: "BK-2024-001",
    customerName: "John Smith",
    dumpsterType: "20 Yard",
    deliveryDate: "2024-01-15",
    pickupDate: "2024-01-22",
    status: "confirmed",
    total: 425.00
  },
  {
    id: "2",
    bookingNumber: "BK-2024-002",
    customerName: "Sarah Johnson",
    dumpsterType: "10 Yard",
    deliveryDate: "2024-01-16",
    pickupDate: "2024-01-23",
    status: "delivered",
    total: 299.00
  },
  {
    id: "3",
    bookingNumber: "BK-2024-003",
    customerName: "Mike Wilson",
    dumpsterType: "30 Yard",
    deliveryDate: "2024-01-18",
    pickupDate: "2024-01-25",
    status: "pending",
    total: 575.00
  }
];

export default function DashboardHome() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <DashboardSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <h1 className="text-2xl font-semibold" data-testid="text-page-title">Dashboard</h1>
            <div className="w-10"></div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <KPICard
                title="Today's Deliveries"
                value={8}
                icon={Truck}
                description="Scheduled for delivery"
              />
              <KPICard
                title="Today's Pickups"
                value={5}
                icon={Calendar}
                description="Scheduled for pickup"
              />
              <KPICard
                title="Available Units"
                value={24}
                icon={Package}
                description="Ready to rent"
              />
              <KPICard
                title="Monthly Revenue"
                value="$12,450"
                icon={DollarSign}
                trend={{ value: 12, isPositive: true }}
              />
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4" data-testid="text-recent-bookings-title">
                  Recent Bookings
                </h2>
                <BookingTable 
                  bookings={mockBookings}
                  onView={(id) => console.log('View booking:', id)}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
