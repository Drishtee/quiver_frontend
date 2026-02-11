/**
 * OpenAI Voice Context
 * Uses @openai/agents SDK for voice-based form filling
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useOnboarding } from './OnboardingContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useAIAssistantConfig } from './AIAssistantConfigContext';
import { getVoiceAgentToken, bulkUpdateFields, uploadAudio } from '../services/api';
import { audioStorage } from '../services/audioStorage';
import type { ScreenType } from '../config/formFieldMappings';
import { getFieldsForScreen } from '../config/formFieldMappings';
import type { AllScreenType, ScreenAssistantConfig } from '../types/screenAssistantConfig';
import { actionRegistry } from '../config/actionRegistry';

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
  currentScreen: AllScreenType | null;
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
  setCurrentScreen: (screen: AllScreenType | null) => void;

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
  const { config: aiConfig, getScreenConfig } = useAIAssistantConfig();

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

  // Refs to avoid stale closures in WebSocket callbacks
  const sessionIdRef = useRef<string | null>(onboarding.sessionId);
  const currentScreenRef = useRef<AllScreenType | null>(state.currentScreen);

  // Keep refs in sync with state
  useEffect(() => {
    isMutedRef.current = state.isMuted;
  }, [state.isMuted]);

  useEffect(() => {
    sessionIdRef.current = onboarding.sessionId;
  }, [onboarding.sessionId]);

  useEffect(() => {
    currentScreenRef.current = state.currentScreen;
  }, [state.currentScreen]);

  // Build dynamic tools for a given screen config
  const getToolsForScreen = useCallback((screenConfig: ScreenAssistantConfig) => {
    const tools: any[] = [];
    const enabledTools = screenConfig.enabled_tools;

    if (enabledTools.includes('update_form_field')) {
      tools.push({
        type: 'function',
        name: 'update_form_field',
        description: 'Save a single form field value. Only use AFTER the user has clearly provided this information. Do NOT announce or confirm the save — continue talking naturally.',
        parameters: {
          type: 'object',
          properties: {
            field: { type: 'string', description: 'The field key to update (e.g., fullName, email, gender, age, etc.)' },
            value: { type: 'string', description: 'The extracted value for the field' }
          },
          required: ['field', 'value']
        }
      });
    }

    if (enabledTools.includes('batch_update_fields')) {
      tools.push({
        type: 'function',
        name: 'batch_update_fields',
        description: 'Save multiple form fields at once. Use when the user shares 2+ details in one response. Do NOT announce or list the saves — continue the conversation naturally.',
        parameters: {
          type: 'object',
          properties: {
            fields: {
              type: 'array',
              description: 'Array of field-value pairs to update',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', description: 'The field key to update' },
                  value: { type: 'string', description: 'The extracted value for the field' }
                },
                required: ['field', 'value']
              }
            }
          },
          required: ['fields']
        }
      });
    }

    if (enabledTools.includes('confirm_all_fields')) {
      tools.push({
        type: 'function',
        name: 'confirm_all_fields',
        description: 'Mark all collected fields as confirmed when user approves',
        parameters: { type: 'object', properties: {}, required: [] }
      });
    }

    if (enabledTools.includes('navigate_to_screen') && screenConfig.allowed_navigation_targets.length > 0) {
      tools.push({
        type: 'function',
        name: 'navigate_to_screen',
        description: `Navigate the user to a different screen. Available targets: ${screenConfig.allowed_navigation_targets.join(', ')}`,
        parameters: {
          type: 'object',
          properties: {
            screen: {
              type: 'string',
              enum: screenConfig.allowed_navigation_targets,
              description: 'The screen to navigate to'
            },
            reason: { type: 'string', description: 'Brief reason for navigation' }
          },
          required: ['screen']
        }
      });
    }

    if (enabledTools.includes('trigger_action') && screenConfig.custom_actions.length > 0) {
      tools.push({
        type: 'function',
        name: 'trigger_action',
        description: `Trigger a screen action. Available actions: ${screenConfig.custom_actions.map(a => `${a.action_id} (${a.description})`).join(', ')}`,
        parameters: {
          type: 'object',
          properties: {
            action_id: {
              type: 'string',
              enum: screenConfig.custom_actions.map(a => a.action_id),
              description: 'The action to trigger'
            }
          },
          required: ['action_id']
        }
      });
    }

    return tools;
  }, []);

  // Get system prompt based on current screen and language
  const getSystemPrompt = useCallback(() => {
    const screenFields = state.currentScreen ? getFieldsForScreen(state.currentScreen as ScreenType) : [];
    const fieldsList = screenFields.map(f => `- ${f.fieldKey}: ${f.aliases.en[0]}`).join('\n');

    const languageInstructions: Record<string, string> = {
      en: 'Respond in English. Be conversational and friendly.',
      hi: 'Respond primarily in Hindi (हिंदी में जवाब दें). You can use simple English words if needed. Say things like "आपका नाम क्या है?" for name, "आपकी उम्र क्या है?" for age.',
      as: 'Respond in Assamese (অসমীয়াত উত্তৰ দিয়ক). Mix with Hindi or English if needed for clarity.',
      mr: 'Respond in Marathi (मराठीत उत्तर द्या). Be friendly and conversational.'
    };

    const assistantName = aiConfig?.assistant_name?.en || 'Quiver AI';
    const stylePreset = aiConfig?.style_preset || 'friendly';

    return `You are ${assistantName}, a ${stylePreset} voice assistant for Quiver - an equity partnership platform for rural entrepreneurs in India.

ABOUT QUIVER:
Quiver partners with rural entrepreneurs by providing business resources, technology access, market connections, and training — through an equity-based partnership (not a loan). Quiver invests in your business growth. No interest payments — Quiver grows when you grow.

YOUR PERSONALITY:
- You are warm, patient, and conversational — like a helpful friend, NOT a form-filling robot
- Have natural conversations. Ask follow-up questions. Show genuine interest in their story
- Use short, simple sentences. Keep responses to 1-2 sentences max
- Match the user's energy and pace. If they want to chat, chat. If they want to get things done, help efficiently

${languageInstructions[currentLanguage] || languageInstructions.en}

LANGUAGE POLICY:
- Only support English, Hindi, Marathi, and Assamese
- Match the user's language. Use Devanagari for Hindi/Marathi, Eastern Nagari for Assamese
- If user speaks an unsupported language, politely ask them to switch

CONVERSATION STYLE:
- Talk naturally. Do NOT ask for fields one by one like a survey
- Do NOT proactively ask "What is your age?", "What is your education?" etc. unprompted
- If the user volunteers information ("I'm Raj, 25, from Mumbai"), acknowledge it warmly and save it
- Only ask about specific fields if the user asks for help filling the form or seems stuck
- NEVER ask about irrelevant personal details (parents, family members, etc.) — only ask about fields that exist on the current screen
- When the user just wants to talk or ask questions, have a normal conversation — don't redirect to form filling

FORM FILLING (only when user provides info or asks for help):
- When user provides info naturally, confirm briefly: "Got it, Raj from Mumbai!" then save
- Do NOT repeat every single field back in a long list — keep confirmations short and natural
- Use batch_update_fields when user gives multiple details at once
- Use update_form_field for a single detail
- If audio is unclear, ask them to repeat — never guess
- After saving fields, do NOT say "field updated" or "saved successfully" — just continue the conversation naturally

Current screen: ${state.currentScreen || 'general'}
${fieldsList ? `Available fields on this screen:\n${fieldsList}` : ''}

Start by greeting the user warmly: "${aiConfig?.greeting_messages?.en || 'Hello! I am here to help you on your Quiver journey.'}"

${state.currentScreen ? (() => {
  const sc = getScreenConfig(state.currentScreen!);
  return sc.system_prompt_override ? `\nSCREEN CONTEXT:\n${sc.system_prompt_override}` : '';
})() : ''}`;
  }, [state.currentScreen, currentLanguage, aiConfig, getScreenConfig]);

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
        console.log('Quiver Voice: Fetching token from backend');
        const tokenData = await getVoiceAgentToken();
        console.log('Quiver Voice: Token response:', tokenData);

        // Check for error in response
        if (tokenData.error) {
          console.error('Quiver Voice: Backend returned error:', tokenData.error);
          // Log debug info if available
          if ((tokenData as any).debug) {
            console.error('Quiver Voice: Debug info:', (tokenData as any).debug);
          }
          throw new Error(tokenData.error);
        }

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
          console.error('Quiver Voice: Could not extract token from response:', JSON.stringify(tokenData));
          throw new Error('Invalid token response from server - no token found');
        }

        console.log('Quiver Voice: Extracted token:', token ? `${token.substring(0, 30)}...` : 'NONE', 'length:', token?.length);
      }

      if (!token || typeof token !== 'string' || token.length < 10) {
        console.error('Quiver Voice: Invalid token:', { token, type: typeof token, length: token?.length });
        throw new Error('Voice service token is invalid');
      }

      console.log('Quiver Voice: Token valid, length:', token.length, 'prefix:', token.substring(0, 30));

      // Connect to Realtime API via WebSocket with subprotocol authentication
      // Ephemeral tokens (ek_...) work like short-lived API keys
      const wsUrl = `wss://api.openai.com/v1/realtime?model=${model}`;
      console.log('Quiver Voice: Connecting to:', wsUrl);

      const ws = new WebSocket(wsUrl, [
        'realtime',
        `openai-insecure-api-key.${token}`,
        'openai-beta.realtime-v1'
      ]);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Quiver Voice: WebSocket connected with subprotocol auth');

        // Build tools dynamically based on current screen config
        const screenConfig = state.currentScreen ? getScreenConfig(state.currentScreen) : null;
        const dynamicTools = screenConfig ? getToolsForScreen(screenConfig) : [
          // Fallback tools if no screen config
          {
            type: 'function',
            name: 'update_form_field',
            description: 'Update a SINGLE form field with the extracted value from user speech.',
            parameters: {
              type: 'object',
              properties: {
                field: { type: 'string', description: 'The field key to update' },
                value: { type: 'string', description: 'The extracted value for the field' }
              },
              required: ['field', 'value']
            }
          },
          {
            type: 'function',
            name: 'batch_update_fields',
            description: 'Update MULTIPLE form fields at once.',
            parameters: {
              type: 'object',
              properties: {
                fields: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: { type: 'string' },
                      value: { type: 'string' }
                    },
                    required: ['field', 'value']
                  }
                }
              },
              required: ['fields']
            }
          },
          {
            type: 'function',
            name: 'confirm_all_fields',
            description: 'Mark all collected fields as confirmed when user approves',
            parameters: { type: 'object', properties: {}, required: [] }
          }
        ];

        console.log(`Quiver Voice: Screen=${state.currentScreen}, Tools=${dynamicTools.map(t => t.name).join(', ')}`);

        // Send session configuration (auth handled by subprotocol)
        ws.send(JSON.stringify({
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: getSystemPrompt(),
            voice: aiConfig?.voice_type || 'alloy',
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: {
              model: 'whisper-1',
              language: currentLanguage === 'as' ? 'as' : currentLanguage === 'mr' ? 'mr' : currentLanguage === 'hi' ? 'hi' : 'en'
            },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.7,
              prefix_padding_ms: 500,
              silence_duration_ms: 1200
            },
            tools: dynamicTools
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
  }, [state.connectionStatus, getSystemPrompt, getScreenConfig, getToolsForScreen]);

  // Send session.update when screen changes while connected
  const sessionUpdateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (state.connectionStatus !== 'connected' || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    // Debounce by 300ms to handle rapid screen changes
    if (sessionUpdateTimerRef.current) {
      clearTimeout(sessionUpdateTimerRef.current);
    }

    sessionUpdateTimerRef.current = setTimeout(() => {
      const screenConfig = state.currentScreen ? getScreenConfig(state.currentScreen) : null;
      const dynamicTools = screenConfig ? getToolsForScreen(screenConfig) : [];

      console.log(`Quiver Voice: session.update for screen=${state.currentScreen}, tools=${dynamicTools.map(t => t.name).join(', ')}`);

      wsRef.current?.send(JSON.stringify({
        type: 'session.update',
        session: {
          instructions: getSystemPrompt(),
          tools: dynamicTools,
        }
      }));
    }, 300);

    return () => {
      if (sessionUpdateTimerRef.current) {
        clearTimeout(sessionUpdateTimerRef.current);
      }
    };
  }, [state.currentScreen, state.connectionStatus, getSystemPrompt, getScreenConfig, getToolsForScreen]);

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

      case 'response.function_call_arguments.done': {
        let toolResult: { success: boolean; message?: string; instruction?: string } = { success: true };

        if (message.name === 'update_form_field') {
          try {
            const args = JSON.parse(message.arguments);
            handleFieldUpdate(args.field, args.value);
            toolResult = { success: true, message: `Saved ${args.field}.`, instruction: 'Field saved silently. Continue the conversation naturally. Do NOT say "field updated" or "saved" — just move on naturally.' };
          } catch (e) {
            console.error('Failed to parse function call', e);
            toolResult = { success: false, message: 'Failed to parse arguments' };
          }
        } else if (message.name === 'batch_update_fields') {
          try {
            const args = JSON.parse(message.arguments);
            if (args.fields && Array.isArray(args.fields)) {
              args.fields.forEach((fieldData: { field: string; value: string }) => {
                handleFieldUpdate(fieldData.field, fieldData.value);
              });
              console.log(`Batch updated ${args.fields.length} fields:`, args.fields.map((f: any) => f.field).join(', '));
            }
            toolResult = { success: true, message: `Saved ${args.fields?.length || 0} fields.`, instruction: 'Fields saved silently. Continue the conversation naturally. Do NOT say "fields updated" or list what was saved — just acknowledge warmly and move on.' };
          } catch (e) {
            console.error('Failed to parse batch update function call', e);
            toolResult = { success: false, message: 'Failed to parse arguments' };
          }
        } else if (message.name === 'confirm_all_fields') {
          confirmAllFields();
        } else if (message.name === 'navigate_to_screen') {
          try {
            const args = JSON.parse(message.arguments);
            console.log(`Quiver Voice: navigate_to_screen → ${args.screen} (reason: ${args.reason || 'none'})`);
            toolResult = actionRegistry.navigateTo(args.screen);
          } catch (e) {
            console.error('Failed to parse navigate_to_screen call', e);
            toolResult = { success: false, message: 'Failed to parse navigation arguments' };
          }
        } else if (message.name === 'trigger_action') {
          try {
            const args = JSON.parse(message.arguments);
            console.log(`Quiver Voice: trigger_action → ${args.action_id}`);
            // Execute action async and send result back
            const callId = message.call_id || `call_${Date.now()}`;
            actionRegistry.executeAction(args.action_id).then((result) => {
              wsRef.current?.send(JSON.stringify({
                type: 'conversation.item.create',
                item: { type: 'function_call_output', call_id: callId, output: JSON.stringify(result) }
              }));
              wsRef.current?.send(JSON.stringify({
                type: 'response.create',
                response: { modalities: ['text', 'audio'] }
              }));
            });
            return; // Skip the synchronous send below
          } catch (e) {
            console.error('Failed to parse trigger_action call', e);
            toolResult = { success: false, message: 'Failed to parse action arguments' };
          }
        }

        // Send function result back to OpenAI
        wsRef.current?.send(JSON.stringify({
          type: 'conversation.item.create',
          item: {
            type: 'function_call_output',
            call_id: message.call_id || `call_${Date.now()}`,
            output: JSON.stringify(toolResult)
          }
        }));

        // Trigger a response after function call output
        wsRef.current?.send(JSON.stringify({
          type: 'response.create',
          response: { modalities: ['text', 'audio'] }
        }));
        break;
      }

      case 'input_audio_buffer.speech_started':
        console.log('Quiver Voice: Speech detected');
        setState(prev => ({ ...prev, isRecording: true }));
        recordingStartTimeRef.current = new Date();
        recordingChunksRef.current = [];
        break;

      case 'input_audio_buffer.speech_stopped':
        console.log('Quiver Voice: Speech ended');
        setState(prev => ({ ...prev, isRecording: false }));
        break;

      case 'input_audio_buffer.committed':
        console.log('Quiver Voice: Audio committed, awaiting response...');
        break;

      case 'response.created':
        console.log('Quiver Voice: Response generation started');
        break;

      case 'response.done':
        // Detect failed responses — the API may silently fail
        if (message.response?.status === 'failed') {
          console.error('Quiver Voice: Response FAILED:', message.response?.status_details);
          setState(prev => ({
            ...prev,
            error: message.response?.status_details?.error?.message || 'Response failed'
          }));
        } else if (message.response?.status === 'cancelled') {
          console.log('Quiver Voice: Response cancelled (user interrupted)');
        } else {
          console.log('Quiver Voice: Response completed');
        }
        break;

      case 'session.updated':
        console.log('Quiver Voice: Session config updated');
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
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      mediaStreamRef.current = stream;

      // Let browser choose native sample rate — we'll resample to 24kHz
      const ctx = new AudioContext();
      audioContextRef.current = ctx;

      // Critical: resume AudioContext (browsers suspend it without user gesture)
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const actualRate = ctx.sampleRate;
      const targetRate = 24000;
      console.log(`Quiver Voice: AudioContext sampleRate=${actualRate}, target=${targetRate}`);

      const source = ctx.createMediaStreamSource(stream);

      processorRef.current = ctx.createScriptProcessor(4096, 1, 1);
      processorRef.current.onaudioprocess = (e) => {
        if (!isMutedRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);

          // Store for recording (at original rate)
          recordingChunksRef.current.push(new Float32Array(inputData));

          // Resample to 24kHz if needed, then send as PCM16
          const samples = actualRate !== targetRate
            ? resampleAudio(inputData, actualRate, targetRate)
            : inputData;
          const pcm16 = float32ToPCM16(samples);
          const base64 = arrayBufferToBase64(pcm16.buffer);

          wsRef.current.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: base64
          }));
        }
      };

      source.connect(processorRef.current);
      processorRef.current.connect(ctx.destination);

      console.log('Quiver Voice: Audio capture started');

    } catch (err) {
      console.error('Failed to access microphone', err);
      setState(prev => ({
        ...prev,
        error: 'Could not access microphone. Please check permissions.'
      }));
    }
  }, []);

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
  // Uses refs (sessionIdRef, currentScreenRef) to avoid stale closure in handleRealtimeMessage
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

  // Persistent AudioContext for playback (avoid creating one per chunk)
  const playbackContextRef = useRef<AudioContext | null>(null);
  const volumeRef = useRef(state.volume);
  useEffect(() => { volumeRef.current = state.volume; }, [state.volume]);

  const getPlaybackContext = useCallback(() => {
    if (!playbackContextRef.current || playbackContextRef.current.state === 'closed') {
      playbackContextRef.current = new AudioContext({ sampleRate: 24000 });
    }
    return playbackContextRef.current;
  }, []);

  // Play audio from queue
  const playNextAudio = useCallback(async () => {
    // Don't play if muted or no audio in queue
    if (isPlayingRef.current || playbackQueueRef.current.length === 0 || isMutedRef.current) {
      if (isMutedRef.current) {
        playbackQueueRef.current = [];
      }
      return;
    }

    isPlayingRef.current = true;
    const audioData = playbackQueueRef.current.shift()!;

    try {
      if (isMutedRef.current) {
        isPlayingRef.current = false;
        playbackQueueRef.current = [];
        return;
      }

      const ctx = getPlaybackContext();
      if (ctx.state === 'suspended') await ctx.resume();

      const audioBuffer = ctx.createBuffer(1, audioData.byteLength / 2, 24000);
      const channelData = audioBuffer.getChannelData(0);
      const dataView = new DataView(audioData);

      for (let i = 0; i < audioData.byteLength / 2; i++) {
        channelData[i] = dataView.getInt16(i * 2, true) / 32768;
      }

      const source = ctx.createBufferSource();
      const gainNode = ctx.createGain();
      gainNode.gain.value = isMutedRef.current ? 0 : volumeRef.current;

      source.buffer = audioBuffer;
      source.connect(gainNode);
      gainNode.connect(ctx.destination);

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
  }, [getPlaybackContext]);

  // Disconnect
  const disconnect = useCallback(() => {
    stopAudioCapture();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    // Close playback context
    if (playbackContextRef.current && playbackContextRef.current.state !== 'closed') {
      playbackContextRef.current.close();
      playbackContextRef.current = null;
    }
    playbackQueueRef.current = [];
    isPlayingRef.current = false;
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
  const setCurrentScreen = useCallback((screen: AllScreenType | null) => {
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

function resampleAudio(input: Float32Array, fromRate: number, toRate: number): Float32Array {
  const ratio = fromRate / toRate;
  const outputLength = Math.round(input.length / ratio);
  const output = new Float32Array(outputLength);
  for (let i = 0; i < outputLength; i++) {
    const srcIdx = i * ratio;
    const floor = Math.floor(srcIdx);
    const ceil = Math.min(floor + 1, input.length - 1);
    const frac = srcIdx - floor;
    output[i] = input[floor] * (1 - frac) + input[ceil] * frac;
  }
  return output;
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
