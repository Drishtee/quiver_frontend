import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { AIAssistant } from "../components/ai-assistant";
import { Check, Globe, Handshake, TrendingUp, Users, Shield, Clock, Mic, FileText } from "lucide-react";
import { LanguageSelector } from "../components/language-selector";
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-24 md:pb-20 mobile-full-screen">
      {/* Header - Mobile optimized */}
      <header className="bg-white shadow-sm py-3 px-4 md:py-4 md:px-6 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-lg flex items-center justify-center mr-2 md:mr-3">
              <Handshake className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <span className="text-lg md:text-xl font-display font-bold text-primary">Quiver</span>
          </div>
          <LanguageSelector variant="compact" />
        </div>
      </header>

      {/* Main Content - Mobile optimized */}
      <main className="max-w-3xl mx-auto px-4 py-5 md:px-6 md:py-8">
        <div className="space-y-5 md:space-y-8">
          {/* Language Selection Card - Compact on mobile */}
          <div className="bg-white rounded-xl md:rounded-2xl border-2 border-primary/20 shadow-lg p-4 md:p-6">
            <h3 className="font-semibold text-gray-900 mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
              <Globe className="w-4 h-4 md:w-5 md:h-5 text-primary" />
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

          {/* Description Card - Mobile optimized */}
          <div className="bg-white rounded-xl md:rounded-2xl border-2 border-primary/20 shadow-lg p-4 md:p-8 space-y-4 md:space-y-6">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-700 leading-relaxed text-sm md:text-lg">
                  {t('consent.description')}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg md:rounded-xl p-4 md:p-6">
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                {t('consent.challenge')}
              </p>
            </div>
          </div>

          {/* Why Quiver Exists - Mobile optimized */}
          <div className="bg-white rounded-xl md:rounded-2xl border-2 border-primary/20 shadow-lg p-4 md:p-8 space-y-4 md:space-y-6">
            <h3 className="text-lg md:text-xl font-display font-bold text-gray-900">
              {t('consent.whyQuiver')}
            </h3>
            <div className="space-y-3 md:space-y-4">
              {(t('consent.reasons', { returnObjects: true }) as string[]).map((reason, index) => (
                <div key={index} className="flex items-start gap-2.5 md:gap-3">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-600 font-bold text-xs md:text-sm">{index + 1}</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-sm md:text-base pt-0.5 md:pt-1">{reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* What We Do - Mobile optimized */}
          <div className="bg-white rounded-xl md:rounded-2xl border-2 border-primary/20 shadow-lg p-4 md:p-8 space-y-4 md:space-y-6">
            <h3 className="text-lg md:text-xl font-display font-bold text-gray-900 flex items-center gap-2 md:gap-3">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              {t('consent.whatWeDo')}
            </h3>
            <div className="grid gap-3 md:gap-4">
              {(t('consent.services', { returnObjects: true }) as string[]).map((service, index) => (
                <div key={index} className="flex items-start gap-2.5 md:gap-3 bg-blue-50 rounded-lg md:rounded-xl p-3 md:p-4">
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 md:w-4 md:h-4 text-white" />
                  </div>
                  <p className="text-gray-700 leading-relaxed text-sm md:text-base">{service}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Important Note - Mobile optimized */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl md:rounded-2xl border-2 border-yellow-200 p-4 md:p-6 space-y-3 md:space-y-4">
            <div className="flex items-start gap-2.5 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <p className="font-bold text-gray-900 text-sm md:text-base">{t('consent.notProgram')}</p>
                <p className="text-gray-700 leading-relaxed text-sm md:text-base">{t('consent.partner')}</p>
              </div>
            </div>
          </div>

          {/* Consent Section - Mobile optimized */}
          <div className="bg-white rounded-xl md:rounded-2xl border-2 border-primary/20 shadow-lg p-4 md:p-8 space-y-4 md:space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg md:text-xl font-display font-bold text-gray-900">
                {t('consent.consentTitle')}
              </h3>
              <div className="text-xs md:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {consents.filter(c => c.checked).length} / {consents.length}
              </div>
            </div>

            <div className="space-y-3 md:space-y-4">
              {/* Consent 1: Journey Interest */}
              <div
                className={`p-3 md:p-4 rounded-lg md:rounded-xl border-2 transition-all ${
                  getConsent('journey')?.checked
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-primary/50'
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
                      <div className="flex items-center gap-1 mt-1.5 md:mt-2 text-[10px] md:text-xs text-green-600">
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
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-primary/50'
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
                      <div className="flex items-center gap-1 mt-1.5 md:mt-2 text-[10px] md:text-xs text-green-600">
                        <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" />
                        <span>{t('consent.agreedAt')}: {formatTimestamp(getConsent('notGrant')?.timestamp || null)}</span>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Consent 3: Data Processing */}
              <div
                className={`p-3 md:p-4 rounded-lg md:rounded-xl border-2 transition-all ${
                  getConsent('dataProcessing')?.checked
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-primary/50'
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
                      <div className="flex items-center gap-1 mt-1.5 md:mt-2 text-[10px] md:text-xs text-green-600">
                        <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" />
                        <span>{t('consent.agreedAt')}: {formatTimestamp(getConsent('dataProcessing')?.timestamp || null)}</span>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Continue Options - Mobile optimized */}
            {allConsentsGiven ? (
              <div className="space-y-3 md:space-y-4">
                <p className="text-center text-gray-600 font-medium text-sm md:text-base">
                  {t('consent.chooseMethod', 'Choose how you want to continue:')}
                </p>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  {/* Form-based Option */}
                  <button
                    onClick={handleContinue}
                    className="p-4 md:p-6 rounded-lg md:rounded-xl border-2 border-primary/20 hover:border-primary bg-white hover:bg-primary/5 transition-all group"
                  >
                    <div className="flex flex-col items-center gap-2 md:gap-3 text-center">
                      <div className="w-10 h-10 md:w-14 md:h-14 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <FileText className="w-5 h-5 md:w-7 md:h-7 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-xs md:text-base">
                          {t('consent.formOption', 'Fill Forms')}
                        </h4>
                        <p className="text-[10px] md:text-sm text-gray-500 mt-0.5 md:mt-1 hidden xs:block">
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
                      className="p-4 md:p-6 rounded-lg md:rounded-xl border-2 border-blue-200 hover:border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all group relative"
                    >
                      <div className="flex flex-col items-center gap-2 md:gap-3 text-center">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Mic className="w-5 h-5 md:w-7 md:h-7 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-xs md:text-base">
                            {t('consent.voiceOption', 'Voice')}
                          </h4>
                          <p className="text-[10px] md:text-sm text-gray-500 mt-0.5 md:mt-1 hidden xs:block">
                            {t('consent.voiceOptionDesc', 'Speak with AI')}
                          </p>
                        </div>
                      </div>
                      <span className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 text-[8px] md:text-xs bg-primary text-white px-1.5 py-0.5 md:px-2 md:py-1 rounded-full">
                        {t('consent.recommended', 'Best')}
                      </span>
                    </button>
                  )}
                </div>

                {/* Fallback single button if voice not available */}
                {!onVoiceOnboarding && (
                  <Button
                    className="w-full h-12 md:h-14 bg-primary hover:bg-secondary text-base md:text-lg font-semibold rounded-lg md:rounded-xl transition-all"
                    onClick={handleContinue}
                  >
                    <span className="flex items-center gap-2">
                      <Check className="w-4 h-4 md:w-5 md:h-5" />
                      {t('common.continue')}
                    </span>
                  </Button>
                )}
              </div>
            ) : (
              <Button
                className="w-full h-12 md:h-14 bg-gray-300 text-gray-500 text-base md:text-lg font-semibold rounded-lg md:rounded-xl cursor-not-allowed"
                disabled
              >
                {t('consent.pleaseAgreeAll')}
              </Button>
            )}

            {/* Consent Summary */}
            {allConsentsGiven && (
              <div className="bg-blue-50 rounded-lg md:rounded-xl p-3 md:p-4 border border-blue-200">
                <p className="text-xs md:text-sm text-blue-700 text-center">
                  {t('consent.allConsentsRecorded')}
                </p>
              </div>
            )}
          </div>

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
