export interface AIAssistantConfig {
  assistant_name: Record<string, string>;
  assistant_subtitle: Record<string, string>;
  greeting_messages: Record<string, string>;
  voice_type: 'alloy' | 'echo' | 'shimmer' | 'ash' | 'ballad' | 'coral' | 'sage' | 'verse';
  style_preset: 'friendly' | 'professional' | 'casual' | 'empathetic';
  custom_system_prompt: string;
  personality_traits: string[];
  vad_threshold: number;
  silence_duration_ms: number;
  vad_prefix_padding_ms: number;
  updated_at: string;
}

export type AIAssistantPublicConfig = Pick<
  AIAssistantConfig,
  'assistant_name' | 'assistant_subtitle' | 'greeting_messages' | 'voice_type' | 'style_preset'
>;
