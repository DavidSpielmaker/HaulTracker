import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/LandingPage";
import DashboardLogin from "@/pages/DashboardLogin";
import DashboardHome from "@/pages/DashboardHome";
import BookingsManagement from "@/pages/BookingsManagement";
import InventoryManagement from "@/pages/InventoryManagement";
import CalendarView from "@/pages/CalendarView";
import Settings from "@/pages/Settings";
import TeamManagement from "@/pages/TeamManagement";
import AdminDashboard from "@/pages/AdminDashboard";
import OrganizationForm from "@/pages/OrganizationForm";
import ApiDocs from "@/pages/ApiDocs";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={DashboardLogin} />
      <Route path="/dashboard/login" component={DashboardLogin} />
      <Route path="/api-docs" component={ApiDocs} />

      {/* Dashboard routes */}
      <Route path="/dashboard" component={DashboardHome} />
      <Route path="/dashboard/bookings" component={BookingsManagement} />
      <Route path="/dashboard/inventory" component={InventoryManagement} />
      <Route path="/dashboard/calendar" component={CalendarView} />
      <Route path="/dashboard/settings" component={Settings} />
      <Route path="/dashboard/team" component={TeamManagement} />

      {/* Super admin routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/organizations/new" component={OrganizationForm} />
      <Route path="/admin/organizations/:id" component={OrganizationForm} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
