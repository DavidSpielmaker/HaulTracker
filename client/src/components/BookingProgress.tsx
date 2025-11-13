import { Check } from "lucide-react";

interface BookingProgressProps {
  currentStep: number;
}

const steps = [
  "Select Size",
  "Details & Date",
  "Contact Info",
  "Payment"
];

export default function BookingProgress({ currentStep }: BookingProgressProps) {
  return (
    <div className="w-full py-8" data-testid="booking-progress">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={index} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                    isCompleted 
                      ? 'bg-primary text-primary-foreground' 
                      : isCurrent 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                  data-testid={`step-indicator-${stepNumber}`}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : stepNumber}
                </div>
                <span className={`mt-2 text-sm font-medium ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`} data-testid={`step-label-${stepNumber}`}>
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div 
                  className={`flex-1 h-0.5 mx-4 transition-colors ${
                    isCompleted ? 'bg-primary' : 'bg-muted'
                  }`}
                  data-testid={`step-connector-${stepNumber}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
