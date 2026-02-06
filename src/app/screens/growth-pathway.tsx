import { PlayCircle, Volume2, ArrowRight } from "lucide-react";
import { IllustrationPlaceholder } from "../components/IllustrationPlaceholder";

interface GrowthPathwayProps {
  industry: string;
  onContinue: () => void;
}

export function GrowthPathway({ industry, onContinue }: GrowthPathwayProps) {
  const industryNames: Record<string, string> = {
    "food-processing": "Food Processing",
    "livestock": "Livestock",
    "textile": "Textile",
    "other": "Other"
  };

  const pathwaySteps = [
    "Assessment",
    "Planning",
    "Implementation",
    "Growth",
    "Scale"
  ];

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm py-3 px-5 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <img src="/quiver-logo.svg" alt="Quiver" className="w-8 h-8" />
          <h1 className="text-lg font-semibold text-gray-900">Your Growth Pathway</h1>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full border border-accent/20">
              <span className="text-sm text-accent font-medium">{industryNames[industry]}</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Your Personalized Growth Pathway
            </h2>
            <p className="text-gray-500">
              Based on your industry, here's how Quiver will help you grow
            </p>
          </div>

          {/* Audio Player */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-4">
              <button className="w-12 h-12 rounded-full bg-accent flex items-center justify-center hover:scale-105 transition-transform flex-shrink-0">
                <Volume2 className="w-6 h-6 text-white" />
              </button>
              <div className="flex-1">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-gradient-to-r from-primary to-accent" />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-gray-500">0:45</span>
                  <span className="text-xs text-gray-500">2:15</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-3 text-center">
              Listen to your AI-generated growth pathway explanation
            </p>
          </div>

          {/* Pathway Roadmap */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-6">Growth Roadmap</h3>

            {/* TODO: Replace with final illustration — see GRAPHIC_DESIGN_SPEC.md */}
            <IllustrationPlaceholder
              id="GFX-GROW-001"
              label="Growth roadmap step illustrations — Assessment, Planning, Implementation, Growth, Scale"
              height="80px"
            />

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute top-6 left-6 right-6 h-0.5 bg-gradient-to-r from-primary to-accent" />

              {/* Steps */}
              {/* TODO: Replace each step's numbered circle with custom illustrations — see GRAPHIC_DESIGN_SPEC.md
                   GFX-GROW-001A: Assessment step illustration
                   GFX-GROW-001B: Planning step illustration
                   GFX-GROW-001C: Implementation step illustration
                   GFX-GROW-001D: Growth step illustration
                   GFX-GROW-001E: Scale step illustration */}
              <div className="flex justify-between relative">
                {pathwaySteps.map((step, index) => (
                  <div key={index} className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white font-semibold z-10 border-4 border-white">
                      {index + 1}
                    </div>
                    <span className="text-xs text-center text-gray-900 font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Video CTA */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 text-center space-y-4">
            <p className="text-gray-900">Want to see a detailed walkthrough?</p>
            <button className="inline-flex items-center justify-center rounded-md border-2 border-accent text-accent hover:bg-accent hover:text-white px-4 py-2 text-sm font-medium transition-colors">
              <PlayCircle className="w-4 h-4 mr-2" />
              Watch Short Video
            </button>
          </div>

          <button
            className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-3 px-6 rounded-xl min-h-[48px] inline-flex items-center justify-center transition-colors"
            onClick={onContinue}
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </main>
    </div>
  );
}
