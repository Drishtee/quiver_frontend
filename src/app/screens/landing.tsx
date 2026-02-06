import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './landing.css';
import { LanguageSelector } from '../components/language-selector';
import { Checkbox } from '../components/ui/checkbox';
import { QuiverAIAssistant } from '../components/voice/QuiverAIAssistant';
import { useOpenAIVoice } from '../../contexts/OpenAIVoiceContext';
import {
  Mic,
  Store,
  ShieldCheck,
  Handshake,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';


/* YouTube Shorts — vertical (9:16) format */
const SOCIAL_PROOF_VIDEOS = [
  { id: 'VCrDDy1rAOw' },
  { id: 'Md0q1DH7TUY' },
  { id: 'xDhmsscKp7g' },
  { id: '82N1MrU_HhI' },
  { id: 'Op5vVXW_diY' },
  { id: 'DCWw4kHdZ5E' },
];

interface LandingProps {
  onGetStarted: (phoneNumber: string) => void;
  onLogin: () => void;
  onSignup?: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onGetStarted, onLogin, onSignup }) => {
  const { t } = useTranslation();
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const voice = useOpenAIVoice();

  // Use dedicated signup page if available, otherwise fall back to inline form
  const handleSignupClick = () => {
    if (onSignup) {
      onSignup();
    } else {
      setShowPhoneInput(true);
      heroRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  /* Video carousel state */
  const videoScrollRef = useRef<HTMLDivElement>(null);
  const [activeVideoIdx, setActiveVideoIdx] = useState(0);
  const [playingVideos, setPlayingVideos] = useState<Set<string>>(new Set());

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.trim()) {
      onGetStarted(phoneNumber);
    }
  };

  const handleVoiceStart = () => {
    voice.activate();
    voice.connect();
  };

  useEffect(() => {
    if (showPhoneInput && heroRef.current) {
      heroRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [showPhoneInput]);

  /* Track active video for scroll dots */
  useEffect(() => {
    const el = videoScrollRef.current;
    if (!el) return;

    const onScroll = () => {
      const firstChild = el.firstElementChild as HTMLElement | null;
      if (!firstChild) return;
      const cardWidth = firstChild.offsetWidth + 16;
      const idx = Math.round(el.scrollLeft / cardWidth);
      setActiveVideoIdx(Math.min(idx, SOCIAL_PROOF_VIDEOS.length - 1));
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const handlePlayVideo = (id: string) => {
    setPlayingVideos(prev => new Set(prev).add(id));
  };

  /* Reusable phone form renderer (not a component — avoids remounting) */
  const renderPhoneForm = (idPrefix: string) => (
    <form onSubmit={handlePhoneSubmit} className="space-y-3">
      <h3 className="text-lg font-bold text-gray-900">
        {t('landing.avatar.enterPhone')}
      </h3>
      <div className="flex items-center gap-2">
        <span className="text-gray-700 font-medium">+91</span>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="9876543210"
          className="flex-1 px-4 py-3 border-2 border-primary/30 rounded-lg focus:border-primary focus:outline-none text-lg bg-white"
          maxLength={10}
          pattern="[0-9]{10}"
          required
        />
      </div>
      <div className="flex items-start gap-3 text-left bg-gray-50 p-3 rounded-lg">
        <Checkbox
          id={`${idPrefix}-consent`}
          checked={consentGiven}
          onCheckedChange={(checked) => setConsentGiven(checked === true)}
          className="mt-1"
        />
        <label
          htmlFor={`${idPrefix}-consent`}
          className="text-sm text-gray-700 cursor-pointer leading-relaxed"
        >
          {t('landing.avatar.consent')}
        </label>
      </div>
      <button
        type="submit"
        disabled={!consentGiven || phoneNumber.length !== 10}
        className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
      >
        {t('landing.avatar.continue')}
      </button>
      <button
        type="button"
        onClick={() => { setShowPhoneInput(false); setConsentGiven(false); }}
        className="w-full text-gray-500 font-medium text-sm"
      >
        {t('landing.avatar.cancel')}
      </button>
    </form>
  );

  return (
    <div className="bg-white font-sans min-h-screen">

      {/* ======================== NAVIGATION ======================== */}
      <nav
        id="header"
        className="bg-white/80 backdrop-blur-sm shadow-sm py-3 px-5 flex justify-between items-center sticky top-0 z-50"
      >
        <div className="flex items-center">
          <img src="/logo.jpg" alt="Quiver" className="w-8 h-8 object-contain mr-2" />
          <span className="text-xl font-display font-bold text-primary">Quiver</span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelector variant="compact" />
          <button
            onClick={onLogin}
            className="text-primary font-medium text-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            {t('landing.nav.login')}
          </button>
          {/* Desktop-only nav CTA */}
          <button
            onClick={handleSignupClick}
            className="hidden lg:flex bg-accent text-white font-bold py-2 px-4 rounded-lg text-sm items-center"
          >
            {t('landing.nav.startGrowing')}
          </button>
        </div>
      </nav>

      {/* ======================== HERO SECTION ======================== */}
      <section
        id="hero-section"
        ref={heroRef}
        className="relative overflow-hidden"
      >
        {/* Mobile background — portrait, light top built into image */}
        <div
          className="absolute inset-0 bg-cover bg-top bg-no-repeat lg:hidden"
          style={{ backgroundImage: "url('/hero-bg.png')" }}
        />
        {/* Desktop background — landscape */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden lg:block"
          style={{ backgroundImage: "url('/herodesktop.png')" }}
        />
        {/* Desktop: soft wash so dark text reads */}
        <div className="absolute inset-0 hidden lg:block bg-gradient-to-b from-white/80 via-white/40 to-transparent" />

        {/* Full-height flex container */}
        <div className="relative min-h-[85vh] lg:min-h-[80vh] flex flex-col px-5 lg:px-8 max-w-5xl mx-auto">

          {/* Top zone: headline + subtitle */}
          <div className="pt-10 lg:pt-16 text-left lg:text-center">
            <h1 className="text-[2.15rem] lg:text-[2.6rem] xl:text-5xl font-display font-extrabold text-gray-950 leading-[1.15] tracking-tight">
              {t('landing.hero.title')}
              <br />
              <span className="text-primary">{t('landing.hero.titleHighlight')}</span>
            </h1>
            <p className="mt-3 lg:mt-4 text-sm lg:text-base text-gray-600 leading-relaxed max-w-[310px] lg:max-w-lg lg:mx-auto">
              {t('landing.hero.subtitle')}
            </p>
          </div>

          {/* Middle zone: QUIVER artwork shows through */}
          <div className="flex-1" />

          {/* Bottom zone: CTA buttons */}
          <div className="pb-24 lg:pb-14">
            {showPhoneInput ? (
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-xl border border-gray-100 max-w-sm lg:mx-auto">
                {renderPhoneForm('hero')}
              </div>
            ) : (
              <div className="flex items-center gap-3 lg:justify-center">
                <button
                  onClick={handleVoiceStart}
                  className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white font-bold py-3 px-5 lg:py-3.5 lg:px-7 rounded-xl shadow-md active:scale-[0.98] transition-all min-h-[48px] text-sm lg:text-base"
                >
                  <Mic className="w-4 h-4 lg:w-5 lg:h-5" />
                  {t('landing.avatar.title')}
                </button>
                <button
                  onClick={handleSignupClick}
                  className="inline-flex items-center justify-center gap-2 bg-white/90 backdrop-blur-sm text-gray-800 font-bold py-3 px-5 lg:py-3.5 lg:px-7 rounded-xl border-2 border-accent/30 shadow-sm hover:border-accent hover:text-accent active:scale-[0.98] transition-all min-h-[48px] text-sm lg:text-base"
                >
                  {t('landing.nav.startGrowing')}
                </button>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ======================== STATS / RESULTS ======================== */}
      <section id="stats-results" className="px-5 py-8 bg-gradient-to-br from-primary to-secondary text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-lg lg:text-2xl font-display font-bold mb-1">
            {t('landing.stats.heading')}
          </h2>
          <p className="text-xs lg:text-sm opacity-80 mb-5">{t('landing.stats.subtitle')}</p>

          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
            <div>
              <div className="text-xl lg:text-2xl font-bold">1000+</div>
              <p className="text-xs opacity-80">{t('landing.stats.businesses')}</p>
            </div>
            <div>
              <div className="text-xl lg:text-2xl font-bold">₹50Cr+</div>
              <p className="text-xs opacity-80">{t('landing.stats.support')}</p>
            </div>
            <div>
              <div className="text-xl lg:text-2xl font-bold">15+</div>
              <p className="text-xs opacity-80">{t('landing.stats.states')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================== SOCIAL PROOF VIDEOS ======================== */}
      <section id="social-proof" className="py-8 lg:py-10 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="px-5 mb-5">
            <h2 className="text-lg lg:text-2xl font-display font-bold text-gray-900 mb-1 text-center">
              {t('landing.socialProof.title')}
            </h2>
            <p className="text-sm text-gray-600 text-center">
              {t('landing.socialProof.subtitle')}
            </p>
          </div>

          {/* Horizontal scroll carousel */}
          <div
            ref={videoScrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 px-5"
          >
            {SOCIAL_PROOF_VIDEOS.map((video) => (
              <div key={video.id} className="snap-center flex-shrink-0 w-[68vw] lg:w-[30%]">
                <div className="aspect-[9/16] rounded-2xl overflow-hidden bg-gray-900 shadow-lg relative">
                  {playingVideos.has(video.id) ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                      title="Success Story"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  ) : (
                    <button
                      onClick={() => handlePlayVideo(video.id)}
                      className="w-full h-full relative group"
                      aria-label="Play video"
                    >
                      <img
                        src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 group-active:bg-black/40 transition-colors flex items-center justify-center">
                        <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg play-btn-pulse">
                          <svg className="w-6 h-6 text-accent ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Scroll indicator dots */}
          <div className="flex justify-center gap-1.5 mt-3 lg:hidden">
            {SOCIAL_PROOF_VIDEOS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeVideoIdx ? 'w-6 bg-accent' : 'w-1.5 bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Social proof CTA */}
          <div className="text-center mt-5 px-5">
            <button
              onClick={handleSignupClick}
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white font-bold py-3 px-6 rounded-xl shadow-sm active:scale-[0.98] transition-all text-sm min-h-[48px]"
            >
              {t('landing.socialProof.cta')}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ======================== EQUITY EXPLAINED ======================== */}
      <section id="equity-section" className="px-5 py-8 lg:py-10 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <span className="inline-block bg-accent/10 text-accent font-semibold text-xs px-3 py-1 rounded-full mb-2">
              {t('landing.equity.badge')}
            </span>
            <h2 className="text-lg lg:text-2xl font-display font-bold text-gray-900 mb-1">
              {t('landing.equity.title')}
            </h2>
            <p className="text-sm text-gray-600">{t('landing.equity.subtitle')}</p>
          </div>

          {/* Circular visualization — Before / After */}
          <div className="grid grid-cols-2 gap-4 lg:gap-8 mb-6 max-w-2xl mx-auto">
            {/* Before Quiver */}
            <div className="flex flex-col items-center">
              <p className="text-xs font-bold text-gray-900 mb-3 h-8 flex items-end text-center">{t('landing.equity.before.title')}</p>
              <div className="w-28 h-28 lg:w-44 lg:h-44 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                <div className="text-center text-white">
                  <Store className="w-5 h-5 lg:w-8 lg:h-8 mx-auto mb-1 opacity-80" />
                  <div className="text-xl lg:text-3xl font-bold">{t('landing.equity.before.percent')}</div>
                  <div className="text-[10px] lg:text-xs opacity-80">{t('landing.equity.before.ownership')}</div>
                </div>
              </div>
              <p className="text-xs text-gray-500 font-medium mt-3 text-center">{t('landing.equity.before.limited')}</p>
            </div>

            {/* With Quiver */}
            <div className="flex flex-col items-center">
              <p className="text-xs font-bold text-gray-900 mb-3 h-8 flex items-end text-center">{t('landing.equity.after.title')}</p>
              <div className="w-28 h-28 lg:w-44 lg:h-44 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg relative">
                <div className="text-center text-white">
                  <Store className="w-5 h-5 lg:w-8 lg:h-8 mx-auto mb-1 opacity-80" />
                  <div className="text-xl lg:text-3xl font-bold">{t('landing.equity.after.percent')}</div>
                  <div className="text-[10px] lg:text-xs opacity-80">{t('landing.equity.after.youOwn')}</div>
                </div>
                {/* Quiver's share — badge at bottom-right */}
                <div className="absolute -bottom-2 -right-2 lg:-bottom-2 lg:-right-3 w-14 h-14 lg:w-[4.5rem] lg:h-[4.5rem] rounded-full bg-accent flex items-center justify-center shadow-lg border-[3px] border-white">
                  <div className="text-center text-white leading-none">
                    <div className="text-xs lg:text-sm font-extrabold">{t('landing.equity.after.quiverPercent')}</div>
                    <div className="text-[9px] lg:text-[11px] font-semibold opacity-90">Quiver</div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-accent font-medium mt-5 text-center">{t('landing.equity.after.description')}</p>
            </div>
          </div>

          {/* Partnership benefits */}
          <div className="text-center mb-3">
            <h3 className="text-base font-bold text-gray-900">{t('landing.equity.benefits.title')}</h3>
            <p className="text-xs text-gray-500">{t('landing.equity.benefits.subtitle')}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 max-w-2xl mx-auto">
            <div className="flex flex-col items-center bg-white border border-gray-200 rounded-xl p-3 lg:p-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-accent to-emerald-600 flex items-center justify-center mb-2 shadow-sm">
                <ShieldCheck className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 text-xs lg:text-sm mb-0.5 text-center">{t('landing.equity.benefits.stayOwner.title')}</h4>
              <p className="text-xs text-gray-600 text-center">{t('landing.equity..stayOwner.description')}</p>
            </div>
            <div className="flex flex-col items-center bg-white border border-gray-200 rounded-xl p-3 lg:p-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-accent to-emerald-600 flex items-center justify-center mb-2 shadow-sm">
                <Handshake className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 text-xs lg:text-sm mb-0.5 text-center">{t('landing.equity.benefits.supportGrowth.title')}</h4>
              <p className="text-xs text-gray-600 text-center">{t('landing.equity.benefits.supportGrowth.description')}</p>
            </div>
            <div className="flex flex-col items-center bg-white border border-gray-200 rounded-xl p-3 lg:p-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-accent to-emerald-600 flex items-center justify-center mb-2 shadow-sm">
                <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 text-xs lg:text-sm mb-0.5 text-center">{t('landing.equity.benefits.earnTogether.title')}</h4>
              <p className="text-xs text-gray-600 text-center">{t('landing.equity.benefits.earnTogether.description')}</p>
            </div>
          </div>

        </div>
      </section>

      {/* ======================== HOW IT WORKS — 4 steps ======================== */}
      <section id="how-it-works" className="px-5 py-8 lg:py-10 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-lg lg:text-2xl font-display font-bold text-gray-900 mb-1 text-center">
            {t('landing.howItWorks.title')}
          </h2>
          <p className="text-sm text-gray-600 mb-6 text-center">
            {t('landing.howItWorks.subtitle')}
          </p>

          {/* Journey path — vertical on mobile, horizontal on desktop */}

          {/* ── Desktop: horizontal journey ── */}
          <div className="hidden lg:flex items-start justify-center max-w-4xl mx-auto">
            {(['step1', 'step2', 'step3', 'step4'] as const).map((key, i) => (
              <div key={key} className="flex items-start">
                {/* Step card */}
                <div className="flex flex-col items-center text-center w-[200px]">
                  <img
                    src={`/GFX-LAND-001${String.fromCharCode(65+i)}.png`}
                    alt={t(`landing.howItWorks.${key}.title`)}
                    className="w-[150px] h-[150px] rounded-full object-cover"
                  />
                  <h3 className="font-bold text-gray-900 text-sm mt-3">
                    {t(`landing.howItWorks.${key}.title`)}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {t(`landing.howItWorks.${key}.description`)}
                  </p>
                </div>
                {/* Arrow between steps */}
                {i < 3 && (
                  <div className="flex items-center pt-[65px] px-1">
                    <svg width="36" height="20" viewBox="0 0 36 20" fill="none" className="text-accent/50">
                      <path d="M0 10h28m0 0l-7-7m7 7l-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── Mobile: full-width vertical journey ── */}
          <div className="lg:hidden space-y-0">
            {(['step1', 'step2', 'step3', 'step4'] as const).map((key, i) => (
              <div key={key}>
                {/* Step card — illustration hero, text below */}
                <div className="p-5 text-center">
                  <img
                    src={`/GFX-LAND-001${String.fromCharCode(65+i)}.png`}
                    alt={t(`landing.howItWorks.${key}.title`)}
                    className="w-[140px] h-[140px] rounded-full object-cover mx-auto"
                  />
                  <h3 className="font-bold text-gray-900 text-base mt-3">
                    {t(`landing.howItWorks.${key}.title`)}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed max-w-[280px] mx-auto">
                    {t(`landing.howItWorks.${key}.description`)}
                  </p>
                </div>

                {/* Bold downward arrow connector */}
                {i < 3 && (
                  <div className="flex flex-col items-center py-2">
                    <div className="w-0.5 h-4 bg-accent/30" />
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 3v12m0 0l-5-5m5 5l5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent" />
                      </svg>
                    </div>
                    <div className="w-0.5 h-4 bg-accent/30" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-500 mt-5 italic">
            {t('landing.howItWorks.bottomNote')}
          </p>

          {/* How it works CTA */}
          <div className="text-center mt-5">
            <button
              onClick={handleSignupClick}
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white font-bold py-3 px-6 rounded-xl shadow-sm active:scale-[0.98] transition-all text-sm min-h-[48px]"
            >
              {t('landing.howItWorks.cta')}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ======================== WHAT QUIVER DOES ======================== */}
      <section id="what-quiver-does" className="px-5 py-8 lg:py-10 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-lg lg:text-2xl font-display font-bold text-gray-900 mb-1 text-center">
            {t('landing.whatQuiverDoes.title')}
          </h2>
          <p className="text-sm text-gray-600 mb-5 text-center max-w-lg mx-auto">
            {t('landing.whatQuiverDoes.subtitle')}
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {[
              { key: 'funding', gfx: 'GFX-LAND-002A' },
              { key: 'mentorship', gfx: 'GFX-LAND-002B' },
              { key: 'education', gfx: 'GFX-LAND-002C' },
              { key: 'tools', gfx: 'GFX-LAND-002D' },
            ].map(({ key, gfx }) => (
              <button
                key={key}
                onClick={handleSignupClick}
                className="bg-white p-4 lg:p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center hover:border-accent/40 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer"
              >
                <img
                  src={`/${gfx}.png`}
                  alt={t(`landing.whatQuiverDoes.${key}.title`)}
                  className="w-14 h-14 lg:w-16 lg:h-16 rounded-lg object-contain mb-2"
                />
                <h3 className="text-sm lg:text-base font-bold text-gray-900 mb-1">
                  {t(`landing.whatQuiverDoes.${key}.title`)}
                </h3>
                <p className="text-xs lg:text-sm text-gray-600 leading-snug">
                  {t(`landing.whatQuiverDoes.${key}.description`)}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ======================== CTA — bottom ======================== */}
      <section id="bottom-cta" className="px-5 py-10 lg:py-14 bg-gradient-to-br from-primary to-secondary text-white">
        <div className="max-w-xl lg:max-w-2xl mx-auto text-center">
          <h2 className="text-xl lg:text-3xl font-display font-extrabold mb-2 leading-tight">
            {t('landing.cta.title')}<br />
            <span className="text-accent">{t('landing.cta.titleLine2')}</span>
          </h2>
          <p className="text-sm lg:text-base text-white/70 mb-6">
            {t('landing.cta.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-sm sm:max-w-md mx-auto mb-5">
            <button
              onClick={handleSignupClick}
              className="flex-1 bg-accent hover:bg-accent/90 text-white font-bold py-3.5 px-6 rounded-xl min-h-[48px] shadow-lg active:scale-[0.98] transition-all text-sm lg:text-base"
            >
              {t('landing.nav.startGrowing')}
            </button>
            <button
              onClick={handleVoiceStart}
              className="flex-1 bg-white/15 text-white font-bold py-3.5 px-6 rounded-xl min-h-[48px] border border-white/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:bg-white/20 text-sm lg:text-base"
            >
              <Mic className="w-4 h-4 lg:w-5 lg:h-5" />
              <span>{t('landing.cta.startVoice')}</span>
            </button>
          </div>

          <div className="flex justify-center gap-4 text-xs text-white/50">
            <span>{t('landing.cta.features.safe')}</span>
            <span className="text-white/20">|</span>
            <span>{t('landing.cta.features.yourLanguage')}</span>
            <span className="text-white/20">|</span>
            <span>{t('landing.cta.features.madeForYou')}</span>
          </div>
        </div>
      </section>

      {/* ======================== FOOTER — mobile: minimal ======================== */}
      <footer className="lg:hidden px-5 py-6 bg-gray-900 text-gray-400 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-3">
          <img src="/logo.jpg" alt="Quiver" className="w-6 h-6 object-contain bg-white rounded p-0.5" />
          <span className="font-display font-bold text-white">Quiver</span>
        </div>
        <p className="mb-3 text-xs">{t('landing.footer.tagline')}</p>
        <div className="flex flex-wrap justify-center gap-2 text-[10px] text-gray-500 mb-3">
          <span>{t('landing.trust.retail')}</span>
          <span className="text-gray-700">·</span>
          <span>{t('landing.trust.restaurants')}</span>
          <span className="text-gray-700">·</span>
          <span>{t('landing.trust.logistics')}</span>
          <span className="text-gray-700">·</span>
          <span>{t('landing.trust.services')}</span>
        </div>
        <p className="text-xs">&copy; 2025 Quiver. {t('landing.footer.copyright')}</p>
      </footer>

      {/* ======================== FOOTER — desktop: full ======================== */}
      <footer className="hidden lg:block px-5 py-10 bg-gray-900 text-gray-400">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src="/logo.jpg" alt="Quiver" className="w-8 h-8 object-contain bg-white rounded p-0.5" />
                <span className="font-display font-bold text-white text-lg">Quiver</span>
              </div>
              <p className="text-sm">{t('landing.footer.tagline')}</p>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-3">{t('landing.footer.company')}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#hero-section" className="hover:text-white transition-colors">{t('landing.footer.aboutUs')}</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">{t('landing.footer.howItWorks')}</a></li>
                <li><a href="#social-proof" className="hover:text-white transition-colors">{t('landing.footer.successStories')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-3">{t('landing.footer.support')}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">{t('landing.footer.helpCenter')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('landing.footer.contactUs')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('landing.footer.faqs')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-3">{t('landing.footer.language')}</h4>
              <LanguageSelector variant="compact" />
            </div>
          </div>
          <div className="border-t border-gray-800 pt-4 text-center text-sm">
            <p>&copy; 2025 Quiver. {t('landing.footer.copyright')}</p>
          </div>
        </div>
      </footer>

      {/* Quiver AI Voice Assistant */}
      <QuiverAIAssistant />
    </div>
  );
};

export default Landing;
