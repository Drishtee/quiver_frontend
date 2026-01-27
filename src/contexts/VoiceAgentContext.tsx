import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useOnboarding } from './OnboardingContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import {
  processTranscript,
  getGreeting,
  type SupportedLanguage as AILanguage,
  type ExtractedField
} from '../services/placeholderAI';
import type { ScreenType } from '../config/formFieldMappings';

type SpeechLanguage = 'en-IN' | 'hi-IN' | 'as-IN';

interface ConversationMessage {
  id: string;
  type: 'user' | 'agent';
  text: string;
  timestamp: Date;
  extractedFields?: ExtractedField[];
}

interface VoiceAgentState {
  isActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  isExpanded: boolean;
  transcript: string;
  interimTranscript: string;
  conversationHistory: ConversationMessage[];
  currentScreen: ScreenType | null;
  filledFields: Record<string, any>;
  error: string | null;
  isSupported: boolean;
}

interface VoiceAgentContextValue extends VoiceAgentState {
  activate: () => void;
  deactivate: () => void;
  toggle: () => void;
  expand: () => void;
  collapse: () => void;
  toggleExpanded: () => void;
  startListening: () => void;
  stopListening: () => void;
  setCurrentScreen: (screen: ScreenType | null) => void;
  clearConversation: () => void;
  clearError: () => void;
  processText: (text: string) => void;
}

const VoiceAgentContext = createContext<VoiceAgentContextValue | undefined>(undefined);

interface VoiceAgentProviderProps {
  children: React.ReactNode;
}

// Map app language to speech recognition language
function mapToSpeechLanguage(lang: string): SpeechLanguage {
  switch (lang) {
    case 'hi':
      return 'hi-IN';
    case 'as':
      return 'as-IN';
    default:
      return 'en-IN';
  }
}

// Map app language to AI language
function mapToAILanguage(lang: string): AILanguage {
  switch (lang) {
    case 'hi':
      return 'hi';
    case 'as':
      return 'as';
    default:
      return 'en';
  }
}

export const VoiceAgentProvider: React.FC<VoiceAgentProviderProps> = ({ children }) => {
  const onboarding = useOnboarding();
  const { currentLanguage } = useLanguage();

  const [state, setState] = useState<VoiceAgentState>({
    isActive: false,
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
    isExpanded: false,
    transcript: '',
    interimTranscript: '',
    conversationHistory: [],
    currentScreen: null,
    filledFields: {},
    error: null,
    isSupported: true
  });

  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle speech recognition result
  const handleSpeechResult = useCallback((transcript: string, isFinal: boolean) => {
    if (isFinal && transcript.trim()) {
      // Add user message to conversation
      const userMessage: ConversationMessage = {
        id: Date.now().toString(),
        type: 'user',
        text: transcript.trim(),
        timestamp: new Date()
      };

      setState(prev => ({
        ...prev,
        transcript: transcript.trim(),
        interimTranscript: '',
        conversationHistory: [...prev.conversationHistory, userMessage],
        isProcessing: true
      }));

      // Process the transcript
      processUserInput(transcript.trim());
    } else if (!isFinal) {
      setState(prev => ({
        ...prev,
        interimTranscript: transcript
      }));
    }
  }, []);

  // Process user input and extract fields
  const processUserInput = useCallback((text: string) => {
    const currentScreen = state.currentScreen;
    if (!currentScreen) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: 'No active screen for voice input'
      }));
      return;
    }

    const aiLanguage = mapToAILanguage(currentLanguage);
    const response = processTranscript(text, currentScreen, aiLanguage);

    // Update filled fields in onboarding context
    if (response.extractedFields.length > 0) {
      const fieldsToUpdate: Record<string, any> = {};
      for (const field of response.extractedFields) {
        fieldsToUpdate[field.fieldKey] = field.value;
      }

      // Update onboarding context
      onboarding.setFields(fieldsToUpdate);

      // Update local state
      setState(prev => ({
        ...prev,
        filledFields: { ...prev.filledFields, ...fieldsToUpdate }
      }));
    }

    // Add agent response to conversation
    const agentMessage: ConversationMessage = {
      id: (Date.now() + 1).toString(),
      type: 'agent',
      text: response.spokenResponse,
      timestamp: new Date(),
      extractedFields: response.extractedFields
    };

    setState(prev => ({
      ...prev,
      conversationHistory: [...prev.conversationHistory, agentMessage],
      isProcessing: false
    }));

    // Speak the response
    speakResponse(response.spokenResponse);
  }, [state.currentScreen, currentLanguage, onboarding]);

  // Process text input (for manual input)
  const processText = useCallback((text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: ConversationMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: text.trim(),
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      transcript: text.trim(),
      conversationHistory: [...prev.conversationHistory, userMessage],
      isProcessing: true
    }));

    // Process after a short delay
    setTimeout(() => processUserInput(text.trim()), 100);
  }, [processUserInput]);

  // Speak response using Web Speech API
  const speakResponse = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = mapToSpeechLanguage(currentLanguage);
      utterance.rate = 0.9;

      utterance.onstart = () => {
        setState(prev => ({ ...prev, isSpeaking: true }));
      };

      utterance.onend = () => {
        setState(prev => ({ ...prev, isSpeaking: false }));
      };

      utterance.onerror = () => {
        setState(prev => ({ ...prev, isSpeaking: false }));
      };

      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  }, [currentLanguage]);

  // Handle speech recognition error
  const handleSpeechError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      error,
      isListening: false
    }));
  }, []);

  // Initialize speech recognition hook
  const speechRecognition = useSpeechRecognition({
    language: mapToSpeechLanguage(currentLanguage),
    continuous: true,
    interimResults: true,
    onResult: handleSpeechResult,
    onError: handleSpeechError,
    onStart: () => setState(prev => ({ ...prev, isListening: true })),
    onEnd: () => setState(prev => ({ ...prev, isListening: false }))
  });

  // Update supported status
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isSupported: speechRecognition.isSupported
    }));
  }, [speechRecognition.isSupported]);

  // Update speech recognition language when app language changes
  useEffect(() => {
    speechRecognition.setLanguage(mapToSpeechLanguage(currentLanguage));
  }, [currentLanguage, speechRecognition]);

  // Activate voice agent
  const activate = useCallback(() => {
    setState(prev => ({ ...prev, isActive: true, isExpanded: true }));

    // Add greeting to conversation
    const aiLanguage = mapToAILanguage(currentLanguage);
    const greeting = getGreeting(aiLanguage);

    const greetingMessage: ConversationMessage = {
      id: Date.now().toString(),
      type: 'agent',
      text: greeting,
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      conversationHistory: prev.conversationHistory.length === 0
        ? [greetingMessage]
        : prev.conversationHistory
    }));

    // Speak greeting if no conversation exists
    if (state.conversationHistory.length === 0) {
      speakResponse(greeting);
    }
  }, [currentLanguage, speakResponse, state.conversationHistory.length]);

  // Deactivate voice agent
  const deactivate = useCallback(() => {
    // Stop listening if active
    if (state.isListening) {
      speechRecognition.stopListening();
    }

    // Cancel any ongoing speech
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setState(prev => ({
      ...prev,
      isActive: false,
      isExpanded: false,
      isListening: false,
      isSpeaking: false,
      interimTranscript: ''
    }));
  }, [state.isListening, speechRecognition]);

  // Toggle voice agent
  const toggle = useCallback(() => {
    if (state.isActive) {
      deactivate();
    } else {
      activate();
    }
  }, [state.isActive, activate, deactivate]);

  // Expand panel
  const expand = useCallback(() => {
    setState(prev => ({ ...prev, isExpanded: true }));
    if (!state.isActive) {
      activate();
    }
  }, [state.isActive, activate]);

  // Collapse panel
  const collapse = useCallback(() => {
    setState(prev => ({ ...prev, isExpanded: false }));
  }, []);

  // Toggle expanded
  const toggleExpanded = useCallback(() => {
    if (state.isExpanded) {
      collapse();
    } else {
      expand();
    }
  }, [state.isExpanded, expand, collapse]);

  // Start listening
  const startListening = useCallback(() => {
    if (!state.isActive) {
      activate();
    }
    speechRecognition.startListening();
  }, [state.isActive, activate, speechRecognition]);

  // Stop listening
  const stopListening = useCallback(() => {
    speechRecognition.stopListening();
  }, [speechRecognition]);

  // Set current screen
  const setCurrentScreen = useCallback((screen: ScreenType | null) => {
    setState(prev => ({ ...prev, currentScreen: screen }));
  }, []);

  // Clear conversation
  const clearConversation = useCallback(() => {
    setState(prev => ({
      ...prev,
      conversationHistory: [],
      transcript: '',
      interimTranscript: '',
      filledFields: {}
    }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const value: VoiceAgentContextValue = {
    ...state,
    activate,
    deactivate,
    toggle,
    expand,
    collapse,
    toggleExpanded,
    startListening,
    stopListening,
    setCurrentScreen,
    clearConversation,
    clearError,
    processText
  };

  return (
    <VoiceAgentContext.Provider value={value}>
      {children}
    </VoiceAgentContext.Provider>
  );
};

export const useVoiceAgentContext = () => {
  const context = useContext(VoiceAgentContext);
  if (!context) {
    throw new Error('useVoiceAgentContext must be used within a VoiceAgentProvider');
  }
  return context;
};

export default VoiceAgentContext;
