import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { ProgressIndicator } from "../components/progress-indicator";
import { LanguageSelector } from "../components/language-selector";
import { onboardingStorage } from "../../utils/storage";
import { Handshake, ArrowLeft } from "lucide-react";
import { IllustrationPlaceholder } from "../components/IllustrationPlaceholder";
import '../screens/landing.css';

interface EquityPartnershipProps {
  onContinue: (answer: string) => void;
  onBack?: () => void;
}

export function EquityPartnership({ onContinue, onBack }: EquityPartnershipProps) {
  const { t } = useTranslation();
  const [openToEquity, setOpenToEquity] = useState<string>('');

  // Load saved data on mount
  useEffect(() => {
    const savedData = onboardingStorage.getData();
    if (savedData.formData.openToEquity) {
      setOpenToEquity(savedData.formData.openToEquity);
    }
  }, []);

  // Save when value changes
  useEffect(() => {
    if (openToEquity) {
      onboardingStorage.updateField('openToEquity', openToEquity);
    }
  }, [openToEquity]);

  // Listen for voice field updates
  useEffect(() => {
    const handleVoiceFieldsApplied = (event: CustomEvent<Record<string, any>>) => {
      const fields = event.detail;
      if (fields.openToEquity || fields.equity || fields.partnership) {
        const value = (fields.openToEquity || fields.equity || fields.partnership || '').toLowerCase();
        if (value.includes('yes') || value.includes('हाँ') || value === 'yes') {
          setOpenToEquity('yes');
        } else if (value.includes('maybe') || value.includes('शायद') || value === 'maybe') {
          setOpenToEquity('maybe');
        } else if (value.includes('no') || value.includes('नहीं') || value === 'no') {
          setOpenToEquity('no');
        }
      }
    };

    window.addEventListener('voiceFieldsApplied', handleVoiceFieldsApplied as EventListener);
    return () => {
      window.removeEventListener('voiceFieldsApplied', handleVoiceFieldsApplied as EventListener);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white pb-6 md:pb-20">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm py-3 px-4 md:px-6 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            {onBack && (
              <button
                onClick={onBack}
                className="mr-2 md:mr-3 p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <img src="/logo.jpg" alt="Quiver" className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-cover mr-2 md:mr-3" />
            <span className="text-base md:text-xl font-display font-bold text-primary">Quiver</span>
          </div>
          <LanguageSelector variant="compact" />
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-5 md:px-6 md:py-8">
        <div className="space-y-5 md:space-y-8">
          {/* Progress - Sticky */}
          <ProgressIndicator current={8} total={9} sticky={true} />

          {/* Illustration + Title */}
          <div className="text-center space-y-2">
            <IllustrationPlaceholder
              id="GFX-ONBD-012"
              label="Two people nurturing a shared growing tree with fruits"
              width="160px"
              height="160px"
              className="mx-auto mb-3 md:mb-4 md:!w-[240px] md:!h-[240px]"
            />
            <h2 className="text-xl md:text-2xl font-display font-bold text-gray-900">
              {t('equity.title')}
            </h2>
            <p className="text-sm md:text-base text-gray-600">
              {t('equity.subtitle')}
            </p>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-sm md:shadow-lg p-4 md:p-8 space-y-4 md:space-y-6">
            <h4 className="text-base md:text-lg font-display font-bold text-gray-900 text-center">
              {t('equity.question')}
            </h4>

            <RadioGroup
              value={openToEquity}
              onValueChange={setOpenToEquity}
              className="space-y-2.5 md:space-y-3"
            >
              {[
                { value: 'yes', label: t('equity.options.yes'), color: 'accent' },
                { value: 'maybe', label: t('equity.options.maybe'), color: 'amber' },
                { value: 'no', label: t('equity.options.no'), color: 'gray' }
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    openToEquity === option.value
                      ? 'border-accent bg-accent/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <RadioGroupItem value={option.value} />
                  <span className="font-medium text-gray-900 text-base md:text-lg">{option.label}</span>
                </label>
              ))}
            </RadioGroup>

            <button
              className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-3 px-4 rounded-xl min-h-[48px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!openToEquity}
              onClick={() => onContinue(openToEquity)}
            >
              {t('equity.continue')}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
