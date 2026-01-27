import { useState, useCallback, useRef, useEffect } from 'react';
import { onboardingStorage, journeyStorage } from '../utils/storage';
import { bulkUpdateFields } from '../services/api';

interface FieldUpdate {
  key: string;
  value: any;
  source: 'ui' | 'voice' | 'text';
}

interface UseAutoSaveOptions {
  sessionId: string | null;
  debounceMs?: number;
  syncIntervalMs?: number;
  onSaveStart?: () => void;
  onSaveComplete?: () => void;
  onSaveError?: (error: Error) => void;
}

interface UseAutoSaveReturn {
  saveField: (key: string, value: any, source?: 'ui' | 'voice' | 'text') => void;
  saveFields: (fields: Record<string, any>, source?: 'ui' | 'voice' | 'text') => void;
  isSaving: boolean;
  lastSaved: Date | null;
  pendingChanges: number;
  forceSave: () => Promise<void>;
  isOnline: boolean;
}

export const useAutoSave = ({
  sessionId,
  debounceMs = 500,
  syncIntervalMs = 5000,
  onSaveStart,
  onSaveComplete,
  onSaveError
}: UseAutoSaveOptions): UseAutoSaveReturn => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const pendingUpdates = useRef<Map<string, FieldUpdate>>(new Map());
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const syncTimer = useRef<NodeJS.Timeout | null>(null);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync pending changes to API
  const syncToServer = useCallback(async () => {
    if (!sessionId || pendingUpdates.current.size === 0) return;

    const updates = Array.from(pendingUpdates.current.values());
    pendingUpdates.current.clear();
    setPendingChanges(0);

    setIsSaving(true);
    onSaveStart?.();

    try {
      if (isOnline) {
        await bulkUpdateFields(
          sessionId,
          updates.map(u => ({ key: u.key, value: u.value, source: u.source }))
        );
        setLastSaved(new Date());
        onSaveComplete?.();
      } else {
        // Store for later sync when offline
        updates.forEach(u => {
          journeyStorage.addPendingChange(u.key, u.value);
        });
      }
    } catch (error) {
      // Re-add failed updates to pending
      updates.forEach(u => {
        pendingUpdates.current.set(u.key, u);
      });
      setPendingChanges(pendingUpdates.current.size);
      onSaveError?.(error instanceof Error ? error : new Error('Failed to save'));
    } finally {
      setIsSaving(false);
    }
  }, [sessionId, isOnline, onSaveStart, onSaveComplete, onSaveError]);

  // Set up periodic sync
  useEffect(() => {
    if (syncIntervalMs > 0) {
      syncTimer.current = setInterval(() => {
        if (pendingUpdates.current.size > 0 && isOnline) {
          syncToServer();
        }
      }, syncIntervalMs);
    }

    return () => {
      if (syncTimer.current) {
        clearInterval(syncTimer.current);
      }
    };
  }, [syncIntervalMs, isOnline, syncToServer]);

  // Save a single field
  const saveField = useCallback((key: string, value: any, source: 'ui' | 'voice' | 'text' = 'ui') => {
    // Save to localStorage immediately
    onboardingStorage.updateField(key, value);

    // Add to pending updates
    pendingUpdates.current.set(key, { key, value, source });
    setPendingChanges(pendingUpdates.current.size);

    // Debounce server sync
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      syncToServer();
    }, debounceMs);
  }, [debounceMs, syncToServer]);

  // Save multiple fields
  const saveFields = useCallback((fields: Record<string, any>, source: 'ui' | 'voice' | 'text' = 'ui') => {
    // Save to localStorage immediately
    onboardingStorage.updateFields(fields);

    // Add all to pending updates
    Object.entries(fields).forEach(([key, value]) => {
      pendingUpdates.current.set(key, { key, value, source });
    });
    setPendingChanges(pendingUpdates.current.size);

    // Debounce server sync
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      syncToServer();
    }, debounceMs);
  }, [debounceMs, syncToServer]);

  // Force immediate save
  const forceSave = useCallback(async () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    await syncToServer();
  }, [syncToServer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      // Save any pending changes before unmount
      if (pendingUpdates.current.size > 0) {
        const updates = Array.from(pendingUpdates.current.values());
        updates.forEach(u => {
          onboardingStorage.updateField(u.key, u.value);
        });
      }
    };
  }, []);

  // Sync when coming back online
  useEffect(() => {
    if (isOnline) {
      // Check for offline pending changes
      const offlinePending = journeyStorage.getPendingChanges();
      if (offlinePending.length > 0 && sessionId) {
        offlinePending.forEach(p => {
          pendingUpdates.current.set(p.key, { key: p.key, value: p.value, source: 'ui' });
        });
        journeyStorage.clearPendingChanges();
        syncToServer();
      }
    }
  }, [isOnline, sessionId, syncToServer]);

  return {
    saveField,
    saveFields,
    isSaving,
    lastSaved,
    pendingChanges,
    forceSave,
    isOnline
  };
};

export default useAutoSave;
