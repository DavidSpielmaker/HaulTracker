import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Truck, Trash2 } from "lucide-react";

const steps = [
  {
    icon: Calendar,
    title: "Choose Your Size",
    description: "Select the perfect dumpster size for your project and pick your delivery date"
  },
  {
    icon: Truck,
    title: "We Deliver",
    description: "Our team delivers the dumpster to your location at the scheduled time"
  },
  {
    icon: Trash2,
    title: "We Pick Up",
    description: "When you're done, we'll pick it up and handle all the disposal"
  }
];

export default function HowItWorks() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4" data-testid="text-how-it-works-title">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-how-it-works-subtitle">
            Getting a dumpster has never been easier. Just three simple steps.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index} className="text-center" data-testid={`card-step-${index + 1}`}>
                <CardContent className="pt-8 pb-8">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Icon className="h-8 w-8 text-primary" data-testid={`icon-step-${index + 1}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3" data-testid={`text-step-title-${index + 1}`}>
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground" data-testid={`text-step-description-${index + 1}`}>
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
