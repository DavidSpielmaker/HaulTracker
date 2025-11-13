import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import BookingFlow from "@/pages/BookingFlow";
import DashboardLogin from "@/pages/DashboardLogin";
import DashboardHome from "@/pages/DashboardHome";
import AdminDashboard from "@/pages/AdminDashboard";
import OrganizationForm from "@/pages/OrganizationForm";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/book" component={BookingFlow} />
      <Route path="/dashboard/login" component={DashboardLogin} />
      <Route path="/dashboard" component={DashboardHome} />
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
