import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useOnboarding } from './OnboardingContext';
import { useLanguage } from '../i18n/LanguageContext';
import { getVoiceAgentToken, getVoiceAgentConfig, bulkUpdateFields, uploadAudio } from '../services/api';
import { audioStorage } from '../services/audioStorage';
import type { ScreenType } from '../config/formFieldMappings';
import { getFieldsForScreen, findFieldByAlias, findOptionByAlias } from '../config/formFieldMappings';

// Audio recording storage
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

interface RealtimeVoiceState {
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

interface RealtimeVoiceContextValue extends RealtimeVoiceState {
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

const RealtimeVoiceContext = createContext<RealtimeVoiceContextValue | undefined>(undefined);

interface RealtimeVoiceProviderProps {
  children: React.ReactNode;
}

export const RealtimeVoiceProvider: React.FC<RealtimeVoiceProviderProps> = ({ children }) => {
  const onboarding = useOnboarding();
  const { currentLanguage } = useLanguage();

  const [state, setState] = useState<RealtimeVoiceState>({
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

  // Refs to avoid stale closures in WebSocket callbacks
  const sessionIdRef = useRef<string | null>(onboarding.sessionId);
  const currentScreenRef = useRef<ScreenType | null>(state.currentScreen);

  useEffect(() => {
    sessionIdRef.current = onboarding.sessionId;
  }, [onboarding.sessionId]);

  useEffect(() => {
    currentScreenRef.current = state.currentScreen;
  }, [state.currentScreen]);

  // Get system prompt based on current screen and language
  const getSystemPrompt = useCallback(() => {
    const screenFields = state.currentScreen ? getFieldsForScreen(state.currentScreen) : [];
    const fieldsList = screenFields.map(f => `- ${f.fieldKey}: ${f.aliases.en[0]}`).join('\n');

    const languageInstructions: Record<string, string> = {
      en: 'Respond in English.',
      hi: 'Respond in Hindi (हिंदी में जवाब दें).',
      as: 'Respond in Assamese (অসমীয়াত উত্তৰ দিয়ক).',
      mr: 'Respond in Marathi (मराठीत उत्तर द्या).'
    };

    return `You are a friendly voice assistant helping users fill out onboarding forms for Quiver, a platform that connects entrepreneurs with mentors and investors.

${languageInstructions[currentLanguage] || languageInstructions.en}

STRICT LANGUAGE POLICY:
- You ONLY support 4 languages: English, Hindi, Marathi, and Assamese.
- NEVER respond in Urdu, Arabic, Bengali, Tamil, Telugu, Gujarati, Kannada, Malayalam, Punjabi, Odia, or ANY other language.
- If the user speaks in an unsupported language, respond in English and politely ask them to speak in English, Hindi, Marathi, or Assamese.
- All transcriptions and responses must be in one of these 4 languages only.
- Use Devanagari script for Hindi and Marathi. Use Eastern Nagari script for Assamese. Never use Arabic/Perso-Arabic script.

Your role is to:
1. Guide the user through filling out form fields naturally through conversation
2. Extract relevant information from their responses
3. Confirm each piece of information before saving
4. Be patient and supportive, especially with first-time users

Current form section: ${state.currentScreen || 'unknown'}
Fields to collect:
${fieldsList || 'No specific fields for this screen'}

When you extract information, use the update_form_field function to save it.
Always confirm with the user before finalizing each field.
If the user wants to change something, allow them to do so.
Keep responses concise and conversational.`;
  }, [state.currentScreen, currentLanguage]);

  // Connect to OpenAI Realtime API
  const connect = useCallback(async () => {
    if (state.connectionStatus === 'connecting' || state.connectionStatus === 'connected') {
      return;
    }

    setState(prev => ({ ...prev, connectionStatus: 'connecting', error: null }));

    try {
      // Check for direct OpenAI key (development) or use backend token
      const openAIKey = import.meta.env.VITE_OPENAI_API_KEY;

      let wsUrl: string;
      let token: string;
      let config: any;

      if (openAIKey) {
        // Direct connection using frontend API key (development mode)
        console.log('Using direct OpenAI connection');
        wsUrl = 'wss://api.openai.com/v1/realtime';
        token = openAIKey;
        config = {
          voice: 'alloy',
          instructions: getSystemPrompt(),
          input_audio_format: 'pcm16',
          output_audio_format: 'pcm16',
          input_audio_transcription: {
            model: 'whisper-1',
            language: currentLanguage === 'as' ? 'as' : currentLanguage === 'mr' ? 'mr' : currentLanguage === 'hi' ? 'hi' : 'en'
          },
          turn_detection: {
            type: 'server_vad',
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 500
          }
        };
      } else {
        // Use backend token endpoint (production mode)
        const tokenData = await getVoiceAgentToken();
        config = await getVoiceAgentConfig();
        wsUrl = tokenData.websocket_url;
        token = tokenData.token;
      }

      const model = import.meta.env.VITE_OPENAI_REALTIME_MODEL || 'gpt-4o-realtime-preview-2024-12-17';

      // Both direct API keys and ephemeral tokens use subprotocol authentication
      // Ephemeral tokens (ek_...) work like short-lived API keys
      console.log('Realtime Voice: Connecting with token:', token.substring(0, 20) + '...');
      const ws = new WebSocket(`${wsUrl}?model=${model}`, [
        'realtime',
        `openai-insecure-api-key.${token}`,
        'openai-beta.realtime-v1'
      ]);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Realtime Voice: WebSocket connected with subprotocol auth');

        // Send session configuration (auth handled by subprotocol)
        ws.send(JSON.stringify({
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: getSystemPrompt(),
            voice: config.voice || 'alloy',
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: {
              model: 'whisper-1',
              language: currentLanguage === 'as' ? 'as' : currentLanguage === 'mr' ? 'mr' : currentLanguage === 'hi' ? 'hi' : 'en'
            },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 500
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
        console.error('Realtime Voice: WebSocket error', event);
        setState(prev => ({
          ...prev,
          connectionStatus: 'error',
          error: 'Connection error. Please try again.'
        }));
      };

      ws.onclose = () => {
        console.log('Realtime Voice: WebSocket closed');
        setState(prev => ({ ...prev, connectionStatus: 'disconnected' }));
        stopAudioCapture();
      };

    } catch (err) {
      console.error('Realtime Voice: Failed to connect', err);
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
        console.log('Realtime Voice: Session created');
        // Trigger initial greeting
        wsRef.current?.send(JSON.stringify({
          type: 'response.create',
          response: { modalities: ['text', 'audio'] }
        }));
        break;

      case 'response.audio.delta':
        if (message.delta) {
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
          // Save the recording
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
        if (!state.isMuted && wsRef.current?.readyState === WebSocket.OPEN) {
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
  // Uses refs (sessionIdRef, currentScreenRef) to avoid stale closure in WebSocket callbacks
  const saveCurrentRecording = useCallback(async (transcript: string) => {
    if (recordingChunksRef.current.length === 0 || !recordingStartTimeRef.current) return;

    // Read latest values from refs (not from closure which may be stale)
    const currentSessionId = sessionIdRef.current;
    const currentScreen = currentScreenRef.current;

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
    const recordedAt = recordingStartTimeRef.current.toISOString();

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
        sessionId: currentSessionId || undefined,
        screen: currentScreen || undefined
      });
    } catch (err) {
      console.error('Failed to persist recording:', err);
    }

    // Upload to backend if session exists
    if (currentSessionId) {
      try {
        console.log(`[AudioUpload] Uploading recording ${recording.id} for session ${currentSessionId}, screen=${currentScreen}, duration=${duration.toFixed(1)}s`);
        const result = await uploadAudio(currentSessionId, wavBlob, {
          transcript,
          duration_seconds: duration,
          screen: currentScreen || undefined,
          recorded_at: recordedAt
        });
        console.log(`[AudioUpload] Success! record_id=${result.audio_record_id}`, result.azure_error ? `(Azure warning: ${result.azure_error})` : '');

        // Mark as uploaded in IndexedDB
        try {
          await audioStorage.markAsUploaded(recording.id);
        } catch (_) { /* non-critical */ }
      } catch (err) {
        console.error(`[AudioUpload] FAILED to upload recording ${recording.id}:`, err);
      }
    } else {
      console.warn('[AudioUpload] No sessionId available - audio saved locally only, will sync when session is created');
    }

    setState(prev => ({
      ...prev,
      audioRecordings: [...prev.audioRecordings, recording]
    }));

    recordingChunksRef.current = [];
    recordingStartTimeRef.current = null;
  }, []); // No dependencies needed - uses refs for latest values

  // Play audio from queue
  const playNextAudio = useCallback(async () => {
    if (isPlayingRef.current || playbackQueueRef.current.length === 0) return;

    isPlayingRef.current = true;
    const audioData = playbackQueueRef.current.shift()!;

    try {
      const audioContext = new AudioContext({ sampleRate: 24000 });
      const audioBuffer = audioContext.createBuffer(1, audioData.byteLength / 2, 24000);
      const channelData = audioBuffer.getChannelData(0);
      const dataView = new DataView(audioData);

      for (let i = 0; i < audioData.byteLength / 2; i++) {
        channelData[i] = dataView.getInt16(i * 2, true) / 32768;
      }

      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();
      gainNode.gain.value = state.volume;

      source.buffer = audioBuffer;
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);

      source.onended = () => {
        isPlayingRef.current = false;
        playNextAudio();
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
    setState(prev => ({ ...prev, isMuted: !prev.isMuted }));
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
    const confirmedFields = state.collectedFields.filter(f => f.confirmed);
    if (confirmedFields.length === 0) return;

    const fields = confirmedFields.reduce((acc, f) => {
      acc[f.field] = f.value;
      return acc;
    }, {} as Record<string, any>);

    onboarding.setFields(fields);

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

  // Sync pending uploads when sessionId becomes available
  useEffect(() => {
    if (!onboarding.sessionId) return;

    const syncPendingUploads = async () => {
      try {
        const pending = await audioStorage.getPendingUploads();
        console.log(`[AudioSync] Found ${pending.length} pending recordings in IndexedDB`);
        if (pending.length === 0) return;

        console.log(`[AudioSync] Syncing ${pending.length} pending audio recordings to backend...`);

        let successCount = 0;
        let failCount = 0;
        for (const rec of pending) {
          try {
            console.log(`[AudioSync] Uploading ${rec.id}: session=${onboarding.sessionId}, screen=${rec.screen}, duration=${rec.duration}s`);
            const result = await uploadAudio(onboarding.sessionId!, rec.blob, {
              transcript: rec.transcript,
              duration_seconds: rec.duration,
              screen: rec.screen,
              recorded_at: rec.timestamp
            });
            await audioStorage.markAsUploaded(rec.id);
            successCount++;
            console.log(`[AudioSync] Synced ${rec.id} -> record_id=${result.audio_record_id}`);
          } catch (err) {
            failCount++;
            console.error(`[AudioSync] FAILED to sync ${rec.id}:`, err);
          }
        }
        console.log(`[AudioSync] Complete: ${successCount} uploaded, ${failCount} failed`);
      } catch (err) {
        console.error('[AudioSync] Failed to read pending uploads from IndexedDB:', err);
      }
    };

    syncPendingUploads();
  }, [onboarding.sessionId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const value: RealtimeVoiceContextValue = {
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
    <RealtimeVoiceContext.Provider value={value}>
      {children}
    </RealtimeVoiceContext.Provider>
  );
};

export const useRealtimeVoice = () => {
  const context = useContext(RealtimeVoiceContext);
  if (!context) {
    throw new Error('useRealtimeVoice must be used within a RealtimeVoiceProvider');
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

export default RealtimeVoiceContext;
