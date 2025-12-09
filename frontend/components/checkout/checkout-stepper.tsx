"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  label: string;
}

interface CheckoutStepperProps {
  steps: Step[];
  currentStep: number;
}

export function CheckoutStepper({ steps, currentStep }: CheckoutStepperProps) {
  return (
    <div className="mb-8 bg-white border border-gray-200 rounded-lg p-4 md:p-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all font-semibold",
                  index < currentStep
                    ? "bg-primary border-primary text-white shadow-md"
                    : index === currentStep
                    ? "border-primary bg-primary/10 text-primary scale-110"
                    : "border-gray-300 bg-gray-50 text-gray-400"
                )}
              >
                {index < currentStep ? (
                  <Check className="h-5 w-5 md:h-6 md:w-6" />
                ) : (
                  <span className="text-sm md:text-base">{index + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs md:text-sm font-medium text-center",
                  index <= currentStep ? "text-gray-900" : "text-gray-400"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-1 flex-1 mx-2 md:mx-4 transition-all rounded-full",
                  index < currentStep ? "bg-primary" : "bg-gray-200"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

