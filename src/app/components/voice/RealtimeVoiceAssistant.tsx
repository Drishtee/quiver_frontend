import { useState, useRef, useEffect, useMemo } from 'react';
import { useRealtimeVoice } from '../../../contexts/RealtimeVoiceContext';
import { useLanguage } from '../../../i18n/LanguageContext';
import { useAIAssistantConfig } from '../../../contexts/AIAssistantConfigContext';
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
  MessageSquare,
  Maximize2,
  Minimize2,
  AudioLines,
  Phone,
  PhoneOff,
  Edit3,
  Save
} from 'lucide-react';
import type { AllScreenType } from '../../../types/screenAssistantConfig';

interface RealtimeVoiceAssistantProps {
  currentScreen?: AllScreenType;
}

export function RealtimeVoiceAssistant({ currentScreen }: RealtimeVoiceAssistantProps) {
  const { currentLanguage } = useLanguage();
  const { getLocalizedValue } = useAIAssistantConfig();
  const [textInput, setTextInput] = useState('');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const conversationEndRef = useRef<HTMLDivElement>(null);

  const voice = useRealtimeVoice();

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

  // Dynamic translations using config context
  const brandName = getLocalizedValue('assistant_name', currentLanguage);
  const subtitle = getLocalizedValue('assistant_subtitle', currentLanguage);

  const texts = useMemo(() => {
    const base = {
      en: {
        connecting: 'Connecting...',
        connected: 'Ready to help',
        disconnected: 'Tap to start',
        error: 'Error',
        listening: 'Listening...',
        speaking: 'Speaking...',
        typeMessage: 'Type a message...',
        collectedFields: 'Collected Information',
        noFieldsYet: 'Speak to start collecting information',
        recordings: 'Recordings',
        noRecordings: 'No recordings yet',
        download: 'Download',
        delete: 'Delete',
        confirm: 'Confirm',
        edit: 'Edit',
        save: 'Save',
        applyToForm: 'Apply to Form',
        endCall: 'Stop Recording',
        mute: 'Mute',
        unmute: 'Unmute'
      },
      hi: {
        connecting: 'कनेक्ट हो रहा है...',
        connected: 'मदद के लिए तैयार',
        disconnected: 'शुरू करने के लिए टैप करें',
        error: 'त्रुटि',
        listening: 'सुन रही हूँ...',
        speaking: 'बोल रही हूँ...',
        typeMessage: 'संदेश लिखें...',
        collectedFields: 'एकत्रित जानकारी',
        noFieldsYet: 'जानकारी एकत्र करने के लिए बोलें',
        recordings: 'रिकॉर्डिंग',
        noRecordings: 'अभी तक कोई रिकॉर्डिंग नहीं',
        download: 'डाउनलोड',
        delete: 'हटाएं',
        confirm: 'पुष्टि करें',
        edit: 'संपादित करें',
        save: 'सेव करें',
        applyToForm: 'फॉर्म में लागू करें',
        endCall: 'रिकॉर्डिंग रोकें',
        mute: 'म्यूट',
        unmute: 'अनम्यूट'
      },
      as: {
        connecting: 'সংযোগ হৈ আছে...',
        connected: 'সহায় কৰিবলৈ প্ৰস্তুত',
        disconnected: 'আৰম্ভ কৰিবলৈ টেপ কৰক',
        error: 'ত্ৰুটি',
        listening: 'শুনি আছো...',
        speaking: 'কৈ আছো...',
        typeMessage: 'বাৰ্তা লিখক...',
        collectedFields: 'সংগ্ৰহ কৰা তথ্য',
        noFieldsYet: 'তথ্য সংগ্ৰহ কৰিবলৈ কওক',
        recordings: 'ৰেকৰ্ডিং',
        noRecordings: 'এতিয়ালৈকে কোনো ৰেকৰ্ডিং নাই',
        download: 'ডাউনলোড',
        delete: 'মচক',
        confirm: 'নিশ্চিত কৰক',
        edit: 'সম্পাদনা কৰক',
        save: 'সংৰক্ষণ কৰক',
        applyToForm: 'ফৰ্মত প্ৰয়োগ কৰক',
        endCall: 'ৰেকৰ্ডিং বন্ধ কৰক',
        mute: 'মিউট',
        unmute: 'আনমিউট'
      }
    };
    const lang = base[currentLanguage as keyof typeof base] || base.en;
    return {
      ...lang,
      title: brandName,
      subtitle,
      tapToStart: currentLanguage === 'hi' ? `${brandName} से बात करने के लिए टैप करें` :
                  currentLanguage === 'as' ? `${brandName}ৰ সৈতে কথা পাতিবলৈ টেপ কৰক` :
                  `Tap to talk with ${brandName}`,
      startCall: currentLanguage === 'hi' ? `${brandName} से बात करें` :
                 currentLanguage === 'as' ? `${brandName}ৰ সৈতে কথা পাতক` :
                 `Talk to ${brandName}`,
    };
  }, [currentLanguage, brandName, subtitle]);

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

  // Get status text and color
  const getStatusInfo = () => {
    switch (voice.connectionStatus) {
      case 'connecting':
        return { text: texts.connecting, color: 'text-yellow-600', bg: 'bg-yellow-100' };
      case 'connected':
        if (voice.isRecording) return { text: texts.listening, color: 'text-amber-600', bg: 'bg-amber-100' };
        if (voice.isSpeaking) return { text: texts.speaking, color: 'text-blue-600', bg: 'bg-blue-100' };
        return { text: texts.connected, color: 'text-green-600', bg: 'bg-green-100' };
      case 'error':
        return { text: texts.error, color: 'text-amber-600', bg: 'bg-amber-100' };
      default:
        return { text: texts.disconnected, color: 'text-gray-600', bg: 'bg-gray-100' };
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
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-accent shadow-lg flex items-center justify-center transition-all hover:scale-110 hover:shadow-xl group"
        aria-label="Open voice assistant"
      >
        <Mic className="w-7 h-7 text-white" />
        <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
        <div className="absolute -top-12 right-0 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {texts.tapToStart}
        </div>
      </button>
    );
  }

  // Minimized state
  if (voice.isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        {/* Status indicator */}
        <div className={`px-4 py-2 rounded-full ${statusInfo.bg} ${statusInfo.color} text-sm font-medium flex items-center gap-2 shadow-lg`}>
          {voice.connectionStatus === 'connecting' && <Loader2 className="w-4 h-4 animate-spin" />}
          {voice.isRecording && <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />}
          {voice.isSpeaking && <AudioLines className="w-4 h-4 animate-pulse" />}
          <span>{statusInfo.text}</span>
        </div>

        {/* Mute button */}
        <button
          onClick={voice.toggleMute}
          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors ${
            voice.isMuted ? 'bg-amber-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {voice.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Expand button */}
        <button
          onClick={voice.restore}
          className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <Maximize2 className="w-5 h-5 text-gray-700" />
        </button>

        {/* Close button */}
        <button
          onClick={voice.deactivate}
          className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    );
  }

  // Full expanded panel
  return (
    <div className="fixed bottom-6 right-6 z-50 w-[420px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-accent px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{texts.title}</h3>
            <p className="text-xs text-white/70">{texts.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={voice.minimize}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Minimize"
          >
            <Minimize2 className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={voice.deactivate}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Status bar */}
      <div className={`px-4 py-2 ${statusInfo.bg} flex items-center justify-between flex-shrink-0`}>
        <div className={`flex items-center gap-2 ${statusInfo.color} text-sm font-medium`}>
          {voice.connectionStatus === 'connecting' && <Loader2 className="w-4 h-4 animate-spin" />}
          {voice.connectionStatus === 'connected' && voice.isRecording && (
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          )}
          {voice.connectionStatus === 'connected' && voice.isSpeaking && (
            <AudioLines className="w-4 h-4 animate-pulse" />
          )}
          <span>{statusInfo.text}</span>
        </div>
        {voice.connectionStatus === 'connected' && (
          <button
            onClick={voice.disconnect}
            className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
          >
            <PhoneOff className="w-3 h-3" />
            {texts.endCall}
          </button>
        )}
      </div>

      {/* Conversation area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[280px] bg-gray-50">
        {voice.conversationHistory.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            {voice.connectionStatus === 'connected' ? (
              <>
                <AudioLines className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>{texts.listening}</p>
              </>
            ) : (
              <>
                <Mic className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>{texts.tapToStart}</p>
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
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    message.type === 'user'
                      ? 'bg-primary text-white rounded-br-md'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
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
            <div ref={conversationEndRef} />
          </>
        )}
      </div>

      {/* Collected fields */}
      {voice.collectedFields.length > 0 && (
        <div className="px-4 py-3 bg-green-50 border-t border-green-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-green-800">{texts.collectedFields}</p>
            <button
              onClick={voice.applyFieldsToForm}
              className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors flex items-center gap-1"
            >
              <Save className="w-3 h-3" />
              {texts.applyToForm}
            </button>
          </div>
          <div className="space-y-2 max-h-[120px] overflow-y-auto">
            {voice.collectedFields.map((field) => (
              <div
                key={field.field}
                className="flex items-center justify-between bg-white rounded-lg px-3 py-2 shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">{field.field}</p>
                  {editingField === field.field ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full text-sm border rounded px-2 py-1 mt-1"
                      autoFocus
                    />
                  ) : (
                    <p className="text-sm text-gray-900 truncate">{String(field.value)}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-2">
                  {editingField === field.field ? (
                    <button
                      onClick={() => handleSaveEdit(field.field)}
                      className="p-1 text-green-600 hover:bg-green-100 rounded"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditField(field.field, field.value)}
                        className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      {!field.confirmed && (
                        <button
                          onClick={() => voice.confirmField(field.field)}
                          className="p-1 text-green-600 hover:bg-green-100 rounded"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}
                  {field.confirmed && (
                    <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error display */}
      {voice.error && (
        <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 flex items-center gap-2 flex-shrink-0">
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-xs text-amber-700 flex-1">{voice.error}</p>
          <button onClick={voice.clearError} className="text-amber-500 hover:text-amber-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
        {voice.connectionStatus !== 'connected' ? (
          <button
            onClick={voice.connect}
            disabled={voice.connectionStatus === 'connecting'}
            className="w-full h-12 bg-accent text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
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
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={voice.toggleMute}
                className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  voice.isMuted
                    ? 'bg-amber-500 hover:bg-amber-600'
                    : 'bg-accent hover:shadow-lg'
                }`}
              >
                {voice.isMuted ? (
                  <MicOff className="w-7 h-7 text-white" />
                ) : (
                  <Mic className="w-7 h-7 text-white" />
                )}
                {!voice.isMuted && voice.isRecording && (
                  <>
                    <span className="absolute inset-0 rounded-full bg-amber-500/50 animate-ping" />
                    <span className="absolute inset-[-4px] rounded-full border-2 border-amber-300 animate-pulse" />
                  </>
                )}
                {voice.isSpeaking && (
                  <span className="absolute inset-[-4px] rounded-full border-2 border-primary/50 animate-pulse" />
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
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
              <button
                type="submit"
                disabled={!textInput.trim()}
                className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

export default RealtimeVoiceAssistant;
