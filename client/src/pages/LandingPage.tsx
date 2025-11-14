import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Calendar, Package, BarChart3, Users, Settings, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">HaulTracker</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-5xl font-bold tracking-tight">
            The Complete Platform for
            <span className="text-primary"> Dumpster Rental Businesses</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Streamline your operations with powerful tools for bookings, inventory management,
            scheduling, and customer management—all in one place.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/login">
              <Button size="lg" className="gap-2">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Everything You Need to Run Your Business</h2>
          <p className="text-muted-foreground text-lg">
            Powerful features designed specifically for dumpster rental operations
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Calendar className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Smart Scheduling</CardTitle>
              <CardDescription>
                Visual calendar for deliveries and pickups. Prevent double-bookings and optimize
                routes automatically.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Package className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>
                Track every unit's status in real-time. Know exactly what's available, rented, or
                in maintenance.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Truck className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Booking Management</CardTitle>
              <CardDescription>
                Manage the complete booking lifecycle from quote to pickup. Update statuses and
                track payments.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Real-Time Analytics</CardTitle>
              <CardDescription>
                Dashboard with live KPIs. Track revenue, utilization rates, and operational
                metrics at a glance.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Team Management</CardTitle>
              <CardDescription>
                Invite team members with role-based permissions. Track activity and manage access
                levels.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Settings className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Configurable Settings</CardTitle>
              <CardDescription>
                Customize business rules, service areas, pricing, and notifications to match your
                operations.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Integration Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Website Integration Ready</CardTitle>
              <CardDescription className="text-lg">
                Keep your existing website. Integrate HaulTracker's booking system with our simple
                API.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-6 font-mono text-sm">
                <div className="text-muted-foreground">// Add booking to your website</div>
                <div className="mt-2">
                  <span className="text-primary">fetch</span>
                  <span>("</span>
                  <span className="text-green-600">https://api.haultracker.com/bookings</span>
                  <span>", &#123;</span>
                </div>
                <div className="ml-4">
                  <span className="text-purple-600">method</span>: "POST",
                </div>
                <div className="ml-4">
                  <span className="text-purple-600">body</span>:{" "}
                  <span className="text-orange-600">JSON.stringify</span>(bookingData)
                </div>
                <div>&#125;)</div>
              </div>
              <p className="text-center text-muted-foreground mt-4">
                Full API documentation included with your account
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-6 bg-primary/5 rounded-2xl p-12 border-2 border-primary/20">
          <h2 className="text-4xl font-bold">Ready to Streamline Your Operations?</h2>
          <p className="text-xl text-muted-foreground">
            Join dumpster rental businesses using HaulTracker to manage their operations more
            efficiently.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/login">
              <Button size="lg" className="gap-2">
                Start Your Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-6 w-6 text-primary" />
              <span className="font-semibold">HaulTracker</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 HaulTracker. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
