import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/DashboardSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useQuery } from "@tanstack/react-query";
import type { Booking } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Loader2, Truck, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  // Get the first day of the month and number of days
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Navigate months
  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Get bookings for a specific date
  const getBookingsForDate = (day: number) => {
    if (!bookings) return { deliveries: [], pickups: [] };

    const dateStr = new Date(year, month, day).toISOString().split("T")[0];

    const deliveries = bookings.filter((b) => {
      const deliveryDate = new Date(b.deliveryDate).toISOString().split("T")[0];
      return deliveryDate === dateStr;
    });

    const pickups = bookings.filter((b) => {
      if (!b.pickupDate) return false;
      const pickupDate = new Date(b.pickupDate).toISOString().split("T")[0];
      return pickupDate === dateStr;
    });

    return { deliveries, pickups };
  };

  // Get bookings for selected date
  const selectedDateBookings = selectedDate
    ? getBookingsForDate(selectedDate.getDate())
    : { deliveries: [], pickups: [] };

  // Generate calendar days
  const calendarDays = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

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
              <h1 className="text-2xl font-semibold">Calendar</h1>
              <div className="w-10"></div>
            </header>

            <main className="flex-1 overflow-auto p-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                      {MONTHS[month]} {year}
                    </h2>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={previousMonth}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setCurrentDate(new Date())}
                      >
                        Today
                      </Button>
                      <Button variant="outline" size="icon" onClick={nextMonth}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Deliveries</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Pickups</span>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="border rounded-lg overflow-hidden">
                    {/* Day Headers */}
                    <div className="grid grid-cols-7 bg-muted">
                      {DAYS.map((day) => (
                        <div
                          key={day}
                          className="p-2 text-center text-sm font-medium border-r last:border-r-0"
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7">
                      {calendarDays.map((day, index) => {
                        if (day === null) {
                          return (
                            <div
                              key={`empty-${index}`}
                              className="min-h-24 p-2 border-r border-b bg-muted/50"
                            />
                          );
                        }

                        const { deliveries, pickups } = getBookingsForDate(day);
                        const isToday =
                          day === new Date().getDate() &&
                          month === new Date().getMonth() &&
                          year === new Date().getFullYear();

                        return (
                          <div
                            key={day}
                            className={`min-h-24 p-2 border-r border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                              isToday ? "bg-primary/5" : ""
                            }`}
                            onClick={() =>
                              setSelectedDate(new Date(year, month, day))
                            }
                          >
                            <div
                              className={`text-sm font-medium mb-1 ${
                                isToday
                                  ? "text-primary font-bold"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {day}
                            </div>
                            <div className="space-y-1">
                              {deliveries.length > 0 && (
                                <div className="flex items-center gap-1 text-xs">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="text-green-700 font-medium">
                                    {deliveries.length} delivery
                                    {deliveries.length !== 1 ? "s" : ""}
                                  </span>
                                </div>
                              )}
                              {pickups.length > 0 && (
                                <div className="flex items-center gap-1 text-xs">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  <span className="text-blue-700 font-medium">
                                    {pickups.length} pickup
                                    {pickups.length !== 1 ? "s" : ""}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </SidebarProvider>

      {/* Day Details Dialog */}
      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedDate &&
                `${MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`}
            </DialogTitle>
            <DialogDescription>
              Scheduled deliveries and pickups
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Deliveries */}
            {selectedDateBookings.deliveries.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-green-600" />
                  Deliveries ({selectedDateBookings.deliveries.length})
                </h3>
                <div className="space-y-2">
                  {selectedDateBookings.deliveries.map((booking) => (
                    <Card key={booking.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">
                              {booking.customerFirstName} {booking.customerLastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {booking.deliveryStreetAddress},{" "}
                              {booking.deliveryCity}
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {booking.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Pickups */}
            {selectedDateBookings.pickups.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  Pickups ({selectedDateBookings.pickups.length})
                </h3>
                <div className="space-y-2">
                  {selectedDateBookings.pickups.map((booking) => (
                    <Card key={booking.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">
                              {booking.customerFirstName} {booking.customerLastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {booking.deliveryStreetAddress},{" "}
                              {booking.deliveryCity}
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {booking.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {selectedDateBookings.deliveries.length === 0 &&
              selectedDateBookings.pickups.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No scheduled deliveries or pickups for this day
                </div>
              )}
          </div>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}
