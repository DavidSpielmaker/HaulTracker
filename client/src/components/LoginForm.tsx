import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Truck } from "lucide-react";

interface LoginFormProps {
  title?: string;
  description?: string;
  onLogin?: (email: string, password: string) => void;
  showRegisterLink?: boolean;
}

export default function LoginForm({ 
  title = "Login", 
  description = "Enter your credentials to access your account",
  onLogin,
  showRegisterLink = false
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin?.(email, password);
    console.log('Login attempt:', { email });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Truck className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl" data-testid="text-login-title">{title}</CardTitle>
          <CardDescription data-testid="text-login-description">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" data-testid="label-email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" data-testid="label-password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="input-password"
              />
            </div>
            <Button type="submit" className="w-full" data-testid="button-login">
              Login
            </Button>
            {showRegisterLink && (
              <p className="text-sm text-center text-muted-foreground">
                Don't have an account?{" "}
                <a href="/register" className="text-primary hover:underline" data-testid="link-register">
                  Sign up
                </a>
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
