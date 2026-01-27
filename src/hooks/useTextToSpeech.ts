import { useState, useCallback, useRef, useEffect } from 'react';

type TTSLanguage = 'en-IN' | 'hi-IN' | 'as-IN';

interface UseTextToSpeechOptions {
  language?: TTSLanguage;
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

interface UseTextToSpeechReturn {
  speak: (text: string) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  setLanguage: (lang: TTSLanguage) => void;
  setRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
  setVolume: (volume: number) => void;
}

export const useTextToSpeech = ({
  language = 'hi-IN',
  rate = 1,
  pitch = 1,
  volume = 1,
  onStart,
  onEnd,
  onError
}: UseTextToSpeechOptions = {}): UseTextToSpeechReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState<TTSLanguage>(language);
  const [currentRate, setCurrentRate] = useState(rate);
  const [currentPitch, setCurrentPitch] = useState(pitch);
  const [currentVolume, setCurrentVolume] = useState(volume);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isSupported = 'speechSynthesis' in window;

  // Load available voices
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();

    // Voices are loaded asynchronously in some browsers
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [isSupported]);

  // Find best voice for language
  const findVoice = useCallback((lang: string): SpeechSynthesisVoice | null => {
    // Try to find exact match
    let voice = voices.find(v => v.lang === lang);

    // Try to find partial match (e.g., 'hi' for 'hi-IN')
    if (!voice) {
      const langPrefix = lang.split('-')[0];
      voice = voices.find(v => v.lang.startsWith(langPrefix));
    }

    // Fallback to any Indian voice
    if (!voice && lang.endsWith('-IN')) {
      voice = voices.find(v => v.lang.endsWith('-IN'));
    }

    // Fallback to default
    if (!voice) {
      voice = voices.find(v => v.default) || voices[0];
    }

    return voice || null;
  }, [voices]);

  const speak = useCallback((text: string) => {
    if (!isSupported) {
      onError?.('Text-to-speech is not supported in this browser.');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLanguage;
    utterance.rate = currentRate;
    utterance.pitch = currentPitch;
    utterance.volume = currentVolume;

    // Set voice
    const voice = findVoice(currentLanguage);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      onStart?.();
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      onEnd?.();
    };

    utterance.onerror = (event) => {
      setIsSpeaking(false);
      setIsPaused(false);
      onError?.(`Speech error: ${event.error}`);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, currentLanguage, currentRate, currentPitch, currentVolume, findVoice, onStart, onEnd, onError]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, [isSupported]);

  const pause = useCallback(() => {
    if (!isSupported || !isSpeaking) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [isSupported, isSpeaking]);

  const resume = useCallback(() => {
    if (!isSupported || !isPaused) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, [isSupported, isPaused]);

  const setLanguage = useCallback((lang: TTSLanguage) => {
    setCurrentLanguage(lang);
  }, []);

  const setRate = useCallback((r: number) => {
    setCurrentRate(Math.max(0.1, Math.min(10, r)));
  }, []);

  const setPitch = useCallback((p: number) => {
    setCurrentPitch(Math.max(0, Math.min(2, p)));
  }, []);

  const setVolume = useCallback((v: number) => {
    setCurrentVolume(Math.max(0, Math.min(1, v)));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    isSupported,
    voices,
    setLanguage,
    setRate,
    setPitch,
    setVolume
  };
};

export default useTextToSpeech;
