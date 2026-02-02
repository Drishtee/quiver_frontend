import { useEffect, useMemo } from 'react';
import { useRealtimeVoice } from '../../../contexts/RealtimeVoiceContext';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import { useLanguage } from '../../../i18n/LanguageContext';
import { getFieldsForScreen, type ScreenType } from '../../../config/formFieldMappings';
import { Check, Circle, Mic } from 'lucide-react';

interface VoiceFormOverlayProps {
  screen: ScreenType;
  children: React.ReactNode;
}

/**
 * VoiceFormOverlay
 * Wraps form screens with voice input visualization
 * Shows which fields have been filled via voice and highlights active field
 */
export function VoiceFormOverlay({ screen, children }: VoiceFormOverlayProps) {
  const voice = useRealtimeVoice();
  const onboarding = useOnboarding();
  const { currentLanguage } = useLanguage();

  // Set the current screen for voice context
  useEffect(() => {
    voice.setCurrentScreen(screen);
  }, [screen, voice.setCurrentScreen]);

  // Get fields for current screen
  const screenFields = useMemo(() => getFieldsForScreen(screen), [screen]);

  // Track which fields have been filled
  const filledFields = useMemo(() => {
    const voiceFilledFields = new Set(voice.collectedFields.map(f => f.field));
    const formFilledFields = new Set(
      Object.entries(onboarding.formData)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key]) => key)
    );
    return new Set([...voiceFilledFields, ...formFilledFields]);
  }, [voice.collectedFields, onboarding.formData]);

  // Progress calculation
  const progress = screenFields.length > 0
    ? Math.round((Array.from(filledFields).filter(f =>
        screenFields.some(sf => sf.fieldKey === f)
      ).length / screenFields.length) * 100)
    : 0;

  // Translations
  const t = {
    en: {
      voiceActive: 'Voice Assistant Active',
      fieldsCompleted: 'fields completed',
      speakToFill: 'Speak to fill the form',
      tapMic: 'Tap the mic to start voice input'
    },
    hi: {
      voiceActive: 'वॉयस असिस्टेंट सक्रिय',
      fieldsCompleted: 'फ़ील्ड पूर्ण',
      speakToFill: 'फॉर्म भरने के लिए बोलें',
      tapMic: 'वॉयस इनपुट शुरू करने के लिए माइक टैप करें'
    },
    as: {
      voiceActive: 'ভয়েচ সহায়ক সক্ৰিয়',
      fieldsCompleted: 'ক্ষেত্ৰ সম্পূৰ্ণ',
      speakToFill: 'ফৰ্ম পূৰণ কৰিবলৈ কওক',
      tapMic: 'ভয়েচ ইনপুট আৰম্ভ কৰিবলৈ মাইক টেপ কৰক'
    }
  };

  const texts = t[currentLanguage as keyof typeof t] || t.en;

  return (
    <div className="relative">
      {/* Main form content */}
      {children}

      {/* Voice status indicator - shows when voice is active */}
      {voice.isActive && voice.connectionStatus === 'connected' && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40">
          <div className="bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-primary/20 px-4 py-2 flex items-center gap-3">
            {/* Listening indicator */}
            <div className={`relative ${voice.isRecording ? 'animate-pulse' : ''}`}>
              <div className={`w-3 h-3 rounded-full ${
                voice.isRecording ? 'bg-amber-500' :
                voice.isSpeaking ? 'bg-blue-500' :
                'bg-green-500'
              }`} />
              {voice.isRecording && (
                <div className="absolute inset-0 w-3 h-3 rounded-full bg-amber-500 animate-ping" />
              )}
            </div>

            <span className="text-sm font-medium text-gray-700">
              {voice.isRecording ? texts.speakToFill : texts.voiceActive}
            </span>

            {/* Progress */}
            <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
              <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{progress}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Field completion sidebar - shows on larger screens */}
      {voice.isActive && screenFields.length > 0 && (
        <div className="hidden lg:block fixed top-1/2 left-4 transform -translate-y-1/2 z-30">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-3 w-48">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {screen}
            </h4>
            <div className="space-y-1">
              {screenFields.map(field => {
                const isFilled = filledFields.has(field.fieldKey);
                const voiceFilled = voice.collectedFields.some(f => f.field === field.fieldKey);

                return (
                  <div
                    key={field.fieldKey}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                      isFilled
                        ? voiceFilled
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                        : 'text-gray-400'
                    }`}
                  >
                    {isFilled ? (
                      <Check className="w-3.5 h-3.5 flex-shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 flex-shrink-0" />
                    )}
                    <span className="truncate">
                      {field.aliases[currentLanguage as keyof typeof field.aliases]?.[0] || field.aliases.en[0]}
                    </span>
                    {voiceFilled && (
                      <Mic className="w-3 h-3 text-green-500 ml-auto flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Highlight effect for recently filled fields via voice */}
      <style>{`
        @keyframes voiceFieldHighlight {
          0% { box-shadow: 0 0 0 0 rgba(var(--color-primary-rgb, 59, 130, 246), 0.5); }
          50% { box-shadow: 0 0 0 4px rgba(var(--color-primary-rgb, 59, 130, 246), 0.3); }
          100% { box-shadow: 0 0 0 0 rgba(var(--color-primary-rgb, 59, 130, 246), 0); }
        }
        .voice-field-updated {
          animation: voiceFieldHighlight 1s ease-out;
        }
      `}</style>
    </div>
  );
}

export default VoiceFormOverlay;
