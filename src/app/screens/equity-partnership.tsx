import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { ProgressIndicator } from "../components/progress-indicator";
import { AIAssistant } from "../components/ai-assistant";
import { onboardingStorage } from "../../utils/storage";
import {
  Handshake,
  Crown,
  Rocket,
  TrendingUp,
  AlertCircle,
  Check,
  X,
  HelpCircle,
  IndianRupee,
  Users,
  Shield
} from "lucide-react";
import '../screens/landing.css';

interface EquityPartnershipProps {
  onContinue: (answer: string) => void;
}

export function EquityPartnership({ onContinue }: EquityPartnershipProps) {
  const [openToEquity, setOpenToEquity] = useState<string>('');
  const [showHindi, setShowHindi] = useState(true);

  // Load saved data on mount
  useEffect(() => {
    const savedData = onboardingStorage.getData();
    if (savedData.formData.openToEquity) {
      setOpenToEquity(savedData.formData.openToEquity);
      console.log("Restored equity answer:", savedData.formData.openToEquity);
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
        // Normalize various ways user might express this
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
              <Handshake className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-primary">साझेदारी की सोच | Partnership Orientation</span>
          </div>
          <button
            onClick={() => setShowHindi(!showHindi)}
            className="px-3 py-1.5 rounded-lg bg-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-all"
          >
            {showHindi ? 'English' : 'हिंदी'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Progress */}
          <ProgressIndicator current={8} total={9} />

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-display font-bold text-gray-900">
              Section H: साझेदारी की सोच
            </h2>
            <p className="text-gray-600">Equity & Partnership Orientation</p>
          </div>

          {/* Equity Explainer Header */}
          <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-2xl p-6 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-display font-bold mb-2">
              {showHindi ? 'इक्विटी (निवेश) को आसान शब्दों में समझिए' : 'Understanding Equity - Explained Simply'}
            </h3>
            <p className="text-white/80">
              {showHindi ? 'Equity & Partnership – सरल भाषा में' : 'What does equity really mean?'}
            </p>
          </div>

          {/* What is Equity */}
          <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg p-8 space-y-6">
            <h4 className="text-xl font-display font-bold text-gray-900 flex items-center gap-3">
              <IndianRupee className="w-6 h-6 text-primary" />
              {showHindi ? 'इक्विटी का मतलब क्या है?' : 'What does equity mean?'}
            </h4>

            <div className="bg-blue-50 rounded-xl p-6 space-y-4">
              <p className="text-gray-700 leading-relaxed">
                {showHindi
                  ? 'जब कोई साझेदार आपके व्यवसाय को बढ़ाने के लिए पैसा लगाता है और बदले में व्यवसाय के मुनाफ़े और फैसलों में एक सीमित हिस्सेदारी लेता है।'
                  : 'When a partner invests money to grow your business and, in return, takes a limited share in the business\'s profits and decisions.'}
              </p>
              <div className="flex items-center gap-3 text-primary font-medium">
                <Check className="w-5 h-5" />
                <span>{showHindi ? 'इसमें हर महीने पैसा लौटाने की बाध्यता नहीं होती।' : 'There is no compulsory monthly repayment.'}</span>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-6">
              <p className="text-gray-700 leading-relaxed font-medium">
                {showHindi
                  ? 'Quiver के साथ काम करने का मतलब केवल पैसा लेना नहीं है। यह एक लंबे समय की साझेदारी है।'
                  : 'Working with Quiver is not just about receiving money. It is about entering a long-term partnership.'}
              </p>
            </div>
          </div>

          {/* Loan vs Equity Comparison */}
          <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg p-8 space-y-6">
            <h4 className="text-xl font-display font-bold text-gray-900">
              {showHindi ? 'लोन बनाम इक्विटी' : 'Loan vs Equity'}
            </h4>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Loan */}
              <div className="bg-amber-50 rounded-xl p-6 border-2 border-amber-200">
                <h5 className="font-bold text-amber-700 mb-4 flex items-center gap-2">
                  <X className="w-5 h-5" />
                  {showHindi ? 'लोन में:' : 'With Loans:'}
                </h5>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-gray-700">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>{showHindi ? 'हर महीने किस्त देनी होती है' : 'Monthly repayments are compulsory'}</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>{showHindi ? 'चाहे व्यवसाय चले या न चले, पैसा लौटाना पड़ता है' : 'Repayment is required even if the business struggles'}</span>
                  </li>
                </ul>
              </div>

              {/* Equity */}
              <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                <h5 className="font-bold text-blue-700 mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  {showHindi ? 'इक्विटी में:' : 'With Equity:'}
                </h5>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-gray-700">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{showHindi ? 'Quiver आपके व्यवसाय में साझेदार बनता है' : 'Quiver becomes a growth partner'}</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{showHindi ? 'Quiver व्यवसाय के बढ़ने में पैसा, समय और मार्गदर्शन लगाता है' : 'Quiver invests money, time, and guidance'}</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{showHindi ? 'व्यवसाय अच्छा चले, तो सभी को लाभ होता है' : 'If the business grows well, both benefit'}</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{showHindi ? 'व्यवसाय को नुकसान हो, तो पूरा बोझ केवल उद्यमी पर नहीं होता' : 'If the business faces challenges, the risk is shared'}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl p-4 flex items-center gap-3">
              <Shield className="w-6 h-6 text-primary flex-shrink-0" />
              <p className="text-gray-700 font-medium">
                {showHindi
                  ? 'इसमें मासिक किस्त का दबाव नहीं होता। Quiver और उद्यमी दोनों का लक्ष्य एक होता है – व्यवसाय को बढ़ाना'
                  : 'There is no fixed monthly repayment pressure. Both Quiver and the entrepreneur work toward the same goal: business growth'}
              </p>
            </div>
          </div>

          {/* Business Remains Yours */}
          <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg p-8 space-y-6">
            <h4 className="text-xl font-display font-bold text-gray-900 flex items-center gap-3">
              <Crown className="w-6 h-6 text-yellow-500" />
              {showHindi ? 'क्या इसका मतलब व्यवसाय Quiver का हो जाएगा?' : 'Does this mean Quiver owns the business?'}
            </h4>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-200">
              <p className="text-2xl font-bold text-gray-900 mb-4">{showHindi ? 'नहीं।' : 'No.'}</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span>{showHindi ? 'व्यवसाय आपका ही रहता है' : 'The business remains yours'}</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span>{showHindi ? 'निर्णयों में आपकी भूमिका बनी रहती है' : 'You continue to play a key role in decisions'}</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span>{showHindi ? 'साझेदारी स्पष्ट नियमों और आपसी सहमति से होती है' : 'The partnership is defined clearly and transparently'}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* When Does Quiver Invest */}
          <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg p-8 space-y-6">
            <h4 className="text-xl font-display font-bold text-gray-900 flex items-center gap-3">
              <Rocket className="w-6 h-6 text-primary" />
              {showHindi ? 'Quiver कब निवेश पर बात करता है?' : 'When does Quiver discuss equity?'}
            </h4>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">1</div>
                <p className="text-gray-700">{showHindi ? 'पहले व्यवसाय को समझता है' : 'First understands the business deeply'}</p>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">2</div>
                <p className="text-gray-700">{showHindi ? 'सिस्टम को मज़बूत करता है' : 'Helps strengthen systems'}</p>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">3</div>
                <p className="text-gray-700">{showHindi ? 'जब व्यवसाय तैयार होता है, तभी निवेश या रेवेन्यू-शेयर पर चर्चा होती है' : 'Discusses equity or revenue-sharing only when the business is ready'}</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
              <p className="text-gray-700">
                <span className="font-bold">{showHindi ? 'यह ज़रूरी नहीं कि हर उद्यमी निवेश ले।' : 'Not every entrepreneur takes investment.'}</span>
                <br />
                <span>{showHindi ? 'लेकिन निवेश की समझ और खुलापन ज़रूरी है।' : 'But openness to understanding this model is important.'}</span>
              </p>
            </div>
          </div>

          {/* Partnership Benefits Summary */}
          <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-2xl p-8">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Crown className="w-7 h-7" />
                </div>
                <h5 className="font-bold mb-1">{showHindi ? 'आप मालिक रहते हैं' : 'You Stay the Owner'}</h5>
                <p className="text-sm text-white/80">{showHindi ? 'आपका व्यवसाय, आपके निर्णय' : 'Your business, your decisions'}</p>
              </div>
              <div>
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Rocket className="w-7 h-7" />
                </div>
                <h5 className="font-bold mb-1">{showHindi ? 'हम बढ़ाने में मदद करते हैं' : 'We Support Growth'}</h5>
                <p className="text-sm text-white/80">{showHindi ? 'पैसा, मार्गदर्शन, उपकरण' : 'Money, guidance, tools'}</p>
              </div>
              <div>
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <h5 className="font-bold mb-1">{showHindi ? 'साथ में कमाते हैं' : 'We Earn Together'}</h5>
                <p className="text-sm text-white/80">{showHindi ? 'केवल जब आप सफल हों' : 'Only when you succeed'}</p>
              </div>
            </div>
          </div>

          {/* Question */}
          <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg p-8 space-y-6">
            <h4 className="text-xl font-display font-bold text-gray-900">
              {showHindi
                ? 'क्या आप भविष्य में निवेश/रेवेन्यू-शेयर आधारित साझेदारी को समझने के लिए खुले हैं?'
                : 'Are you open to exploring an investment/revenue-share based partnership in the future?'}
            </h4>

            <RadioGroup
              value={openToEquity}
              onValueChange={setOpenToEquity}
              className="space-y-3"
            >
              {[
                { value: 'yes', labelHi: 'हाँ', labelEn: 'Yes', color: 'green' },
                { value: 'maybe', labelHi: 'शायद', labelEn: 'Maybe', color: 'yellow' },
                { value: 'no', labelHi: 'नहीं', labelEn: 'No', color: 'red' }
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    openToEquity === option.value
                      ? `border-${option.color}-500 bg-${option.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <RadioGroupItem value={option.value} />
                  <span className="font-medium text-gray-900 text-lg">{option.labelHi}</span>
                  <span className="text-gray-500">| {option.labelEn}</span>
                </label>
              ))}
            </RadioGroup>

            <Button
              className="w-full h-14 bg-primary hover:bg-secondary text-lg font-semibold rounded-xl transition-all"
              disabled={!openToEquity}
              onClick={() => onContinue(openToEquity)}
            >
              {showHindi ? 'आगे बढ़ें' : 'Continue'}
            </Button>
          </div>

          {/* AI Assistant */}
          <AIAssistant
            position="inline"
            message={showHindi
              ? "इक्विटी के बारे में कोई सवाल? मैं समझाने में मदद कर सकता हूँ!"
              : "Questions about equity? I can help explain!"}
          />
        </div>
      </main>
    </div>
  );
}
