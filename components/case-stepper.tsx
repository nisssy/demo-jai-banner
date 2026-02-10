"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CaseStepperProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

const steps = [
  { id: 1, name: "提案" },
  { id: 2, name: "掲載" },
];

export function CaseStepper({ currentStep, onStepClick }: CaseStepperProps) {
  return (
    <nav aria-label="進行状況" className="mb-8">
      <ol className="flex items-center justify-center gap-8">
        {steps.map((step, index) => (
          <li key={step.id} className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onStepClick?.(step.id)}
              disabled={!onStepClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-2 transition-colors",
                onStepClick && "cursor-pointer hover:bg-muted",
                !onStepClick && "cursor-default"
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                  currentStep > step.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : currentStep === step.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30 bg-background text-muted-foreground"
                )}
              >
                {currentStep > step.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  step.id
                )}
              </span>
              <span
                className={cn(
                  "text-sm font-medium",
                  currentStep >= step.id
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {step.name}
              </span>
            </button>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-16",
                  currentStep > step.id ? "bg-primary" : "bg-muted-foreground/30"
                )}
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
