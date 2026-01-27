/**
 * useRealtimeVoiceAssistant
 * A convenience hook for using the Realtime Voice Assistant in components
 */

import { useCallback, useEffect } from 'react';
import { useRealtimeVoice } from '../contexts/RealtimeVoiceContext';
import type { ScreenType } from '../config/formFieldMappings';

interface UseRealtimeVoiceAssistantOptions {
  screen?: ScreenType;
  autoConnect?: boolean;
  onFieldCollected?: (field: string, value: any) => void;
  onError?: (error: string) => void;
}

export function useRealtimeVoiceAssistant(options: UseRealtimeVoiceAssistantOptions = {}) {
  const {
    screen,
    autoConnect = false,
    onFieldCollected,
    onError
  } = options;

  const voice = useRealtimeVoice();

  // Set screen when provided
  useEffect(() => {
    if (screen) {
      voice.setCurrentScreen(screen);
    }
  }, [screen, voice.setCurrentScreen]);

  // Auto-connect if requested
  useEffect(() => {
    if (autoConnect && !voice.isActive) {
      voice.activate();
      voice.connect();
    }
  }, [autoConnect, voice.isActive, voice.activate, voice.connect]);

  // Handle field collection callback
  useEffect(() => {
    if (onFieldCollected && voice.collectedFields.length > 0) {
      const latestField = voice.collectedFields[voice.collectedFields.length - 1];
      onFieldCollected(latestField.field, latestField.value);
    }
  }, [voice.collectedFields, onFieldCollected]);

  // Handle error callback
  useEffect(() => {
    if (onError && voice.error) {
      onError(voice.error);
    }
  }, [voice.error, onError]);

  // Get collected value for a specific field
  const getCollectedValue = useCallback((fieldKey: string) => {
    const field = voice.collectedFields.find(f => f.field === fieldKey);
    return field?.value;
  }, [voice.collectedFields]);

  // Check if a field has been collected
  const hasField = useCallback((fieldKey: string) => {
    return voice.collectedFields.some(f => f.field === fieldKey);
  }, [voice.collectedFields]);

  // Check if a field is confirmed
  const isFieldConfirmed = useCallback((fieldKey: string) => {
    const field = voice.collectedFields.find(f => f.field === fieldKey);
    return field?.confirmed ?? false;
  }, [voice.collectedFields]);

  // Get all collected fields as a flat object
  const getCollectedFieldsObject = useCallback(() => {
    return voice.collectedFields.reduce((acc, field) => {
      acc[field.field] = field.value;
      return acc;
    }, {} as Record<string, any>);
  }, [voice.collectedFields]);

  // Get only confirmed fields
  const getConfirmedFieldsObject = useCallback(() => {
    return voice.collectedFields
      .filter(f => f.confirmed)
      .reduce((acc, field) => {
        acc[field.field] = field.value;
        return acc;
      }, {} as Record<string, any>);
  }, [voice.collectedFields]);

  // Start voice session
  const startVoice = useCallback(() => {
    voice.activate();
    voice.connect();
  }, [voice.activate, voice.connect]);

  // Stop voice session
  const stopVoice = useCallback(() => {
    voice.deactivate();
  }, [voice.deactivate]);

  return {
    // State
    isActive: voice.isActive,
    isConnected: voice.connectionStatus === 'connected',
    isConnecting: voice.connectionStatus === 'connecting',
    isRecording: voice.isRecording,
    isSpeaking: voice.isSpeaking,
    isMuted: voice.isMuted,
    error: voice.error,

    // Collected data
    collectedFields: voice.collectedFields,
    conversationHistory: voice.conversationHistory,
    audioRecordings: voice.audioRecordings,

    // Field utilities
    getCollectedValue,
    hasField,
    isFieldConfirmed,
    getCollectedFieldsObject,
    getConfirmedFieldsObject,

    // Actions
    startVoice,
    stopVoice,
    toggleMute: voice.toggleMute,
    sendMessage: voice.sendTextMessage,
    confirmField: voice.confirmField,
    editField: voice.editField,
    applyToForm: voice.applyFieldsToForm,
    clearError: voice.clearError,

    // Recording actions
    downloadRecording: voice.downloadRecording,
    clearRecordings: voice.clearRecordings
  };
}

export default useRealtimeVoiceAssistant;
