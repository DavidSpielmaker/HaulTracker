import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Truck } from "lucide-react";

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2 hover-elevate rounded-md px-3 py-2" data-testid="link-home">
              <Truck className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold">DumpsterPro</span>
            </a>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/">
              <a className="text-sm font-medium hover:text-primary transition-colors" data-testid="link-nav-home">
                Home
              </a>
            </Link>
            <Link href="/book">
              <a className="text-sm font-medium hover:text-primary transition-colors" data-testid="link-nav-book">
                Book Now
              </a>
            </Link>
            <Link href="/quote">
              <a className="text-sm font-medium hover:text-primary transition-colors" data-testid="link-nav-quote">
                Get Quote
              </a>
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/dashboard/login">
              <a data-testid="link-dashboard-login">
                <Button variant="ghost" size="sm">
                  Dashboard Login
                </Button>
              </a>
            </Link>
            <Link href="/book">
              <a data-testid="link-book-cta">
                <Button size="sm">
                  Book Now
                </Button>
              </a>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
