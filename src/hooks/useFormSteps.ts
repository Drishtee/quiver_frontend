import { useState, useCallback, useMemo } from "react";

export interface FormStepConfig<T = Record<string, unknown>> {
  id: string;
  title?: string;
  description?: string;
  fields: (keyof T)[];
  validate?: (data: Partial<T>) => Record<string, string> | null;
  isOptional?: boolean;
}

export interface UseFormStepsOptions<T> {
  steps: FormStepConfig<T>[];
  initialData?: Partial<T>;
  onStepChange?: (step: number, direction: "next" | "back") => void;
  onComplete?: (data: T) => void;
  validateOnNext?: boolean;
}

export interface UseFormStepsReturn<T> {
  // Current state
  currentStep: number;
  totalSteps: number;
  currentStepConfig: FormStepConfig<T>;
  data: Partial<T>;
  errors: Record<string, string>;
  isFirstStep: boolean;
  isLastStep: boolean;
  progress: number;

  // Navigation
  goToStep: (step: number) => void;
  nextStep: () => boolean;
  prevStep: () => void;
  skipStep: () => void;
  reset: () => void;

  // Data management
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setFieldValues: (values: Partial<T>) => void;
  setFieldError: (field: string, error: string) => void;
  clearErrors: () => void;

  // Validation
  validateCurrentStep: () => boolean;
  validateAll: () => boolean;

  // Helpers
  isStepComplete: (step: number) => boolean;
  getStepData: (step: number) => Partial<T>;
  canGoNext: boolean;
  canGoBack: boolean;
}

export function useFormSteps<T extends Record<string, unknown>>({
  steps,
  initialData = {} as Partial<T>,
  onStepChange,
  onComplete,
  validateOnNext = true,
}: UseFormStepsOptions<T>): UseFormStepsReturn<T> {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<Partial<T>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const totalSteps = steps.length;
  const currentStepConfig = steps[currentStep - 1];
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;
  const progress = (currentStep / totalSteps) * 100;

  // Validate a specific step
  const validateStep = useCallback(
    (stepIndex: number): boolean => {
      const step = steps[stepIndex - 1];
      if (!step || !step.validate) return true;

      const stepData: Partial<T> = {};
      for (const field of step.fields) {
        stepData[field] = data[field];
      }

      const validationErrors = step.validate(stepData);
      if (validationErrors && Object.keys(validationErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...validationErrors }));
        return false;
      }

      // Clear errors for validated fields
      setErrors((prev) => {
        const newErrors = { ...prev };
        for (const field of step.fields) {
          delete newErrors[field as string];
        }
        return newErrors;
      });

      return true;
    },
    [data, steps]
  );

  // Validate current step
  const validateCurrentStep = useCallback(() => {
    return validateStep(currentStep);
  }, [currentStep, validateStep]);

  // Validate all steps
  const validateAll = useCallback((): boolean => {
    let isValid = true;
    for (let i = 1; i <= totalSteps; i++) {
      if (!validateStep(i)) {
        isValid = false;
      }
    }
    return isValid;
  }, [totalSteps, validateStep]);

  // Navigate to specific step
  const goToStep = useCallback(
    (step: number) => {
      if (step < 1 || step > totalSteps) return;

      const direction = step > currentStep ? "next" : "back";
      setCurrentStep(step);
      onStepChange?.(step, direction);
    },
    [currentStep, totalSteps, onStepChange]
  );

  // Go to next step
  const nextStep = useCallback((): boolean => {
    if (isLastStep) {
      if (validateOnNext && !validateCurrentStep()) {
        return false;
      }
      onComplete?.(data as T);
      return true;
    }

    if (validateOnNext && !validateCurrentStep()) {
      return false;
    }

    setCompletedSteps((prev) => new Set(prev).add(currentStep));
    setCurrentStep((prev) => prev + 1);
    onStepChange?.(currentStep + 1, "next");
    return true;
  }, [
    currentStep,
    data,
    isLastStep,
    onComplete,
    onStepChange,
    validateCurrentStep,
    validateOnNext,
  ]);

  // Go to previous step
  const prevStep = useCallback(() => {
    if (isFirstStep) return;
    setCurrentStep((prev) => prev - 1);
    onStepChange?.(currentStep - 1, "back");
  }, [currentStep, isFirstStep, onStepChange]);

  // Skip current step (if optional)
  const skipStep = useCallback(() => {
    if (currentStepConfig?.isOptional && !isLastStep) {
      setCurrentStep((prev) => prev + 1);
      onStepChange?.(currentStep + 1, "next");
    }
  }, [currentStep, currentStepConfig, isLastStep, onStepChange]);

  // Reset form
  const reset = useCallback(() => {
    setCurrentStep(1);
    setData(initialData);
    setErrors({});
    setCompletedSteps(new Set());
  }, [initialData]);

  // Set a single field value
  const setFieldValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setData((prev) => ({ ...prev, [field]: value }));
      // Clear error for this field when value changes
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    },
    []
  );

  // Set multiple field values
  const setFieldValues = useCallback((values: Partial<T>) => {
    setData((prev) => ({ ...prev, ...values }));
    // Clear errors for updated fields
    setErrors((prev) => {
      const newErrors = { ...prev };
      for (const field of Object.keys(values)) {
        delete newErrors[field];
      }
      return newErrors;
    });
  }, []);

  // Set error for a field
  const setFieldError = useCallback((field: string, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Check if a step is complete
  const isStepComplete = useCallback(
    (step: number) => {
      return completedSteps.has(step);
    },
    [completedSteps]
  );

  // Get data for a specific step
  const getStepData = useCallback(
    (step: number): Partial<T> => {
      const stepConfig = steps[step - 1];
      if (!stepConfig) return {};

      const stepData: Partial<T> = {};
      for (const field of stepConfig.fields) {
        stepData[field] = data[field];
      }
      return stepData;
    },
    [data, steps]
  );

  // Computed values
  const canGoNext = useMemo(() => {
    if (!validateOnNext) return true;
    // Check if required fields have values
    const step = currentStepConfig;
    if (!step) return false;

    for (const field of step.fields) {
      const value = data[field];
      if (value === undefined || value === null || value === "") {
        return false;
      }
    }
    return true;
  }, [currentStepConfig, data, validateOnNext]);

  const canGoBack = !isFirstStep;

  return {
    // State
    currentStep,
    totalSteps,
    currentStepConfig,
    data,
    errors,
    isFirstStep,
    isLastStep,
    progress,

    // Navigation
    goToStep,
    nextStep,
    prevStep,
    skipStep,
    reset,

    // Data management
    setFieldValue,
    setFieldValues,
    setFieldError,
    clearErrors,

    // Validation
    validateCurrentStep,
    validateAll,

    // Helpers
    isStepComplete,
    getStepData,
    canGoNext,
    canGoBack,
  };
}

export default useFormSteps;
