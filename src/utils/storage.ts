// LocalStorage utilities with type safety and error handling

const STORAGE_PREFIX = 'quiver_';

export interface StoredOnboardingData {
  phone: string | null;  // Track which phone number this data belongs to
  sessionId: string | null;
  currentStep: number;
  completedSteps: number[];
  formData: Record<string, any>;
  lastSaved: string | null;
  consentGiven: boolean;
  consentTimestamp: string | null;
}

export const storage = {
  // Get item with type safety
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      if (item === null) return defaultValue;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return defaultValue;
    }
  },

  // Set item with serialization
  set<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error);
      return false;
    }
  },

  // Remove item
  remove(key: string): boolean {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
      return false;
    }
  },

  // Check if key exists
  has(key: string): boolean {
    return localStorage.getItem(STORAGE_PREFIX + key) !== null;
  },

  // Clear all quiver-related storage
  clearAll(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
};

// Onboarding-specific storage functions
export const onboardingStorage = {
  // Default onboarding state
  getDefaultData(): StoredOnboardingData {
    return {
      phone: null,
      sessionId: null,
      currentStep: 0,
      completedSteps: [],
      formData: {},
      lastSaved: null,
      consentGiven: false,
      consentTimestamp: null
    };
  },

  // Set phone number for this onboarding session
  setPhone(phone: string): boolean {
    return this.saveData({ phone });
  },

  // Check if data belongs to a specific phone number
  isForPhone(phone: string): boolean {
    const data = this.getData();
    return data.phone === phone;
  },

  // Get full onboarding data
  getData(): StoredOnboardingData {
    return storage.get<StoredOnboardingData>('onboarding', this.getDefaultData());
  },

  // Save full onboarding data
  saveData(data: Partial<StoredOnboardingData>): boolean {
    const existing = this.getData();
    const updated = {
      ...existing,
      ...data,
      lastSaved: new Date().toISOString()
    };
    return storage.set('onboarding', updated);
  },

  // Update a single form field
  updateField(key: string, value: any): boolean {
    const data = this.getData();
    data.formData[key] = value;
    data.lastSaved = new Date().toISOString();
    return storage.set('onboarding', data);
  },

  // Update multiple form fields
  updateFields(fields: Record<string, any>): boolean {
    const data = this.getData();
    data.formData = { ...data.formData, ...fields };
    data.lastSaved = new Date().toISOString();
    return storage.set('onboarding', data);
  },

  // Update step progress
  setCurrentStep(step: number): boolean {
    const data = this.getData();
    data.currentStep = step;
    return storage.set('onboarding', data);
  },

  // Mark a step as completed
  completeStep(step: number): boolean {
    const data = this.getData();
    if (!data.completedSteps.includes(step)) {
      data.completedSteps.push(step);
      data.completedSteps.sort((a, b) => a - b);
    }
    return storage.set('onboarding', data);
  },

  // Set session ID
  setSessionId(sessionId: string): boolean {
    return this.saveData({ sessionId });
  },

  // Record consent
  recordConsent(given: boolean): boolean {
    return this.saveData({
      consentGiven: given,
      consentTimestamp: given ? new Date().toISOString() : null
    });
  },

  // Clear onboarding data
  clear(): boolean {
    return storage.remove('onboarding');
  },

  // Check if there's saved progress
  hasProgress(): boolean {
    const data = this.getData();
    return data.sessionId !== null || Object.keys(data.formData).length > 0;
  },

  // Calculate completion percentage
  getCompletionPercentage(totalSteps: number): number {
    const data = this.getData();
    if (totalSteps === 0) return 0;
    return Math.round((data.completedSteps.length / totalSteps) * 100);
  }
};

// Journey state utilities
export const journeyStorage = {
  // Get the last visited step
  getLastStep(): number {
    return storage.get<number>('last_step', 0);
  },

  // Save the last visited step
  setLastStep(step: number): boolean {
    return storage.set('last_step', step);
  },

  // Get pending changes queue
  getPendingChanges(): Array<{ key: string; value: any; timestamp: string }> {
    return storage.get<Array<{ key: string; value: any; timestamp: string }>>('pending_changes', []);
  },

  // Add a pending change
  addPendingChange(key: string, value: any): boolean {
    const pending = this.getPendingChanges();
    pending.push({ key, value, timestamp: new Date().toISOString() });
    return storage.set('pending_changes', pending);
  },

  // Clear pending changes
  clearPendingChanges(): boolean {
    return storage.remove('pending_changes');
  }
};

export default storage;
