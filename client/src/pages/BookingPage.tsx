import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Phone, MapPin, Globe } from "lucide-react";

type PublicOrganization = {
  id: number;
  name: string;
  slug: string;
  phone: string;
  city: string;
  state: string;
  website?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
};

export default function BookingPage() {
  const params = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();

  const { data: organization, isLoading, error } = useQuery<PublicOrganization>({
    queryKey: ["/api/organizations", params.slug],
    queryFn: async () => {
      const res = await fetch(`/api/organizations/${params.slug}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Organization not found");
        }
        throw new Error(`Failed to fetch organization: ${res.statusText}`);
      }
      return await res.json();
    },
    enabled: !!params.slug,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" data-testid="loading-spinner" />
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Organization Not Found</CardTitle>
            <CardDescription>
              The organization you're looking for doesn't exist or is no longer available.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")} data-testid="button-go-home">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Apply organization branding via CSS variables
  const brandingStyle = {
    "--org-primary": organization.primaryColor || "211 85% 42%",
    "--org-secondary": organization.secondaryColor || "211 85% 42%",
  } as React.CSSProperties;

  return (
    <div className="min-h-screen" style={brandingStyle}>
      {/* Header with organization branding */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {organization.logo && (
                <img
                  src={organization.logo}
                  alt={`${organization.name} logo`}
                  className="h-12 w-auto object-contain"
                  data-testid="img-org-logo"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold" data-testid="text-org-name">
                  {organization.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {organization.city}, {organization.state}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a
                href={`tel:${organization.phone}`}
                className="flex items-center gap-2 text-sm hover-elevate px-3 py-2 rounded-md"
                data-testid="link-phone"
              >
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">{organization.phone}</span>
              </a>
              {organization.website && (
                <a
                  href={organization.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm hover-elevate px-3 py-2 rounded-md"
                  data-testid="link-website"
                >
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline">Website</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Book a Dumpster Rental</CardTitle>
              <CardDescription>
                Select your dumpster size, delivery date, and rental duration to get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Booking form coming soon. This is the branded booking page for{" "}
                  <span className="font-semibold">{organization.name}</span>.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Organization ID: {organization.id} | Slug: {organization.slug}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} {organization.name}. All rights reserved.</p>
            {organization.website && (
              <p className="mt-1">
                Visit us at{" "}
                <a
                  href={organization.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {organization.website}
                </a>
              </p>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
