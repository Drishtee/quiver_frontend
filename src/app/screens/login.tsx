import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Checkbox } from "../components/ui/checkbox";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { verifyOTP } from "../../services/api";

import type { VerifyOTPResponse } from "../../types/api";

interface LoginProps {
  onLogin: (data: { phone: string; otp: string; response: VerifyOTPResponse }) => void;
  onBack: () => void;
  onSwitchToSignup: () => void;
}

export function Login({ onLogin, onBack, onSwitchToSignup }: LoginProps) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhoneSubmit = async () => {
    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Import and call sendOTP
      const { sendOTP } = await import("../../services/api");
      await sendOTP(phone);
      setShowOTP(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async () => {
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await verifyOTP(phone, otp);
      // Pass the full response to parent for routing decisions
      onLogin({ phone, otp, response });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background mobile-full-screen">
      {/* Header - Mobile-first */}
      <header className="border-b border-border bg-white sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3 md:px-6 md:py-4 md:gap-4">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 active:bg-gray-200 rounded-lg min-h-touch min-w-touch flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Quiver Logo" className="w-8 h-8 object-contain" />
            <h1 className="text-lg md:text-xl font-semibold text-foreground">Quiver</h1>
          </div>
        </div>
      </header>

      {/* Main Content - Mobile-first */}
      <main className="max-w-md mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="space-y-6 md:space-y-8">
          {/* Welcome Section - Mobile-first */}
          <div className="text-center space-y-2 md:space-y-3">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
              Welcome Back
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              {showOTP
                ? `Enter the OTP sent to +91 ${phone}`
                : "Log in to access your Quiver account"
              }
            </p>
          </div>

          {/* Login Form - Mobile-first */}
          <div className="bg-white rounded-xl md:rounded-2xl border border-border shadow-sm p-4 md:p-6 space-y-5 md:space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {!showOTP ? (
              <>
                {/* Phone Number Input - Mobile-first touch targets */}
                <div className="space-y-2">
                  <label className="text-sm text-foreground font-medium">
                    Mobile Number
                  </label>
                  <div className="flex gap-2">
                    <div className="w-16 h-12 bg-input-background rounded-lg flex items-center justify-center border border-border">
                      <span className="text-sm text-muted-foreground">+91</span>
                    </div>
                    <Input
                      type="tel"
                      inputMode="numeric"
                      placeholder="Enter your number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="flex-1 bg-input-background border-border"
                      maxLength={10}
                      disabled={isLoading}
                      autoComplete="tel"
                    />
                  </div>
                </div>

                {/* Remember Me - Mobile-first touch targets */}
                <div className="flex items-center gap-3 min-h-touch">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="w-5 h-5"
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm text-muted-foreground cursor-pointer flex-1"
                  >
                    Remember this device
                  </label>
                </div>

                {/* Submit Button - Mobile-first */}
                <Button
                  className="w-full min-h-[48px] bg-primary hover:bg-primary/90 active:bg-primary/80"
                  disabled={!phone || phone.length !== 10 || isLoading}
                  onClick={handlePhoneSubmit}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    "Continue with OTP"
                  )}
                </Button>
              </>
            ) : (
              <>
                {/* OTP Input */}
                <div className="space-y-2">
                  <label className="text-sm text-foreground font-medium">
                    Enter OTP
                  </label>
                  <div className="relative">
                    <Input
                      type={showOTP ? "text" : "password"}
                      placeholder="6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="h-11 bg-input-background border-border pr-10"
                      maxLength={6}
                      disabled={isLoading}
                    />
                    <button
                      onClick={() => setShowOTP(!showOTP)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                    >
                      {showOTP ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Resend OTP */}
                <div className="text-center">
                  <button
                    onClick={handlePhoneSubmit}
                    className="text-sm text-primary hover:underline"
                    disabled={isLoading}
                  >
                    Resend OTP
                  </button>
                </div>

                {/* Submit Button */}
                <Button
                  className="w-full h-12 bg-primary hover:bg-primary/90"
                  disabled={!otp || otp.length !== 6 || isLoading}
                  onClick={handleOTPSubmit}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Log In"
                  )}
                </Button>

                {/* Change Number */}
                <button
                  onClick={() => setShowOTP(false)}
                  className="w-full text-sm text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  Change phone number
                </button>
              </>
            )}
          </div>

          {/* Switch to Signup */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button
                onClick={onSwitchToSignup}
                className="text-primary font-medium hover:underline"
              >
                Sign up here
              </button>
            </p>
          </div>

          {/* Multi-tenant Notice */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-xs text-center text-foreground">
              <strong>Multi-Tenant Platform:</strong> Your data is securely isolated by organization.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
