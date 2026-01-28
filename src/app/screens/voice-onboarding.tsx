import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "../components/ui/button";
import { ArrowLeft, Mic, MicOff, Volume2, VolumeX, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
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

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export function VoiceOnboarding({ onBack, onComplete, phone }: VoiceOnboardingProps) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [collectedFields, setCollectedFields] = useState<CollectedField[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const playbackQueueRef = useRef<ArrayBuffer[]>([]);
  const isPlayingRef = useRef(false);

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

      case "response.function_call_arguments.done":
        // Handle function calls (field updates)
        if (message.name === "update_form_field") {
          try {
            const args = JSON.parse(message.arguments);
            handleFieldUpdate(args.field, args.value);
          } catch (e) {
            console.error("Failed to parse function call:", e);
          }
        } else if (message.name === "complete_onboarding") {
          handleOnboardingComplete();
        }
        break;

      case "error":
        console.error("Realtime API error:", message.error);
        setError(message.error?.message || "An error occurred");
        break;
    }
  };

  const handleFieldUpdate = (field: string, value: string) => {
    setCollectedFields(prev => {
      // Update existing field or add new one
      const existing = prev.findIndex(f => f.field === field);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { field, value, timestamp: new Date() };
        return updated;
      }
      return [...prev, { field, value, timestamp: new Date() }];
    });

    // Send function call result back
    wsRef.current?.send(JSON.stringify({
      type: "conversation.item.create",
      item: {
        type: "function_call_output",
        call_id: `call_${Date.now()}`,
        output: JSON.stringify({ success: true, field, value }),
      }
    }));
  };

  const handleOnboardingComplete = async () => {
    setIsSubmitting(true);
    try {
      // Convert collected fields to voice_data format
      const voiceData: Record<string, string> = {};
      collectedFields.forEach(f => {
        voiceData[f.field] = f.value;
      });

      // Submit to backend
      const result = await submitVoiceAgentData(phone, voiceData);

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
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });
      mediaStreamRef.current = stream;

      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);

      // Create processor for capturing audio
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      processorRef.current.onaudioprocess = (e) => {
        if (isRecording && !isMuted && wsRef.current?.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          const pcm16 = float32ToPCM16(inputData);
          const base64 = arrayBufferToBase64(pcm16.buffer);

          wsRef.current.send(JSON.stringify({
            type: "input_audio_buffer.append",
            audio: base64,
          }));
        }
      };

      source.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);

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
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="border-b border-border bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Voice-Guided Onboarding</h1>
            <p className="text-sm text-muted-foreground">Speak naturally to complete your profile</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Voice Interaction Panel */}
          <div className="space-y-6">
            {/* Connection Status */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Voice Assistant</h3>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  connectionStatus === "connected" ? "bg-green-100 text-green-700" :
                  connectionStatus === "connecting" ? "bg-yellow-100 text-yellow-700" :
                  connectionStatus === "error" ? "bg-red-100 text-red-700" :
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
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                {connectionStatus === "disconnected" || connectionStatus === "error" ? (
                  <Button
                    onClick={connectToVoiceAgent}
                    className="h-14 px-8 bg-primary hover:bg-primary/90"
                  >
                    <Mic className="w-5 h-5 mr-2" />
                    Start Voice Onboarding
                  </Button>
                ) : connectionStatus === "connecting" ? (
                  <Button disabled className="h-14 px-8">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Connecting...
                  </Button>
                ) : (
                  <>
                    <Button
                      variant={isMuted ? "destructive" : "outline"}
                      size="lg"
                      onClick={toggleMute}
                      className="h-14 w-14 rounded-full p-0"
                    >
                      {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={disconnect}
                      className="h-14 px-6"
                    >
                      End Session
                    </Button>
                  </>
                )}
              </div>

              {/* Recording Indicator */}
              {isRecording && !isMuted && (
                <div className="mt-4 flex items-center justify-center gap-2 text-primary">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm">Listening...</span>
                </div>
              )}
            </div>

            {/* Transcript */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
              <h3 className="font-semibold text-foreground mb-4">Conversation</h3>
              <div className="h-64 overflow-y-auto space-y-3">
                {transcript.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
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
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
              <h3 className="font-semibold text-foreground mb-4">Information Collected</h3>

              {collectedFields.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Volume2 className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-muted-foreground">
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
              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{collectedFields.length} / 12 fields</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${(collectedFields.length / 12) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl border border-blue-100 p-6">
              <h4 className="font-semibold text-foreground mb-3">Tips for Voice Onboarding</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">1.</span>
                  Speak clearly and at a normal pace
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">2.</span>
                  Wait for the assistant to finish speaking before responding
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">3.</span>
                  You can speak in Hindi, English, or Assamese
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">4.</span>
                  If something is unclear, ask the assistant to repeat
                </li>
              </ul>
            </div>

            {/* Manual Submit */}
            {collectedFields.length >= 6 && (
              <Button
                onClick={handleOnboardingComplete}
                disabled={isSubmitting}
                className="w-full h-12 bg-green-600 hover:bg-green-700"
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
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
