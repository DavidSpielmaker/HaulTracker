import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

type PublicOrganization = {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
};

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function OrgLogin() {
  const params = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: organization, isLoading: orgLoading } = useQuery<PublicOrganization>({
    queryKey: ["/api/organizations", params.slug],
    queryFn: async () => {
      const res = await fetch(`/api/organizations/${params.slug}`);
      if (!res.ok) {
        throw new Error("Organization not found");
      }
      return await res.json();
    },
    enabled: !!params.slug,
  });

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData & { organizationId: string }) =>
      apiRequest("POST", "/api/auth/login", data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "You've been logged in successfully.",
      });
      // Redirect to general dashboard (org-specific dashboard coming soon)
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginFormData) => {
    if (!organization) return;
    loginMutation.mutate({
      ...data,
      organizationId: String(organization.id),
    });
  };

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" data-testid="loading-spinner" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Organization Not Found</CardTitle>
            <CardDescription>
              The organization you're looking for doesn't exist.
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

  // Apply organization branding
  const brandingStyle = {
    "--org-primary": organization.primaryColor || "211 85% 42%",
    "--org-secondary": organization.secondaryColor || "211 85% 42%",
  } as React.CSSProperties;

  return (
    <div className="flex items-center justify-center min-h-screen p-4" style={brandingStyle}>
      <Card className="max-w-md w-full">
        <CardHeader className="space-y-4">
          {organization.logo && (
            <div className="flex justify-center">
              <img
                src={organization.logo}
                alt={`${organization.name} logo`}
                className="h-16 w-auto object-contain"
                data-testid="img-org-logo"
              />
            </div>
          )}
          <div className="text-center">
            <CardTitle data-testid="text-org-name">Sign in to {organization.name}</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        {...field}
                        data-testid="input-email"
                        disabled={loginMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                        data-testid="input-password"
                        disabled={loginMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                style={{
                  backgroundColor: `hsl(var(--org-primary))`,
                  color: 'white'
                }}
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Need access?{" "}
              <button
                onClick={() => setLocation(`/org/${params.slug}`)}
                className="hover:underline"
                style={{ color: `hsl(var(--org-primary))` }}
                data-testid="link-booking-page"
              >
                Return to booking page
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
