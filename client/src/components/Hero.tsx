import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import heroImage from "@assets/generated_images/Hero_image_facility_yard_05720e5d.png";
import { ArrowRight, Phone } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
      
      <div className="container relative mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6" data-testid="text-hero-title">
            Kansas City's Premier Junk Removal & Dumpster Rental
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90" data-testid="text-hero-subtitle">
            Fast, reliable waste management solutions for your project. Same-day delivery available.
          </p>
          <div className="flex items-center gap-2 text-white mb-8">
            <Phone className="h-6 w-6" />
            <a href="tel:8166611759" className="text-2xl font-semibold hover:underline" data-testid="link-hero-phone">
              (816) 661-1759
            </a>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/book">
              <a data-testid="button-hero-book">
                <Button size="lg" className="text-lg px-8">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </Link>
            <Link href="/quote">
              <a data-testid="button-hero-quote">
                <Button size="lg" variant="outline" className="text-lg px-8 bg-background/10 backdrop-blur-sm border-white/20 text-white hover:bg-background/20">
                  Request Quote
                </Button>
              </a>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
