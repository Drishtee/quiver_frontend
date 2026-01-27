/**
 * QuiverAIAssistant
 * Branded voice assistant component with enhanced UI/UX
 */

import { useState, useRef, useEffect } from 'react';
import { useOpenAIVoice } from '../../../contexts/OpenAIVoiceContext';
import { useLanguage } from '../../../i18n/LanguageContext';
import {
  Mic,
  MicOff,
  X,
  Send,
  Loader2,
  Check,
  AlertCircle,
  Maximize2,
  Minimize2,
  Download,
  AudioLines,
  Phone,
  PhoneOff,
  ChevronDown,
  ChevronUp,
  Edit3,
  Sparkles,
  MessageCircle
} from 'lucide-react';
import type { ScreenType } from '../../../config/formFieldMappings';

interface QuiverAIAssistantProps {
  currentScreen?: ScreenType;
}

export function QuiverAIAssistant({ currentScreen }: QuiverAIAssistantProps) {
  const { currentLanguage } = useLanguage();
  const [textInput, setTextInput] = useState('');
  const [showRecordings, setShowRecordings] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const conversationEndRef = useRef<HTMLDivElement>(null);

  const voice = useOpenAIVoice();

  // Update screen when prop changes
  useEffect(() => {
    if (currentScreen) {
      voice.setCurrentScreen(currentScreen);
    }
  }, [currentScreen, voice.setCurrentScreen]);

  // Auto-scroll conversation
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [voice.conversationHistory]);

  // Translations
  const t = {
    en: {
      brandName: 'Quiver AI',
      subtitle: 'Voice Assistant',
      connecting: 'Connecting...',
      connected: 'Ready to help',
      disconnected: 'Tap to start',
      error: 'Connection error',
      listening: 'Listening...',
      speaking: 'Speaking...',
      tapToStart: 'Tap to talk with Quiver AI',
      typeMessage: 'Type a message...',
      collectedFields: 'Collected Information',
      noFieldsYet: 'I\'ll help you fill the form',
      recordings: 'Recordings',
      noRecordings: 'No recordings yet',
      download: 'Download',
      delete: 'Delete',
      confirm: 'Confirm',
      edit: 'Edit',
      save: 'Save',
      applyToForm: 'Apply All',
      startCall: 'Start Conversation',
      endCall: 'End',
      mute: 'Mute',
      unmute: 'Unmute'
    },
    hi: {
      brandName: 'Quiver AI',
      subtitle: 'वॉयस असिस्टेंट',
      connecting: 'कनेक्ट हो रहा है...',
      connected: 'मदद के लिए तैयार',
      disconnected: 'शुरू करने के लिए टैप करें',
      error: 'कनेक्शन त्रुटि',
      listening: 'सुन रहा हूँ...',
      speaking: 'बोल रहा हूँ...',
      tapToStart: 'Quiver AI से बात करने के लिए टैप करें',
      typeMessage: 'संदेश लिखें...',
      collectedFields: 'एकत्रित जानकारी',
      noFieldsYet: 'मैं फॉर्म भरने में मदद करूंगा',
      recordings: 'रिकॉर्डिंग',
      noRecordings: 'अभी तक कोई रिकॉर्डिंग नहीं',
      download: 'डाउनलोड',
      delete: 'हटाएं',
      confirm: 'पुष्टि करें',
      edit: 'संपादित करें',
      save: 'सेव करें',
      applyToForm: 'सभी लागू करें',
      startCall: 'बातचीत शुरू करें',
      endCall: 'समाप्त',
      mute: 'म्यूट',
      unmute: 'अनम्यूट'
    },
    as: {
      brandName: 'Quiver AI',
      subtitle: 'ভয়েচ সহায়ক',
      connecting: 'সংযোগ হৈ আছে...',
      connected: 'সহায় কৰিবলৈ প্ৰস্তুত',
      disconnected: 'আৰম্ভ কৰিবলৈ টেপ কৰক',
      error: 'সংযোগ ত্ৰুটি',
      listening: 'শুনি আছো...',
      speaking: 'কৈ আছো...',
      tapToStart: 'Quiver AI ৰ সৈতে কথা পাতিবলৈ টেপ কৰক',
      typeMessage: 'বাৰ্তা লিখক...',
      collectedFields: 'সংগ্ৰহ কৰা তথ্য',
      noFieldsYet: 'মই ফৰ্ম পূৰণত সহায় কৰিম',
      recordings: 'ৰেকৰ্ডিং',
      noRecordings: 'এতিয়ালৈকে কোনো ৰেকৰ্ডিং নাই',
      download: 'ডাউনলোড',
      delete: 'মচক',
      confirm: 'নিশ্চিত কৰক',
      edit: 'সম্পাদনা কৰক',
      save: 'সংৰক্ষণ কৰক',
      applyToForm: 'সকলো প্ৰয়োগ কৰক',
      startCall: 'কথোপকথন আৰম্ভ কৰক',
      endCall: 'শেষ',
      mute: 'মিউট',
      unmute: 'আনমিউট'
    }
  };

  const texts = t[currentLanguage as keyof typeof t] || t.en;

  // Handle text submit
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim() && voice.connectionStatus === 'connected') {
      voice.sendTextMessage(textInput.trim());
      setTextInput('');
    }
  };

  // Handle field edit
  const handleEditField = (fieldKey: string, currentValue: any) => {
    setEditingField(fieldKey);
    setEditValue(String(currentValue));
  };

  const handleSaveEdit = (fieldKey: string) => {
    voice.editField(fieldKey, editValue);
    setEditingField(null);
    setEditValue('');
  };

  // Get status info
  const getStatusInfo = () => {
    switch (voice.connectionStatus) {
      case 'connecting':
        return { text: texts.connecting, color: 'text-amber-600', bg: 'bg-amber-50', pulse: true };
      case 'connected':
        if (voice.isRecording) return { text: texts.listening, color: 'text-red-600', bg: 'bg-red-50', pulse: true };
        if (voice.isSpeaking) return { text: texts.speaking, color: 'text-blue-600', bg: 'bg-blue-50', pulse: true };
        return { text: texts.connected, color: 'text-emerald-600', bg: 'bg-emerald-50', pulse: false };
      case 'error':
        return { text: texts.error, color: 'text-red-600', bg: 'bg-red-50', pulse: false };
      default:
        return { text: texts.disconnected, color: 'text-gray-600', bg: 'bg-gray-50', pulse: false };
    }
  };

  const statusInfo = getStatusInfo();

  // Floating button when collapsed
  if (!voice.isActive) {
    return (
      <button
        onClick={() => {
          voice.activate();
          voice.connect();
        }}
        className="fixed bottom-6 right-6 z-50 group"
        aria-label="Open Quiver AI Assistant"
      >
        {/* Outer glow animation */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-50 blur-lg animate-pulse" />

        {/* Main button */}
        <div className="relative flex items-center gap-3 px-5 py-3 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105">
          {/* Sparkle icon */}
          <div className="relative">
            <Sparkles className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
          </div>

          {/* Text */}
          <span className="text-white font-semibold text-base whitespace-nowrap">
            {texts.brandName}
          </span>

          {/* Mic icon */}
          <Mic className="w-5 h-5 text-white/80" />
        </div>

        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {texts.tapToStart}
          <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900" />
        </div>
      </button>
    );
  }

  // Minimized pill state
  if (voice.isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        {/* Status pill */}
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg ${statusInfo.bg} border border-gray-200`}>
          {voice.connectionStatus === 'connecting' && <Loader2 className="w-4 h-4 animate-spin text-amber-600" />}
          {voice.isRecording && (
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
          {voice.isSpeaking && <AudioLines className="w-4 h-4 animate-pulse text-blue-600" />}
          <span className={`text-sm font-medium ${statusInfo.color}`}>{statusInfo.text}</span>
        </div>

        {/* Mute button */}
        <button
          onClick={voice.toggleMute}
          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${
            voice.isMuted
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          {voice.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Expand button */}
        <button
          onClick={voice.restore}
          className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
        >
          <Maximize2 className="w-5 h-5 text-gray-700" />
        </button>

        {/* Close button */}
        <button
          onClick={voice.deactivate}
          className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    );
  }

  // Full expanded panel
  return (
    <div className="fixed bottom-6 right-6 z-50 w-[400px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-5 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">{texts.brandName}</h3>
            <p className="text-xs text-white/70">{texts.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={voice.minimize}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Minimize"
          >
            <Minimize2 className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={voice.deactivate}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Status bar */}
      <div className={`px-5 py-2.5 ${statusInfo.bg} flex items-center justify-between flex-shrink-0 border-b border-gray-100`}>
        <div className={`flex items-center gap-2 ${statusInfo.color} text-sm font-medium`}>
          {voice.connectionStatus === 'connecting' && <Loader2 className="w-4 h-4 animate-spin" />}
          {voice.connectionStatus === 'connected' && voice.isRecording && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          )}
          {voice.connectionStatus === 'connected' && voice.isSpeaking && (
            <AudioLines className="w-4 h-4 animate-pulse" />
          )}
          <span>{statusInfo.text}</span>
        </div>
        {voice.connectionStatus === 'connected' && (
          <button
            onClick={voice.disconnect}
            className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            {texts.endCall}
          </button>
        )}
      </div>

      {/* Conversation area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[180px] max-h-[260px] bg-gradient-to-b from-gray-50 to-white">
        {voice.conversationHistory.length === 0 ? (
          <div className="text-center py-8">
            {voice.connectionStatus === 'connected' ? (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center">
                  <AudioLines className="w-8 h-8 text-violet-500" />
                </div>
                <p className="text-gray-600 font-medium">{texts.listening}</p>
                <p className="text-gray-400 text-sm mt-1">{texts.noFieldsYet}</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">{texts.tapToStart}</p>
              </>
            )}
          </div>
        ) : (
          <>
            {voice.conversationHistory.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-br-md'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                  {message.extractedFields && message.extractedFields.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/20 flex flex-wrap gap-1">
                      {message.extractedFields.map((field, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs rounded-full"
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
            <div ref={conversationEndRef} />
          </>
        )}
      </div>

      {/* Collected fields */}
      {voice.collectedFields.length > 0 && (
        <div className="px-4 py-3 bg-emerald-50 border-t border-emerald-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              {texts.collectedFields}
            </p>
            <button
              onClick={voice.applyFieldsToForm}
              className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm"
            >
              {texts.applyToForm}
            </button>
          </div>
          <div className="space-y-2 max-h-[100px] overflow-y-auto">
            {voice.collectedFields.map((field) => (
              <div
                key={field.field}
                className="flex items-center justify-between bg-white rounded-xl px-3 py-2 shadow-sm border border-emerald-100"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-600 truncate">{field.field}</p>
                  {editingField === field.field ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1 mt-1 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      autoFocus
                    />
                  ) : (
                    <p className="text-sm text-gray-900 font-medium truncate">{String(field.value)}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-2">
                  {editingField === field.field ? (
                    <button
                      onClick={() => handleSaveEdit(field.field)}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditField(field.field, field.value)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {!field.confirmed && (
                        <button
                          onClick={() => voice.confirmField(field.field)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}
                  {field.confirmed && (
                    <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recordings section */}
      {voice.audioRecordings.length > 0 && (
        <div className="border-t border-gray-100 flex-shrink-0">
          <button
            onClick={() => setShowRecordings(!showRecordings)}
            className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="text-xs font-medium text-gray-600 flex items-center gap-2">
              <AudioLines className="w-4 h-4" />
              {texts.recordings} ({voice.audioRecordings.length})
            </span>
            {showRecordings ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {showRecordings && (
            <div className="px-4 pb-3 space-y-2 max-h-[100px] overflow-y-auto">
              {voice.audioRecordings.map((recording) => (
                <div
                  key={recording.id}
                  className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-700 truncate">{recording.transcript || 'Recording'}</p>
                    <p className="text-gray-400">
                      {recording.duration.toFixed(1)}s - {recording.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  <button
                    onClick={() => voice.downloadRecording(recording.id)}
                    className="p-1.5 text-violet-600 hover:bg-violet-100 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={voice.clearRecordings}
                className="w-full text-xs text-red-500 hover:text-red-600 py-1 font-medium"
              >
                {texts.delete} All
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error display */}
      {voice.error && (
        <div className="px-4 py-2.5 bg-red-50 border-t border-red-100 flex items-center gap-2 flex-shrink-0">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-700 flex-1">{voice.error}</p>
          <button onClick={voice.clearError} className="text-red-400 hover:text-red-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0">
        {voice.connectionStatus !== 'connected' ? (
          <button
            onClick={voice.connect}
            disabled={voice.connectionStatus === 'connecting'}
            className="w-full h-12 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-violet-700 hover:to-fuchsia-700 transition-all disabled:opacity-50 shadow-lg"
          >
            {voice.connectionStatus === 'connecting' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {texts.connecting}
              </>
            ) : (
              <>
                <Phone className="w-5 h-5" />
                {texts.startCall}
              </>
            )}
          </button>
        ) : (
          <>
            {/* Main mic button */}
            <div className="flex items-center justify-center mb-4">
              <button
                onClick={voice.toggleMute}
                className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  voice.isMuted
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-gradient-to-br from-violet-600 to-fuchsia-600 hover:shadow-lg'
                }`}
              >
                {voice.isMuted ? (
                  <MicOff className="w-7 h-7 text-white" />
                ) : (
                  <Mic className="w-7 h-7 text-white" />
                )}
                {!voice.isMuted && voice.isRecording && (
                  <>
                    <span className="absolute inset-0 rounded-full bg-red-500/40 animate-ping" />
                    <span className="absolute inset-[-4px] rounded-full border-2 border-red-300 animate-pulse" />
                  </>
                )}
                {voice.isSpeaking && (
                  <span className="absolute inset-[-4px] rounded-full border-2 border-violet-300 animate-pulse" />
                )}
              </button>
            </div>

            {/* Text input */}
            <form onSubmit={handleTextSubmit} className="flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={texts.typeMessage}
                className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
              />
              <button
                type="submit"
                disabled={!textInput.trim()}
                className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:from-violet-700 hover:to-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default QuiverAIAssistant;
