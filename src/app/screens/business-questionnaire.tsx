import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { ProgressIndicator } from "../components/progress-indicator";
import { AIAssistant } from "../components/ai-assistant";
import {
  Mic,
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
  ChevronRight
} from "lucide-react";
import '../screens/landing.css';

interface BusinessQuestionnaireProps {
  onContinue: (answers: Record<string, string | string[]>) => void;
}

type Section = 'D' | 'E' | 'F' | 'G';

export function BusinessQuestionnaire({ onContinue }: BusinessQuestionnaireProps) {
  const [currentSection, setCurrentSection] = useState<Section>('D');
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [autoSaved, setAutoSaved] = useState(false);

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
    setAutoSaved(true);
    setTimeout(() => setAutoSaved(false), 2000);
  };

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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pb-24 md:pb-20 mobile-full-screen">
      {/* Header - Mobile-first */}
      <header className="bg-white shadow-sm py-3 px-4 md:py-4 md:px-6 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center min-w-0">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-lg flex items-center justify-center mr-2 md:mr-3 flex-shrink-0">
              <Briefcase className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <span className="text-base md:text-xl font-display font-bold text-primary truncate">व्यवसाय विवरण | Business Details</span>
          </div>
          {autoSaved && (
            <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full flex-shrink-0">
              <Save className="w-3 h-3" />
              <span className="hidden xs:inline">Auto-saved</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content - Mobile-first */}
      <main className="max-w-2xl mx-auto px-4 py-6 md:px-6 md:py-8">
        <div className="space-y-5 md:space-y-6">
          {/* Progress */}
          <ProgressIndicator current={progressBase + sectionIndex} total={9} />

          {/* Section Tabs - Horizontally scrollable on mobile */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide scroll-momentum">
            {sections.map((section, idx) => (
              <button
                key={section.id}
                onClick={() => idx <= sectionIndex && setCurrentSection(section.id)}
                className={`px-3 py-2 md:px-4 rounded-lg text-sm font-medium whitespace-nowrap transition-all min-h-touch flex items-center ${
                  section.id === currentSection
                    ? 'bg-primary text-white'
                    : idx <= sectionIndex
                      ? 'bg-green-100 text-primary hover:bg-green-200 active:bg-green-300'
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
            <div className="space-y-6">
              {/* Product Description */}
              <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg p-6 space-y-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  उत्पाद / सेवा का विवरण | Product/Service Description <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Textarea
                    placeholder="अपने उत्पाद या सेवा के बारे में बताएं..."
                    value={(answers.productDescription as string) || ''}
                    onChange={(e) => updateAnswer('productDescription', e.target.value)}
                    className="min-h-[120px] bg-gray-50 border-gray-200 rounded-xl resize-none"
                  />
                  <button className="absolute right-3 bottom-3 p-2 hover:bg-green-50 rounded-lg transition-colors">
                    <Mic className="w-5 h-5 text-primary" />
                  </button>
                </div>
              </div>

              {/* Primary Customers */}
              <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg p-6 space-y-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <Users className="w-5 h-5 text-primary" />
                  मुख्य ग्राहक | Primary Customers <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { value: 'households', labelHi: 'परिवार', labelEn: 'Households' },
                    { value: 'retailers', labelHi: 'दुकानदार', labelEn: 'Retailers' },
                    { value: 'wholesalers', labelHi: 'थोक', labelEn: 'Wholesalers' },
                    { value: 'institutions', labelHi: 'संस्थान', labelEn: 'Institutions' },
                    { value: 'online', labelHi: 'ऑनलाइन', labelEn: 'Online' }
                  ].map((option) => {
                    const selected = ((answers.primaryCustomers as string[]) || []).includes(option.value);
                    return (
                      <label
                        key={option.value}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 cursor-pointer transition-all ${
                          selected ? 'border-primary bg-green-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => toggleMultiSelect('primaryCustomers', option.value)}
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-900">{option.labelHi}</span>
                          <span className="text-xs text-gray-500 block">{option.labelEn}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Sales Geography */}
              <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg p-6 space-y-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <MapPin className="w-5 h-5 text-primary" />
                  बिक्री क्षेत्र | Sales Geography <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { value: 'village', labelHi: 'गाँव', labelEn: 'Village' },
                    { value: 'block', labelHi: 'ब्लॉक', labelEn: 'Block' },
                    { value: 'district', labelHi: 'ज़िला', labelEn: 'District' },
                    { value: 'state', labelHi: 'राज्य', labelEn: 'State' }
                  ].map((option) => {
                    const selected = ((answers.salesGeography as string[]) || []).includes(option.value);
                    return (
                      <label
                        key={option.value}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 cursor-pointer transition-all ${
                          selected ? 'border-primary bg-green-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => toggleMultiSelect('salesGeography', option.value)}
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-900">{option.labelHi}</span>
                          <span className="text-xs text-gray-500 block">{option.labelEn}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Avg Customers per Month */}
              <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg p-6 space-y-4">
                <label className="text-sm font-medium text-gray-900">
                  प्रति माह औसत ग्राहक | Avg. customers per month
                </label>
                <Input
                  type="number"
                  placeholder="जैसे: 50"
                  value={(answers.avgCustomers as string) || ''}
                  onChange={(e) => updateAnswer('avgCustomers', e.target.value)}
                  className="h-12 bg-gray-50 border-gray-200 rounded-xl"
                />
              </div>

              {/* Sales Channel */}
              <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg p-6 space-y-4">
                <label className="text-sm font-medium text-gray-900">
                  बिक्री का तरीका | Sales Channel <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'direct', labelHi: 'सीधे', labelEn: 'Direct' },
                    { value: 'retail', labelHi: 'खुदरा', labelEn: 'Retail' },
                    { value: 'middlemen', labelHi: 'बिचौलिए', labelEn: 'Middlemen' },
                    { value: 'online', labelHi: 'ऑनलाइन', labelEn: 'Online' }
                  ].map((option) => {
                    const selected = ((answers.salesChannel as string[]) || []).includes(option.value);
                    return (
                      <label
                        key={option.value}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 cursor-pointer transition-all ${
                          selected ? 'border-primary bg-green-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => toggleMultiSelect('salesChannel', option.value)}
                        />
                        <span className="text-sm font-medium text-gray-900">{option.labelHi}</span>
                        <span className="text-xs text-gray-500">| {option.labelEn}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Dependency Questions */}
              <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg p-6 space-y-6">
                <div className="space-y-4">
                  <label className="text-sm font-medium text-gray-900">
                    क्या आपकी 30% से अधिक बिक्री केवल 1–2 ग्राहकों से आती है?
                    <span className="block text-xs text-gray-500">Do more than 30% of your sales come from 1–2 customers?</span>
                  </label>
                  <RadioGroup
                    value={(answers.salesConcentration as string) || ''}
                    onValueChange={(value) => updateAnswer('salesConcentration', value)}
                    className="flex gap-4"
                  >
                    {[
                      { value: 'yes', label: 'हाँ | Yes' },
                      { value: 'no', label: 'नहीं | No' }
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all ${
                          answers.salesConcentration === option.value ? 'border-primary bg-green-50' : 'border-gray-200'
                        }`}
                      >
                        <RadioGroupItem value={option.value} />
                        <span className="text-sm font-medium">{option.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-medium text-gray-900">
                    अगर आप 7 दिन के लिए व्यवसाय से दूर रहें, तो क्या व्यवसाय चलेगा?
                    <span className="block text-xs text-gray-500">If you step away for 7 days, will the business run?</span>
                  </label>
                  <RadioGroup
                    value={(answers.businessIndependence as string) || ''}
                    onValueChange={(value) => updateAnswer('businessIndependence', value)}
                    className="flex gap-4"
                  >
                    {[
                      { value: 'yes', label: 'हाँ | Yes' },
                      { value: 'partial', label: 'आंशिक | Partial' },
                      { value: 'no', label: 'नहीं | No' }
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all ${
                          answers.businessIndependence === option.value ? 'border-primary bg-green-50' : 'border-gray-200'
                        }`}
                      >
                        <RadioGroupItem value={option.value} />
                        <span className="text-sm font-medium">{option.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </div>
          )}

          {/* Section E: Financial Snapshot */}
          {currentSection === 'E' && (
            <div className="space-y-6">
              {/* Monthly Revenue */}
              <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg p-6 space-y-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <IndianRupee className="w-5 h-5 text-primary" />
                  औसत मासिक बिक्री (₹) | Avg. Monthly Revenue <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="जैसे: 50000"
                  value={(answers.monthlyRevenue as string) || ''}
                  onChange={(e) => updateAnswer('monthlyRevenue', e.target.value)}
                  className="h-12 bg-gray-50 border-gray-200 rounded-xl"
                />
              </div>

              {/* Monthly Expenses */}
              <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg p-6 space-y-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <IndianRupee className="w-5 h-5 text-red-500" />
                  औसत मासिक खर्च (₹) | Avg. Monthly Expenses <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="जैसे: 35000"
                  value={(answers.monthlyExpenses as string) || ''}
                  onChange={(e) => updateAnswer('monthlyExpenses', e.target.value)}
                  className="h-12 bg-gray-50 border-gray-200 rounded-xl"
                />
              </div>

              {/* Current Status */}
              <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg p-6 space-y-4">
                <label className="text-sm font-medium text-gray-900">
                  वर्तमान स्थिति | Current Status <span className="text-red-500">*</span>
                </label>
                <RadioGroup
                  value={(answers.currentStatus as string) || ''}
                  onValueChange={(value) => updateAnswer('currentStatus', value)}
                  className="flex flex-wrap gap-3"
                >
                  {[
                    { value: 'profit', labelHi: 'मुनाफ़ा', labelEn: 'Profit', color: 'green' },
                    { value: 'breakeven', labelHi: 'बराबर', labelEn: 'Break-even', color: 'yellow' },
                    { value: 'loss', labelHi: 'नुकसान', labelEn: 'Loss', color: 'red' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                        answers.currentStatus === option.value
                          ? `border-${option.color}-500 bg-${option.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <RadioGroupItem value={option.value} />
                      <span className="font-medium text-gray-900">{option.labelHi}</span>
                      <span className="text-sm text-gray-500">| {option.labelEn}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              {/* Sales Trend */}
              <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg p-6 space-y-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  पिछले 12 महीनों में आपकी बिक्री | Sales trend in last 12 months <span className="text-red-500">*</span>
                </label>
                <RadioGroup
                  value={(answers.salesTrend as string) || ''}
                  onValueChange={(value) => updateAnswer('salesTrend', value)}
                  className="flex flex-wrap gap-3"
                >
                  {[
                    { value: 'increased', labelHi: 'बढ़ी', labelEn: 'Increased' },
                    { value: 'same', labelHi: 'समान रही', labelEn: 'Same' },
                    { value: 'decreased', labelHi: 'घटी', labelEn: 'Decreased' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                        answers.salesTrend === option.value ? 'border-primary bg-green-50' : 'border-gray-200'
                      }`}
                    >
                      <RadioGroupItem value={option.value} />
                      <span className="font-medium text-gray-900">{option.labelHi}</span>
                      <span className="text-sm text-gray-500">| {option.labelEn}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              {/* Workers */}
              <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg p-6 space-y-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <Users className="w-5 h-5 text-primary" />
                  काम करने वाले लोग | Workers
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-600">वेतनभोगी | Paid</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={(answers.paidWorkers as string) || ''}
                      onChange={(e) => updateAnswer('paidWorkers', e.target.value)}
                      className="h-10 bg-gray-50 border-gray-200 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-600">परिवार | Family</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={(answers.familyWorkers as string) || ''}
                      onChange={(e) => updateAnswer('familyWorkers', e.target.value)}
                      className="h-10 bg-gray-50 border-gray-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Frequency */}
              <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg p-6 space-y-4">
                <label className="text-sm font-medium text-gray-900">
                  औसतन कर्मचारियों को कैसे भुगतान किया जाता है? | Payment frequency
                </label>
                <RadioGroup
                  value={(answers.paymentFrequency as string) || ''}
                  onValueChange={(value) => updateAnswer('paymentFrequency', value)}
                  className="flex flex-wrap gap-3"
                >
                  {[
                    { value: 'daily', labelHi: 'दैनिक', labelEn: 'Daily' },
                    { value: 'weekly', labelHi: 'साप्ताहिक', labelEn: 'Weekly' },
                    { value: 'monthly', labelHi: 'मासिक', labelEn: 'Monthly' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all ${
                        answers.paymentFrequency === option.value ? 'border-primary bg-green-50' : 'border-gray-200'
                      }`}
                    >
                      <RadioGroupItem value={option.value} />
                      <span className="font-medium text-gray-900">{option.labelHi}</span>
                      <span className="text-sm text-gray-500">| {option.labelEn}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              {/* Bank/UPI Transactions */}
              <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg p-6 space-y-4">
                <label className="text-sm font-medium text-gray-900">
                  क्या व्यवसाय के लेन-देन बैंक खाते / UPI से होते हैं?
                  <span className="block text-xs text-gray-500">Are business transactions done via Bank/UPI?</span>
                </label>
                <RadioGroup
                  value={(answers.digitalTransactions as string) || ''}
                  onValueChange={(value) => updateAnswer('digitalTransactions', value)}
                  className="flex gap-4"
                >
                  {[
                    { value: 'yes', label: 'हाँ | Yes' },
                    { value: 'partial', label: 'आंशिक | Partial' },
                    { value: 'no', label: 'नहीं | No' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all ${
                        answers.digitalTransactions === option.value ? 'border-primary bg-green-50' : 'border-gray-200'
                      }`}
                    >
                      <RadioGroupItem value={option.value} />
                      <span className="text-sm font-medium">{option.label}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              {/* Records */}
              <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg p-6 space-y-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <FileText className="w-5 h-5 text-primary" />
                  क्या रिकॉर्ड रखते हैं? | Records maintained?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'notebook', labelHi: 'कॉपी/रजिस्टर', labelEn: 'Notebook' },
                    { value: 'app', labelHi: 'ऐप', labelEn: 'App' },
                    { value: 'excel', labelHi: 'एक्सेल', labelEn: 'Excel' },
                    { value: 'none', labelHi: 'कोई नहीं', labelEn: 'None' }
                  ].map((option) => {
                    const selected = ((answers.recordsType as string[]) || []).includes(option.value);
                    return (
                      <label
                        key={option.value}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 cursor-pointer transition-all ${
                          selected ? 'border-primary bg-green-50' : 'border-gray-200'
                        }`}
                      >
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => toggleMultiSelect('recordsType', option.value)}
                        />
                        <span className="text-sm font-medium text-gray-900">{option.labelHi}</span>
                        <span className="text-xs text-gray-500">| {option.labelEn}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Section F: Assets & Compliance */}
          {currentSection === 'F' && (
            <div className="space-y-6">
              {/* Key Assets */}
              <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg p-6 space-y-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <Building className="w-5 h-5 text-primary" />
                  प्रमुख मशीनें/उपकरण | Key Assets/Machines
                </label>
                <div className="relative">
                  <Textarea
                    placeholder="मशीनों और उपकरणों की सूची..."
                    value={(answers.keyAssets as string) || ''}
                    onChange={(e) => updateAnswer('keyAssets', e.target.value)}
                    className="min-h-[100px] bg-gray-50 border-gray-200 rounded-xl resize-none"
                  />
                  <button className="absolute right-3 bottom-3 p-2 hover:bg-green-50 rounded-lg transition-colors">
                    <Mic className="w-5 h-5 text-primary" />
                  </button>
                </div>
              </div>

              {/* Workspace Type */}
              <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg p-6 space-y-4">
                <label className="text-sm font-medium text-gray-900">
                  कार्यस्थल | Workspace Type <span className="text-red-500">*</span>
                </label>
                <RadioGroup
                  value={(answers.workspaceType as string) || ''}
                  onValueChange={(value) => updateAnswer('workspaceType', value)}
                  className="flex flex-wrap gap-3"
                >
                  {[
                    { value: 'home', labelHi: 'घर', labelEn: 'Home' },
                    { value: 'rented', labelHi: 'किराए पर', labelEn: 'Rented' },
                    { value: 'owned', labelHi: 'खुद का', labelEn: 'Owned' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                        answers.workspaceType === option.value ? 'border-primary bg-green-50' : 'border-gray-200'
                      }`}
                    >
                      <RadioGroupItem value={option.value} />
                      <span className="font-medium text-gray-900">{option.labelHi}</span>
                      <span className="text-sm text-gray-500">| {option.labelEn}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              {/* Registrations */}
              <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg p-6 space-y-4">
                <label className="text-sm font-medium text-gray-900">
                  पंजीकरण | Registrations
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'udyam', label: 'Udyam' },
                    { value: 'gst', label: 'GST' },
                    { value: 'fssai', label: 'FSSAI' },
                    { value: 'none', labelHi: 'कोई नहीं', label: 'None' }
                  ].map((option) => {
                    const selected = ((answers.registrations as string[]) || []).includes(option.value);
                    return (
                      <label
                        key={option.value}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 cursor-pointer transition-all ${
                          selected ? 'border-primary bg-green-50' : 'border-gray-200'
                        }`}
                      >
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => toggleMultiSelect('registrations', option.value)}
                        />
                        <span className="text-sm font-medium text-gray-900">{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Income Decision Control */}
              <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg p-6 space-y-4">
                <label className="text-sm font-medium text-gray-900">
                  क्या व्यवसाय से होने वाली आय पर आपका निर्णय होता है?
                  <span className="block text-xs text-gray-500">Do you decide how business income is used?</span>
                </label>
                <RadioGroup
                  value={(answers.incomeControl as string) || ''}
                  onValueChange={(value) => updateAnswer('incomeControl', value)}
                  className="flex gap-4"
                >
                  {[
                    { value: 'yes', label: 'हाँ | Yes' },
                    { value: 'partial', label: 'आंशिक | Partial' },
                    { value: 'no', label: 'नहीं | No' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all ${
                        answers.incomeControl === option.value ? 'border-primary bg-green-50' : 'border-gray-200'
                      }`}
                    >
                      <RadioGroupItem value={option.value} />
                      <span className="text-sm font-medium">{option.label}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Section G: Time & Growth Intent */}
          {currentSection === 'G' && (
            <div className="space-y-6">
              {/* Hours per Day */}
              <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg p-6 space-y-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <Clock className="w-5 h-5 text-primary" />
                  आप रोज़ाना कितने घंटे व्यवसाय पर काम करते हैं? <span className="text-red-500">*</span>
                  <span className="block text-xs text-gray-500 font-normal">Hours per day on business</span>
                </label>
                <RadioGroup
                  value={(answers.hoursPerDay as string) || ''}
                  onValueChange={(value) => updateAnswer('hoursPerDay', value)}
                  className="flex flex-wrap gap-3"
                >
                  {[
                    { value: '1-3', label: '1-3 घंटे' },
                    { value: '3-6', label: '3-6 घंटे' },
                    { value: '6+', label: '6+ घंटे' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                        answers.hoursPerDay === option.value ? 'border-primary bg-green-50' : 'border-gray-200'
                      }`}
                    >
                      <RadioGroupItem value={option.value} />
                      <span className="font-medium text-gray-900">{option.label}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              {/* Open to Change */}
              <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg p-6 space-y-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  क्या आप नए तरीकों को आज़माने और बदलाव करने में सहज हैं? <span className="text-red-500">*</span>
                  <span className="block text-xs text-gray-500 font-normal">Are you open to trying new methods?</span>
                </label>
                <RadioGroup
                  value={(answers.openToChange as string) || ''}
                  onValueChange={(value) => updateAnswer('openToChange', value)}
                  className="flex gap-4"
                >
                  {[
                    { value: 'yes', label: 'हाँ | Yes' },
                    { value: 'sometimes', label: 'कभी-कभी | Sometimes' },
                    { value: 'no', label: 'नहीं | No' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all ${
                        answers.openToChange === option.value ? 'border-primary bg-green-50' : 'border-gray-200'
                      }`}
                    >
                      <RadioGroupItem value={option.value} />
                      <span className="text-sm font-medium">{option.label}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              {/* Priority */}
              <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg p-6 space-y-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <Target className="w-5 h-5 text-primary" />
                  अगले 12 महीनों में आपकी प्राथमिकता क्या है? <span className="text-red-500">*</span>
                  <span className="block text-xs text-gray-500 font-normal">Your priority for next 12 months</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { value: 'sales', labelHi: 'बिक्री', labelEn: 'Sales' },
                    { value: 'profit', labelHi: 'मुनाफ़ा', labelEn: 'Profit' },
                    { value: 'capacity', labelHi: 'क्षमता', labelEn: 'Capacity' },
                    { value: 'new-market', labelHi: 'नया बाज़ार', labelEn: 'New Market' },
                    { value: 'working-capital', labelHi: 'कार्यशील पूंजी', labelEn: 'Working Capital' }
                  ].map((option) => {
                    const selected = ((answers.priority as string[]) || []).includes(option.value);
                    return (
                      <label
                        key={option.value}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 cursor-pointer transition-all ${
                          selected ? 'border-primary bg-green-50' : 'border-gray-200'
                        }`}
                      >
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => toggleMultiSelect('priority', option.value)}
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-900">{option.labelHi}</span>
                          <span className="text-xs text-gray-500 block">{option.labelEn}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Quiver Support */}
              <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg p-6 space-y-4">
                <label className="text-sm font-medium text-gray-900">
                  Quiver से आप क्या सहयोग चाहते हैं? <span className="text-red-500">*</span>
                  <span className="block text-xs text-gray-500">What support do you want from Quiver?</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'mentorship', labelHi: 'मार्गदर्शन', labelEn: 'Mentorship' },
                    { value: 'market-access', labelHi: 'बाज़ार पहुंच', labelEn: 'Market Access' },
                    { value: 'systems', labelHi: 'सिस्टम', labelEn: 'Systems' },
                    { value: 'growth-capital', labelHi: 'ग्रोथ कैपिटल', labelEn: 'Growth Capital' }
                  ].map((option) => {
                    const selected = ((answers.quiverSupport as string[]) || []).includes(option.value);
                    return (
                      <label
                        key={option.value}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 cursor-pointer transition-all ${
                          selected ? 'border-primary bg-green-50' : 'border-gray-200'
                        }`}
                      >
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => toggleMultiSelect('quiverSupport', option.value)}
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-900">{option.labelHi}</span>
                          <span className="text-xs text-gray-500 block">{option.labelEn}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Investment Amount */}
              <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg p-6 space-y-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <IndianRupee className="w-5 h-5 text-primary" />
                  आप Quiver से कितनी निवेश राशि चाहते हैं?
                  <span className="block text-xs text-gray-500 font-normal">How much investment do you want from Quiver?</span>
                </label>
                <Input
                  type="number"
                  placeholder="जैसे: 500000"
                  value={(answers.investmentAmount as string) || ''}
                  onChange={(e) => updateAnswer('investmentAmount', e.target.value)}
                  className="h-12 bg-gray-50 border-gray-200 rounded-xl"
                />
              </div>

              {/* Funding Use */}
              <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg p-6 space-y-4">
                <label className="text-sm font-medium text-gray-900">
                  Quiver से मिलने वाली फंडिंग का उपयोग आप किस काम के लिए करेंगे?
                  <span className="block text-xs text-gray-500">How will you use the funding from Quiver?</span>
                </label>
                <div className="relative">
                  <Textarea
                    placeholder="फंडिंग के उपयोग का विवरण..."
                    value={(answers.fundingUse as string) || ''}
                    onChange={(e) => updateAnswer('fundingUse', e.target.value)}
                    className="min-h-[100px] bg-gray-50 border-gray-200 rounded-xl resize-none"
                  />
                  <button className="absolute right-3 bottom-3 p-2 hover:bg-green-50 rounded-lg transition-colors">
                    <Mic className="w-5 h-5 text-primary" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation - Mobile-first sticky at bottom */}
          <div className="sticky bottom-0 -mx-4 md:mx-0 px-4 py-4 md:p-0 bg-white md:bg-transparent border-t md:border-0 border-border">
            <div className="flex gap-3">
              {sectionIndex > 0 && (
                <Button
                  variant="outline"
                  className="flex-1 min-h-[52px] md:h-14 border-gray-300 text-gray-700 rounded-xl"
                  onClick={handleBack}
                >
                  <ChevronLeft className="w-5 h-5 mr-1 md:mr-2" />
                  <span className="hidden xs:inline">पीछे |</span> Back
                </Button>
              )}
              <Button
                className="flex-1 min-h-[52px] md:h-14 bg-primary hover:bg-secondary active:bg-secondary/90 text-base md:text-lg font-semibold rounded-xl transition-all"
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
