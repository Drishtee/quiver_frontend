import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

// Initialize i18n
import './i18n';

// Providers
import { LanguageProvider } from './i18n/LanguageContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { VoiceAgentProvider } from './contexts/VoiceAgentContext';
import { OpenAIVoiceProvider } from './contexts/OpenAIVoiceContext';

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <OnboardingProvider>
      <VoiceAgentProvider>
        <OpenAIVoiceProvider>
          <App />
        </OpenAIVoiceProvider>
      </VoiceAgentProvider>
    </OnboardingProvider>
  </LanguageProvider>
);
  