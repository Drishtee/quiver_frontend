import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { ProgressIndicator } from "../components/progress-indicator";
import { AIAssistant } from "../components/ai-assistant";

import { useOnboarding } from "../../contexts/OnboardingContext";
import { onboardingStorage } from "../../utils/storage";
import {
  Save,
  ShoppingCart,
  Users,
  MapPin,
  TrendingUp,
  IndianRupee,
  Clock,
  Lightbulb,
  Target,
  Building,
  FileText,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { IllustrationPlaceholder } from '../components/IllustrationPlaceholder';
import '../screens/landing.css';

interface BusinessQuestionnaireProps {
  onContinue: (answers: Record<string, string | string[]>) => void;
  onBack?: () => void;
}

type Section = 'D' | 'E' | 'F' | 'G';

// Keys for questionnaire fields to filter from storage
const QUESTIONNAIRE_KEYS = [
  'productDescription', 'primaryCustomers', 'salesGeography', 'avgCustomers',
  'salesChannel', 'salesConcentration', 'businessIndependence',
  'monthlyRevenue', 'monthlyExpenses', 'currentStatus', 'salesTrend',
  'paidWorkers', 'familyWorkers', 'paymentFrequency', 'digitalTransactions', 'recordsType',
  'keyAssets', 'workspaceType', 'registrations', 'incomeControl',
  'hoursPerDay', 'openToChange', 'priority', 'quiverSupport', 'investmentAmount', 'fundingUse',
  'currentSection_questionnaire'
];

export function BusinessQuestionnaire({ onContinue, onBack }: BusinessQuestionnaireProps) {
  const onboarding = useOnboarding();
  const [currentSection, setCurrentSection] = useState<Section>('D');
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [autoSaved, setAutoSaved] = useState(false);
  const [hasRestoredData, setHasRestoredData] = useState(false);

  // Load saved data on mount
  useEffect(() => {
    const savedData = onboardingStorage.getData();
    const restoredAnswers: Record<string, string | string[]> = {};
    let hasData = false;

    QUESTIONNAIRE_KEYS.forEach(key => {
      if (savedData.formData[key] !== undefined) {
        restoredAnswers[key] = savedData.formData[key];
        hasData = true;
      }
    });

    if (hasData) {
      setAnswers(restoredAnswers);
      // Restore section if saved
      if (restoredAnswers.currentSection_questionnaire) {
        setCurrentSection(restoredAnswers.currentSection_questionnaire as Section);
      }
      setHasRestoredData(true);
      console.log("Restored questionnaire data:", Object.keys(restoredAnswers).length, "fields");
    }
  }, []);

  // Listen for voice field updates
  useEffect(() => {
    const handleVoiceFieldsApplied = (event: CustomEvent<Record<string, any>>) => {
      const fields = event.detail;
      setAnswers(prev => {
        const updated = { ...prev };
        // Map voice fields to questionnaire fields
        Object.entries(fields).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            updated[key] = value;
          }
        });
        return updated;
      });
      setAutoSaved(true);
      setTimeout(() => setAutoSaved(false), 2000);
    };

    window.addEventListener('voiceFieldsApplied', handleVoiceFieldsApplied as EventListener);
    return () => {
      window.removeEventListener('voiceFieldsApplied', handleVoiceFieldsApplied as EventListener);
    };
  }, []);

  const updateAnswer = (key: string, value: string | string[]) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
    // Persist to localStorage
    onboardingStorage.updateField(key, value);
    setAutoSaved(true);
    setTimeout(() => setAutoSaved(false), 2000);
  };

  // Save current section when it changes
  useEffect(() => {
    onboardingStorage.updateField('currentSection_questionnaire', currentSection);
  }, [currentSection]);

  const toggleMultiSelect = (key: string, value: string) => {
    const current = (answers[key] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    updateAnswer(key, updated);
  };

  const sections: { id: Section; title: string; titleEn: string }[] = [
    { id: 'D', title: 'उत्पाद, बाज़ार और निर्भरता', titleEn: 'Product, Market & Dependency' },
    { id: 'E', title: 'वित्तीय स्थिति', titleEn: 'Financial Snapshot' },
    { id: 'F', title: 'संसाधन और नियंत्रण', titleEn: 'Assets & Compliance' },
    { id: 'G', title: 'समय और सोच', titleEn: 'Time & Growth Intent' }
  ];

  const sectionIndex = sections.findIndex(s => s.id === currentSection);
  const progressBase = 4; // Previous sections: A, B, C

  const canProceed = () => {
    switch (currentSection) {
      case 'D':
        return answers.productDescription && answers.primaryCustomers && answers.salesGeography && answers.salesChannel;
      case 'E':
        return answers.monthlyRevenue && answers.monthlyExpenses && answers.currentStatus && answers.salesTrend;
      case 'F':
        return answers.workspaceType;
      case 'G':
        return answers.hoursPerDay && answers.openToChange && answers.priority && answers.quiverSupport;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentSection === 'G') {
      onContinue(answers);
    } else {
      const nextIndex = sectionIndex + 1;
      if (nextIndex < sections.length) {
        setCurrentSection(sections[nextIndex].id);
      }
    }
  };

  const handleBack = () => {
    const prevIndex = sectionIndex - 1;
    if (prevIndex >= 0) {
      setCurrentSection(sections[prevIndex].id);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-20 mobile-full-screen">
      {/* Header - Mobile-first */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm py-3 px-4 md:py-4 md:px-6 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center min-w-0">
            {onBack && (
              <button
                onClick={onBack}
                className="mr-2 md:mr-3 p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <img src="/logo.jpg" alt="Quiver" className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-cover mr-2 md:mr-3 flex-shrink-0" />
            <span className="text-base md:text-xl font-display font-bold text-primary truncate">Quiver</span>
          </div>
          {autoSaved && (
            <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full flex-shrink-0">
              <Save className="w-3 h-3" />
              <span className="hidden sm:inline">Auto-saved</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content - Mobile-first */}
      <main className="max-w-2xl mx-auto px-4 py-6 md:px-6 md:py-8">
        <div className="space-y-5 md:space-y-6">
          {/* Progress - Sticky */}
          <ProgressIndicator current={progressBase + sectionIndex} total={9} sticky={true} />

          {/* Section Tabs - Horizontally scrollable on mobile */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide scroll-momentum">
            {sections.map((section, idx) => (
              <button
                key={section.id}
                onClick={() => idx <= sectionIndex && setCurrentSection(section.id)}
                className={`px-3 py-2 md:px-4 rounded-lg text-sm font-medium whitespace-nowrap transition-all min-h-touch flex items-center ${
                  section.id === currentSection
                    ? 'bg-accent text-white'
                    : idx <= sectionIndex
                      ? 'bg-gray-100 text-accent hover:bg-gray-200'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Section {section.id}
              </button>
            ))}
          </div>

          {/* Section Title */}
          <div className="text-center space-y-1">
            <h2 className="text-xl md:text-2xl font-display font-bold text-gray-900">
              Section {currentSection}: {sections[sectionIndex].title}
            </h2>
            <p className="text-sm md:text-base text-gray-600">{sections[sectionIndex].titleEn}</p>
          </div>

          {/* Section D: Product, Market & Dependency */}
          {currentSection === 'D' && (
            <div className="space-y-4 md:space-y-6">
              {/* GFX-ONBD-010A: Product & Market section header illustration */}
              {/* TODO: Replace with marketplace bird's-eye illustration — see GRAPHIC_DESIGN_SPEC.md */}
              {/* <img src="/illustrations/onboarding/gfx-onbd-010a-product-market.svg" alt="" className="w-full h-[100px] object-contain" /> */}
              <IllustrationPlaceholder
                id="GFX-ONBD-010A"
                label="Product & Market — marketplace scene with customers and analysis"
                height="100px"
              />
              {/* Product Description */}
              <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 md:border-2 shadow-sm md:shadow-lg p-4 md:p-6 space-y-3 md:space-y-4">
                <label className="flex items-start gap-2 text-sm font-medium text-gray-900">
                  <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <span>आप क्या बनाते / बेचते हैं?</span>
                    <span className="block text-xs text-gray-500 font-normal">What do you make or sell? <span className="text-red-500">*</span></span>
                  </div>
                </label>
                <div className="relative">
                  <Textarea
                    placeholder="उदाहरण: मैं घर पर अचार बनाती हूँ और स्थानीय बाज़ार में बेचती हूँ..."
                    value={(answers.productDescription as string) || ''}
                    onChange={(e) => updateAnswer('productDescription', e.target.value)}
                    className="min-h-[100px] md:min-h-[120px] bg-gray-50 border-gray-200 rounded-lg md:rounded-xl resize-none text-sm md:text-base"
                  />
                </div>
              </div>

              {/* Primary Customers */}
              <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 md:border-2 shadow-sm md:shadow-lg p-4 md:p-6 space-y-3 md:space-y-4">
                <label className="flex items-start gap-2 text-sm font-medium text-gray-900">
                  <Users className="w-4 h-4 md:w-5 md:h-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <span>आपके मुख्य ग्राहक कौन हैं?</span>
                    <span className="block text-xs text-gray-500 font-normal">Who are your main customers? <span className="text-red-500">*</span></span>
                  </div>
                </label>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {[
                    { value: 'households', labelHi: 'घर-परिवार', labelEn: 'Households' },
                    { value: 'retailers', labelHi: 'दुकानदार', labelEn: 'Shops' },
                    { value: 'wholesalers', labelHi: 'थोक व्यापारी', labelEn: 'Wholesalers' },
                    { value: 'institutions', labelHi: 'संस्थान/होटल', labelEn: 'Hotels/Offices' },
                    { value: 'online', labelHi: 'ऑनलाइन', labelEn: 'Online' }
                  ].map((option) => {
                    const selected = ((answers.primaryCustomers as string[]) || []).includes(option.value);
                    return (
                      <label
                        key={option.value}
                        className={`flex items-center gap-2 px-2.5 py-2.5 md:px-3 md:py-3 rounded-lg md:rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98] ${
                          selected ? 'border-accent bg-accent/5' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => toggleMultiSelect('primaryCustomers', option.value)}
                          className="h-4 w-4"
                        />
                        <div className="min-w-0">
                          <span className="text-xs md:text-sm font-medium text-gray-900 block truncate">{option.labelHi}</span>
                          <span className="text-[11px] md:text-xs text-gray-500 block truncate">{option.labelEn}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Sales Geography */}
              <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 md:border-2 shadow-sm md:shadow-lg p-4 md:p-6 space-y-3 md:space-y-4">
                <label className="flex items-start gap-2 text-sm font-medium text-gray-900">
                  <MapPin className="w-4 h-4 md:w-5 md:h-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <span>आप कहाँ तक बेचते हैं?</span>
                    <span className="block text-xs text-gray-500 font-normal">Where do you sell? <span className="text-red-500">*</span></span>
                  </div>
                </label>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {[
                    { value: 'village', labelHi: 'अपने गाँव में', labelEn: 'My Village' },
                    { value: 'block', labelHi: 'आस-पास के गाँव', labelEn: 'Nearby Areas' },
                    { value: 'district', labelHi: 'पूरे ज़िले में', labelEn: 'Whole District' },
                    { value: 'state', labelHi: 'राज्य/देश भर में', labelEn: 'State/Country' }
                  ].map((option) => {
                    const selected = ((answers.salesGeography as string[]) || []).includes(option.value);
                    return (
                      <label
                        key={option.value}
                        className={`flex items-center gap-2 px-2.5 py-2.5 md:px-3 md:py-3 rounded-lg md:rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98] ${
                          selected ? 'border-accent bg-accent/5' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => toggleMultiSelect('salesGeography', option.value)}
                          className="h-4 w-4"
                        />
                        <div className="min-w-0">
                          <span className="text-xs md:text-sm font-medium text-gray-900 block truncate">{option.labelHi}</span>
                          <span className="text-[11px] md:text-xs text-gray-500 block truncate">{option.labelEn}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Avg Customers per Month */}
              <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 md:border-2 shadow-sm md:shadow-lg p-4 md:p-6 space-y-3 md:space-y-4">
                <label className="text-sm font-medium text-gray-900">
                  <span>हर महीने कितने ग्राहक आते हैं?</span>
                  <span className="block text-xs text-gray-500 font-normal">How many customers per month?</span>
                </label>
                <Input
                  type="number"
                  placeholder="उदाहरण: 50"
                  value={(answers.avgCustomers as string) || ''}
                  onChange={(e) => updateAnswer('avgCustomers', e.target.value)}
                  className="h-11 md:h-12 bg-gray-50 border-gray-200 rounded-lg md:rounded-xl text-sm md:text-base"
                />
              </div>

              {/* Sales Channel */}
              <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 md:border-2 shadow-sm md:shadow-lg p-4 md:p-6 space-y-3 md:space-y-4">
                <label className="text-sm font-medium text-gray-900">
                  <span>आप कैसे बेचते हैं?</span>
                  <span className="block text-xs text-gray-500 font-normal">How do you sell? <span className="text-red-500">*</span></span>
                </label>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {[
                    { value: 'direct', labelHi: 'सीधे ग्राहक को', labelEn: 'Direct to Customer' },
                    { value: 'retail', labelHi: 'दुकान के ज़रिए', labelEn: 'Through Shops' },
                    { value: 'middlemen', labelHi: 'बिचौलियों से', labelEn: 'Via Middlemen' },
                    { value: 'online', labelHi: 'ऑनलाइन/डिजिटल', labelEn: 'Online/Digital' }
                  ].map((option) => {
                    const selected = ((answers.salesChannel as string[]) || []).includes(option.value);
                    return (
                      <label
                        key={option.value}
                        className={`flex items-center gap-2 px-2.5 py-2.5 md:px-3 md:py-3 rounded-lg md:rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98] ${
                          selected ? 'border-accent bg-accent/5' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => toggleMultiSelect('salesChannel', option.value)}
                          className="h-4 w-4"
                        />
                        <div className="min-w-0">
                          <span className="text-xs md:text-sm font-medium text-gray-900 block truncate">{option.labelHi}</span>
                          <span className="text-[11px] md:text-xs text-gray-500 block truncate">{option.labelEn}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Dependency Questions */}
              <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 md:border-2 shadow-sm md:shadow-lg p-4 md:p-6 space-y-5 md:space-y-6">
                <div className="space-y-3 md:space-y-4">
                  <label className="text-sm font-medium text-gray-900">
                    <span>क्या आपकी ज़्यादातर बिक्री 1-2 बड़े ग्राहकों से होती है?</span>
                    <span className="block text-xs text-gray-500 font-normal">Do most sales come from 1-2 big customers?</span>
                  </label>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {[
                      { value: 'yes', labelHi: 'हाँ', labelEn: 'Yes' },
                      { value: 'no', labelHi: 'नहीं', labelEn: 'No' }
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-3 rounded-lg md:rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98] ${
                          answers.salesConcentration === option.value ? 'border-accent bg-accent/5' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => updateAnswer('salesConcentration', option.value)}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          answers.salesConcentration === option.value ? 'border-accent' : 'border-gray-300'
                        }`}>
                          {answers.salesConcentration === option.value && (
                            <div className="w-2 h-2 rounded-full bg-accent" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{option.labelHi}</span>
                        <span className="text-xs text-gray-500">| {option.labelEn}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 md:pt-5 space-y-3 md:space-y-4">
                  <label className="text-sm font-medium text-gray-900">
                    <span>अगर आप 7 दिन के लिए छुट्टी लें, तो क्या काम चलेगा?</span>
                    <span className="block text-xs text-gray-500 font-normal">If you take 7 days off, will business continue?</span>
                  </label>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {[
                      { value: 'yes', labelHi: 'हाँ, चलेगा', labelEn: 'Yes' },
                      { value: 'partial', labelHi: 'थोड़ा-बहुत', labelEn: 'Partially' },
                      { value: 'no', labelHi: 'नहीं चलेगा', labelEn: 'No' }
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-2 px-3 py-2.5 md:px-4 md:py-3 rounded-lg md:rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98] ${
                          answers.businessIndependence === option.value ? 'border-accent bg-accent/5' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => updateAnswer('businessIndependence', option.value)}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          answers.businessIndependence === option.value ? 'border-accent' : 'border-gray-300'
                        }`}>
                          {answers.businessIndependence === option.value && (
                            <div className="w-2 h-2 rounded-full bg-accent" />
                          )}
                        </div>
                        <span className="text-xs md:text-sm font-medium text-gray-900">{option.labelHi}</span>
                        <span className="text-[11px] md:text-xs text-gray-500">| {option.labelEn}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section E: Financial Snapshot */}
          {currentSection === 'E' && (
            <div className="space-y-4 md:space-y-6">
              {/* GFX-ONBD-010B: Financial Health section header illustration */}
              {/* TODO: Replace with rupee/budget visualization — see GRAPHIC_DESIGN_SPEC.md */}
              {/* <img src="/illustrations/onboarding/gfx-onbd-010b-financial.svg" alt="" className="w-full h-[100px] object-contain" /> */}
              <IllustrationPlaceholder
                id="GFX-ONBD-010B"
                label="Financial Health — rupee symbol with savings, revenue, expenses branches"
                height="100px"
              />
              {/* Monthly Revenue */}
              <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 md:border-2 shadow-sm md:shadow-lg p-4 md:p-6 space-y-3 md:space-y-4">
                <label className="flex items-start gap-2 text-sm font-medium text-gray-900">
                  <IndianRupee className="w-4 h-4 md:w-5 md:h-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <span>हर महीने कितनी बिक्री होती है? (₹)</span>
                    <span className="block text-xs text-gray-500 font-normal">Monthly sales/revenue <span className="text-red-500">*</span></span>
                  </div>
                </label>
                <Input
                  type="number"
                  placeholder="उदाहरण: 50000"
                  value={(answers.monthlyRevenue as string) || ''}
                  onChange={(e) => updateAnswer('monthlyRevenue', e.target.value)}
                  className="h-11 md:h-12 bg-gray-50 border-gray-200 rounded-lg md:rounded-xl text-sm md:text-base"
                />
              </div>

              {/* Monthly Expenses */}
              <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 md:border-2 shadow-sm md:shadow-lg p-4 md:p-6 space-y-3 md:space-y-4">
                <label className="flex items-start gap-2 text-sm font-medium text-gray-900">
                  <IndianRupee className="w-4 h-4 md:w-5 md:h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span>हर महीने कुल कितना खर्च होता है? (₹)</span>
                    <span className="block text-xs text-gray-500 font-normal">Monthly expenses <span className="text-red-500">*</span></span>
                  </div>
                </label>
                <Input
                  type="number"
                  placeholder="उदाहरण: 35000"
                  value={(answers.monthlyExpenses as string) || ''}
                  onChange={(e) => updateAnswer('monthlyExpenses', e.target.value)}
                  className="h-11 md:h-12 bg-gray-50 border-gray-200 rounded-lg md:rounded-xl text-sm md:text-base"
                />
              </div>

              {/* Current Status */}
              <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 md:border-2 shadow-sm md:shadow-lg p-4 md:p-6 space-y-3 md:space-y-4">
                <label className="text-sm font-medium text-gray-900">
                  <span>अभी व्यवसाय की स्थिति क्या है?</span>
                  <span className="block text-xs text-gray-500 font-normal">Current business status <span className="text-red-500">*</span></span>
                </label>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {[
                    { value: 'profit', labelHi: 'फ़ायदे में', labelEn: 'In Profit', bgColor: 'bg-green-50', borderColor: 'border-green-500' },
                    { value: 'breakeven', labelHi: 'बराबरी पर', labelEn: 'Break-even', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-500' },
                    { value: 'loss', labelHi: 'घाटे में', labelEn: 'In Loss', bgColor: 'bg-amber-50', borderColor: 'border-amber-500' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-2 px-3 py-2.5 md:px-4 md:py-3 rounded-lg md:rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98] ${
                        answers.currentStatus === option.value
                          ? `${option.borderColor} ${option.bgColor}`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => updateAnswer('currentStatus', option.value)}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        answers.currentStatus === option.value ? option.borderColor : 'border-gray-300'
                      }`}>
                        {answers.currentStatus === option.value && (
                          <div className={`w-2 h-2 rounded-full ${option.borderColor.replace('border', 'bg')}`} />
                        )}
                      </div>
                      <span className="text-xs md:text-sm font-medium text-gray-900">{option.labelHi}</span>
                      <span className="text-[11px] md:text-xs text-gray-500">| {option.labelEn}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sales Trend */}
              <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 md:border-2 shadow-sm md:shadow-lg p-4 md:p-6 space-y-3 md:space-y-4">
                <label className="flex items-start gap-2 text-sm font-medium text-gray-900">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <span>पिछले साल बिक्री कैसी रही?</span>
                    <span className="block text-xs text-gray-500 font-normal">Sales trend last 12 months <span className="text-red-500">*</span></span>
                  </div>
                </label>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {[
                    { value: 'increased', labelHi: 'बढ़ी', labelEn: 'Increased' },
                    { value: 'same', labelHi: 'वही रही', labelEn: 'Same' },
                    { value: 'decreased', labelHi: 'कम हुई', labelEn: 'Decreased' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-2 px-3 py-2.5 md:px-4 md:py-3 rounded-lg md:rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98] ${
                        answers.salesTrend === option.value ? 'border-accent bg-accent/5' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => updateAnswer('salesTrend', option.value)}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        answers.salesTrend === option.value ? 'border-accent' : 'border-gray-300'
                      }`}>
                        {answers.salesTrend === option.value && (
                          <div className="w-2 h-2 rounded-full bg-accent" />
                        )}
                      </div>
                      <span className="text-xs md:text-sm font-medium text-gray-900">{option.labelHi}</span>
                      <span className="text-[11px] md:text-xs text-gray-500">| {option.labelEn}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Workers */}
              <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 md:border-2 shadow-sm md:shadow-lg p-4 md:p-6 space-y-3 md:space-y-4">
                <label className="flex items-start gap-2 text-sm font-medium text-gray-900">
                  <Users className="w-4 h-4 md:w-5 md:h-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <span>आपके साथ कितने लोग काम करते हैं?</span>
                    <span className="block text-xs text-gray-500 font-normal">How many people work with you?</span>
                  </div>
                </label>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-xs text-gray-600">वेतन पर | Paid Workers</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={(answers.paidWorkers as string) || ''}
                      onChange={(e) => updateAnswer('paidWorkers', e.target.value)}
                      className="h-10 md:h-11 bg-gray-50 border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-xs text-gray-600">परिवार से | Family Members</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={(answers.familyWorkers as string) || ''}
                      onChange={(e) => updateAnswer('familyWorkers', e.target.value)}
                      className="h-10 md:h-11 bg-gray-50 border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Frequency */}
              <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 md:border-2 shadow-sm md:shadow-lg p-4 md:p-6 space-y-3 md:space-y-4">
                <label className="text-sm font-medium text-gray-900">
                  <span>कर्मचारियों को कैसे पैसे देते हैं?</span>
                  <span className="block text-xs text-gray-500 font-normal">How do you pay workers?</span>
                </label>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {[
                    { value: 'daily', labelHi: 'रोज़ाना', labelEn: 'Daily' },
                    { value: 'weekly', labelHi: 'हफ़्ते में', labelEn: 'Weekly' },
                    { value: 'monthly', labelHi: 'महीने में', labelEn: 'Monthly' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-2 px-3 py-2.5 md:px-4 md:py-3 rounded-lg md:rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98] ${
                        answers.paymentFrequency === option.value ? 'border-accent bg-accent/5' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => updateAnswer('paymentFrequency', option.value)}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        answers.paymentFrequency === option.value ? 'border-accent' : 'border-gray-300'
                      }`}>
                        {answers.paymentFrequency === option.value && (
                          <div className="w-2 h-2 rounded-full bg-accent" />
                        )}
                      </div>
                      <span className="text-xs md:text-sm font-medium text-gray-900">{option.labelHi}</span>
                      <span className="text-[11px] md:text-xs text-gray-500">| {option.labelEn}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Bank/UPI Transactions */}
              <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 md:border-2 shadow-sm md:shadow-lg p-4 md:p-6 space-y-3 md:space-y-4">
                <label className="text-sm font-medium text-gray-900">
                  <span>क्या आप UPI/बैंक से लेन-देन करते हैं?</span>
                  <span className="block text-xs text-gray-500 font-normal">Do you use UPI/Bank for transactions?</span>
                </label>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {[
                    { value: 'yes', labelHi: 'हाँ, पूरा', labelEn: 'Yes, Fully' },
                    { value: 'partial', labelHi: 'कुछ', labelEn: 'Partially' },
                    { value: 'no', labelHi: 'नहीं, नकद', labelEn: 'No, Cash' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-2 px-3 py-2.5 md:px-4 md:py-3 rounded-lg md:rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98] ${
                        answers.digitalTransactions === option.value ? 'border-accent bg-accent/5' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => updateAnswer('digitalTransactions', option.value)}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        answers.digitalTransactions === option.value ? 'border-accent' : 'border-gray-300'
                      }`}>
                        {answers.digitalTransactions === option.value && (
                          <div className="w-2 h-2 rounded-full bg-accent" />
                        )}
                      </div>
                      <span className="text-xs md:text-sm font-medium text-gray-900">{option.labelHi}</span>
                      <span className="text-[11px] md:text-xs text-gray-500">| {option.labelEn}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Records */}
              <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 md:border-2 shadow-sm md:shadow-lg p-4 md:p-6 space-y-3 md:space-y-4">
                <label className="flex items-start gap-2 text-sm font-medium text-gray-900">
                  <FileText className="w-4 h-4 md:w-5 md:h-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <span>आप हिसाब-किताब कैसे रखते हैं?</span>
                    <span className="block text-xs text-gray-500 font-normal">How do you keep records?</span>
                  </div>
                </label>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {[
                    { value: 'notebook', labelHi: 'कॉपी/बही में', labelEn: 'Notebook' },
                    { value: 'app', labelHi: 'मोबाइल ऐप में', labelEn: 'Mobile App' },
                    { value: 'excel', labelHi: 'एक्सेल/कंप्यूटर', labelEn: 'Excel/Computer' },
                    { value: 'none', labelHi: 'नहीं रखते', labelEn: 'None' }
                  ].map((option) => {
                    const selected = ((answers.recordsType as string[]) || []).includes(option.value);
                    return (
                      <label
                        key={option.value}
                        className={`flex items-center gap-2 px-2.5 py-2.5 md:px-3 md:py-3 rounded-lg md:rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98] ${
                          selected ? 'border-accent bg-accent/5' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => toggleMultiSelect('recordsType', option.value)}
                          className="h-4 w-4"
                        />
                        <div className="min-w-0">
                          <span className="text-xs md:text-sm font-medium text-gray-900 block truncate">{option.labelHi}</span>
                          <span className="text-[11px] md:text-xs text-gray-500 block truncate">{option.labelEn}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Section F: Assets & Compliance */}
          {currentSection === 'F' && (
            <div className="space-y-4 md:space-y-6">
              {/* GFX-ONBD-010C: Assets & Setup section header illustration */}
              {/* TODO: Replace with workspace/equipment illustration — see GRAPHIC_DESIGN_SPEC.md */}
              {/* <img src="/illustrations/onboarding/gfx-onbd-010c-assets.svg" alt="" className="w-full h-[100px] object-contain" /> */}
              <IllustrationPlaceholder
                id="GFX-ONBD-010C"
                label="Assets & Setup — workspace with equipment, inventory, checklist"
                height="100px"
              />
              {/* Key Assets */}
              <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 md:border-2 shadow-sm md:shadow-lg p-4 md:p-6 space-y-3 md:space-y-4">
                <label className="flex items-start gap-2 text-sm font-medium text-gray-900">
                  <Building className="w-4 h-4 md:w-5 md:h-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <span>आपके पास कौन-कौन सी मशीनें/उपकरण हैं?</span>
                    <span className="block text-xs text-gray-500 font-normal">What machines/equipment do you have?</span>
                  </div>
                </label>
                <div className="relative">
                  <Textarea
                    placeholder="उदाहरण: सिलाई मशीन, ओवरलॉक मशीन, कटिंग टेबल..."
                    value={(answers.keyAssets as string) || ''}
                    onChange={(e) => updateAnswer('keyAssets', e.target.value)}
                    className="min-h-[80px] md:min-h-[100px] bg-gray-50 border-gray-200 rounded-lg md:rounded-xl resize-none text-sm md:text-base"
                  />
                </div>
              </div>

              {/* Workspace Type */}
              <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 md:border-2 shadow-sm md:shadow-lg p-4 md:p-6 space-y-3 md:space-y-4">
                <label className="text-sm font-medium text-gray-900">
                  <span>आप कहाँ से काम करते हैं?</span>
                  <span className="block text-xs text-gray-500 font-normal">Where do you work from? <span className="text-red-500">*</span></span>
                </label>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {[
                    { value: 'home', labelHi: 'अपने घर से', labelEn: 'From Home' },
                    { value: 'rented', labelHi: 'किराए की जगह', labelEn: 'Rented Space' },
                    { value: 'owned', labelHi: 'खुद की दुकान', labelEn: 'Own Shop' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-2 px-3 py-2.5 md:px-4 md:py-3 rounded-lg md:rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98] ${
                        answers.workspaceType === option.value ? 'border-accent bg-accent/5' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => updateAnswer('workspaceType', option.value)}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        answers.workspaceType === option.value ? 'border-accent' : 'border-gray-300'
                      }`}>
                        {answers.workspaceType === option.value && (
                          <div className="w-2 h-2 rounded-full bg-accent" />
                        )}
                      </div>
                      <span className="text-xs md:text-sm font-medium text-gray-900">{option.labelHi}</span>
                      <span className="text-[11px] md:text-xs text-gray-500">| {option.labelEn}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Registrations */}
              <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 md:border-2 shadow-sm md:shadow-lg p-4 md:p-6 space-y-3 md:space-y-4">
                <label className="text-sm font-medium text-gray-900">
                  <span>क्या आपके पास कोई पंजीकरण है?</span>
                  <span className="block text-xs text-gray-500 font-normal">Do you have any registrations?</span>
                </label>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {[
                    { value: 'udyam', labelHi: 'उद्यम', labelEn: 'Udyam' },
                    { value: 'gst', labelHi: 'जीएसटी', labelEn: 'GST' },
                    { value: 'fssai', labelHi: 'FSSAI', labelEn: 'FSSAI (Food)' },
                    { value: 'none', labelHi: 'कोई नहीं', labelEn: 'None' }
                  ].map((option) => {
                    const selected = ((answers.registrations as string[]) || []).includes(option.value);
                    return (
                      <label
                        key={option.value}
                        className={`flex items-center gap-2 px-2.5 py-2.5 md:px-3 md:py-3 rounded-lg md:rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98] ${
                          selected ? 'border-accent bg-accent/5' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => toggleMultiSelect('registrations', option.value)}
                          className="h-4 w-4"
                        />
                        <div className="min-w-0">
                          <span className="text-xs md:text-sm font-medium text-gray-900 block truncate">{option.labelHi}</span>
                          <span className="text-[11px] md:text-xs text-gray-500 block truncate">{option.labelEn}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Income Decision Control */}
              <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 md:border-2 shadow-sm md:shadow-lg p-4 md:p-6 space-y-3 md:space-y-4">
                <label className="text-sm font-medium text-gray-900">
                  <span>क्या कमाई पर आपका फ़ैसला चलता है?</span>
                  <span className="block text-xs text-gray-500 font-normal">Do you decide how to use business income?</span>
                </label>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {[
                    { value: 'yes', labelHi: 'हाँ, पूरा', labelEn: 'Yes, Fully' },
                    { value: 'partial', labelHi: 'कुछ हद तक', labelEn: 'Partially' },
                    { value: 'no', labelHi: 'नहीं', labelEn: 'No' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-2 px-3 py-2.5 md:px-4 md:py-3 rounded-lg md:rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98] ${
                        answers.incomeControl === option.value ? 'border-accent bg-accent/5' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => updateAnswer('incomeControl', option.value)}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        answers.incomeControl === option.value ? 'border-accent' : 'border-gray-300'
                      }`}>
                        {answers.incomeControl === option.value && (
                          <div className="w-2 h-2 rounded-full bg-accent" />
                        )}
                      </div>
                      <span className="text-xs md:text-sm font-medium text-gray-900">{option.labelHi}</span>
                      <span className="text-[11px] md:text-xs text-gray-500">| {option.labelEn}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section G: Time & Growth Intent */}
          {currentSection === 'G' && (
            <div className="space-y-4 md:space-y-6">
              {/* GFX-ONBD-010D: Growth Goals section header illustration */}
              {/* TODO: Replace with mountain/summit illustration — see GRAPHIC_DESIGN_SPEC.md */}
              {/* <img src="/illustrations/onboarding/gfx-onbd-010d-growth-goals.svg" alt="" className="w-full h-[100px] object-contain" /> */}
              <IllustrationPlaceholder
                id="GFX-ONBD-010D"
                label="Growth Goals — person at mountain base, winding path to glowing summit"
                height="100px"
              />
              {/* Hours per Day */}
              <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 md:border-2 shadow-sm md:shadow-lg p-4 md:p-6 space-y-3 md:space-y-4">
                <label className="flex items-start gap-2 text-sm font-medium text-gray-900">
                  <Clock className="w-4 h-4 md:w-5 md:h-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <span>रोज़ाना कितने घंटे काम करते हैं?</span>
                    <span className="block text-xs text-gray-500 font-normal">How many hours do you work daily? <span className="text-red-500">*</span></span>
                  </div>
                </label>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {[
                    { value: '1-3', labelHi: '1-3 घंटे', labelEn: '1-3 hrs' },
                    { value: '3-6', labelHi: '3-6 घंटे', labelEn: '3-6 hrs' },
                    { value: '6+', labelHi: '6+ घंटे', labelEn: '6+ hrs' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-2 px-3 py-2.5 md:px-4 md:py-3 rounded-lg md:rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98] ${
                        answers.hoursPerDay === option.value ? 'border-accent bg-accent/5' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => updateAnswer('hoursPerDay', option.value)}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        answers.hoursPerDay === option.value ? 'border-accent' : 'border-gray-300'
                      }`}>
                        {answers.hoursPerDay === option.value && (
                          <div className="w-2 h-2 rounded-full bg-accent" />
                        )}
                      </div>
                      <span className="text-xs md:text-sm font-medium text-gray-900">{option.labelHi}</span>
                      <span className="text-[11px] md:text-xs text-gray-500">| {option.labelEn}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Open to Change */}
              <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 md:border-2 shadow-sm md:shadow-lg p-4 md:p-6 space-y-3 md:space-y-4">
                <label className="flex items-start gap-2 text-sm font-medium text-gray-900">
                  <Lightbulb className="w-4 h-4 md:w-5 md:h-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <span>क्या आप नए तरीके आज़माने को तैयार हैं?</span>
                    <span className="block text-xs text-gray-500 font-normal">Are you open to trying new methods? <span className="text-red-500">*</span></span>
                  </div>
                </label>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {[
                    { value: 'yes', labelHi: 'हाँ, ज़रूर', labelEn: 'Yes' },
                    { value: 'sometimes', labelHi: 'कभी-कभी', labelEn: 'Sometimes' },
                    { value: 'no', labelHi: 'नहीं', labelEn: 'No' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-2 px-3 py-2.5 md:px-4 md:py-3 rounded-lg md:rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98] ${
                        answers.openToChange === option.value ? 'border-accent bg-accent/5' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => updateAnswer('openToChange', option.value)}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        answers.openToChange === option.value ? 'border-accent' : 'border-gray-300'
                      }`}>
                        {answers.openToChange === option.value && (
                          <div className="w-2 h-2 rounded-full bg-accent" />
                        )}
                      </div>
                      <span className="text-xs md:text-sm font-medium text-gray-900">{option.labelHi}</span>
                      <span className="text-[11px] md:text-xs text-gray-500">| {option.labelEn}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 md:border-2 shadow-sm md:shadow-lg p-4 md:p-6 space-y-3 md:space-y-4">
                <label className="flex items-start gap-2 text-sm font-medium text-gray-900">
                  <Target className="w-4 h-4 md:w-5 md:h-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <span>अगले साल आप क्या चाहते हैं?</span>
                    <span className="block text-xs text-gray-500 font-normal">Your goals for next 12 months <span className="text-red-500">*</span></span>
                  </div>
                </label>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {[
                    { value: 'sales', labelHi: 'ज़्यादा बिक्री', labelEn: 'More Sales' },
                    { value: 'profit', labelHi: 'ज़्यादा मुनाफ़ा', labelEn: 'More Profit' },
                    { value: 'capacity', labelHi: 'ज़्यादा उत्पादन', labelEn: 'More Production' },
                    { value: 'new-market', labelHi: 'नया बाज़ार', labelEn: 'New Markets' },
                    { value: 'working-capital', labelHi: 'चलती पूंजी', labelEn: 'Working Capital' }
                  ].map((option) => {
                    const selected = ((answers.priority as string[]) || []).includes(option.value);
                    return (
                      <label
                        key={option.value}
                        className={`flex items-center gap-2 px-2.5 py-2.5 md:px-3 md:py-3 rounded-lg md:rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98] ${
                          selected ? 'border-accent bg-accent/5' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => toggleMultiSelect('priority', option.value)}
                          className="h-4 w-4"
                        />
                        <div className="min-w-0">
                          <span className="text-xs md:text-sm font-medium text-gray-900 block truncate">{option.labelHi}</span>
                          <span className="text-[11px] md:text-xs text-gray-500 block truncate">{option.labelEn}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Quiver Support */}
              <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 md:border-2 shadow-sm md:shadow-lg p-4 md:p-6 space-y-3 md:space-y-4">
                <label className="text-sm font-medium text-gray-900">
                  <span>Quiver से आपको क्या मदद चाहिए?</span>
                  <span className="block text-xs text-gray-500 font-normal">What help do you need from Quiver? <span className="text-red-500">*</span></span>
                </label>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {[
                    { value: 'mentorship', labelHi: 'सलाह/मार्गदर्शन', labelEn: 'Guidance' },
                    { value: 'market-access', labelHi: 'नए ग्राहक', labelEn: 'New Customers' },
                    { value: 'systems', labelHi: 'बेहतर सिस्टम', labelEn: 'Better Systems' },
                    { value: 'growth-capital', labelHi: 'पैसों की मदद', labelEn: 'Funding' }
                  ].map((option) => {
                    const selected = ((answers.quiverSupport as string[]) || []).includes(option.value);
                    return (
                      <label
                        key={option.value}
                        className={`flex items-center gap-2 px-2.5 py-2.5 md:px-3 md:py-3 rounded-lg md:rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98] ${
                          selected ? 'border-accent bg-accent/5' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => toggleMultiSelect('quiverSupport', option.value)}
                          className="h-4 w-4"
                        />
                        <div className="min-w-0">
                          <span className="text-xs md:text-sm font-medium text-gray-900 block truncate">{option.labelHi}</span>
                          <span className="text-[11px] md:text-xs text-gray-500 block truncate">{option.labelEn}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Investment Amount */}
              <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 md:border-2 shadow-sm md:shadow-lg p-4 md:p-6 space-y-3 md:space-y-4">
                <label className="flex items-start gap-2 text-sm font-medium text-gray-900">
                  <IndianRupee className="w-4 h-4 md:w-5 md:h-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <span>आपको कितने पैसों की ज़रूरत है? (₹)</span>
                    <span className="block text-xs text-gray-500 font-normal">How much funding do you need?</span>
                  </div>
                </label>
                <Input
                  type="number"
                  placeholder="उदाहरण: 500000"
                  value={(answers.investmentAmount as string) || ''}
                  onChange={(e) => updateAnswer('investmentAmount', e.target.value)}
                  className="h-11 md:h-12 bg-gray-50 border-gray-200 rounded-lg md:rounded-xl text-sm md:text-base"
                />
              </div>

              {/* Funding Use */}
              <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 md:border-2 shadow-sm md:shadow-lg p-4 md:p-6 space-y-3 md:space-y-4">
                <label className="text-sm font-medium text-gray-900">
                  <span>पैसों का इस्तेमाल किसमें करेंगे?</span>
                  <span className="block text-xs text-gray-500 font-normal">How will you use the funding?</span>
                </label>
                <div className="relative">
                  <Textarea
                    placeholder="उदाहरण: नई मशीन खरीदना, कच्चा माल लाना, दुकान बड़ी करना..."
                    value={(answers.fundingUse as string) || ''}
                    onChange={(e) => updateAnswer('fundingUse', e.target.value)}
                    className="min-h-[80px] md:min-h-[100px] bg-gray-50 border-gray-200 rounded-lg md:rounded-xl resize-none text-sm md:text-base"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation - Mobile-first sticky at bottom */}
          <div className="sticky bottom-0 -mx-4 md:mx-0 px-4 py-4 md:p-0 bg-white md:bg-transparent border-t md:border-0 border-gray-200">
            <div className="flex gap-3">
              {sectionIndex > 0 && (
                <Button
                  variant="outline"
                  className="flex-1 min-h-[52px] md:h-14 border-gray-300 text-gray-700 rounded-xl"
                  onClick={handleBack}
                >
                  <ChevronLeft className="w-5 h-5 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">पीछे |</span> Back
                </Button>
              )}
              <Button
                className="flex-1 min-h-[52px] md:h-14 bg-accent hover:bg-accent/90 active:bg-accent/80 text-base md:text-lg font-semibold rounded-xl transition-all"
                onClick={handleNext}
                disabled={!canProceed()}
              >
                {currentSection === 'G' ? 'आगे बढ़ें | Continue' : 'अगला | Next'}
                <ChevronRight className="w-5 h-5 ml-1 md:ml-2" />
              </Button>
            </div>
          </div>

          {/* AI Assistant - Hidden on small mobile */}
          <div className="hidden sm:block">
            <AIAssistant
              position="inline"
              message="सवालों में मदद चाहिए? बोलकर भी जवाब दे सकते हैं! | Need help? You can also speak to answer!"
            />
          </div>

        </div>
      </main>
    </div>
  );
}
