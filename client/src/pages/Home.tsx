import PublicHeader from "@/components/PublicHeader";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import ServiceAreaChecker from "@/components/ServiceAreaChecker";
import DumpsterCard from "@/components/DumpsterCard";
import dumpster10 from "@assets/generated_images/10_yard_dumpster_product_223909e0.png";
import dumpster20 from "@assets/generated_images/20_yard_dumpster_product_0952f587.png";
import dumpster30 from "@assets/generated_images/30_yard_dumpster_product_1a26a904.png";
import dumpster40 from "@assets/generated_images/40_yard_dumpster_product_faa9df10.png";
import { Link } from "wouter";

// TODO: remove mock functionality
const dumpsterTypes = [
  {
    id: "10-yard",
    name: "10 Yard Dumpster",
    sizeYards: 10,
    description: "Perfect for small projects like garage cleanouts or minor renovations",
    weeklyRate: 299,
    dailyRate: 45,
    weightLimit: 2,
    imageUrl: dumpster10
  },
  {
    id: "20-yard",
    name: "20 Yard Dumpster",
    sizeYards: 20,
    description: "Ideal for medium projects such as kitchen remodels or roof replacements",
    weeklyRate: 425,
    dailyRate: 65,
    weightLimit: 4,
    imageUrl: dumpster20,
    popular: true
  },
  {
    id: "30-yard",
    name: "30 Yard Dumpster",
    sizeYards: 30,
    description: "Great for large projects including whole-home cleanouts or new construction",
    weeklyRate: 575,
    dailyRate: 85,
    weightLimit: 6,
    imageUrl: dumpster30
  },
  {
    id: "40-yard",
    name: "40 Yard Dumpster",
    sizeYards: 40,
    description: "Best for major commercial projects or large-scale demolitions",
    weeklyRate: 725,
    dailyRate: 105,
    weightLimit: 8,
    imageUrl: dumpster40
  }
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <PublicHeader />
      <Hero />
      
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4" data-testid="text-dumpster-sizes-title">
              Choose Your Dumpster Size
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-dumpster-sizes-subtitle">
              We offer a variety of sizes to match your project needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {dumpsterTypes.map((dumpster) => (
              <DumpsterCard
                key={dumpster.id}
                {...dumpster}
                onSelect={(id) => {
                  console.log('Selected dumpster:', id);
                  window.location.href = '/book';
                }}
              />
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />
      <ServiceAreaChecker />

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4" data-testid="text-cta-title">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto" data-testid="text-cta-subtitle">
            Book your dumpster today and we'll have it delivered when you need it
          </p>
          <Link href="/book" data-testid="button-cta-book">
            <button className="bg-background text-foreground hover-elevate active-elevate-2 px-8 py-3 rounded-md text-lg font-medium">
              Book Now
            </button>
          </Link>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p data-testid="text-footer">© 2024 1 Call Junk Removal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
