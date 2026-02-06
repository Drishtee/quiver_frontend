import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../components/ui/input-otp";
import { ArrowLeft } from "lucide-react";
import { IllustrationPlaceholder } from "../components/IllustrationPlaceholder";
import "./landing.css";

interface OTPVerificationProps {
  phone: string;
  onVerify: (otp: string) => void;
  onBack: () => void;
  onResend?: () => void;
  error?: string | null;
  loading?: boolean;
}

export function OTPVerification({ phone, onVerify, onBack, onResend, error, loading }: OTPVerificationProps) {
  const { t } = useTranslation();
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleResend = () => {
    setTimer(30);
    setCanResend(false);
    setOtp("");
    onResend?.();
  };

  const maskedPhone = `+91 ${phone.slice(0, 2)}****${phone.slice(-2)}`;

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
          {/* GFX-AUTH-005: OTP Phone Illustration */}
          {/* TODO: Replace logo with phone/SMS illustration — see GRAPHIC_DESIGN_SPEC.md */}
          {/* <img src="/illustrations/auth/gfx-auth-005-otp-phone.svg" alt="" className="w-[200px] h-[200px] mx-auto" /> */}
          <div className="text-center space-y-3">
            <IllustrationPlaceholder
              id="GFX-AUTH-005"
              label="Phone receiving OTP message illustration"
              width="200px"
              height="200px"
              className="mx-auto"
            />
            <h1 className="text-xl font-display font-bold text-gray-900">
              {t('otp.title')}
            </h1>
            <p className="text-sm text-gray-600">
              {t('otp.subtitle')} {maskedPhone}
            </p>
          </div>

          {/* OTP Input Card */}
          <div className="space-y-5">
            <div className="flex flex-col items-center space-y-4">
              <label className="text-sm text-gray-500">{t('otp.title')}</label>
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
                inputMode="numeric"
              >
                <InputOTPGroup className="gap-1.5">
                  <InputOTPSlot index={0} className="w-11 h-13 text-lg border-2 border-gray-200 rounded-xl bg-gray-50" />
                  <InputOTPSlot index={1} className="w-11 h-13 text-lg border-2 border-gray-200 rounded-xl bg-gray-50" />
                  <InputOTPSlot index={2} className="w-11 h-13 text-lg border-2 border-gray-200 rounded-xl bg-gray-50" />
                  <InputOTPSlot index={3} className="w-11 h-13 text-lg border-2 border-gray-200 rounded-xl bg-gray-50" />
                  <InputOTPSlot index={4} className="w-11 h-13 text-lg border-2 border-gray-200 rounded-xl bg-gray-50" />
                  <InputOTPSlot index={5} className="w-11 h-13 text-lg border-2 border-gray-200 rounded-xl bg-gray-50" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <button
              className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-3 px-6 rounded-xl min-h-[48px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={otp.length !== 6 || loading}
              onClick={() => onVerify(otp)}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('otp.verify')}...
                </>
              ) : (
                t('otp.verify')
              )}
            </button>

            <div className="text-center min-h-[48px] flex items-center justify-center">
              {!canResend ? (
                <p className="text-sm text-gray-500">
                  {t('otp.resendIn', { seconds: timer })}
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  className="text-sm text-accent font-medium hover:underline min-h-[48px] flex items-center justify-center px-4"
                >
                  {t('otp.resend')}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
