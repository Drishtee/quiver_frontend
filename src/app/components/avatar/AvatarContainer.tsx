import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useAvatarState } from '../../../hooks/useAvatarState';
import { useSpeechRecognition } from '../../../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../../../hooks/useTextToSpeech';
import { useLanguage } from '../../../i18n/LanguageContext';
import { useAIAssistantConfig } from '../../../contexts/AIAssistantConfigContext';
import {
  Mic,
  MicOff,
  X,
  Minimize2,
  Maximize2,
  MessageCircle,
  Send,
  Volume2
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AvatarContainerProps {
  mode?: 'floating' | 'inline' | 'fullscreen';
  onMessage?: (message: string) => void;
  currentScreen?: string;
  formContext?: Record<string, any>;
  onFormFieldFill?: (field: string, value: string) => void;
  className?: string;
}

export const AvatarContainer: React.FC<AvatarContainerProps> = ({
  mode = 'floating',
  onMessage,
  currentScreen,
  formContext,
  onFormFieldFill,
  className = ''
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { getLocalizedValue } = useAIAssistantConfig();
  const [isExpanded, setIsExpanded] = useState(mode !== 'floating');
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const speechLanguage = currentLanguage === 'hi' ? 'hi-IN' :
                         currentLanguage === 'as' ? 'as-IN' : 'en-IN';

  const avatarState = useAvatarState();

  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: sttSupported
  } = useSpeechRecognition({
    language: speechLanguage,
    continuous: false,
    onStart: () => avatarState.startListening(),
    onEnd: () => {
      avatarState.stopListening();
      if (transcript) {
        handleUserMessage(transcript);
      }
    },
    onResult: (text, isFinal) => {
      if (isFinal) {
        handleUserMessage(text);
        resetTranscript();
      }
    }
  });

  const { speak, stop: stopSpeaking, isSpeaking, isSupported: ttsSupported } = useTextToSpeech({
    language: speechLanguage,
    onStart: () => avatarState.startTalking(),
    onEnd: () => avatarState.stopTalking()
  });

  // Greet on mount
  useEffect(() => {
    if (mode !== 'floating' || isExpanded) {
      avatarState.greet();
      const greeting = getGreeting();
      speak(greeting);
    }
  }, []);

  const getGreeting = () => {
    return getLocalizedValue('greeting_messages', currentLanguage);
  };

  const handleUserMessage = useCallback(async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    onMessage?.(text);

    setIsProcessing(true);
    avatarState.startThinking();

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const response = generateResponse(text);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);
      speak(response);
    }, 1000);
  }, [onMessage, avatarState, speak]);

  const generateResponse = (userText: string): string => {
    // Simple response generation (replace with AI API)
    const lowerText = userText.toLowerCase();

    if (currentLanguage === 'hi') {
      if (lowerText.includes('नाम') || lowerText.includes('name')) {
        return 'अपना नाम बताने के लिए धन्यवाद। मैंने इसे फॉर्म में भर दिया है।';
      }
      if (lowerText.includes('मदद') || lowerText.includes('help')) {
        return 'मैं यहाँ आपकी मदद के लिए हूँ। आप मुझे कुछ भी पूछ सकते हैं।';
      }
      return 'मैं समझ गया। कृपया आगे बढ़ें।';
    }

    if (lowerText.includes('name')) {
      return 'Thank you for sharing your name. I\'ve filled it in the form.';
    }
    if (lowerText.includes('help')) {
      return 'I\'m here to help you. You can ask me anything.';
    }
    return 'I understand. Please continue.';
  };

  const handleSendText = () => {
    if (inputText.trim()) {
      handleUserMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded && messages.length === 0) {
      avatarState.greet();
      speak(getGreeting());
    }
  };

  // Floating bubble mode
  if (mode === 'floating' && !isExpanded) {
    return (
      <button
        onClick={toggleExpanded}
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full bg-accent text-white shadow-xl hover:shadow-2xl transition-all hover:scale-110 z-50 flex items-center justify-center ${className}`}
      >
        <MessageCircle className="w-7 h-7" />
      </button>
    );
  }

  // Minimized state
  if (isMinimized) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium text-gray-700">{getLocalizedValue('assistant_name', currentLanguage)}</span>
          <Maximize2 className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    );
  }

  // Full chat panel
  return (
    <div
      className={`
        ${mode === 'floating' ? 'fixed bottom-6 right-6 w-96 max-h-[600px] rounded-2xl shadow-2xl z-50' : ''}
        ${mode === 'inline' ? 'w-full rounded-2xl shadow-lg' : ''}
        ${mode === 'fullscreen' ? 'fixed inset-0 z-50' : ''}
        bg-white overflow-hidden flex flex-col ${className}
      `}
    >
      {/* Header */}
      <div className="bg-accent px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar Head */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center">
                <div className="text-2xl">👨‍💼</div>
              </div>
            </div>
            {/* Status indicator */}
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
              avatarState.state === 'talking' ? 'bg-green-400 animate-pulse' :
              avatarState.state === 'listening' ? 'bg-blue-400 animate-pulse' :
              avatarState.state === 'thinking' ? 'bg-yellow-400 animate-pulse' :
              'bg-gray-300'
            }`} />
          </div>
          <div className="text-white">
            <h3 className="font-bold">{getLocalizedValue('assistant_name', currentLanguage)}</h3>
            <p className="text-xs text-white/80">
              {avatarState.state === 'talking' ? t('landing.avatar.aiReady') :
               avatarState.state === 'listening' ? t('landing.avatar.listening') :
               avatarState.state === 'thinking' ? '...' :
               'Online'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {mode === 'floating' && (
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Minimize2 className="w-4 h-4 text-white" />
            </button>
          )}
          {mode === 'floating' && (
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px] max-h-[350px]">
        {messages.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>{t('landing.avatar.subtitle')}</p>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-primary text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-800 rounded-bl-md'
              }`}
            >
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        {interimTranscript && (
          <div className="flex justify-end">
            <div className="bg-primary/10 text-primary rounded-2xl rounded-br-md px-4 py-2 italic">
              <p className="text-sm">{interimTranscript}</p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {/* Voice button */}
          {sttSupported && (
            <button
              onClick={isListening ? stopListening : startListening}
              className={`p-3 rounded-full transition-all ${
                isListening
                  ? 'bg-amber-500 text-white animate-pulse'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          )}

          {/* Text input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('landing.avatar.chatText')}
              className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-full focus:outline-none focus:border-primary transition-colors"
            />
            <button
              onClick={handleSendText}
              disabled={!inputText.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-primary disabled:text-gray-300"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {/* TTS button */}
          {ttsSupported && isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="p-3 rounded-full bg-primary text-white"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvatarContainer;
