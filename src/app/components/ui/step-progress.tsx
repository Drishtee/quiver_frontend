import * as React from "react";
import { motion } from "motion/react";
import { cn } from "./utils";

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  showStepCount?: boolean;
  showLabels?: boolean;
  labels?: string[];
  variant?: "dots" | "bar" | "segments";
  className?: string;
}

export function StepProgress({
  currentStep,
  totalSteps,
  showStepCount = true,
  showLabels = false,
  labels = [],
  variant = "bar",
  className,
}: StepProgressProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className={cn("w-full", className)}>
      {/* Step count display */}
      {showStepCount && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(progress)}% complete
          </span>
        </div>
      )}

      {/* Progress visualization */}
      {variant === "bar" && (
        <ProgressBar progress={progress} />
      )}

      {variant === "dots" && (
        <ProgressDots
          currentStep={currentStep}
          totalSteps={totalSteps}
          labels={showLabels ? labels : undefined}
        />
      )}

      {variant === "segments" && (
        <ProgressSegments
          currentStep={currentStep}
          totalSteps={totalSteps}
        />
      )}
    </div>
  );
}

interface ProgressBarProps {
  progress: number;
  className?: string;
}

function ProgressBar({ progress, className }: ProgressBarProps) {
  return (
    <div
      className={cn(
        "h-2 w-full bg-muted rounded-full overflow-hidden",
        className
      )}
    >
      <motion.div
        className="h-full bg-primary rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    </div>
  );
}

interface ProgressDotsProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  className?: string;
}

function ProgressDots({
  currentStep,
  totalSteps,
  labels,
  className,
}: ProgressDotsProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;

        return (
          <div key={index} className="flex flex-col items-center">
            <motion.div
              className={cn(
                "size-3 rounded-full transition-colors",
                isCompleted && "bg-primary",
                isCurrent && "bg-primary ring-4 ring-primary/20",
                !isCompleted && !isCurrent && "bg-muted"
              )}
              initial={false}
              animate={{
                scale: isCurrent ? 1.2 : 1,
              }}
              transition={{ duration: 0.2 }}
            />
            {labels && labels[index] && (
              <span
                className={cn(
                  "text-xs mt-1 whitespace-nowrap",
                  (isCompleted || isCurrent)
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                {labels[index]}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface ProgressSegmentsProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

function ProgressSegments({
  currentStep,
  totalSteps,
  className,
}: ProgressSegmentsProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber <= currentStep;

        return (
          <motion.div
            key={index}
            className={cn(
              "h-2 flex-1 rounded-full transition-colors",
              isCompleted ? "bg-primary" : "bg-muted"
            )}
            initial={false}
            animate={{
              backgroundColor: isCompleted ? "var(--primary)" : "var(--muted)",
            }}
            transition={{ duration: 0.2 }}
          />
        );
      })}
    </div>
  );
}

// Compact version for inline use
interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function StepIndicator({
  currentStep,
  totalSteps,
  className,
}: StepIndicatorProps) {
  return (
    <span className={cn("text-sm text-muted-foreground", className)}>
      <span className="font-medium text-foreground">{currentStep}</span>
      <span className="mx-1">/</span>
      <span>{totalSteps}</span>
    </span>
  );
}

export { StepProgress as default };
