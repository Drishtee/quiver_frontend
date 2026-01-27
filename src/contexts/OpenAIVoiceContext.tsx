/**
 * OpenAI Voice Context
 * Uses @openai/agents SDK for voice-based form filling
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useOnboarding } from './OnboardingContext';
import { useLanguage } from '../i18n/LanguageContext';
import { getVoiceAgentToken, bulkUpdateFields, uploadAudio } from '../services/api';
import { audioStorage } from '../services/audioStorage';
import type { ScreenType } from '../config/formFieldMappings';
import { getFieldsForScreen } from '../config/formFieldMappings';

// Types
interface AudioRecording {
  id: string;
  blob: Blob;
  timestamp: Date;
  duration: number;
  transcript?: string;
}

interface ConversationMessage {
  id: string;
  type: 'user' | 'agent';
  text: string;
  timestamp: Date;
  audioId?: string;
  extractedFields?: { fieldKey: string; value: any }[];
}

interface CollectedField {
  field: string;
  value: any;
  timestamp: Date;
  confirmed: boolean;
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface OpenAIVoiceState {
  isActive: boolean;
  isExpanded: boolean;
  isMinimized: boolean;
  connectionStatus: ConnectionStatus;
  isRecording: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  transcript: string;
  conversationHistory: ConversationMessage[];
  collectedFields: CollectedField[];
  audioRecordings: AudioRecording[];
  currentScreen: ScreenType | null;
  error: string | null;
  volume: number;
}

interface OpenAIVoiceContextValue extends OpenAIVoiceState {
  // Connection
  connect: () => Promise<void>;
  disconnect: () => void;

  // UI State
  activate: () => void;
  deactivate: () => void;
  expand: () => void;
  collapse: () => void;
  minimize: () => void;
  restore: () => void;

  // Audio controls
  toggleMute: () => void;
  setVolume: (volume: number) => void;

  // Screen management
  setCurrentScreen: (screen: ScreenType | null) => void;

  // Data management
  confirmField: (fieldKey: string) => void;
  editField: (fieldKey: string, value: any) => void;
  applyFieldsToForm: () => Promise<void>;

  // Audio recordings
  getRecordings: () => AudioRecording[];
  downloadRecording: (id: string) => void;
  clearRecordings: () => void;

  // Utilities
  clearError: () => void;
  clearConversation: () => void;
  sendTextMessage: (text: string) => void;
}

const OpenAIVoiceContext = createContext<OpenAIVoiceContextValue | undefined>(undefined);

interface OpenAIVoiceProviderProps {
  children: React.ReactNode;
}

export const OpenAIVoiceProvider: React.FC<OpenAIVoiceProviderProps> = ({ children }) => {
  const onboarding = useOnboarding();
  const { currentLanguage } = useLanguage();

  const [state, setState] = useState<OpenAIVoiceState>({
    isActive: false,
    isExpanded: false,
    isMinimized: false,
    connectionStatus: 'disconnected',
    isRecording: false,
    isMuted: false,
    isSpeaking: false,
    transcript: '',
    conversationHistory: [],
    collectedFields: [],
    audioRecordings: [],
    currentScreen: null,
    error: null,
    volume: 1.0
  });

  // Refs for WebSocket and audio handling
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const playbackQueueRef = useRef<ArrayBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const recordingChunksRef = useRef<Float32Array[]>([]);
  const recordingStartTimeRef = useRef<Date | null>(null);

  // Ref to track mute state in callbacks
  const isMutedRef = useRef(false);

  // Keep ref in sync with state
  useEffect(() => {
    isMutedRef.current = state.isMuted;
  }, [state.isMuted]);

  // Get system prompt based on current screen and language
  const getSystemPrompt = useCallback(() => {
    const screenFields = state.currentScreen ? getFieldsForScreen(state.currentScreen) : [];
    const fieldsList = screenFields.map(f => `- ${f.fieldKey}: ${f.aliases.en[0]}`).join('\n');

    const languageInstructions: Record<string, string> = {
      en: 'Respond in English. Be conversational and friendly.',
      hi: 'Respond primarily in Hindi (हिंदी में जवाब दें). You can use simple English words if needed. Say things like "आपका नाम क्या है?" for name, "आपकी उम्र क्या है?" for age.',
      as: 'Respond in Assamese (অসমীয়াত উত্তৰ দিয়ক). Mix with Hindi or English if needed for clarity.',
      mr: 'Respond in Marathi (मराठीत उत्तर द्या). Be friendly and conversational.',
      bn: 'Respond in Bengali (বাংলায় উত্তর দিন). Be warm and helpful.',
      ta: 'Respond in Tamil (தமிழில் பதிலளிக்கவும்). Be respectful and clear.',
      te: 'Respond in Telugu (తెలుగులో సమాధానం ఇవ్వండి). Be patient and supportive.',
      gu: 'Respond in Gujarati (ગુજરાતીમાં જવાબ આપો). Be friendly.',
      kn: 'Respond in Kannada (ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಿ). Be helpful.',
      ml: 'Respond in Malayalam (മലയാളത്തിൽ മറുപടി നൽകുക). Be supportive.',
      pa: 'Respond in Punjabi (ਪੰਜਾਬੀ ਵਿੱਚ ਜਵਾਬ ਦਿਓ). Be warm and friendly.',
      or: 'Respond in Odia (ଓଡ଼ିଆରେ ଉତ୍ତର ଦିଅନ୍ତୁ). Be patient.'
    };

    return `You are Quiver AI, a friendly voice assistant helping rural entrepreneurs in India fill out onboarding forms.

IMPORTANT LANGUAGE INSTRUCTION:
${languageInstructions[currentLanguage] || languageInstructions.en}

You MUST respond in the user's language. If they speak Hindi, respond in Hindi. If they speak Assamese, respond in Assamese. Match their language.

CRITICAL RULES - FOLLOW STRICTLY:
1. NEVER assume or guess information the user did not explicitly say
2. NEVER auto-fill fields based on partial or unclear audio
3. ALWAYS repeat back what you heard and ask for confirmation before saving ANY field
4. If audio is unclear or you're not 100% certain, ASK the user to repeat
5. Ask ONE question at a time and wait for a CLEAR response
6. Only call update_form_field AFTER the user confirms the information is correct

Your role:
1. Guide users through filling out form fields naturally through conversation
2. Ask ONE question at a time and wait for a clear response
3. When you hear an answer, repeat it back: "I heard [value], is that correct?"
4. Only save the field AFTER user confirms with "yes", "हाँ", "correct", etc.
5. Be patient, supportive, and encouraging

Current form section: ${state.currentScreen || 'general'}
Fields to collect:
${fieldsList || 'No specific fields - just help the user with their questions'}

IMPORTANT: Do NOT call update_form_field until the user explicitly confirms the value.
Keep responses concise (1-2 sentences) and conversational.

Start by greeting the user warmly and asking how you can help them today.`;
  }, [state.currentScreen, currentLanguage]);

  // Connect to Voice Realtime API
  const connect = useCallback(async () => {
    if (state.connectionStatus === 'connecting' || state.connectionStatus === 'connected') {
      return;
    }

    setState(prev => ({ ...prev, connectionStatus: 'connecting', error: null }));

    try {
      // Check for direct API key (development) or use backend token
      const openAIKey = import.meta.env.VITE_OPENAI_API_KEY;
      const model = import.meta.env.VITE_OPENAI_REALTIME_MODEL || 'gpt-4o-realtime-preview-2024-12-17';

      let token: string;

      if (openAIKey) {
        // Direct connection using frontend API key (development mode)
        console.log('Voice: Using direct API key');
        token = openAIKey;
      } else {
        // Use backend token endpoint (production mode)
        console.log('Voice: Fetching token from backend');
        const tokenData = await getVoiceAgentToken();
        console.log('Voice: Token response:', JSON.stringify(tokenData, null, 2));

        // Extract token from various possible response formats
        if (typeof tokenData === 'string') {
          token = tokenData;
        } else if (tokenData.client_secret?.value) {
          token = tokenData.client_secret.value;
        } else if (tokenData.token) {
          token = tokenData.token;
        } else if ((tokenData as any).data?.client_secret?.value) {
          token = (tokenData as any).data.client_secret.value;
        } else if ((tokenData as any).data?.token) {
          token = (tokenData as any).data.token;
        } else {
          console.error('Voice: Could not extract token from response:', tokenData);
          throw new Error('Invalid token response from server');
        }
      }

      if (!token || typeof token !== 'string') {
        throw new Error('Voice service token is invalid');
      }

      // Connect to Realtime API via WebSocket
      const wsUrl = `wss://api.openai.com/v1/realtime?model=${model}`;
      const ws = new WebSocket(wsUrl, [
        'realtime',
        `openai-insecure-api-key.${token}`,
        'openai-beta.realtime-v1'
      ]);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Quiver Voice: WebSocket connected');

        // Send session configuration
        ws.send(JSON.stringify({
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: getSystemPrompt(),
            voice: 'alloy',
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: {
              model: 'whisper-1'
            },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.7,           // Higher = less sensitive to background noise
              prefix_padding_ms: 500,   // More buffer before speech starts
              silence_duration_ms: 1200 // Wait longer before considering speech ended
            },
            tools: [
              {
                type: 'function',
                name: 'update_form_field',
                description: 'Update a form field with the extracted value from user speech',
                parameters: {
                  type: 'object',
                  properties: {
                    field: {
                      type: 'string',
                      description: 'The field key to update (e.g., fullName, email, gender, age, etc.)'
                    },
                    value: {
                      type: 'string',
                      description: 'The extracted value for the field'
                    }
                  },
                  required: ['field', 'value']
                }
              },
              {
                type: 'function',
                name: 'confirm_all_fields',
                description: 'Mark all collected fields as confirmed when user approves',
                parameters: {
                  type: 'object',
                  properties: {},
                  required: []
                }
              }
            ]
          }
        }));

        setState(prev => ({ ...prev, connectionStatus: 'connected' }));
        startAudioCapture();
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleRealtimeMessage(message);
      };

      ws.onerror = (event) => {
        console.error('Quiver Voice: WebSocket error', event);
        setState(prev => ({
          ...prev,
          connectionStatus: 'error',
          error: 'Connection error. Please try again.'
        }));
      };

      ws.onclose = () => {
        console.log('Quiver Voice: WebSocket closed');
        setState(prev => ({ ...prev, connectionStatus: 'disconnected' }));
        stopAudioCapture();
      };

    } catch (err) {
      console.error('Quiver Voice: Failed to connect', err);
      setState(prev => ({
        ...prev,
        connectionStatus: 'error',
        error: err instanceof Error ? err.message : 'Failed to connect'
      }));
    }
  }, [state.connectionStatus, getSystemPrompt]);

  // Handle incoming WebSocket messages
  const handleRealtimeMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'session.created':
        console.log('Quiver Voice: Session created');
        // Trigger initial greeting
        wsRef.current?.send(JSON.stringify({
          type: 'response.create',
          response: { modalities: ['text', 'audio'] }
        }));
        break;

      case 'response.audio.delta':
        // Skip queueing audio when muted - this prevents audio buildup
        if (message.delta && !isMutedRef.current) {
          const audioData = base64ToArrayBuffer(message.delta);
          playbackQueueRef.current.push(audioData);
          playNextAudio();
        }
        break;

      case 'response.audio_transcript.delta':
        if (message.delta) {
          setState(prev => {
            const newHistory = [...prev.conversationHistory];
            const lastMessage = newHistory[newHistory.length - 1];

            if (lastMessage && lastMessage.type === 'agent' && !lastMessage.text.endsWith('.')) {
              lastMessage.text += message.delta;
            } else {
              newHistory.push({
                id: Date.now().toString(),
                type: 'agent',
                text: message.delta,
                timestamp: new Date()
              });
            }

            return { ...prev, conversationHistory: newHistory, isSpeaking: true };
          });
        }
        break;

      case 'response.audio_transcript.done':
        setState(prev => ({ ...prev, isSpeaking: false }));
        break;

      case 'conversation.item.input_audio_transcription.completed':
        if (message.transcript) {
          // Save the recording with transcript
          saveCurrentRecording(message.transcript);

          setState(prev => ({
            ...prev,
            transcript: message.transcript,
            conversationHistory: [...prev.conversationHistory, {
              id: Date.now().toString(),
              type: 'user',
              text: message.transcript,
              timestamp: new Date()
            }]
          }));
        }
        break;

      case 'response.function_call_arguments.done':
        if (message.name === 'update_form_field') {
          try {
            const args = JSON.parse(message.arguments);
            handleFieldUpdate(args.field, args.value);
          } catch (e) {
            console.error('Failed to parse function call', e);
          }
        } else if (message.name === 'confirm_all_fields') {
          confirmAllFields();
        }

        // Send function result
        wsRef.current?.send(JSON.stringify({
          type: 'conversation.item.create',
          item: {
            type: 'function_call_output',
            call_id: message.call_id || `call_${Date.now()}`,
            output: JSON.stringify({ success: true })
          }
        }));
        break;

      case 'input_audio_buffer.speech_started':
        setState(prev => ({ ...prev, isRecording: true }));
        recordingStartTimeRef.current = new Date();
        recordingChunksRef.current = [];
        break;

      case 'input_audio_buffer.speech_stopped':
        setState(prev => ({ ...prev, isRecording: false }));
        break;

      case 'error':
        console.error('Realtime API error:', message.error);
        setState(prev => ({
          ...prev,
          error: message.error?.message || 'An error occurred'
        }));
        break;
    }
  }, []);

  // Handle field updates from voice
  const handleFieldUpdate = useCallback((field: string, value: string) => {
    setState(prev => {
      const existingIdx = prev.collectedFields.findIndex(f => f.field === field);
      const newField: CollectedField = {
        field,
        value,
        timestamp: new Date(),
        confirmed: false
      };

      if (existingIdx >= 0) {
        const updated = [...prev.collectedFields];
        updated[existingIdx] = newField;
        return { ...prev, collectedFields: updated };
      }
      return { ...prev, collectedFields: [...prev.collectedFields, newField] };
    });

    // Update onboarding context immediately
    onboarding.setField(field, value);
  }, [onboarding]);

  // Confirm all collected fields
  const confirmAllFields = useCallback(() => {
    setState(prev => ({
      ...prev,
      collectedFields: prev.collectedFields.map(f => ({ ...f, confirmed: true }))
    }));
  }, []);

  // Start capturing audio from microphone
  const startAudioCapture = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      mediaStreamRef.current = stream;

      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);

      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      processorRef.current.onaudioprocess = (e) => {
        if (!isMutedRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);

          // Store for recording
          recordingChunksRef.current.push(new Float32Array(inputData));

          // Send to API
          const pcm16 = float32ToPCM16(inputData);
          const base64 = arrayBufferToBase64(pcm16.buffer);

          wsRef.current.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: base64
          }));
        }
      };

      source.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);

    } catch (err) {
      console.error('Failed to access microphone', err);
      setState(prev => ({
        ...prev,
        error: 'Could not access microphone. Please check permissions.'
      }));
    }
  }, [state.isMuted]);

  // Stop audio capture
  const stopAudioCapture = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  // Save current recording
  const saveCurrentRecording = useCallback(async (transcript: string) => {
    if (recordingChunksRef.current.length === 0 || !recordingStartTimeRef.current) return;

    const totalLength = recordingChunksRef.current.reduce((acc, chunk) => acc + chunk.length, 0);
    const combined = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of recordingChunksRef.current) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }

    // Convert to WAV blob
    const wavBlob = float32ToWav(combined, 24000);
    const duration = (Date.now() - recordingStartTimeRef.current.getTime()) / 1000;

    const recording: AudioRecording = {
      id: `rec_${Date.now()}`,
      blob: wavBlob,
      timestamp: recordingStartTimeRef.current,
      duration,
      transcript
    };

    // Save to IndexedDB for persistence
    try {
      await audioStorage.saveRecording({
        ...recording,
        sessionId: onboarding.sessionId || undefined,
        screen: state.currentScreen || undefined
      });
    } catch (err) {
      console.error('Failed to persist recording:', err);
    }

    // Upload to Azure if session exists
    if (onboarding.sessionId) {
      try {
        await uploadAudio(onboarding.sessionId, wavBlob, {
          transcript,
          duration_seconds: duration,
          screen: state.currentScreen || undefined,
          recorded_at: recordingStartTimeRef.current.toISOString()
        });
        console.log('Audio uploaded to Azure successfully');
      } catch (err) {
        console.error('Failed to upload audio to Azure:', err);
      }
    }

    setState(prev => ({
      ...prev,
      audioRecordings: [...prev.audioRecordings, recording]
    }));

    recordingChunksRef.current = [];
    recordingStartTimeRef.current = null;
  }, [onboarding.sessionId, state.currentScreen]);

  // Play audio from queue
  const playNextAudio = useCallback(async () => {
    // Don't play if muted or no audio in queue
    if (isPlayingRef.current || playbackQueueRef.current.length === 0 || isMutedRef.current) {
      if (isMutedRef.current) {
        // Clear the queue when muted
        playbackQueueRef.current = [];
      }
      return;
    }

    isPlayingRef.current = true;
    const audioData = playbackQueueRef.current.shift()!;

    try {
      // Double check mute state before playing
      if (isMutedRef.current) {
        isPlayingRef.current = false;
        playbackQueueRef.current = [];
        return;
      }

      const audioContext = new AudioContext({ sampleRate: 24000 });
      const audioBuffer = audioContext.createBuffer(1, audioData.byteLength / 2, 24000);
      const channelData = audioBuffer.getChannelData(0);
      const dataView = new DataView(audioData);

      for (let i = 0; i < audioData.byteLength / 2; i++) {
        channelData[i] = dataView.getInt16(i * 2, true) / 32768;
      }

      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();
      gainNode.gain.value = isMutedRef.current ? 0 : state.volume;

      source.buffer = audioBuffer;
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);

      source.onended = () => {
        isPlayingRef.current = false;
        if (!isMutedRef.current) {
          playNextAudio();
        }
      };
      source.start();
    } catch (err) {
      console.error('Failed to play audio', err);
      isPlayingRef.current = false;
      playNextAudio();
    }
  }, [state.volume]);

  // Disconnect
  const disconnect = useCallback(() => {
    stopAudioCapture();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setState(prev => ({ ...prev, connectionStatus: 'disconnected' }));
  }, [stopAudioCapture]);

  // UI State handlers
  const activate = useCallback(() => {
    setState(prev => ({ ...prev, isActive: true, isExpanded: true, isMinimized: false }));
  }, []);

  const deactivate = useCallback(() => {
    disconnect();
    setState(prev => ({
      ...prev,
      isActive: false,
      isExpanded: false,
      isMinimized: false
    }));
  }, [disconnect]);

  const expand = useCallback(() => {
    setState(prev => ({ ...prev, isExpanded: true, isMinimized: false }));
  }, []);

  const collapse = useCallback(() => {
    setState(prev => ({ ...prev, isExpanded: false }));
  }, []);

  const minimize = useCallback(() => {
    setState(prev => ({ ...prev, isMinimized: true }));
  }, []);

  const restore = useCallback(() => {
    setState(prev => ({ ...prev, isMinimized: false }));
  }, []);

  // Audio controls
  const toggleMute = useCallback(() => {
    setState(prev => {
      const newMuted = !prev.isMuted;

      // If muting, stop any current audio playback
      if (newMuted) {
        playbackQueueRef.current = []; // Clear playback queue
        isPlayingRef.current = false;
      }

      return { ...prev, isMuted: newMuted, isSpeaking: newMuted ? false : prev.isSpeaking };
    });
  }, []);

  const setVolume = useCallback((volume: number) => {
    setState(prev => ({ ...prev, volume: Math.max(0, Math.min(1, volume)) }));
  }, []);

  // Screen management
  const setCurrentScreen = useCallback((screen: ScreenType | null) => {
    setState(prev => ({ ...prev, currentScreen: screen }));
  }, []);

  // Field management
  const confirmField = useCallback((fieldKey: string) => {
    setState(prev => ({
      ...prev,
      collectedFields: prev.collectedFields.map(f =>
        f.field === fieldKey ? { ...f, confirmed: true } : f
      )
    }));
  }, []);

  const editField = useCallback((fieldKey: string, value: any) => {
    setState(prev => ({
      ...prev,
      collectedFields: prev.collectedFields.map(f =>
        f.field === fieldKey ? { ...f, value, confirmed: false } : f
      )
    }));
    onboarding.setField(fieldKey, value);
  }, [onboarding]);

  const applyFieldsToForm = useCallback(async () => {
    // Apply ALL collected fields (not just confirmed ones)
    if (state.collectedFields.length === 0) return;

    const fields = state.collectedFields.reduce((acc, f) => {
      acc[f.field] = f.value;
      return acc;
    }, {} as Record<string, any>);

    // Mark all as confirmed
    setState(prev => ({
      ...prev,
      collectedFields: prev.collectedFields.map(f => ({ ...f, confirmed: true }))
    }));

    // Update each field individually to ensure React detects changes
    Object.entries(fields).forEach(([key, value]) => {
      onboarding.setField(key, value);
    });

    // Dispatch a custom event so forms can listen for updates
    window.dispatchEvent(new CustomEvent('voiceFieldsApplied', { detail: fields }));

    // Also sync to backend if session exists
    if (onboarding.sessionId) {
      try {
        const apiFields = Object.entries(fields).map(([key, value]) => ({
          key,
          value: String(value),
          source: 'voice' as const
        }));
        await bulkUpdateFields(onboarding.sessionId, apiFields);
      } catch (err) {
        console.error('Failed to sync fields to backend', err);
      }
    }
  }, [state.collectedFields, onboarding]);

  // Recording management
  const getRecordings = useCallback(() => state.audioRecordings, [state.audioRecordings]);

  const downloadRecording = useCallback((id: string) => {
    const recording = state.audioRecordings.find(r => r.id === id);
    if (!recording) return;

    const url = URL.createObjectURL(recording.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording_${recording.timestamp.toISOString()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [state.audioRecordings]);

  const clearRecordings = useCallback(async () => {
    try {
      await audioStorage.clearAllRecordings();
    } catch (err) {
      console.error('Failed to clear recordings from storage:', err);
    }
    setState(prev => ({ ...prev, audioRecordings: [] }));
  }, []);

  // Utilities
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearConversation = useCallback(() => {
    setState(prev => ({
      ...prev,
      conversationHistory: [],
      collectedFields: [],
      transcript: ''
    }));
  }, []);

  const sendTextMessage = useCallback((text: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    // Add to conversation history
    setState(prev => ({
      ...prev,
      conversationHistory: [...prev.conversationHistory, {
        id: Date.now().toString(),
        type: 'user',
        text,
        timestamp: new Date()
      }]
    }));

    // Send to API
    wsRef.current.send(JSON.stringify({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text }]
      }
    }));

    wsRef.current.send(JSON.stringify({
      type: 'response.create',
      response: { modalities: ['text', 'audio'] }
    }));
  }, []);

  // Load persisted recordings on mount
  useEffect(() => {
    const loadPersistedRecordings = async () => {
      try {
        const stored = await audioStorage.getAllRecordings();
        if (stored.length > 0) {
          const recordings: AudioRecording[] = stored.map(rec => ({
            id: rec.id,
            blob: rec.blob,
            timestamp: new Date(rec.timestamp),
            duration: rec.duration,
            transcript: rec.transcript
          }));
          setState(prev => ({
            ...prev,
            audioRecordings: recordings
          }));
        }
      } catch (err) {
        console.error('Failed to load persisted recordings:', err);
      }
    };

    loadPersistedRecordings();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const value: OpenAIVoiceContextValue = {
    ...state,
    connect,
    disconnect,
    activate,
    deactivate,
    expand,
    collapse,
    minimize,
    restore,
    toggleMute,
    setVolume,
    setCurrentScreen,
    confirmField,
    editField,
    applyFieldsToForm,
    getRecordings,
    downloadRecording,
    clearRecordings,
    clearError,
    clearConversation,
    sendTextMessage
  };

  return (
    <OpenAIVoiceContext.Provider value={value}>
      {children}
    </OpenAIVoiceContext.Provider>
  );
};

export const useOpenAIVoice = () => {
  const context = useContext(OpenAIVoiceContext);
  if (!context) {
    throw new Error('useOpenAIVoice must be used within an OpenAIVoiceProvider');
  }
  return context;
};

// Helper functions
function float32ToPCM16(float32Array: Float32Array): Int16Array {
  const pcm16 = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return pcm16;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function float32ToWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // WAV header
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  // Audio data
  const pcm16 = float32ToPCM16(samples);
  for (let i = 0; i < pcm16.length; i++) {
    view.setInt16(44 + i * 2, pcm16[i], true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

export default OpenAIVoiceContext;
