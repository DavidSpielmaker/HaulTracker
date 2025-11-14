import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/DashboardSidebar";
import KPICard from "@/components/KPICard";
import BookingTable from "@/components/BookingTable";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Truck, Calendar, Package, DollarSign, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Booking } from "@shared/schema";

export default function DashboardHome() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  // Get the 5 most recent bookings
  const recentBookings = bookings?.slice(0, 5) || [];
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
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <h1 className="text-2xl font-semibold" data-testid="text-page-title">Dashboard</h1>
            <div className="w-10"></div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            {statsLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
                  <KPICard
                    title="Today's Deliveries"
                    value={stats?.todayDeliveries || 0}
                    icon={Truck}
                    description="Scheduled for delivery"
                  />
                  <KPICard
                    title="Today's Pickups"
                    value={stats?.todayPickups || 0}
                    icon={Calendar}
                    description="Scheduled for pickup"
                  />
                  <KPICard
                    title="Available Units"
                    value={stats?.availableUnits || 0}
                    icon={Package}
                    description="Ready to rent"
                  />
                  <KPICard
                    title="Monthly Revenue"
                    value={`$${(stats?.monthlyRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    icon={DollarSign}
                  />
                </div>

                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4" data-testid="text-recent-bookings-title">
                      Recent Bookings
                    </h2>
                    {bookingsLoading ? (
                      <div className="flex items-center justify-center h-32">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      <BookingTable
                        bookings={recentBookings.map(b => ({
                          id: b.id,
                          bookingNumber: `BK-${b.id}`,
                          customerName: `${b.customerFirstName} ${b.customerLastName}`,
                          dumpsterType: "Dumpster", // TODO: Join with dumpster type
                          deliveryDate: new Date(b.deliveryDate).toLocaleDateString(),
                          pickupDate: b.pickupDate ? new Date(b.pickupDate).toLocaleDateString() : "TBD",
                          status: b.status,
                          total: Number(b.totalAmount)
                        }))}
                        onView={(id) => console.log('View booking:', id)}
                      />
                    )}
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
    </ProtectedRoute>
  );
}
