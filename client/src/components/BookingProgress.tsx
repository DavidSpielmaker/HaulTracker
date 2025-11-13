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
      <div className="max-w-3xl mx-auto">
        {/* Circles and connector lines row */}
        <div className="relative flex items-center mb-2">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;

            return (
              <div key={index} className="flex-1 flex items-center justify-center">
                <div className="flex items-center w-full">
                  {index > 0 && (
                    <div 
                      className={`flex-1 h-0.5 transition-colors ${
                        isCompleted || (index < currentStep) ? 'bg-primary' : 'bg-muted'
                      }`}
                      data-testid={`step-connector-${index}`}
                    />
                  )}
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                      isCompleted 
                        ? 'bg-primary text-primary-foreground' 
                        : isCurrent 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    } ${index > 0 ? 'mx-2' : ''} ${index < steps.length - 1 ? 'mx-2' : ''}`}
                    data-testid={`step-indicator-${stepNumber}`}
                  >
                    {isCompleted ? <Check className="h-5 w-5" /> : stepNumber}
                  </div>
                  {index < steps.length - 1 && (
                    <div 
                      className={`flex-1 h-0.5 transition-colors ${
                        isCompleted ? 'bg-primary' : 'bg-muted'
                      }`}
                      data-testid={`step-connector-${stepNumber}`}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Labels row */}
        <div className="flex">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCurrent = stepNumber === currentStep;
            
            return (
              <div key={index} className="flex-1 flex justify-center">
                <span 
                  className={`text-sm font-medium ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`} 
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
  );
}
