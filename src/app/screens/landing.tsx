import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './landing.css';
import { LanguageSelector } from '../components/language-selector';
import { VideoExplainer } from '../components/video-explainer';
import { Checkbox } from '../components/ui/checkbox';
import { QuiverAIAssistant } from '../components/voice/QuiverAIAssistant';

interface LandingProps {
  onGetStarted: (phoneNumber: string) => void;
  onLogin: () => void;
}

// Named export for the Landing component
export const Landing: React.FC<LandingProps> = ({ onGetStarted, onLogin }) => {
  const { t } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  const handleVoiceStart = () => {
    setIsListening(true);
    setShowPhoneInput(true);
  };

  const handleTextStart = () => {
    setShowPhoneInput(true);
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.trim()) {
      onGetStarted(phoneNumber);
    }
  };

  // Scroll to phone input when it's shown
  useEffect(() => {
    if (showPhoneInput && heroRef.current) {
      heroRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [showPhoneInput]);

  return (
    <div className="bg-gradient-to-b from-green-50 to-white font-sans min-h-screen">
      {/* Navigation */}
      <nav
        id="header"
        className="bg-white shadow-sm py-4 px-6 flex justify-between items-center sticky top-0 z-50"
      >
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
            <i className="fa-solid fa-seedling text-white text-xl"></i>
          </div>
          <span className="text-2xl font-display font-bold text-primary">Quiver</span>
        </div>
        <div className="flex items-center space-x-4">
          <LanguageSelector variant="compact" />
          <button
            onClick={onLogin}
            className="bg-white hover:bg-gray-50 text-primary font-medium py-2 px-6 rounded-full border-2 border-primary transition-colors"
          >
            {t('landing.nav.login')}
          </button>
          <button
            onClick={() => setShowPhoneInput(true)}
            className="bg-primary hover:bg-secondary text-white font-medium py-2 px-6 rounded-full transition-colors"
          >
            {t('landing.nav.startGrowing')}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero-section" className="relative px-6 py-16 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="text-center lg:text-left">
              <div className="inline-block bg-accent/20 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <i className="fa-solid fa-handshake mr-2"></i>{t('landing.hero.badge')}
              </div>
              <h1 className="text-5xl lg:text-6xl font-display font-bold text-gray-900 mb-6 leading-tight">
                {t('landing.hero.title')}<br/>
                <span className="text-primary">{t('landing.hero.titleHighlight')}</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {t('landing.hero.subtitle')}
              </p>
              <div className="mt-8 flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <i className="fa-solid fa-check-circle text-accent mr-2"></i>
                  <span>{t('landing.hero.features.simple')}</span>
                </div>
                <div className="flex items-center">
                  <i className="fa-solid fa-check-circle text-accent mr-2"></i>
                  <span>{t('landing.hero.features.noHidden')}</span>
                </div>
                <div className="flex items-center">
                  <i className="fa-solid fa-check-circle text-accent mr-2"></i>
                  <span>{t('landing.hero.features.yourControl')}</span>
                </div>
              </div>

              {/* Video Explainer */}
              <div className="mt-8">
                <VideoExplainer
                  variant="modal"
                  videoId="dQw4w9WgXcQ"
                  className="inline-flex"
                />
              </div>
            </div>

            {/* Right Column - Video Avatar Container */}
            <div className="relative">
              <div 
                id="video-avatar-container" 
                className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-primary/20"
              >
                {/* Avatar Display Area */}
                <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl mb-6 flex items-center justify-center overflow-hidden relative">
                  <div id="avatar-video" className="w-full h-full flex items-center justify-center">
                    {showPhoneInput ? (
                      <div className="text-center p-6 w-full">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Enter Your Phone Number</h3>
                        <form onSubmit={handlePhoneSubmit} className="space-y-4">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-700 font-medium">+91</span>
                            <input
                              type="tel"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              placeholder="9876543210"
                              className="flex-1 px-4 py-3 border-2 border-primary/30 rounded-lg focus:border-primary focus:outline-none text-lg"
                              maxLength={10}
                              pattern="[0-9]{10}"
                              required
                            />
                          </div>
                          {/* Consent Checkbox - Required */}
                          <div className="flex items-start gap-3 text-left bg-muted/50 p-3 rounded-lg">
                            <Checkbox
                              id="landing-consent"
                              checked={consentGiven}
                              onCheckedChange={(checked) => setConsentGiven(checked === true)}
                              className="mt-1"
                            />
                            <label
                              htmlFor="landing-consent"
                              className="text-sm text-gray-700 cursor-pointer leading-relaxed"
                            >
                              I agree to the{' '}
                              <a href="#terms" className="text-primary hover:underline">Terms of Service</a>
                              {' '}and{' '}
                              <a href="#privacy" className="text-primary hover:underline">Privacy Policy</a>.
                              I consent to receive communications via SMS and WhatsApp.
                            </label>
                          </div>
                          <button
                            type="submit"
                            disabled={!consentGiven || phoneNumber.length !== 10}
                            className="w-full bg-primary hover:bg-secondary text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
                          >
                            Continue
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowPhoneInput(false);
                              setConsentGiven(false);
                            }}
                            className="w-full text-gray-600 hover:text-gray-800 font-medium"
                          >
                            Cancel
                          </button>
                        </form>
                      </div>
                    ) : isListening ? (
                      <div className="text-center animate-pulse">
                        <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl">
                          <i className="fa-solid fa-microphone-lines text-white text-5xl animate-pulse"></i>
                        </div>
                        <p className="text-primary font-bold text-lg mb-2">Listening...</p>
                        <p className="text-gray-600 text-sm">Speak in your language</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-primary flex items-center justify-center">
                          <i className="fa-solid fa-user-tie text-white text-5xl"></i>
                        </div>
                        <div className="animate-pulse">
                          <div className="flex justify-center space-x-2 mb-4">
                            <div className="w-3 h-3 bg-primary rounded-full"></div>
                            <div className="w-3 h-3 bg-primary rounded-full animation-delay-200"></div>
                            <div className="w-3 h-3 bg-primary rounded-full animation-delay-400"></div>
                          </div>
                          <p className="text-gray-600 text-sm">AI Assistant Ready</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Title and Description */}
                {!showPhoneInput && (
                  <>
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">
                        Talk to Our Growth Expert
                      </h3>
                      <p className="text-gray-600">Voice or text — your choice, your language</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-4">
                      <button
                        id="start-voice-btn"
                        onClick={handleVoiceStart}
                        className="bg-primary hover:bg-secondary text-white font-bold py-4 px-8 rounded-full text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
                      >
                        <i className="fa-solid fa-microphone mr-3 text-xl"></i>
                        <span>Start Voice Conversation</span>
                      </button>
                      <button
                        id="start-text-btn"
                        onClick={handleTextStart}
                        className="bg-white hover:bg-gray-50 text-primary font-semibold py-4 px-8 rounded-full text-lg border-2 border-primary transition-all flex items-center justify-center"
                      >
                        <i className="fa-solid fa-comments mr-3 text-xl"></i>
                        <span>Chat with Text</span>
                      </button>
                    </div>
                  </>
                )}

                {/* Feature Indicators */}
                <div className="mt-6 flex items-center justify-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <i className="fa-solid fa-language mr-1"></i>
                    <span>10+ Languages</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fa-solid fa-shield-halved mr-1"></i>
                    <span>Secure & Private</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fa-solid fa-clock mr-1"></i>
                    <span>Available 24/7</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Quiver Does Section */}
      <section id="what-quiver-does" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
              What Quiver Does for You
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              You don't get everything. You get what your business actually needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Funding Card */}
            <div 
              id="funding-card" 
              className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl border-2 border-green-100 hover:border-primary transition-all hover:shadow-xl"
            >
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6">
                <i className="fa-solid fa-coins text-white text-3xl"></i>
              </div>
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">Funding</h3>
              <p className="text-gray-600 leading-relaxed">
                Money to grow your business — only if you need it, only what you need.
              </p>
            </div>

            {/* Mentorship Card */}
            <div 
              id="mentorship-card" 
              className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border-2 border-blue-100 hover:border-primary transition-all hover:shadow-xl"
            >
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-6">
                <i className="fa-solid fa-user-tie text-white text-3xl"></i>
              </div>
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">Mentorship</h3>
              <p className="text-gray-600 leading-relaxed">
                Guidance from experienced people who understand your challenges.
              </p>
            </div>

            {/* Education Card */}
            <div 
              id="education-card" 
              className="bg-gradient-to-br from-yellow-50 to-white p-8 rounded-2xl border-2 border-yellow-100 hover:border-primary transition-all hover:shadow-xl"
            >
              <div className="w-16 h-16 bg-warm rounded-2xl flex items-center justify-center mb-6">
                <i className="fa-solid fa-graduation-cap text-white text-3xl"></i>
              </div>
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">Education</h3>
              <p className="text-gray-600 leading-relaxed">
                Learn new skills to run your business better and smarter.
              </p>
            </div>

            {/* Tools Card */}
            <div 
              id="tools-card" 
              className="bg-gradient-to-br from-orange-50 to-white p-8 rounded-2xl border-2 border-orange-100 hover:border-primary transition-all hover:shadow-xl"
            >
              <div className="w-16 h-16 bg-earth rounded-2xl flex items-center justify-center mb-6">
                <i className="fa-solid fa-toolbox text-white text-3xl"></i>
              </div>
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">Tools & Support</h3>
              <p className="text-gray-600 leading-relaxed">
                Practical help and tools to make your work easier every day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Equity Explained Section */}
      <section id="equity-explained" className="py-20 px-6 bg-gradient-to-br from-green-50 via-blue-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-primary/10 text-primary px-6 py-3 rounded-full text-sm font-bold mb-6">
              <i className="fa-solid fa-lightbulb mr-2"></i>Understanding Partnership
            </div>
            <h2 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-6">
              What Does "Equity" Mean?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              It's simple: Partnership, not control. You remain the owner.
            </p>
          </div>

          {/* Before and After Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Before Quiver */}
            <div className="bg-white p-10 rounded-3xl shadow-xl">
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-8 text-center">
                Before Quiver
              </h3>
              <div className="flex justify-center mb-6">
                <div className="relative w-72 h-72">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl"></div>
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-48 h-48 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 shadow-lg">
                        <div className="text-white text-center">
                          <i className="fa-solid fa-store text-5xl mb-3"></i>
                          <div className="text-3xl font-bold">100%</div>
                          <div className="text-sm mt-1">Your Business</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-gray-600">
                        <i className="fa-solid fa-coins text-yellow-500"></i>
                        <span className="text-sm font-medium">Limited Resources</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-center text-gray-600 text-lg">
                You work alone with limited resources
              </p>
            </div>

            {/* With Quiver Partnership */}
            <div className="bg-white p-10 rounded-3xl shadow-xl border-4 border-primary relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full"></div>
              <h3 className="text-2xl font-display font-bold text-primary mb-8 text-center relative z-10">
                With Quiver Partnership
              </h3>
              <div className="flex justify-center mb-6 relative z-10">
                <div className="relative w-72 h-72">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl"></div>
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="relative">
                      <div className="w-48 h-48 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg relative">
                        <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-warm to-earth rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                          <div className="text-white text-center">
                            <div className="text-xs font-bold">10-15%</div>
                          </div>
                        </div>
                        <div className="text-white text-center">
                          <i className="fa-solid fa-store text-5xl mb-3"></i>
                          <div className="text-3xl font-bold">85-90%</div>
                          <div className="text-sm mt-1">You Own</div>
                        </div>
                      </div>
                      <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-white px-3 py-2 rounded-lg shadow text-center">
                          <i className="fa-solid fa-coins text-primary mb-1"></i>
                          <div className="font-semibold text-gray-700">Funding</div>
                        </div>
                        <div className="bg-white px-3 py-2 rounded-lg shadow text-center">
                          <i className="fa-solid fa-user-tie text-primary mb-1"></i>
                          <div className="font-semibold text-gray-700">Mentorship</div>
                        </div>
                        <div className="bg-white px-3 py-2 rounded-lg shadow text-center">
                          <i className="fa-solid fa-graduation-cap text-primary mb-1"></i>
                          <div className="font-semibold text-gray-700">Education</div>
                        </div>
                        <div className="bg-white px-3 py-2 rounded-lg shadow text-center">
                          <i className="fa-solid fa-toolbox text-primary mb-1"></i>
                          <div className="font-semibold text-gray-700">Tools</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-center text-gray-600 text-lg relative z-10">
                You grow faster with support, money & guidance
              </p>
            </div>
          </div>

          {/* Partnership Benefits */}
          <div className="bg-gradient-to-br from-white to-green-50 rounded-3xl shadow-2xl p-10 max-w-4xl mx-auto border-2 border-primary/20">
            <div className="text-center mb-8">
              <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                <i className="fa-solid fa-handshake text-5xl text-primary"></i>
              </div>
              <h3 className="text-3xl font-display font-bold text-gray-900 mb-4">
                Like a Partner Who Helps You Grow
              </h3>
              <p className="text-xl text-gray-600">And grows with you</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-white rounded-2xl shadow-md border-2 border-green-100 hover:border-primary transition-all">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-crown text-white text-2xl"></i>
                </div>
                <p className="font-bold text-gray-900 mb-2 text-lg">You Stay the Owner</p>
                <p className="text-sm text-gray-600">Your business, your decisions</p>
              </div>
              <div className="text-center p-6 bg-white rounded-2xl shadow-md border-2 border-blue-100 hover:border-primary transition-all">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-accent to-secondary rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-rocket text-white text-2xl"></i>
                </div>
                <p className="font-bold text-gray-900 mb-2 text-lg">We Support Growth</p>
                <p className="text-sm text-gray-600">Money, guidance, tools</p>
              </div>
              <div className="text-center p-6 bg-white rounded-2xl shadow-md border-2 border-yellow-100 hover:border-primary transition-all">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-warm to-earth rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-chart-line text-white text-2xl"></i>
                </div>
                <p className="font-bold text-gray-900 mb-2 text-lg">We Earn Together</p>
                <p className="text-sm text-gray-600">Only when you succeed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Equity is NOT Section */}
      <section id="what-equity-is-not" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
              What Equity is NOT
            </h2>
            <p className="text-xl text-gray-600">Clear answers to build your trust</p>
          </div>

          {/* What We DON'T Do */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div id="not-takeover" className="bg-red-50 p-8 rounded-2xl border-2 border-red-200">
              <div className="flex items-start mb-4">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                  <i className="fa-solid fa-times text-white text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">We DON'T Take Over</h3>
                  <p className="text-gray-700">Your business remains yours. We don't become the boss.</p>
                </div>
              </div>
            </div>

            <div id="not-interfere" className="bg-red-50 p-8 rounded-2xl border-2 border-red-200">
              <div className="flex items-start mb-4">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                  <i className="fa-solid fa-times text-white text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">We DON'T Interfere Daily</h3>
                  <p className="text-gray-700">You run your business. We guide when you need us.</p>
                </div>
              </div>
            </div>

            <div id="not-earn-alone" className="bg-red-50 p-8 rounded-2xl border-2 border-red-200">
              <div className="flex items-start mb-4">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                  <i className="fa-solid fa-times text-white text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">We DON'T Earn if You Don't</h3>
                  <p className="text-gray-700">Our success is tied to your success. We grow together.</p>
                </div>
              </div>
            </div>

            <div id="not-hidden" className="bg-red-50 p-8 rounded-2xl border-2 border-red-200">
              <div className="flex items-start mb-4">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                  <i className="fa-solid fa-times text-white text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">NO Hidden Terms</h3>
                  <p className="text-gray-700">Everything is explained clearly in your language.</p>
                </div>
              </div>
            </div>
          </div>

          {/* What We DO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div id="we-guide" className="bg-green-50 p-8 rounded-2xl border-2 border-green-200 text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-check text-white text-3xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">We Guide</h3>
              <p className="text-gray-700">With experience and care</p>
            </div>

            <div id="we-support" className="bg-green-50 p-8 rounded-2xl border-2 border-green-200 text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-check text-white text-3xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">We Support</h3>
              <p className="text-gray-700">With money and resources</p>
            </div>

            <div id="we-align" className="bg-green-50 p-8 rounded-2xl border-2 border-green-200 text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-check text-white text-3xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">We Stay Aligned</h3>
              <p className="text-gray-700">Your goals are our goals</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 bg-gradient-to-b from-white to-green-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
              How Quiver Decides What You Need
            </h2>
            <p className="text-xl text-gray-600">Simple steps. You're always in control.</p>
          </div>

          <div className="relative">
            {/* Vertical Line (hidden on mobile) */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-primary/20 hidden lg:block"></div>

            <div className="space-y-12">
              {/* Step 1 */}
              <div id="step-1" className="flex flex-col lg:flex-row items-center gap-8">
                <div className="lg:w-1/2 lg:text-right lg:pr-12">
                  <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-primary/20 hover:border-primary transition-all">
                    <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">
                      1. You Tell Us About Your Business
                    </h3>
                    <p className="text-gray-600 text-lg">
                      Use voice or answer simple questions in your language. No complicated forms.
                    </p>
                  </div>
                </div>
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center flex-shrink-0 shadow-xl z-10">
                  <i className="fa-solid fa-microphone text-white text-2xl"></i>
                </div>
                <div className="lg:w-1/2"></div>
              </div>

              {/* Step 2 */}
              <div id="step-2" className="flex flex-col lg:flex-row-reverse items-center gap-8">
                <div className="lg:w-1/2 lg:text-left lg:pl-12">
                  <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-primary/20 hover:border-primary transition-all">
                    <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">
                      2. We Understand Your Challenges
                    </h3>
                    <p className="text-gray-600 text-lg">
                      Our team listens carefully and identifies what will help you grow most.
                    </p>
                  </div>
                </div>
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 shadow-xl z-10">
                  <i className="fa-solid fa-brain text-white text-2xl"></i>
                </div>
                <div className="lg:w-1/2"></div>
              </div>

              {/* Step 3 */}
              <div id="step-3" className="flex flex-col lg:flex-row items-center gap-8">
                <div className="lg:w-1/2 lg:text-right lg:pr-12">
                  <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-primary/20 hover:border-primary transition-all">
                    <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">
                      3. We Suggest Support
                    </h3>
                    <p className="text-gray-600 text-lg">
                      Money, mentorship, education, or tools — only what makes sense for you.
                    </p>
                  </div>
                </div>
                <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center flex-shrink-0 shadow-xl z-10">
                  <i className="fa-solid fa-lightbulb text-white text-2xl"></i>
                </div>
                <div className="lg:w-1/2"></div>
              </div>

              {/* Step 4 */}
              <div id="step-4" className="flex flex-col lg:flex-row-reverse items-center gap-8">
                <div className="lg:w-1/2 lg:text-left lg:pl-12">
                  <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-primary/20 hover:border-primary transition-all">
                    <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">
                      4. You Decide — Always
                    </h3>
                    <p className="text-gray-600 text-lg">
                      Nothing is forced. Everything is explained. You choose what's right for you.
                    </p>
                  </div>
                </div>
                <div className="w-20 h-20 bg-warm rounded-full flex items-center justify-center flex-shrink-0 shadow-xl z-10">
                  <i className="fa-solid fa-hand-pointer text-white text-2xl"></i>
                </div>
                <div className="lg:w-1/2"></div>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <div className="bg-primary/10 inline-block px-8 py-4 rounded-full">
              <p className="text-lg font-semibold text-primary">
                <i className="fa-solid fa-shield-heart mr-2"></i>
                Nothing is forced. Everything is explained.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Emotional Close Section */}
      <section id="emotional-close" className="py-20 px-6 bg-gradient-to-br from-primary to-secondary text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="mb-8">
            <i className="fa-solid fa-seedling text-7xl mb-6 inline-block"></i>
          </div>
          <h2 className="text-4xl lg:text-5xl font-display font-bold mb-6 leading-tight">
            You Build the Business.<br/>
            We Help It Grow.
          </h2>
          <p className="text-2xl mb-8 opacity-90">
            Quiver is not a lender. Not a boss. A growth partner.
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 mb-12 max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold mb-2">1000+</div>
                <p className="text-lg opacity-90">Businesses Growing</p>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">₹50Cr+</div>
                <p className="text-lg opacity-90">Support Provided</p>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">15+</div>
                <p className="text-lg opacity-90">States Covered</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={() => setShowPhoneInput(true)}
              className="bg-white hover:bg-gray-100 text-primary font-bold py-5 px-10 rounded-full text-xl transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105"
            >
              <i className="fa-solid fa-comments mr-2"></i>Continue in Your Language
            </button>
            <button
              onClick={handleVoiceStart}
              className="bg-warm hover:bg-earth text-white font-bold py-5 px-10 rounded-full text-xl transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105"
            >
              <i className="fa-solid fa-microphone mr-2"></i>Start with Voice
            </button>
          </div>

          <div className="mt-12 flex items-center justify-center space-x-8 text-sm opacity-90">
            <div className="flex items-center">
              <i className="fa-solid fa-lock mr-2"></i>
              <span>100% Safe</span>
            </div>
            <div className="flex items-center">
              <i className="fa-solid fa-language mr-2"></i>
              <span>Your Language</span>
            </div>
            <div className="flex items-center">
              <i className="fa-solid fa-heart mr-2"></i>
              <span>Made for You</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals Section */}
      <section id="trust-signals" className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-6">
              Trusted by Small Businesses Across India
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
            <div className="text-center">
              <i className="fa-solid fa-store text-5xl text-primary mb-2"></i>
              <p className="text-sm font-medium text-gray-700">Retail Shops</p>
            </div>
            <div className="text-center">
              <i className="fa-solid fa-utensils text-5xl text-primary mb-2"></i>
              <p className="text-sm font-medium text-gray-700">Restaurants</p>
            </div>
            <div className="text-center">
              <i className="fa-solid fa-truck text-5xl text-primary mb-2"></i>
              <p className="text-sm font-medium text-gray-700">Logistics</p>
            </div>
            <div className="text-center">
              <i className="fa-solid fa-scissors text-5xl text-primary mb-2"></i>
              <p className="text-sm font-medium text-gray-700">Services</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="bg-gray-900 text-gray-300 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
                  <i className="fa-solid fa-seedling text-white text-xl"></i>
                </div>
                <span className="text-2xl font-display font-bold text-white">Quiver</span>
              </div>
              <p className="text-sm">Your growth partner for building a better business.</p>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
              </ul>
            </div>

            {/* Language Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Language</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">हिंदी</a></li>
                <li><a href="#" className="hover:text-white transition-colors">English</a></li>
                <li><a href="#" className="hover:text-white transition-colors">தமிழ்</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 Quiver. Made with <i className="fa-solid fa-heart text-red-500"></i> for Indian Entrepreneurs.</p>
          </div>
        </div>
      </footer>

      {/* Quiver AI Voice Assistant - Available on landing page */}
      <QuiverAIAssistant />
    </div>
  );
};

// Also export as default for convenience
export default Landing;