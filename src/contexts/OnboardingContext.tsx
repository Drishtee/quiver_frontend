import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { onboardingStorage, journeyStorage } from '../utils/storage';
import { useAutoSave } from '../hooks/useAutoSave';

// Step definitions
export const ONBOARDING_STEPS = [
  { id: 0, key: 'consent', name: 'Consent', nameHi: 'सहमति', nameAs: 'সন্মতি' },
  { id: 1, key: 'profile', name: 'Profile', nameHi: 'प्रोफाइल', nameAs: 'প্ৰ\'ফাইল' },
  { id: 2, key: 'industry', name: 'Business Details', nameHi: 'व्यवसाय विवरण', nameAs: 'ব্যৱসায়ৰ বিৱৰণ' },
  { id: 3, key: 'questionnaire', name: 'Questionnaire', nameHi: 'प्रश्नावली', nameAs: 'প্ৰশ্নাৱলী' },
  { id: 4, key: 'equity', name: 'Partnership', nameHi: 'साझेदारी', nameAs: 'অংশীদাৰিত্ব' },
  { id: 5, key: 'review', name: 'Review', nameHi: 'समीक्षा', nameAs: 'পৰ্যালোচনা' }
] as const;

export type StepKey = typeof ONBOARDING_STEPS[number]['key'];

interface ConsentRecord {
  key: string;
  given: boolean;
  timestamp: string | null;
}

interface OnboardingState {
  sessionId: string | null;
  currentStep: number;
  completedSteps: number[];
  formData: Record<string, any>;
  lastSaved: Date | null;
  isSaving: boolean;
  isOnline: boolean;
  consentGiven: boolean;
  consentTimestamp: Date | null;
  consents: Record<string, ConsentRecord>;
}

interface OnboardingContextValue extends OnboardingState {
  // Field operations
  setField: (key: string, value: any) => void;
  setFields: (fields: Record<string, any>) => void;
  getField: <T>(key: string, defaultValue: T) => T;

  // Navigation
  goToStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  canGoToStep: (step: number) => boolean;

  // Progress
  markStepComplete: (step: number) => void;
  isStepComplete: (step: number) => boolean;
  getCompletionPercentage: () => number;

  // Session
  setSessionId: (id: string) => void;

  // Consent
  recordConsent: (consentKey: string, timestamp: string) => void;
  getConsent: (consentKey: string) => ConsentRecord | undefined;
  hasAllConsents: (requiredKeys: string[]) => boolean;

  // Persistence
  loadSavedProgress: () => boolean;
  clearProgress: () => void;
  forceSave: () => Promise<void>;

  // Step info
  steps: typeof ONBOARDING_STEPS;
  currentStepInfo: typeof ONBOARDING_STEPS[number] | undefined;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const [state, setState] = useState<OnboardingState>(() => {
    const stored = onboardingStorage.getData();
    return {
      sessionId: stored.sessionId,
      currentStep: stored.currentStep,
      completedSteps: stored.completedSteps,
      formData: stored.formData,
      lastSaved: stored.lastSaved ? new Date(stored.lastSaved) : null,
      isSaving: false,
      isOnline: navigator.onLine,
      consentGiven: stored.consentGiven,
      consentTimestamp: stored.consentTimestamp ? new Date(stored.consentTimestamp) : null,
      consents: (stored as any).consents || {}
    };
  });

  const autoSave = useAutoSave({
    sessionId: state.sessionId,
    debounceMs: 500,
    syncIntervalMs: 5000,
    onSaveStart: () => setState(prev => ({ ...prev, isSaving: true })),
    onSaveComplete: () => setState(prev => ({ ...prev, isSaving: false, lastSaved: new Date() })),
    onSaveError: (error) => {
      console.error('Auto-save error:', error);
      setState(prev => ({ ...prev, isSaving: false }));
    }
  });

  // Update online status from autoSave hook
  useEffect(() => {
    setState(prev => ({ ...prev, isOnline: autoSave.isOnline, isSaving: autoSave.isSaving }));
  }, [autoSave.isOnline, autoSave.isSaving]);

  // Set a single field
  const setField = useCallback((key: string, value: any) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [key]: value }
    }));
    autoSave.saveField(key, value);
  }, [autoSave]);

  // Set multiple fields
  const setFields = useCallback((fields: Record<string, any>) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...fields }
    }));
    autoSave.saveFields(fields);
  }, [autoSave]);

  // Get a field value
  const getField = useCallback(<T,>(key: string, defaultValue: T): T => {
    return (state.formData[key] as T) ?? defaultValue;
  }, [state.formData]);

  // Navigation
  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < ONBOARDING_STEPS.length) {
      setState(prev => ({ ...prev, currentStep: step }));
      onboardingStorage.setCurrentStep(step);
      journeyStorage.setLastStep(step);
    }
  }, []);

  const nextStep = useCallback(() => {
    goToStep(state.currentStep + 1);
  }, [state.currentStep, goToStep]);

  const previousStep = useCallback(() => {
    goToStep(state.currentStep - 1);
  }, [state.currentStep, goToStep]);

  const canGoToStep = useCallback((step: number) => {
    // Can go to any completed step or the next incomplete step
    if (step <= state.currentStep) return true;
    if (step === state.currentStep + 1 && state.completedSteps.includes(state.currentStep)) return true;
    return state.completedSteps.includes(step - 1);
  }, [state.currentStep, state.completedSteps]);

  // Progress tracking
  const markStepComplete = useCallback((step: number) => {
    setState(prev => {
      if (prev.completedSteps.includes(step)) return prev;
      const newCompleted = [...prev.completedSteps, step].sort((a, b) => a - b);
      onboardingStorage.completeStep(step);
      return { ...prev, completedSteps: newCompleted };
    });
  }, []);

  const isStepComplete = useCallback((step: number) => {
    return state.completedSteps.includes(step);
  }, [state.completedSteps]);

  const getCompletionPercentage = useCallback(() => {
    return Math.round((state.completedSteps.length / ONBOARDING_STEPS.length) * 100);
  }, [state.completedSteps]);

  // Session management
  const setSessionId = useCallback((id: string) => {
    setState(prev => ({ ...prev, sessionId: id }));
    onboardingStorage.setSessionId(id);
  }, []);

  // Consent - Enhanced to support multiple consent items with timestamps
  const recordConsent = useCallback((consentKey: string, timestamp: string) => {
    const consentRecord: ConsentRecord = {
      key: consentKey,
      given: true,
      timestamp
    };

    setState(prev => {
      const newConsents = {
        ...prev.consents,
        [consentKey]: consentRecord
      };

      // Also set legacy consent flags for backwards compatibility
      const allConsentsGiven = Object.keys(newConsents).length >= 3;

      return {
        ...prev,
        consents: newConsents,
        consentGiven: allConsentsGiven,
        consentTimestamp: allConsentsGiven ? new Date() : prev.consentTimestamp
      };
    });

    // Save to storage
    onboardingStorage.recordConsent(true);

    // Save individual consent to API
    if (state.sessionId) {
      autoSave.saveFields({
        [`consent_${consentKey}`]: true,
        [`consent_${consentKey}_timestamp`]: timestamp
      });
    }
  }, [state.sessionId, autoSave]);

  const getConsent = useCallback((consentKey: string): ConsentRecord | undefined => {
    return state.consents[consentKey];
  }, [state.consents]);

  const hasAllConsents = useCallback((requiredKeys: string[]): boolean => {
    return requiredKeys.every(key => state.consents[key]?.given === true);
  }, [state.consents]);

  // Persistence
  const loadSavedProgress = useCallback((): boolean => {
    const stored = onboardingStorage.getData();
    if (stored.sessionId || Object.keys(stored.formData).length > 0) {
      setState({
        sessionId: stored.sessionId,
        currentStep: stored.currentStep,
        completedSteps: stored.completedSteps,
        formData: stored.formData,
        lastSaved: stored.lastSaved ? new Date(stored.lastSaved) : null,
        isSaving: false,
        isOnline: navigator.onLine,
        consentGiven: stored.consentGiven,
        consentTimestamp: stored.consentTimestamp ? new Date(stored.consentTimestamp) : null,
        consents: (stored as any).consents || {}
      });
      return true;
    }
    return false;
  }, []);

  const clearProgress = useCallback(() => {
    onboardingStorage.clear();
    journeyStorage.clearPendingChanges();
    setState({
      sessionId: null,
      currentStep: 0,
      completedSteps: [],
      formData: {},
      lastSaved: null,
      isSaving: false,
      isOnline: navigator.onLine,
      consentGiven: false,
      consentTimestamp: null,
      consents: {}
    });
  }, []);

  const forceSave = useCallback(async () => {
    await autoSave.forceSave();
  }, [autoSave]);

  // Current step info
  const currentStepInfo = useMemo(() => {
    return ONBOARDING_STEPS.find(s => s.id === state.currentStep);
  }, [state.currentStep]);

  const value: OnboardingContextValue = {
    ...state,
    setField,
    setFields,
    getField,
    goToStep,
    nextStep,
    previousStep,
    canGoToStep,
    markStepComplete,
    isStepComplete,
    getCompletionPercentage,
    setSessionId,
    recordConsent,
    getConsent,
    hasAllConsents,
    loadSavedProgress,
    clearProgress,
    forceSave,
    steps: ONBOARDING_STEPS,
    currentStepInfo
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

export default OnboardingContext;
