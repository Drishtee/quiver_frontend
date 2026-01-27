import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../components/ui/input-otp";
import { AIAssistant } from "../components/ai-assistant";
import { ArrowLeft } from "lucide-react";

interface OTPVerificationProps {
  phone: string;
  onVerify: (otp: string) => void;
  onBack: () => void;
  onResend?: () => void;
  error?: string | null;
  loading?: boolean;
}

export function OTPVerification({ phone, onVerify, onBack, onResend, error, loading }: OTPVerificationProps) {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((t) => t - 1);
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Verify Mobile Number</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-6 py-12">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">
              Verify Your Mobile Number
            </h2>
            <p className="text-muted-foreground">
              We've sent a 6-digit code to {maskedPhone}
            </p>
          </div>

          {/* OTP Input Card */}
          <div className="bg-white rounded-2xl border border-border shadow-sm p-8 space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <label className="text-sm text-muted-foreground">Enter OTP</label>
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="w-12 h-12 text-lg border-border" />
                  <InputOTPSlot index={1} className="w-12 h-12 text-lg border-border" />
                  <InputOTPSlot index={2} className="w-12 h-12 text-lg border-border" />
                  <InputOTPSlot index={3} className="w-12 h-12 text-lg border-border" />
                  <InputOTPSlot index={4} className="w-12 h-12 text-lg border-border" />
                  <InputOTPSlot index={5} className="w-12 h-12 text-lg border-border" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm text-center">
                {error}
              </div>
            )}

            <Button
              className="w-full h-12 bg-primary hover:bg-primary/90"
              disabled={otp.length !== 6 || loading}
              onClick={() => onVerify(otp)}
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </Button>

            <div className="text-center">
              {!canResend ? (
                <p className="text-sm text-muted-foreground">
                  Resend code in {timer}s
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  className="text-sm text-primary hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </div>

          {/* AI Assistant Hint */}
          <AIAssistant 
            position="inline"
            message="Having trouble? I can help you verify your number or resend the code."
          />
        </div>
      </main>
    </div>
  );
}
