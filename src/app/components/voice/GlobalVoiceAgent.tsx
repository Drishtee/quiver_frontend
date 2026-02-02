import { useState, useRef, useEffect } from 'react';
import { useVoiceAgent } from '../../../hooks/useVoiceAgent';
import { useLanguage } from '../../../i18n/LanguageContext';
import {
  Mic,
  MicOff,
  X,
  Minus,
  Send,
  Volume2,
  VolumeX,
  Loader2,
  Check,
  AlertCircle,
  MessageSquare
} from 'lucide-react';

interface GlobalVoiceAgentProps {
  currentScreen?: string;
}

export function GlobalVoiceAgent({ currentScreen }: GlobalVoiceAgentProps) {
  const { currentLanguage } = useLanguage();
  const [textInput, setTextInput] = useState('');
  const conversationEndRef = useRef<HTMLDivElement>(null);

  const voiceAgent = useVoiceAgent({
    screen: currentScreen as any
  });

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [voiceAgent.conversationHistory]);

  // Handle text input submit
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      voiceAgent.processText(textInput.trim());
      setTextInput('');
    }
  };

  // Get translations
  const translations = {
    en: {
      title: 'Voice Assistant',
      listening: 'Listening...',
      processing: 'Processing...',
      speaking: 'Speaking...',
      tapToSpeak: 'Tap to speak',
      typeMessage: 'Type a message...',
      unsupported: 'Voice not supported in this browser',
      filledFields: 'Filled Fields',
      noFieldsYet: 'No fields filled yet'
    },
    hi: {
      title: 'वॉयस असिस्टेंट',
      listening: 'सुन रहा हूँ...',
      processing: 'प्रोसेस कर रहा हूँ...',
      speaking: 'बोल रहा हूँ...',
      tapToSpeak: 'बोलने के लिए टैप करें',
      typeMessage: 'संदेश लिखें...',
      unsupported: 'इस ब्राउज़र में वॉयस सपोर्ट नहीं है',
      filledFields: 'भरे गए फ़ील्ड',
      noFieldsYet: 'अभी कोई फ़ील्ड नहीं भरा'
    },
    as: {
      title: 'ভয়েচ সহায়ক',
      listening: 'শুনি আছো...',
      processing: 'প্ৰচেছ কৰি আছো...',
      speaking: 'কৈ আছো...',
      tapToSpeak: 'কবলৈ টেপ কৰক',
      typeMessage: 'বাৰ্তা লিখক...',
      unsupported: 'এই ব্ৰাউজাৰত ভয়েচ সমৰ্থিত নহয়',
      filledFields: 'পূৰণ কৰা ক্ষেত্ৰসমূহ',
      noFieldsYet: 'এতিয়ালৈকে কোনো ক্ষেত্ৰ পূৰণ কৰা হোৱা নাই'
    }
  };

  const t = translations[currentLanguage as keyof typeof translations] || translations.en;

  // Get status text
  const getStatusText = () => {
    if (voiceAgent.isListening) return t.listening;
    if (voiceAgent.isProcessing) return t.processing;
    if (voiceAgent.isSpeaking) return t.speaking;
    return t.tapToSpeak;
  };

  // Don't render if voice is not supported
  if (!voiceAgent.isSupported) {
    return null;
  }

  // Collapsed state - just the floating button
  if (!voiceAgent.isExpanded) {
    return (
      <button
        onClick={voiceAgent.expand}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg flex items-center justify-center transition-all hover:scale-110 hover:shadow-xl group"
        aria-label="Open voice assistant"
      >
        <Mic className="w-6 h-6 text-white" />
        {/* Pulse animation when available */}
        <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
      </button>
    );
  }

  // Expanded state - full panel
  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-white">{t.title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={voiceAgent.collapse}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Minimize"
          >
            <Minus className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={voiceAgent.deactivate}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Conversation Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[300px] bg-gray-50">
        {voiceAgent.conversationHistory.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            {t.tapToSpeak}
          </div>
        ) : (
          <>
            {voiceAgent.conversationHistory.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    message.type === 'user'
                      ? 'bg-primary text-white rounded-br-md'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  {message.extractedFields && message.extractedFields.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/20 flex flex-wrap gap-1">
                      {message.extractedFields.map((field, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full"
                        >
                          <Check className="w-3 h-3" />
                          {field.fieldKey}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {/* Interim transcript */}
            {voiceAgent.interimTranscript && (
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl px-4 py-2.5 bg-primary/50 text-white rounded-br-md">
                  <p className="text-sm italic">{voiceAgent.interimTranscript}</p>
                </div>
              </div>
            )}
            <div ref={conversationEndRef} />
          </>
        )}
      </div>

      {/* Filled Fields Summary */}
      {Object.keys(voiceAgent.filledFields).length > 0 && (
        <div className="px-4 py-2 bg-green-50 border-t border-green-100">
          <p className="text-xs font-medium text-green-800 mb-1.5">{t.filledFields}</p>
          <div className="flex flex-wrap gap-1">
            {Object.entries(voiceAgent.filledFields).map(([key, value]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full"
                title={`${key}: ${value}`}
              >
                <Check className="w-3 h-3" />
                {key}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {voiceAgent.error && (
        <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-xs text-amber-700 flex-1">{voiceAgent.error}</p>
          <button
            onClick={voiceAgent.clearError}
            className="text-amber-500 hover:text-amber-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Voice Controls */}
      <div className="p-4 border-t border-gray-200 bg-white">
        {/* Status */}
        <div className="text-center mb-3">
          <span className="text-xs text-gray-500">{getStatusText()}</span>
        </div>

        {/* Main Mic Button */}
        <div className="flex items-center justify-center mb-4">
          <button
            onClick={voiceAgent.toggleListening}
            disabled={voiceAgent.isProcessing}
            className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              voiceAgent.isListening
                ? 'bg-amber-500 hover:bg-amber-600'
                : 'bg-gradient-to-br from-primary to-secondary hover:shadow-lg'
            } ${voiceAgent.isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={voiceAgent.isListening ? 'Stop listening' : 'Start listening'}
          >
            {voiceAgent.isProcessing ? (
              <Loader2 className="w-7 h-7 text-white animate-spin" />
            ) : voiceAgent.isListening ? (
              <MicOff className="w-7 h-7 text-white" />
            ) : (
              <Mic className="w-7 h-7 text-white" />
            )}

            {/* Listening animation */}
            {voiceAgent.isListening && (
              <>
                <span className="absolute inset-0 rounded-full bg-amber-500/50 animate-ping" />
                <span className="absolute inset-[-4px] rounded-full border-2 border-amber-300 animate-pulse" />
              </>
            )}

            {/* Speaking animation */}
            {voiceAgent.isSpeaking && (
              <span className="absolute inset-[-4px] rounded-full border-2 border-primary/50 animate-pulse" />
            )}
          </button>
        </div>

        {/* Text Input Fallback */}
        <form onSubmit={handleTextSubmit} className="flex gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={t.typeMessage}
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            disabled={voiceAgent.isProcessing}
          />
          <button
            type="submit"
            disabled={!textInput.trim() || voiceAgent.isProcessing}
            className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default GlobalVoiceAgent;
