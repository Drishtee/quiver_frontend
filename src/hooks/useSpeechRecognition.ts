import { useState, useCallback, useRef, useEffect } from 'react';

type SpeechLanguage = 'en-IN' | 'hi-IN' | 'as-IN';

interface UseSpeechRecognitionOptions {
  language?: SpeechLanguage;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  isSupported: boolean;
  error: string | null;
  setLanguage: (lang: SpeechLanguage) => void;
}

// Check if Web Speech API is supported
const isSpeechRecognitionSupported = (): boolean => {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
};

// Get SpeechRecognition constructor
const getSpeechRecognition = (): typeof SpeechRecognition | null => {
  if ('SpeechRecognition' in window) {
    return window.SpeechRecognition;
  }
  if ('webkitSpeechRecognition' in window) {
    return (window as any).webkitSpeechRecognition;
  }
  return null;
};

export const useSpeechRecognition = ({
  language = 'hi-IN',
  continuous = false,
  interimResults = true,
  onResult,
  onError,
  onStart,
  onEnd
}: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<SpeechLanguage>(language);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isSupported = isSpeechRecognitionSupported();

  // Initialize recognition
  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = currentLanguage;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      onStart?.();
    };

    recognition.onend = () => {
      setIsListening(false);
      onEnd?.();
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + ' ' + finalTranscript);
        onResult?.(finalTranscript.trim(), true);
      }

      setInterimTranscript(interim);
      if (interim) {
        onResult?.(interim, false);
      }
    };

    recognition.onerror = (event) => {
      let errorMessage = 'Speech recognition error';

      switch (event.error) {
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone access.';
          break;
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your connection.';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone found. Please connect a microphone.';
          break;
        default:
          errorMessage = `Error: ${event.error}`;
      }

      setError(errorMessage);
      setIsListening(false);
      onError?.(errorMessage);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [isSupported, continuous, interimResults, currentLanguage, onResult, onError, onStart, onEnd]);

  // Update language
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = currentLanguage;
    }
  }, [currentLanguage]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser.');
      onError?.('Speech recognition is not supported in this browser.');
      return;
    }

    if (recognitionRef.current && !isListening) {
      try {
        setTranscript('');
        setInterimTranscript('');
        recognitionRef.current.start();
      } catch (err) {
        console.error('Error starting speech recognition:', err);
      }
    }
  }, [isSupported, isListening, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  const setLanguage = useCallback((lang: SpeechLanguage) => {
    setCurrentLanguage(lang);
  }, []);

  return {
    isListening,
    transcript: transcript.trim(),
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    error,
    setLanguage
  };
};

export default useSpeechRecognition;
