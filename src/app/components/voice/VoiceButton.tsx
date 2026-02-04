import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useSpeechRecognition } from '../../../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../../../hooks/useTextToSpeech';
import { useLanguage } from '../../../i18n/LanguageContext';

interface VoiceButtonProps {
  onTranscript?: (text: string, isFinal: boolean) => void;
  onSpeakComplete?: () => void;
  textToSpeak?: string;
  mode?: 'listen' | 'speak' | 'both';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'floating' | 'inline';
  className?: string;
  disabled?: boolean;
  showWaveform?: boolean;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  onTranscript,
  onSpeakComplete,
  textToSpeak,
  mode = 'listen',
  size = 'md',
  variant = 'default',
  className = '',
  disabled = false,
  showWaveform = true
}) => {
  const { currentLanguage } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);

  // Map app language to speech language
  const speechLanguage = currentLanguage === 'hi' ? 'hi-IN' :
                         currentLanguage === 'as' ? 'as-IN' : 'en-IN';

  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    isSupported: sttSupported,
    error: sttError
  } = useSpeechRecognition({
    language: speechLanguage,
    continuous: false,
    interimResults: true,
    onResult: (text, isFinal) => {
      onTranscript?.(text, isFinal);
    }
  });

  const {
    speak,
    stop: stopSpeaking,
    isSpeaking,
    isSupported: ttsSupported
  } = useTextToSpeech({
    language: speechLanguage,
    onEnd: () => {
      onSpeakComplete?.();
    }
  });

  // Speak when textToSpeak changes
  useEffect(() => {
    if (textToSpeak && (mode === 'speak' || mode === 'both')) {
      speak(textToSpeak);
    }
  }, [textToSpeak, mode, speak]);

  const handleClick = () => {
    if (disabled) return;

    if (mode === 'listen' || mode === 'both') {
      if (isListening) {
        stopListening();
      } else {
        startListening();
      }
    } else if (mode === 'speak') {
      if (isSpeaking) {
        stopSpeaking();
      } else if (textToSpeak) {
        speak(textToSpeak);
      }
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  // Variant classes
  const variantClasses = {
    default: 'bg-white border-2 border-gray-200 hover:border-primary hover:bg-gray-50',
    floating: 'bg-accent text-white shadow-lg hover:shadow-xl',
    inline: 'bg-gray-100 hover:bg-gray-200'
  };

  const isActive = isListening || isSpeaking;
  const showError = sttError && !isListening;
  const isSupported = (mode === 'listen' && sttSupported) ||
                      (mode === 'speak' && ttsSupported) ||
                      (mode === 'both' && sttSupported);

  if (!isSupported) {
    return (
      <button
        disabled
        className={`rounded-full flex items-center justify-center opacity-50 cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        title="Voice not supported in this browser"
      >
        <MicOff className={`${iconSizes[size]} text-gray-400`} />
      </button>
    );
  }

  return (
    <div className="relative inline-flex items-center">
      <button
        onClick={handleClick}
        disabled={disabled || isProcessing}
        className={`
          relative rounded-full flex items-center justify-center transition-all duration-200
          ${sizeClasses[size]}
          ${isActive
            ? 'bg-accent text-white shadow-lg scale-110'
            : variantClasses[variant]
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
        title={mode === 'listen' ? 'Click to speak' : mode === 'speak' ? 'Click to listen' : 'Voice assistant'}
      >
        {/* Pulse animation when active */}
        {isActive && showWaveform && (
          <>
            <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
            <span className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
          </>
        )}

        {/* Icon */}
        {isProcessing ? (
          <Loader2 className={`${iconSizes[size]} animate-spin`} />
        ) : mode === 'speak' ? (
          isSpeaking ? (
            <VolumeX className={iconSizes[size]} />
          ) : (
            <Volume2 className={iconSizes[size]} />
          )
        ) : isListening ? (
          <MicOff className={iconSizes[size]} />
        ) : (
          <Mic className={iconSizes[size]} />
        )}
      </button>

      {/* Transcript display */}
      {(isListening || interimTranscript) && (
        <div className="absolute left-full ml-3 bg-white shadow-lg rounded-lg p-3 min-w-[200px] max-w-[300px] z-10">
          <p className="text-sm text-gray-600">
            {interimTranscript || transcript || 'Listening...'}
          </p>
        </div>
      )}

      {/* Error display */}
      {showError && (
        <div className="absolute left-full ml-3 bg-amber-50 border border-amber-200 rounded-lg p-2 z-10">
          <p className="text-xs text-amber-600">{sttError}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceButton;
