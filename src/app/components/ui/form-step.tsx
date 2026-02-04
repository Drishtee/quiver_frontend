import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "./utils";
import { Button } from "./button";
import { StepProgress } from "./step-progress";

interface FormStepProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  isNextDisabled?: boolean;
  isBackDisabled?: boolean;
  nextLabel?: string;
  backLabel?: string;
  skipLabel?: string;
  showSkip?: boolean;
  showProgress?: boolean;
  className?: string;
  contentClassName?: string;
  isLastStep?: boolean;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export function FormStep({
  children,
  title,
  description,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onSkip,
  isNextDisabled = false,
  isBackDisabled = false,
  nextLabel = "Next",
  backLabel = "Back",
  skipLabel = "Skip",
  showSkip = false,
  showProgress = true,
  className,
  contentClassName,
  isLastStep = false,
  submitLabel = "Submit",
  isSubmitting = false,
}: FormStepProps) {
  return (
    <div
      className={cn(
        "flex flex-col min-h-screen md:min-h-0",
        "bg-white",
        className
      )}
    >
      {/* Progress indicator at top */}
      {showProgress && (
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-200 px-4 py-3 md:px-6">
          <StepProgress
            currentStep={currentStep}
            totalSteps={totalSteps}
            showStepCount
          />
        </div>
      )}

      {/* Main content area */}
      <div
        className={cn(
          "flex-1 flex flex-col px-4 py-6 md:px-6 md:py-8",
          "overflow-y-auto",
          contentClassName
        )}
      >
        {/* Title and description */}
        {(title || description) && (
          <div className="mb-6 md:mb-8">
            {title && (
              <h2 className="text-xl md:text-2xl font-display font-semibold text-gray-900">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-2 text-gray-500 text-sm md:text-base">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons - sticky at bottom on mobile */}
      <div
        className={cn(
          "sticky bottom-0 z-10",
          "bg-white/95 backdrop-blur",
          "border-t border-gray-200",
          "px-4 py-4 md:px-6",
          "pb-safe" // Safe area for notched devices
        )}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Back button */}
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isBackDisabled || currentStep === 1}
            className="min-h-[48px] px-4 md:px-6"
          >
            <ChevronLeft className="size-4 mr-1" />
            <span className="hidden sm:inline">{backLabel}</span>
          </Button>

          {/* Skip button (optional) */}
          {showSkip && onSkip && (
            <Button
              variant="ghost"
              onClick={onSkip}
              className="min-h-[48px] text-gray-500"
            >
              {skipLabel}
            </Button>
          )}

          {/* Spacer */}
          {!showSkip && <div className="flex-1" />}

          {/* Next/Submit button */}
          <Button
            onClick={onNext}
            disabled={isNextDisabled || isSubmitting}
            className={cn(
              "min-h-[48px] px-6 md:px-8",
              isLastStep && "bg-primary hover:bg-primary/90"
            )}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </span>
            ) : (
              <>
                <span>{isLastStep ? submitLabel : nextLabel}</span>
                {!isLastStep && <ChevronRight className="size-4 ml-1" />}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface FormStepContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function FormStepContainer({
  children,
  className,
}: FormStepContainerProps) {
  return (
    <div
      className={cn(
        "w-full max-w-lg mx-auto",
        "space-y-6",
        className
      )}
    >
      {children}
    </div>
  );
}

interface FormStepFieldProps {
  children: React.ReactNode;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export function FormStepField({
  children,
  label,
  description,
  error,
  required,
  className,
}: FormStepFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-base font-medium text-gray-900">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      {children}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export { FormStep as default };
