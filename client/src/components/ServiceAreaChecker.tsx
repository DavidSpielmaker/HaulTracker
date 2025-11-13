import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, CheckCircle, XCircle } from "lucide-react";

export default function ServiceAreaChecker() {
  const [zipCode, setZipCode] = useState("");
  const [result, setResult] = useState<{ serviceable: boolean; fee?: number } | null>(null);

  const handleCheck = () => {
    // TODO: remove mock functionality
    const mockServiceable = zipCode.startsWith("9") || zipCode.startsWith("8");
    setResult({
      serviceable: mockServiceable,
      fee: mockServiceable ? 75 : undefined
    });
    console.log('Checking zip code:', zipCode);
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl" data-testid="text-service-area-title">
              Check Service Availability
            </CardTitle>
            <CardDescription data-testid="text-service-area-description">
              Enter your ZIP code to see if we service your area
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter ZIP code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                maxLength={5}
                data-testid="input-zip-code"
              />
              <Button onClick={handleCheck} data-testid="button-check-service">
                Check
              </Button>
            </div>

            {result && (
              <div className={`p-4 rounded-md ${result.serviceable ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`} data-testid="text-service-result">
                <div className="flex items-start gap-3">
                  {result.serviceable ? (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-medium ${result.serviceable ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
                      {result.serviceable ? "Great news! We service your area." : "Sorry, we don't currently service this area."}
                    </p>
                    {result.serviceable && result.fee && (
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        Delivery fee: ${result.fee}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
