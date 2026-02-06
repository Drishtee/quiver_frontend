import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { AIAssistant } from "../components/ai-assistant";
import { Check, Globe, Handshake, TrendingUp, Users, Shield, Clock, Mic, FileText } from "lucide-react";
import { LanguageSelector } from "../components/language-selector";
import { IllustrationPlaceholder } from "../components/IllustrationPlaceholder";
import { useLanguage } from "../../i18n/LanguageContext";
import { useOnboarding } from "../../contexts/OnboardingContext";
import '../screens/landing.css';

interface UnderstandingConsentProps {
  onContinue: () => void;
  onVoiceOnboarding?: () => void;
}

interface ConsentItem {
  id: string;
  checked: boolean;
  timestamp: string | null;
}

export function UnderstandingConsent({ onContinue, onVoiceOnboarding }: UnderstandingConsentProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { recordConsent } = useOnboarding();

  const [consents, setConsents] = useState<ConsentItem[]>([
    { id: 'journey', checked: false, timestamp: null },
    { id: 'notGrant', checked: false, timestamp: null },
    { id: 'equityUnderstanding', checked: false, timestamp: null },
    { id: 'dataProcessing', checked: false, timestamp: null }
  ]);

  const handleConsentChange = useCallback((consentId: string, checked: boolean) => {
    const timestamp = checked ? new Date().toISOString() : null;

    setConsents(prev => prev.map(consent =>
      consent.id === consentId
        ? { ...consent, checked, timestamp }
        : consent
    ));

    // Record consent with timestamp in OnboardingContext
    if (checked) {
      recordConsent(`consent_${consentId}`, timestamp!);
    }
  }, [recordConsent]);

  const allConsentsGiven = consents.every(c => c.checked);

  const handleContinue = useCallback(() => {
    if (allConsentsGiven) {
      // Record final consent confirmation
      recordConsent('all_consents_confirmed', new Date().toISOString());
      onContinue();
    }
  }, [allConsentsGiven, onContinue, recordConsent]);

  // Get consent item by id
  const getConsent = (id: string) => consents.find(c => c.id === id);

  // Format timestamp for display
  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleString(
      currentLanguage === 'hi' ? 'hi-IN' :
      currentLanguage === 'as' ? 'as-IN' : 'en-IN',
      { dateStyle: 'short', timeStyle: 'short' }
    );
  };

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-20 mobile-full-screen">
      {/* Header - Mobile optimized */}
      <header className="bg-white shadow-sm py-3 px-4 md:py-4 md:px-6 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <img src="/logo.jpg" alt="Quiver" className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-cover mr-2 md:mr-3" />
            <span className="text-lg md:text-xl font-display font-bold text-primary">Quiver</span>
          </div>
          <LanguageSelector variant="compact" />
        </div>
      </header>

      {/* Main Content - Mobile optimized */}
      <main className="max-w-3xl mx-auto px-4 py-5 md:px-6 md:py-8">
        <div className="space-y-5 md:space-y-8">
          {/* Language Selection Card - Compact on mobile */}
          <div className="bg-white rounded-xl md:rounded-2xl border-2 border-gray-200 shadow-lg p-4 md:p-6">
            <h3 className="font-semibold text-gray-900 mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
              <Globe className="w-4 h-4 md:w-5 md:h-5 text-accent" />
              {t('consent.selectLanguage')}
            </h3>
            <LanguageSelector variant="default" className="w-full" />
          </div>

          {/* Main Title - Responsive sizing */}
          <div className="text-center space-y-1 md:space-y-2">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900">
              {t('consent.title')}
            </h1>
            <p className="text-base md:text-lg text-gray-600">{t('consent.subtitle')}</p>
          </div>

          {/* TODO: Replace with final illustration — see GRAPHIC_DESIGN_SPEC.md */}
          <IllustrationPlaceholder
            id="GFX-ONBD-001"
            label="Partnership hero — entrepreneur, bridge, Quiver team, benefit icons"
            height="200px"
          />

          {/* Description - Clean typography without container */}
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-accent rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-700 leading-relaxed text-sm md:text-lg">
                  {t('consent.description')}
                </p>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed text-sm md:text-base pl-0 md:pl-16">
              {t('consent.challenge')}
            </p>
          </div>

          {/* Why Quiver Exists - Questions as visual dividers, no containers */}
          <div className="space-y-6 md:space-y-8 pt-4">
            <h3 className="text-lg md:text-xl font-display font-bold text-gray-900 border-b border-gray-200 pb-3">
              {t('consent.whyQuiver')}
            </h3>
            <div className="space-y-5 md:space-y-6">
              {(t('consent.reasons', { returnObjects: true }) as string[]).map((reason, index) => (
                <div key={index} className="flex items-start gap-3 md:gap-4">
                  <span className="text-accent font-bold text-lg md:text-xl flex-shrink-0 w-6">{index + 1}.</span>
                  <p className="text-gray-800 leading-relaxed text-base md:text-lg font-medium">{reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* What We Do - Clean list without heavy containers */}
          <div className="space-y-4 md:space-y-5 pt-2">
            <h3 className="text-lg md:text-xl font-display font-bold text-gray-900 flex items-center gap-2 md:gap-3">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-accent" />
              {t('consent.whatWeDo')}
            </h3>
            <div className="space-y-3 md:space-y-4 pl-1">
              {(t('consent.services', { returnObjects: true }) as string[]).map((service, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 leading-relaxed text-sm md:text-base">{service}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Important Note - Highlighted yellow box for emphasis */}
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 md:p-5 mt-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 md:w-6 md:h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="font-bold text-gray-900 text-sm md:text-base">{t('consent.notProgram')}</p>
                <p className="text-gray-700 leading-relaxed text-sm md:text-base">{t('consent.partner')}</p>
              </div>
            </div>
          </div>

          {/* Consent Section - Clean, prominent layout */}
          <div className="bg-white rounded-xl md:rounded-2xl border-2 border-accent/30 shadow-lg p-4 md:p-8 space-y-5 md:space-y-6 mt-8">
            {/* Consent Header - Complete sentence, no hanging words */}
            <div className="space-y-2">
              <h3 className="text-lg md:text-xl font-display font-bold text-gray-900">
                {t('consent.consentTitle')}
              </h3>
              <p className="text-sm md:text-base text-gray-600">
                {t('consent.consentExplanation', 'By checking the boxes below, you acknowledge that you have read and understood the information above about Quiver\'s partnership model.')}
              </p>
            </div>

            {/* Progress indicator */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-300 rounded-full"
                  style={{ width: `${(consents.filter(c => c.checked).length / consents.length) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-500 font-medium">
                {consents.filter(c => c.checked).length}/{consents.length}
              </span>
            </div>

            <div className="space-y-3 md:space-y-4">
              {/* Consent 1: Journey Interest */}
              <div
                className={`p-3 md:p-4 rounded-lg md:rounded-xl border-2 transition-all ${
                  getConsent('journey')?.checked
                    ? 'border-accent bg-accent/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <label className="flex items-start gap-2.5 md:gap-3 cursor-pointer">
                  <Checkbox
                    id="consent-journey"
                    checked={getConsent('journey')?.checked || false}
                    onCheckedChange={(checked) => handleConsentChange('journey', checked as boolean)}
                    className="mt-0.5 md:mt-1"
                  />
                  <div className="flex-1">
                    <span className="text-gray-700 leading-relaxed block text-sm md:text-base">
                      {t('consent.consent1')}
                    </span>
                    {getConsent('journey')?.timestamp && (
                      <div className="flex items-center gap-1 mt-1.5 md:mt-2 text-[10px] md:text-xs text-accent">
                        <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" />
                        <span>{t('consent.agreedAt')}: {formatTimestamp(getConsent('journey')?.timestamp || null)}</span>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Consent 2: Not a Grant Program */}
              <div
                className={`p-3 md:p-4 rounded-lg md:rounded-xl border-2 transition-all ${
                  getConsent('notGrant')?.checked
                    ? 'border-accent bg-accent/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <label className="flex items-start gap-2.5 md:gap-3 cursor-pointer">
                  <Checkbox
                    id="consent-notGrant"
                    checked={getConsent('notGrant')?.checked || false}
                    onCheckedChange={(checked) => handleConsentChange('notGrant', checked as boolean)}
                    className="mt-0.5 md:mt-1"
                  />
                  <div className="flex-1">
                    <span className="text-gray-700 leading-relaxed block text-sm md:text-base">
                      {t('consent.consent2')}
                    </span>
                    {getConsent('notGrant')?.timestamp && (
                      <div className="flex items-center gap-1 mt-1.5 md:mt-2 text-[10px] md:text-xs text-accent">
                        <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" />
                        <span>{t('consent.agreedAt')}: {formatTimestamp(getConsent('notGrant')?.timestamp || null)}</span>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Consent 3: Equity Understanding - NEW */}
              <div
                className={`p-3 md:p-4 rounded-lg md:rounded-xl border-2 transition-all ${
                  getConsent('equityUnderstanding')?.checked
                    ? 'border-accent bg-accent/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <label className="flex items-start gap-2.5 md:gap-3 cursor-pointer">
                  <Checkbox
                    id="consent-equityUnderstanding"
                    checked={getConsent('equityUnderstanding')?.checked || false}
                    onCheckedChange={(checked) => handleConsentChange('equityUnderstanding', checked as boolean)}
                    className="mt-0.5 md:mt-1"
                  />
                  <div className="flex-1">
                    <span className="text-gray-700 leading-relaxed block text-sm md:text-base">
                      {t('consent.consent4')}
                    </span>
                    {getConsent('equityUnderstanding')?.timestamp && (
                      <div className="flex items-center gap-1 mt-1.5 md:mt-2 text-[10px] md:text-xs text-accent">
                        <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" />
                        <span>{t('consent.agreedAt')}: {formatTimestamp(getConsent('equityUnderstanding')?.timestamp || null)}</span>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Consent 4: Data Processing */}
              <div
                className={`p-3 md:p-4 rounded-lg md:rounded-xl border-2 transition-all ${
                  getConsent('dataProcessing')?.checked
                    ? 'border-accent bg-accent/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <label className="flex items-start gap-2.5 md:gap-3 cursor-pointer">
                  <Checkbox
                    id="consent-dataProcessing"
                    checked={getConsent('dataProcessing')?.checked || false}
                    onCheckedChange={(checked) => handleConsentChange('dataProcessing', checked as boolean)}
                    className="mt-0.5 md:mt-1"
                  />
                  <div className="flex-1">
                    <span className="text-gray-700 leading-relaxed block text-sm md:text-base">
                      {t('consent.consent3')}
                    </span>
                    {getConsent('dataProcessing')?.timestamp && (
                      <div className="flex items-center gap-1 mt-1.5 md:mt-2 text-[10px] md:text-xs text-accent">
                        <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" />
                        <span>{t('consent.agreedAt')}: {formatTimestamp(getConsent('dataProcessing')?.timestamp || null)}</span>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Consent Summary - shown when all checked */}
            {allConsentsGiven && (
              <div className="bg-accent/10 rounded-lg p-3 md:p-4 border border-accent/20">
                <p className="text-sm md:text-base text-accent font-medium text-center flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  {t('consent.allConsentsRecorded')}
                </p>
              </div>
            )}
          </div>

          {/* Fill Forms - Textual divider below consent, not in a container */}
          {/* TODO: Replace with final illustrations — see GRAPHIC_DESIGN_SPEC.md
               GFX-ONBD-002A: Form-fill path illustration (person typing on device)
               GFX-ONBD-002B: Voice-path illustration (person speaking with AI waveforms) */}
          {allConsentsGiven && (
            <div className="pt-6 md:pt-8">
              <p className="text-center text-sm md:text-base text-gray-600 font-medium mb-4">
                {t('consent.chooseMethod', 'Choose how you want to continue:')}
              </p>

              {/* Continue Options - Clean grid without heavy containers */}
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                {/* Form-based Option */}
                <button
                  onClick={handleContinue}
                  className="p-4 md:p-6 rounded-xl border-2 border-gray-200 hover:border-accent bg-white hover:bg-accent/5 transition-all group"
                >
                  <div className="flex flex-col items-center gap-2 md:gap-3 text-center">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-accent/10 rounded-full flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <FileText className="w-6 h-6 md:w-7 md:h-7 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm md:text-base">
                        {t('consent.formOption', 'Fill Forms')}
                      </h4>
                      <p className="text-xs md:text-sm text-gray-500 mt-1">
                        {t('consent.formOptionDesc', 'Type step by step')}
                      </p>
                    </div>
                  </div>
                </button>

                {/* Voice-guided Option */}
                {onVoiceOnboarding && (
                  <button
                    onClick={() => {
                      recordConsent('all_consents_confirmed', new Date().toISOString());
                      onVoiceOnboarding();
                    }}
                    className="p-4 md:p-6 rounded-xl border-2 border-accent hover:border-accent bg-accent/5 hover:bg-accent/10 transition-all group relative"
                  >
                    <div className="flex flex-col items-center gap-2 md:gap-3 text-center">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-accent rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Mic className="w-6 h-6 md:w-7 md:h-7 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm md:text-base">
                          {t('consent.voiceOption', 'Voice')}
                        </h4>
                        <p className="text-xs md:text-sm text-gray-500 mt-1">
                          {t('consent.voiceOptionDesc', 'Speak with AI')}
                        </p>
                      </div>
                    </div>
                    <span className="absolute -top-2 -right-2 text-[10px] md:text-xs bg-accent text-white px-2 py-1 rounded-full font-medium">
                      {t('consent.recommended', 'Best')}
                    </span>
                  </button>
                )}
              </div>

              {/* Fallback single button if voice not available */}
              {!onVoiceOnboarding && (
                <Button
                  className="w-full h-12 md:h-14 bg-accent hover:bg-accent/90 text-base md:text-lg font-semibold rounded-xl transition-all mt-4"
                  onClick={handleContinue}
                >
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4 md:w-5 md:h-5" />
                    {t('common.continue')}
                  </span>
                </Button>
              )}
            </div>
          )}

          {/* Disabled state when consents not complete */}
          {!allConsentsGiven && (
            <div className="pt-6">
              <Button
                className="w-full h-12 md:h-14 bg-gray-200 text-gray-400 text-base md:text-lg font-semibold rounded-xl cursor-not-allowed"
                disabled
              >
                {t('consent.pleaseAgreeAll')}
              </Button>
            </div>
          )}

          {/* AI Assistant Help - Hidden on mobile for cleaner look */}
          <div className="hidden md:block">
            <AIAssistant
              position="inline"
              message={t('consent.aiHelp')}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
