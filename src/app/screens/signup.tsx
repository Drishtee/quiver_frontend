import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Shield } from "lucide-react";
import { Checkbox } from "../components/ui/checkbox";
import { LanguageSelector } from "../components/language-selector";
import { sendOTP, verifyOTP } from "../../services/api";
import "./landing.css";

import type { VerifyOTPResponse } from "../../types/api";

interface SignupProps {
  onSignup: (data: { phone: string; otp: string; response: VerifyOTPResponse }) => void;
  onBack: () => void;
  onSwitchToLogin: () => void;
}

export function Signup({ onSignup, onBack, onSwitchToLogin }: SignupProps) {
  const { t } = useTranslation();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);

  const handlePhoneSubmit = async () => {
    if (phone.length !== 10) {
      setError(t('signup.errorInvalidPhone'));
      return;
    }

    if (!consentGiven) {
      setError(t('consent.pleaseAgreeAll'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await sendOTP(phone);
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async () => {
    if (otp.length !== 6) {
      setError(t('signup.errorInvalidOtp'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await verifyOTP(phone, otp);
      onSignup({ phone, otp, response });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 py-3 px-5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-gray-100 active:bg-gray-200 rounded-lg min-h-[48px] min-w-[48px] flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-gray-900" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Quiver" className="w-8 h-8 rounded-lg object-cover" />
            <span className="text-xl font-display font-bold text-primary">Quiver</span>
          </div>
        </div>
        <LanguageSelector variant="compact" />
      </nav>

      {/* Centered form card */}
      <main className="flex items-start justify-center px-5 py-8 lg:py-16">
        <div className="w-full max-w-sm lg:max-w-md">
          {/* Logo + heading */}
          <div className="text-center mb-8">
            <img src="/logo.jpg" alt="Quiver" className="w-14 h-14 rounded-xl object-cover mx-auto" />
            <h1 className="text-2xl font-display font-bold text-gray-900 mt-4">
              {t('signup.title')}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {step === 'otp'
                ? t('signup.otpSent', { phone })
                : t('signup.subtitle')
              }
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Phone Step */}
            {step === 'phone' ? (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm text-gray-900 font-medium">
                    {t('signup.phoneLabel')}
                  </label>
                  <div className="flex gap-2">
                    <div className="w-16 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200">
                      <span className="text-sm text-gray-600 font-medium">+91</span>
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder={t('signup.phonePlaceholder')}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none text-base"
                      maxLength={10}
                      disabled={isLoading}
                      autoComplete="tel"
                    />
                  </div>
                </div>

                {/* Consent */}
                <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <Checkbox
                    id="signup-consent"
                    checked={consentGiven}
                    onCheckedChange={(checked) => setConsentGiven(checked === true)}
                    className="mt-1"
                  />
                  <label
                    htmlFor="signup-consent"
                    className="text-sm text-gray-700 cursor-pointer leading-relaxed"
                  >
                    {t('signup.consent')}
                  </label>
                </div>

                <button
                  className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-3 px-6 rounded-xl min-h-[48px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={!phone || phone.length !== 10 || !consentGiven || isLoading}
                  onClick={handlePhoneSubmit}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t('signup.sendingOtp')}
                    </>
                  ) : (
                    t('signup.sendOtp')
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm text-gray-900 font-medium">
                    {t('signup.otpLabel')}
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder={t('signup.otpPlaceholder')}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none text-base text-center tracking-[0.3em] font-semibold"
                    maxLength={6}
                    disabled={isLoading}
                    autoComplete="one-time-code"
                  />
                </div>

                {/* Resend OTP */}
                <div className="text-center">
                  <button
                    onClick={handlePhoneSubmit}
                    className="text-sm text-accent font-medium hover:underline min-h-[48px]"
                    disabled={isLoading}
                  >
                    {t('signup.resendOtp')}
                  </button>
                </div>

                <button
                  className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-3 px-6 rounded-xl min-h-[48px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={!otp || otp.length !== 6 || isLoading}
                  onClick={handleOTPSubmit}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t('signup.verifying')}
                    </>
                  ) : (
                    t('signup.verifySignup')
                  )}
                </button>

                {/* Change Number */}
                <button
                  onClick={() => { setStep('phone'); setOtp(''); setError(null); }}
                  className="w-full text-sm text-gray-500 hover:text-gray-900 font-medium min-h-[48px]"
                  disabled={isLoading}
                >
                  {t('signup.changeNumber')}
                </button>
              </div>
            )}
          </div>

          {/* Switch to Login */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              {t('signup.hasAccount')}{" "}
              <button
                onClick={onSwitchToLogin}
                className="text-accent font-bold hover:underline"
              >
                {t('signup.login')}
              </button>
            </p>
          </div>

          {/* Trust Line */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <Shield className="w-4 h-4 text-gray-400" />
            <p className="text-xs text-gray-500">
              {t('signup.trustLine')}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
