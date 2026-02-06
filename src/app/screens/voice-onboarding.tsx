import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Mic, MicOff, Volume2, VolumeX, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { IllustrationPlaceholder } from "../components/IllustrationPlaceholder";
import { getVoiceAgentToken, getVoiceAgentConfig, submitVoiceAgentData } from "../../services/api";

interface VoiceOnboardingProps {
  onBack: () => void;
  onComplete: (sessionId: string) => void;
  phone: string;
}

interface CollectedField {
  field: string;
  value: string;
  timestamp: Date;
}

interface SavedSession {
  fields: CollectedField[];
  transcript: string[];
  savedAt: string;
}

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

// Storage key for persisting session data
const getStorageKey = (phone: string) => `voice_onboarding_${phone}`;

export function VoiceOnboarding({ onBack, onComplete, phone }: VoiceOnboardingProps) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [collectedFields, setCollectedFields] = useState<CollectedField[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRestoredSession, setHasRestoredSession] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const playbackQueueRef = useRef<ArrayBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const processedCallIdsRef = useRef<Set<string>>(new Set()); // Track processed function calls
  const collectedFieldsRef = useRef<CollectedField[]>([]); // Ref to avoid stale closures

  // Field labels for display
  const fieldLabels: Record<string, string> = {
    full_name: "Full Name",
    email: "Email Address",
    gender: "Gender",
    age: "Age",
    education: "Education Level",
    state: "State",
    district: "District",
    business_name: "Business Name",
    business_type: "Business Type",
    year_started: "Year Started",
    ownership_type: "Ownership Type",
    role: "Your Role",
  };

  const connectToVoiceAgent = useCallback(async () => {
    setConnectionStatus("connecting");
    setError(null);
    processedCallIdsRef.current.clear(); // Reset for new session

    try {
      // Check for direct API key (like QuiverAIAssistant does)
      const directApiKey = import.meta.env.VITE_OPENAI_API_KEY;
      const model = import.meta.env.VITE_OPENAI_REALTIME_MODEL || 'gpt-4o-realtime-preview-2024-12-17';

      let token: string;
      let config: any;
      let wsUrl: string;

      if (directApiKey) {
        // Use direct API key (same as QuiverAIAssistant)
        console.log("Using direct API key from VITE_OPENAI_API_KEY");
        token = directApiKey;
        wsUrl = `wss://api.openai.com/v1/realtime?model=${model}`;
        config = await getVoiceAgentConfig();
      } else {
        // Use backend ephemeral token
        console.log("Fetching ephemeral token from backend");
        const tokenData = await getVoiceAgentToken();
        config = await getVoiceAgentConfig();
        token = tokenData.token;
        wsUrl = `${tokenData.websocket_url}?model=${tokenData.model}`;
      }

      console.log("Connecting to:", wsUrl, "with token type:", token.startsWith('sk-') ? 'API_KEY' : 'EPHEMERAL', "prefix:", token.substring(0, 15) + "...");

      // Subprotocol auth - include 'realtime' protocol
      const ws = new WebSocket(wsUrl, [
        "realtime",
        `openai-insecure-api-key.${token}`,
        "openai-beta.realtime-v1"
      ]);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected, accepted protocol:", ws.protocol);

        // Send session configuration (no separate auth needed - handled by subprotocol)
        ws.send(JSON.stringify({
          type: "session.update",
          session: {
            modalities: ["text", "audio"],
            instructions: config.instructions,
            voice: config.voice,
            input_audio_format: config.input_audio_format,
            output_audio_format: config.output_audio_format,
            input_audio_transcription: config.input_audio_transcription,
            turn_detection: config.turn_detection,
            tools: config.tools,
          }
        }));
        console.log("Session config sent");

        setConnectionStatus("connected");
        startAudioCapture();
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleRealtimeMessage(message);
      };

      ws.onerror = (event) => {
        console.error("WebSocket error:", event);
        setError("Connection error. Please try again.");
        setConnectionStatus("error");
      };

      ws.onclose = () => {
        console.log("WebSocket closed");
        setConnectionStatus("disconnected");
        stopAudioCapture();
      };

    } catch (err) {
      console.error("Failed to connect:", err);
      setError(err instanceof Error ? err.message : "Failed to connect to voice agent");
      setConnectionStatus("error");
    }
  }, []);

  const handleRealtimeMessage = (message: any) => {
    // Log all message types for debugging
    if (!message.type?.includes('audio.delta')) {
      console.log("Realtime message:", message.type, message);
    }

    switch (message.type) {
      case "session.created":
        console.log("Session created");
        // Start the conversation
        wsRef.current?.send(JSON.stringify({
          type: "response.create",
          response: {
            modalities: ["text", "audio"],
          }
        }));
        break;

      case "response.audio.delta":
        // Queue audio for playback
        if (message.delta) {
          const audioData = base64ToArrayBuffer(message.delta);
          playbackQueueRef.current.push(audioData);
          playNextAudio();
        }
        break;

      case "response.audio_transcript.delta":
        // AI is speaking - add to transcript
        if (message.delta) {
          setTranscript(prev => {
            const newTranscript = [...prev];
            if (newTranscript.length > 0 && newTranscript[newTranscript.length - 1].startsWith("AI: ")) {
              newTranscript[newTranscript.length - 1] += message.delta;
            } else {
              newTranscript.push(`AI: ${message.delta}`);
            }
            return newTranscript;
          });
        }
        break;

      case "conversation.item.input_audio_transcription.completed":
        // User speech transcribed
        if (message.transcript) {
          setTranscript(prev => [...prev, `You: ${message.transcript}`]);
        }
        break;

      case "response.function_call_arguments.done": {
        // Handle function calls (field updates)
        // IMPORTANT: We must use the exact call_id from the message to respond
        const callId = message.call_id;
        console.log("Function call received:", message.name, "call_id:", callId);

        // Prevent duplicate processing
        if (processedCallIdsRef.current.has(callId)) {
          console.log("Call already processed, skipping:", callId);
          break;
        }
        processedCallIdsRef.current.add(callId);

        if (message.name === "update_form_field") {
          try {
            const args = JSON.parse(message.arguments);
            handleFieldUpdate(args.field, args.value, callId);
          } catch (e) {
            console.error("Failed to parse function call:", e);
          }
        } else if (message.name === "complete_onboarding") {
          handleOnboardingComplete(callId);
        }
        break;
      }

      case "response.done":
        // Response completed - log for debugging
        console.log("Response completed:", message.response?.status);
        break;

      case "response.output_item.done": {
        // An output item (text, audio, or function call) completed
        console.log("Output item done:", message.item?.type, message.item);

        // Also handle function calls here as a fallback
        if (message.item?.type === "function_call" && message.item?.call_id) {
          const item = message.item;
          const itemCallId = item.call_id;

          // Prevent duplicate processing
          if (processedCallIdsRef.current.has(itemCallId)) {
            console.log("Call already processed (from output_item), skipping:", itemCallId);
            break;
          }
          processedCallIdsRef.current.add(itemCallId);

          console.log("Function call from output_item.done:", item.name, "call_id:", itemCallId);

          if (item.name === "update_form_field" && item.arguments) {
            try {
              const args = JSON.parse(item.arguments);
              handleFieldUpdate(args.field, args.value, itemCallId);
            } catch (e) {
              console.error("Failed to parse function call from output_item:", e);
            }
          } else if (item.name === "complete_onboarding") {
            handleOnboardingComplete(itemCallId);
          }
        }
        break;
      }

      case "input_audio_buffer.speech_started":
        console.log("User started speaking");
        break;

      case "input_audio_buffer.speech_stopped":
        console.log("User stopped speaking");
        break;

      case "error":
        console.error("Realtime API error:", message.error);
        // Don't show "Tool call ID not found" errors to user - these are handled internally
        if (!message.error?.message?.includes("Tool call ID")) {
          setError(message.error?.message || "An error occurred");
        }
        break;
    }
  };

  const handleFieldUpdate = (field: string, value: string, callId: string) => {
    console.log("Updating field:", field, "=", value, "for call_id:", callId);

    // Update both state and ref for immediate availability
    const updateFields = (prev: CollectedField[]): CollectedField[] => {
      const existing = prev.findIndex(f => f.field === field);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { field, value, timestamp: new Date() };
        return updated;
      }
      return [...prev, { field, value, timestamp: new Date() }];
    };

    // Update ref immediately (for sync access in callbacks)
    collectedFieldsRef.current = updateFields(collectedFieldsRef.current);
    console.log("Current collected fields:", collectedFieldsRef.current);

    // Update state (for UI re-render)
    setCollectedFields(updateFields);

    // Send function call result back using the EXACT call_id from OpenAI
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // Step 1: Send the function call output with the correct call_id
      wsRef.current.send(JSON.stringify({
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: callId,  // Use the exact call_id from OpenAI
          output: JSON.stringify({ success: true, field, value }),
        }
      }));
      console.log("Function output sent for call_id:", callId);

      // Step 2: Trigger a new response so the AI continues the conversation
      wsRef.current.send(JSON.stringify({
        type: "response.create",
        response: {
          modalities: ["text", "audio"],
        }
      }));
      console.log("Triggered new response to continue conversation");
    }
  };

  const handleOnboardingComplete = async (callId?: string) => {
    setIsSubmitting(true);

    // If this was triggered by a function call, send the response first
    if (callId && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: callId,
          output: JSON.stringify({ success: true, message: "Onboarding completed" }),
        }
      }));
      console.log("Function output sent for complete_onboarding, call_id:", callId);
    }

    try {
      // Use ref to get current fields (avoids stale closure)
      const currentFields = collectedFieldsRef.current;
      console.log("Submitting fields:", currentFields);

      // Convert collected fields to voice_data format
      const voiceData: Record<string, string> = {};
      currentFields.forEach(f => {
        voiceData[f.field] = f.value;
      });

      console.log("Voice data payload:", voiceData);

      if (Object.keys(voiceData).length === 0) {
        setError("No data collected. Please complete the voice session first.");
        setIsSubmitting(false);
        return;
      }

      // Submit to backend
      const result = await submitVoiceAgentData(phone, voiceData);

      // Clear saved session from localStorage on success
      try {
        localStorage.removeItem(getStorageKey(phone));
        console.log("Cleared saved voice session after successful submit");
      } catch (e) {
        console.error("Failed to clear saved session:", e);
      }

      // Close connection
      disconnect();

      // Notify parent
      onComplete(result.session_id);
    } catch (err) {
      console.error("Failed to submit data:", err);
      setError("Failed to save your information. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startAudioCapture = async () => {
    try {
      console.log("Starting audio capture...");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });
      console.log("Microphone access granted");
      mediaStreamRef.current = stream;

      audioContextRef.current = new AudioContext({ sampleRate: 24000 });

      // Resume AudioContext if suspended (required by browsers)
      if (audioContextRef.current.state === 'suspended') {
        console.log("AudioContext suspended, resuming...");
        await audioContextRef.current.resume();
      }
      console.log("AudioContext state:", audioContextRef.current.state);

      const source = audioContextRef.current.createMediaStreamSource(stream);

      // Create processor for capturing audio
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      let audioPacketCount = 0;
      processorRef.current.onaudioprocess = (e) => {
        // Always send audio when WebSocket is open (don't rely on stale isRecording state)
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          const pcm16 = float32ToPCM16(inputData);
          const base64 = arrayBufferToBase64(pcm16.buffer);

          wsRef.current.send(JSON.stringify({
            type: "input_audio_buffer.append",
            audio: base64,
          }));

          audioPacketCount++;
          if (audioPacketCount % 50 === 0) {
            console.log(`Audio packets sent: ${audioPacketCount}`);
          }
        }
      };

      source.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);

      console.log("Audio capture started successfully!");
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to access microphone:", err);
      setError("Could not access microphone. Please check permissions.");
    }
  };

  const stopAudioCapture = () => {
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
    setIsRecording(false);
  };

  const playNextAudio = async () => {
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
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.onended = () => {
        isPlayingRef.current = false;
        playNextAudio();
      };
      source.start();
    } catch (err) {
      console.error("Failed to play audio:", err);
      isPlayingRef.current = false;
      playNextAudio();
    }
  };

  const disconnect = () => {
    stopAudioCapture();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnectionStatus("disconnected");
  };

  const clearSavedSession = () => {
    try {
      localStorage.removeItem(getStorageKey(phone));
      setCollectedFields([]);
      collectedFieldsRef.current = [];
      setTranscript([]);
      setHasRestoredSession(false);
      console.log("Cleared saved voice session");
    } catch (e) {
      console.error("Failed to clear saved session:", e);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: isMuted ? "input_audio_buffer.clear" : "input_audio_buffer.commit",
      }));
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  // Load saved session on mount
  useEffect(() => {
    const storageKey = getStorageKey(phone);
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const session: SavedSession = JSON.parse(saved);
        // Convert timestamp strings back to Date objects
        const restoredFields = session.fields.map(f => ({
          ...f,
          timestamp: new Date(f.timestamp)
        }));

        setCollectedFields(restoredFields);
        collectedFieldsRef.current = restoredFields;
        setTranscript(session.transcript || []);
        setHasRestoredSession(true);

        console.log("Restored voice session:", restoredFields.length, "fields");
      }
    } catch (e) {
      console.error("Failed to restore voice session:", e);
    }
  }, [phone]);

  // Save session to localStorage when fields or transcript change
  useEffect(() => {
    if (collectedFields.length > 0 || transcript.length > 0) {
      const storageKey = getStorageKey(phone);
      const session: SavedSession = {
        fields: collectedFields,
        transcript: transcript,
        savedAt: new Date().toISOString()
      };
      try {
        localStorage.setItem(storageKey, JSON.stringify(session));
        console.log("Saved voice session:", collectedFields.length, "fields");
      } catch (e) {
        console.error("Failed to save voice session:", e);
      }
    }
  }, [collectedFields, transcript, phone]);

  // Keep ref in sync with state to avoid stale closures
  useEffect(() => {
    collectedFieldsRef.current = collectedFields;
  }, [collectedFields]);

  // Helper functions
  const float32ToPCM16 = (float32Array: Float32Array): Int16Array => {
    const pcm16 = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return pcm16;
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm py-3 px-5 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-900" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Voice-Guided Onboarding</h1>
            <p className="text-sm text-gray-500">Speak naturally to complete your profile</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Voice Interaction Panel */}
          <div className="space-y-6">
            {/* Connection Status */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              {/* TODO: Replace with final illustration — see GRAPHIC_DESIGN_SPEC.md */}
              <IllustrationPlaceholder
                id="GFX-VOICE-001"
                label="Friendly AI voice assistant avatar with headphones and waveforms"
                width="120px"
                height="120px"
                className="mx-auto"
              />
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Voice Assistant</h3>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  connectionStatus === "connected" ? "bg-green-100 text-green-700" :
                  connectionStatus === "connecting" ? "bg-yellow-100 text-yellow-700" :
                  connectionStatus === "error" ? "bg-red-100 text-red-600" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    connectionStatus === "connected" ? "bg-green-500 animate-pulse" :
                    connectionStatus === "connecting" ? "bg-yellow-500 animate-pulse" :
                    connectionStatus === "error" ? "bg-red-500" :
                    "bg-gray-400"
                  }`} />
                  {connectionStatus === "connected" ? "Connected" :
                   connectionStatus === "connecting" ? "Connecting..." :
                   connectionStatus === "error" ? "Error" :
                   "Disconnected"}
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Restored Session Notice */}
              {hasRestoredSession && collectedFields.length > 0 && connectionStatus === "disconnected" && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-blue-700 font-medium">Previous session restored</p>
                      <p className="text-xs text-blue-600 mt-1">
                        {collectedFields.length} field(s) recovered. Continue where you left off or start fresh.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={clearSavedSession}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Clear & Start Fresh
                  </button>
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                {connectionStatus === "disconnected" || connectionStatus === "error" ? (
                  <button
                    onClick={connectToVoiceAgent}
                    className="h-14 px-8 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl min-h-[48px] flex items-center justify-center"
                  >
                    <Mic className="w-5 h-5 mr-2" />
                    {hasRestoredSession && collectedFields.length > 0 ? "Continue Session" : "Start Voice Onboarding"}
                  </button>
                ) : connectionStatus === "connecting" ? (
                  <button disabled className="h-14 px-8 border-2 border-gray-200 bg-white hover:bg-gray-50 text-gray-900 font-medium rounded-xl min-h-[48px] flex items-center justify-center opacity-70 cursor-not-allowed">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Connecting...
                  </button>
                ) : (
                  <>
                    <button
                      onClick={toggleMute}
                      className={`h-14 w-14 rounded-full p-0 flex items-center justify-center ${
                        isMuted
                          ? "bg-red-500 hover:bg-red-600 text-white"
                          : "border-2 border-gray-200 bg-white hover:bg-gray-50 text-gray-900"
                      }`}
                    >
                      {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </button>
                    <button
                      onClick={disconnect}
                      className="border-2 border-gray-200 bg-white hover:bg-gray-50 text-gray-900 font-medium rounded-xl min-h-[48px] px-6 h-14 flex items-center justify-center"
                    >
                      End Session
                    </button>
                  </>
                )}
              </div>

              {/* Recording Indicator */}
              {isRecording && !isMuted && (
                <div className="mt-4 flex items-center justify-center gap-2 text-accent">
                  <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
                  <span className="text-sm">Listening...</span>
                </div>
              )}
            </div>

            {/* Transcript */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Conversation</h3>
              <div className="h-64 overflow-y-auto space-y-3">
                {transcript.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    Start the voice session to begin the conversation
                  </p>
                ) : (
                  transcript.map((line, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg text-sm ${
                        line.startsWith("AI:")
                          ? "bg-blue-50 text-blue-900 mr-8"
                          : "bg-gray-100 text-gray-900 ml-8"
                      }`}
                    >
                      {line}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Collected Information Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Information Collected</h3>

              {collectedFields.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Volume2 className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">
                    As you speak, your information will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {collectedFields.map((field, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-900">
                          {fieldLabels[field.field] || field.field}
                        </p>
                        <p className="text-sm text-green-700">{field.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Progress */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium">{collectedFields.length} / 12 fields</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${(collectedFields.length / 12) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-3">Tips for Voice Onboarding</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-start gap-2">
                  <span className="text-accent">1.</span>
                  Speak clearly and at a normal pace
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">2.</span>
                  Wait for the assistant to finish speaking before responding
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">3.</span>
                  You can speak in Hindi, English, or Assamese
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">4.</span>
                  If something is unclear, ask the assistant to repeat
                </li>
              </ul>
            </div>

            {/* Manual Submit */}
            {collectedFields.length >= 6 && (
              <button
                onClick={() => handleOnboardingComplete()}
                disabled={isSubmitting}
                className="w-full h-12 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl min-h-[48px] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Complete Onboarding
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
