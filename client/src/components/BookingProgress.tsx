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
      <div className="max-w-3xl mx-auto px-4">
        <div className="relative">
          {/* Background line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted" style={{ left: '5%', right: '5%' }} />
          
          {/* Progress line */}
          <div 
            className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-300"
            style={{ 
              left: '5%',
              width: `${((currentStep - 1) / (steps.length - 1)) * 90}%`
            }}
          />
          
          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isCompleted = stepNumber < currentStep;
              const isCurrent = stepNumber === currentStep;

              return (
                <div key={index} className="flex flex-col items-center">
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
                  <span 
                    className={`mt-2 text-sm font-medium text-center ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`} 
                    data-testid={`step-label-${stepNumber}`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
