import { useState } from "react";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import {
  Building2,
  Users,
  TrendingUp,
  Handshake,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Target,
  Shield
} from "lucide-react";

interface BusinessModelConfirmationProps {
  onContinue: () => void;
  onBack?: () => void;
}

export function BusinessModelConfirmation({ onContinue, onBack }: BusinessModelConfirmationProps) {
  const [hasUnderstood, setHasUnderstood] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);

  const isValid = hasUnderstood && hasAgreed;

  const keyPoints = [
    {
      icon: Building2,
      titleEn: "Business Partnership",
      titleHi: "व्यापार साझेदारी",
      descEn: "Quiver partners with rural entrepreneurs to help grow their businesses",
      descHi: "Quiver ग्रामीण उद्यमियों के साथ साझेदारी करके उनके व्यवसाय को बढ़ाने में मदद करता है"
    },
    {
      icon: TrendingUp,
      titleEn: "Growth Support",
      titleHi: "विकास सहायता",
      descEn: "We provide mentorship, resources, and market access to scale your enterprise",
      descHi: "हम आपके उद्यम को बढ़ाने के लिए मार्गदर्शन, संसाधन और बाजार पहुंच प्रदान करते हैं"
    },
    {
      icon: Handshake,
      titleEn: "Equity Partnership",
      titleHi: "इक्विटी साझेदारी",
      descEn: "In exchange for our support, Quiver takes a small equity stake in your business",
      descHi: "हमारे समर्थन के बदले में, Quiver आपके व्यवसाय में एक छोटी इक्विटी हिस्सेदारी लेता है"
    },
    {
      icon: Users,
      titleEn: "Dedicated Team",
      titleHi: "समर्पित टीम",
      descEn: "You'll work directly with Quiver's team for guidance and support",
      descHi: "आप मार्गदर्शन और सहायता के लिए सीधे Quiver की टीम के साथ काम करेंगे"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center mr-3">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-display font-bold text-primary">Welcome to Quiver</span>
            <p className="text-sm text-muted-foreground">Quiver में आपका स्वागत है</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/20 to-blue-100 rounded-full flex items-center justify-center">
              <Target className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Understanding Quiver's Business Model
            </h1>
            <p className="text-lg text-gray-600">
              Quiver का बिज़नेस मॉडल समझें
            </p>
            <p className="text-gray-500 max-w-md mx-auto">
              Before we begin your onboarding journey, please take a moment to understand how Quiver works with entrepreneurs like you.
            </p>
          </div>

          {/* Key Points */}
          <div className="space-y-4">
            {keyPoints.map((point, index) => {
              const Icon = point.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {point.titleEn}
                    </h3>
                    <p className="text-sm text-primary font-medium mb-1">
                      {point.titleHi}
                    </p>
                    <p className="text-sm text-gray-600">{point.descEn}</p>
                    <p className="text-sm text-gray-500 mt-1">{point.descHi}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Important Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <div className="flex gap-3">
              <Shield className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800">Important Note | महत्वपूर्ण सूचना</h3>
                <p className="text-sm text-amber-700 mt-2">
                  By proceeding, you acknowledge that Quiver's partnership model involves equity participation.
                  Our team will explain the specific terms during your onboarding consultation.
                </p>
                <p className="text-sm text-amber-600 mt-2">
                  आगे बढ़ने से, आप स्वीकार करते हैं कि Quiver की साझेदारी मॉडल में इक्विटी भागीदारी शामिल है।
                  हमारी टीम आपकी ऑनबोर्डिंग परामर्श के दौरान विशिष्ट शर्तों की व्याख्या करेगी।
                </p>
              </div>
            </div>
          </div>

          {/* Confirmation Checkboxes */}
          <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg p-6 space-y-5">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Please Confirm | कृपया पुष्टि करें
            </h3>

            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <Checkbox
                  checked={hasUnderstood}
                  onCheckedChange={(checked) => setHasUnderstood(checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="text-gray-900 group-hover:text-primary transition-colors">
                    I have read and understood Quiver's business model
                  </p>
                  <p className="text-sm text-gray-500">
                    मैंने Quiver का बिज़नेस मॉडल पढ़ और समझ लिया है
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <Checkbox
                  checked={hasAgreed}
                  onCheckedChange={(checked) => setHasAgreed(checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="text-gray-900 group-hover:text-primary transition-colors">
                    I am interested in partnering with Quiver and want to proceed with onboarding
                  </p>
                  <p className="text-sm text-gray-500">
                    मैं Quiver के साथ साझेदारी करने में रुचि रखता हूं और ऑनबोर्डिंग के साथ आगे बढ़ना चाहता हूं
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Continue Button */}
          <Button
            className="w-full h-14 bg-primary hover:bg-primary/90 text-lg font-semibold rounded-xl transition-all disabled:opacity-50"
            disabled={!isValid}
            onClick={onContinue}
          >
            Continue to Onboarding | ऑनबोर्डिंग जारी रखें
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          {/* Help Text */}
          <p className="text-center text-sm text-gray-500">
            Have questions? You can discuss with our team during your consultation call.
            <br />
            <span className="text-gray-400">
              क्या आपके कोई प्रश्न हैं? आप अपनी परामर्श कॉल के दौरान हमारी टीम से चर्चा कर सकते हैं।
            </span>
          </p>
        </div>
      </main>
    </div>
  );
}
