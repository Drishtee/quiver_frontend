import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Shield } from "lucide-react";
import { verifyOTP } from "../../services/api";
import "./landing.css";

import type { VerifyOTPResponse } from "../../types/api";

interface LoginProps {
  onLogin: (data: { phone: string; otp: string; response: VerifyOTPResponse }) => void;
  onBack: () => void;
  onSwitchToSignup: () => void;
}

export function Login({ onLogin, onBack, onSwitchToSignup }: LoginProps) {
  const { t } = useTranslation();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhoneSubmit = async () => {
    if (phone.length !== 10) {
      setError(t('login.errorInvalidPhone'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { sendOTP } = await import("../../services/api");
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
      setError(t('login.errorInvalidOtp'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await verifyOTP(phone, otp);
      onLogin({ phone, otp, response });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Glassmorphism Nav */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm py-3 px-5 flex items-center gap-3 sticky top-0 z-50">
        <button
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-gray-100 active:bg-gray-200 rounded-lg min-h-[48px] min-w-[48px] flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-gray-900" />
        </button>
        <div className="flex items-center gap-2">
          <img src="/logo.jpg" alt="Quiver" className="w-8 h-8 object-contain" />
          <span className="text-xl font-display font-bold text-primary">Quiver</span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-5 py-8">
        <div className="space-y-6">
          {/* Logo + Heading */}
          <div className="text-center space-y-3">
            <img src="/logo.jpg" alt="Quiver" className="w-20 h-20 object-contain mx-auto" />
            <h1 className="text-2xl font-display font-extrabold text-gray-950">
              {t('login.title')}
            </h1>
            <p className="text-sm text-gray-600">
              {step === 'otp'
                ? t('login.otpSent', { phone })
                : t('login.subtitle')
              }
            </p>
          </div>

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
                  {t('login.phoneLabel')}
                </label>
                <div className="flex gap-2">
                  <div className="w-16 h-12 bg-gray-50 rounded-xl flex items-center justify-center border-2 border-gray-200">
                    <span className="text-sm text-gray-600 font-medium">+91</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder={t('login.phonePlaceholder')}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:border-accent focus:outline-none text-base"
                    maxLength={10}
                    disabled={isLoading}
                    autoComplete="tel"
                  />
                </div>
              </div>

              <button
                className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-3 px-6 rounded-xl min-h-[48px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={!phone || phone.length !== 10 || isLoading}
                onClick={handlePhoneSubmit}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t('login.sendingOtp')}
                  </>
                ) : (
                  t('login.sendOtp')
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm text-gray-900 font-medium">
                  {t('login.otpLabel')}
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder={t('login.otpPlaceholder')}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:border-accent focus:outline-none text-base text-center tracking-[0.3em] font-semibold"
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
                  {t('login.resendOtp')}
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
                    {t('login.verifying')}
                  </>
                ) : (
                  t('login.verifyLogin')
                )}
              </button>

              {/* Change Number */}
              <button
                onClick={() => { setStep('phone'); setOtp(''); setError(null); }}
                className="w-full text-sm text-gray-500 hover:text-gray-900 font-medium min-h-[48px]"
                disabled={isLoading}
              >
                {t('login.changeNumber')}
              </button>
            </div>
          )}

          {/* Switch to Signup */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {t('login.noAccount')}{" "}
              <button
                onClick={onSwitchToSignup}
                className="text-accent font-bold hover:underline"
              >
                {t('login.signUp')}
              </button>
            </p>
          </div>

          {/* Trust Line */}
          <div className="flex items-center justify-center gap-2 py-3">
            <Shield className="w-4 h-4 text-gray-400" />
            <p className="text-xs text-gray-500">
              {t('login.trustLine')}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
