import { useState } from "react";
import PublicHeader from "@/components/PublicHeader";
import BookingProgress from "@/components/BookingProgress";
import DumpsterCard from "@/components/DumpsterCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import dumpster10 from "@assets/generated_images/10_yard_dumpster_product_223909e0.png";
import dumpster20 from "@assets/generated_images/20_yard_dumpster_product_0952f587.png";
import dumpster30 from "@assets/generated_images/30_yard_dumpster_product_1a26a904.png";
import dumpster40 from "@assets/generated_images/40_yard_dumpster_product_faa9df10.png";

// TODO: remove mock functionality
const dumpsterTypes = [
  { id: "10-yard", name: "10 Yard Dumpster", sizeYards: 10, description: "Perfect for small projects", weeklyRate: 299, dailyRate: 45, weightLimit: 2, imageUrl: dumpster10 },
  { id: "20-yard", name: "20 Yard Dumpster", sizeYards: 20, description: "Ideal for medium projects", weeklyRate: 425, dailyRate: 65, weightLimit: 4, imageUrl: dumpster20, popular: true },
  { id: "30-yard", name: "30 Yard Dumpster", sizeYards: 30, description: "Great for large projects", weeklyRate: 575, dailyRate: 85, weightLimit: 6, imageUrl: dumpster30 },
  { id: "40-yard", name: "40 Yard Dumpster", sizeYards: 40, description: "Best for major projects", weeklyRate: 725, dailyRate: 105, weightLimit: 8, imageUrl: dumpster40 }
];

export default function BookingFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDumpster, setSelectedDumpster] = useState<string | null>(null);
  const [deliveryDate, setDeliveryDate] = useState<Date>();
  const [pickupDate, setPickupDate] = useState<Date>();

  const handleNext = () => {
    setCurrentStep(Math.min(4, currentStep + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setCurrentStep(Math.max(1, currentStep - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <PublicHeader />
      
      <div className="container mx-auto px-4 py-8">
        <BookingProgress currentStep={currentStep} />

        <div className="max-w-5xl mx-auto">
          {currentStep === 1 && (
            <div>
              <h2 className="text-3xl font-semibold mb-8 text-center" data-testid="text-step-title">
                Select Your Dumpster Size
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {dumpsterTypes.map((dumpster) => (
                  <DumpsterCard
                    key={dumpster.id}
                    {...dumpster}
                    onSelect={(id) => {
                      setSelectedDumpster(id);
                      handleNext();
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-step-title">Delivery Details & Dates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address" data-testid="label-address">Delivery Address</Label>
                    <Input id="address" placeholder="123 Main St" data-testid="input-address" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" data-testid="label-city">City</Label>
                    <Input id="city" placeholder="City" data-testid="input-city" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" data-testid="label-state">State</Label>
                    <Input id="state" placeholder="State" data-testid="input-state" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip" data-testid="label-zip">ZIP Code</Label>
                    <Input id="zip" placeholder="12345" data-testid="input-zip" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label data-testid="label-delivery-date">Delivery Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal" data-testid="button-delivery-date">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {deliveryDate ? format(deliveryDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={deliveryDate} onSelect={setDeliveryDate} />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label data-testid="label-pickup-date">Pickup Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal" data-testid="button-pickup-date">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {pickupDate ? format(pickupDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={pickupDate} onSelect={setPickupDate} />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handleBack} data-testid="button-back">
                    Back
                  </Button>
                  <Button onClick={handleNext} data-testid="button-next">
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-step-title">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" data-testid="label-name">Full Name</Label>
                    <Input id="name" placeholder="John Doe" data-testid="input-name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" data-testid="label-email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" data-testid="input-email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" data-testid="label-phone">Phone</Label>
                    <Input id="phone" type="tel" placeholder="(555) 123-4567" data-testid="input-phone" />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handleBack} data-testid="button-back">
                    Back
                  </Button>
                  <Button onClick={handleNext} data-testid="button-next">
                    Continue to Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-step-title">Review & Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 p-6 rounded-md space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dumpster Size:</span>
                    <span className="font-medium" data-testid="text-summary-dumpster">20 Yard</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weekly Rate:</span>
                    <span className="font-medium" data-testid="text-summary-rate">$425.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Fee:</span>
                    <span className="font-medium" data-testid="text-summary-delivery">$75.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax:</span>
                    <span className="font-medium" data-testid="text-summary-tax">$40.00</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span data-testid="text-summary-total">$540.00</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="card" data-testid="label-card">Card Number</Label>
                    <Input id="card" placeholder="4242 4242 4242 4242" data-testid="input-card" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry" data-testid="label-expiry">Expiry</Label>
                      <Input id="expiry" placeholder="MM/YY" data-testid="input-expiry" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc" data-testid="label-cvc">CVC</Label>
                      <Input id="cvc" placeholder="123" data-testid="input-cvc" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handleBack} data-testid="button-back">
                    Back
                  </Button>
                  <Button onClick={() => console.log('Booking confirmed')} data-testid="button-confirm">
                    Confirm Booking
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
