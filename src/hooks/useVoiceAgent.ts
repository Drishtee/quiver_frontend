/**
 * Convenience hook for using the Voice Agent
 * Wraps VoiceAgentContext with additional helpers
 */

import { useCallback, useEffect } from 'react';
import { useVoiceAgentContext } from '../contexts/VoiceAgentContext';
import type { ScreenType } from '../config/formFieldMappings';

interface UseVoiceAgentOptions {
  screen?: ScreenType;
  autoActivate?: boolean;
}

export function useVoiceAgent(options: UseVoiceAgentOptions = {}) {
  const { screen, autoActivate = false } = options;

  const context = useVoiceAgentContext();

  // Set current screen when provided
  useEffect(() => {
    if (screen) {
      context.setCurrentScreen(screen);
    }
  }, [screen, context.setCurrentScreen]);

  // Auto-activate if requested
  useEffect(() => {
    if (autoActivate && !context.isActive && context.isSupported) {
      context.activate();
    }
  }, [autoActivate, context.isActive, context.isSupported, context.activate]);

  // Toggle listening state
  const toggleListening = useCallback(() => {
    if (context.isListening) {
      context.stopListening();
    } else {
      context.startListening();
    }
  }, [context.isListening, context.startListening, context.stopListening]);

  // Get the latest message from the conversation
  const getLatestMessage = useCallback(() => {
    const history = context.conversationHistory;
    return history.length > 0 ? history[history.length - 1] : null;
  }, [context.conversationHistory]);

  // Get the latest agent message
  const getLatestAgentMessage = useCallback(() => {
    const history = context.conversationHistory;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].type === 'agent') {
        return history[i];
      }
    }
    return null;
  }, [context.conversationHistory]);

  // Get all extracted fields from the conversation
  const getAllExtractedFields = useCallback(() => {
    const fields: Record<string, any> = {};
    for (const message of context.conversationHistory) {
      if (message.extractedFields) {
        for (const field of message.extractedFields) {
          fields[field.fieldKey] = field.value;
        }
      }
    }
    return fields;
  }, [context.conversationHistory]);

  // Check if a specific field has been filled via voice
  const isFieldFilled = useCallback((fieldKey: string) => {
    return fieldKey in context.filledFields;
  }, [context.filledFields]);

  // Get field value filled via voice
  const getFieldValue = useCallback((fieldKey: string) => {
    return context.filledFields[fieldKey];
  }, [context.filledFields]);

  // Get conversation message count
  const messageCount = context.conversationHistory.length;

  // Check if voice agent is ready to use
  const isReady = context.isSupported && context.isActive;

  // Check if voice agent is busy (processing or speaking)
  const isBusy = context.isProcessing || context.isSpeaking;

  // Get current status string
  const getStatus = useCallback(() => {
    if (!context.isSupported) return 'unsupported';
    if (!context.isActive) return 'inactive';
    if (context.isProcessing) return 'processing';
    if (context.isSpeaking) return 'speaking';
    if (context.isListening) return 'listening';
    return 'ready';
  }, [
    context.isSupported,
    context.isActive,
    context.isProcessing,
    context.isSpeaking,
    context.isListening
  ]);

  return {
    // State
    isActive: context.isActive,
    isListening: context.isListening,
    isSpeaking: context.isSpeaking,
    isProcessing: context.isProcessing,
    isExpanded: context.isExpanded,
    isSupported: context.isSupported,
    isReady,
    isBusy,
    transcript: context.transcript,
    interimTranscript: context.interimTranscript,
    conversationHistory: context.conversationHistory,
    filledFields: context.filledFields,
    error: context.error,
    currentScreen: context.currentScreen,
    messageCount,

    // Actions
    activate: context.activate,
    deactivate: context.deactivate,
    toggle: context.toggle,
    expand: context.expand,
    collapse: context.collapse,
    toggleExpanded: context.toggleExpanded,
    startListening: context.startListening,
    stopListening: context.stopListening,
    toggleListening,
    setCurrentScreen: context.setCurrentScreen,
    clearConversation: context.clearConversation,
    clearError: context.clearError,
    processText: context.processText,

    // Helpers
    getLatestMessage,
    getLatestAgentMessage,
    getAllExtractedFields,
    isFieldFilled,
    getFieldValue,
    getStatus
  };
}

export default useVoiceAgent;
