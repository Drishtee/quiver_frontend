import { useState, useCallback } from 'react';

export type AvatarState = 'idle' | 'listening' | 'thinking' | 'talking' | 'greeting';

export type AvatarEmotion = 'neutral' | 'happy' | 'curious' | 'encouraging' | 'concerned';

interface UseAvatarStateOptions {
  initialState?: AvatarState;
  initialEmotion?: AvatarEmotion;
}

interface UseAvatarStateReturn {
  state: AvatarState;
  emotion: AvatarEmotion;
  setState: (state: AvatarState) => void;
  setEmotion: (emotion: AvatarEmotion) => void;
  startListening: () => void;
  stopListening: () => void;
  startThinking: () => void;
  startTalking: () => void;
  stopTalking: () => void;
  greet: () => void;
  reset: () => void;
}

export const useAvatarState = ({
  initialState = 'idle',
  initialEmotion = 'neutral'
}: UseAvatarStateOptions = {}): UseAvatarStateReturn => {
  const [state, setState] = useState<AvatarState>(initialState);
  const [emotion, setEmotion] = useState<AvatarEmotion>(initialEmotion);

  const startListening = useCallback(() => {
    setState('listening');
    setEmotion('curious');
  }, []);

  const stopListening = useCallback(() => {
    setState('idle');
  }, []);

  const startThinking = useCallback(() => {
    setState('thinking');
    setEmotion('curious');
  }, []);

  const startTalking = useCallback(() => {
    setState('talking');
    setEmotion('encouraging');
  }, []);

  const stopTalking = useCallback(() => {
    setState('idle');
    setEmotion('neutral');
  }, []);

  const greet = useCallback(() => {
    setState('greeting');
    setEmotion('happy');

    // Auto-return to idle after greeting
    setTimeout(() => {
      setState('idle');
      setEmotion('neutral');
    }, 2000);
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setEmotion('neutral');
  }, []);

  return {
    state,
    emotion,
    setState,
    setEmotion,
    startListening,
    stopListening,
    startThinking,
    startTalking,
    stopTalking,
    greet,
    reset
  };
};

export default useAvatarState;
