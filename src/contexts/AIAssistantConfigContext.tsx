import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { AIAssistantPublicConfig } from '../types/aiAssistantConfig';
import type { ScreenAssistantConfig, ScreenConfigMap } from '../types/screenAssistantConfig';
import { fetchPublicAIConfig, fetchScreenAssistantConfigs } from '../services/api';
import { DEFAULT_SCREEN_CONFIGS } from '../config/defaultScreenConfigs';

interface AIAssistantConfigContextValue {
  config: AIAssistantPublicConfig | null;
  screenConfigs: ScreenConfigMap;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getLocalizedValue: (field: 'assistant_name' | 'assistant_subtitle' | 'greeting_messages', language: string) => string;
  getScreenConfig: (screenKey: string) => ScreenAssistantConfig;
}

const DEFAULT_CONFIG: AIAssistantPublicConfig = {
  assistant_name: { en: 'Jyoti Didi', hi: 'ज्योति दीदी', as: 'জ্যোতি দিদি', mr: 'ज्योती दीदी' },
  assistant_subtitle: { en: 'Your Business Guide', hi: 'आपकी बिज़नेस गाइड', as: 'আপোনাৰ ব্যৱসায় গাইড', mr: 'तुमचा व्यवसाय मार्गदर्शक' },
  greeting_messages: { en: "Hello! I'm here to help you on your Quiver journey.", hi: 'नमस्ते! मैं आपकी Quiver यात्रा में मदद करने के लिए हूँ।', as: 'নমস্কাৰ! মই আপোনাৰ Quiver যাত্ৰাত সহায় কৰিবলৈ ইয়াত আছোঁ।', mr: 'नमस्कार! मी तुमच्या Quiver प्रवासात मदत करण्यासाठी येथे आहे.' },
  voice_type: 'alloy',
  style_preset: 'friendly',
};

const FALLBACK_SCREEN_CONFIG: ScreenAssistantConfig = {
  screen_key: 'landing',
  enabled: false,
  system_prompt_override: '',
  enabled_tools: [],
  allowed_navigation_targets: [],
  custom_actions: [],
};

const AIAssistantConfigContext = createContext<AIAssistantConfigContextValue>({
  config: DEFAULT_CONFIG,
  screenConfigs: DEFAULT_SCREEN_CONFIGS,
  loading: false,
  error: null,
  refetch: async () => {},
  getLocalizedValue: () => '',
  getScreenConfig: () => FALLBACK_SCREEN_CONFIG,
});

export function AIAssistantConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AIAssistantPublicConfig>(DEFAULT_CONFIG);
  const [screenConfigs, setScreenConfigs] = useState<ScreenConfigMap>(DEFAULT_SCREEN_CONFIGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both configs in parallel
      const [publicData, screenData] = await Promise.allSettled([
        fetchPublicAIConfig(),
        fetchScreenAssistantConfigs(),
      ]);

      if (publicData.status === 'fulfilled') {
        setConfig(publicData.value);
      } else {
        console.warn('Failed to fetch AI assistant public config, using defaults');
      }

      if (screenData.status === 'fulfilled' && Object.keys(screenData.value).length > 0) {
        // Merge fetched configs with defaults (fetched overrides defaults)
        setScreenConfigs(prev => ({ ...DEFAULT_SCREEN_CONFIGS, ...screenData.value }));
      } else {
        console.warn('Failed to fetch screen configs or empty, using defaults');
      }
    } catch (err) {
      console.warn('Failed to fetch AI assistant config, using defaults:', err);
      setError(err instanceof Error ? err.message : 'Failed to load config');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const getLocalizedValue = useCallback(
    (field: 'assistant_name' | 'assistant_subtitle' | 'greeting_messages', language: string): string => {
      const source = config?.[field] || DEFAULT_CONFIG[field];
      return source[language] || source['en'] || '';
    },
    [config]
  );

  const getScreenConfig = useCallback(
    (screenKey: string): ScreenAssistantConfig => {
      return screenConfigs[screenKey] || DEFAULT_SCREEN_CONFIGS[screenKey] || FALLBACK_SCREEN_CONFIG;
    },
    [screenConfigs]
  );

  return (
    <AIAssistantConfigContext.Provider value={{ config, screenConfigs, loading, error, refetch, getLocalizedValue, getScreenConfig }}>
      {children}
    </AIAssistantConfigContext.Provider>
  );
}

export function useAIAssistantConfig() {
  return useContext(AIAssistantConfigContext);
}
