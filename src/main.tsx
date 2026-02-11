import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { FeedbackRoot } from './feedback';

// Initialize i18n
import './i18n';

// Providers
import { LanguageProvider } from './i18n/LanguageContext';
import { AIAssistantConfigProvider } from './contexts/AIAssistantConfigContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { VoiceAgentProvider } from './contexts/VoiceAgentContext';
import { OpenAIVoiceProvider } from './contexts/OpenAIVoiceContext';

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <AIAssistantConfigProvider>
      <OnboardingProvider>
        <VoiceAgentProvider>
          <OpenAIVoiceProvider>
            <App />
            <FeedbackRoot />
          </OpenAIVoiceProvider>
        </VoiceAgentProvider>
      </OnboardingProvider>
    </AIAssistantConfigProvider>
  </LanguageProvider>
);
  