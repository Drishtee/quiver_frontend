import { Button } from "../components/ui/button";
import { AIAssistant } from "../components/ai-assistant";
import { PlayCircle, Volume2, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="border-b border-border bg-white sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <h1 className="text-lg font-semibold text-foreground">Your Growth Pathway</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100">
              <span className="text-sm text-primary font-medium">{industryNames[industry]}</span>
            </div>
            <h2 className="text-2xl font-semibold text-foreground">
              Your Personalized Growth Pathway
            </h2>
            <p className="text-muted-foreground">
              Based on your industry, here's how Quiver will help you grow
            </p>
          </div>

          {/* Audio Player */}
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
            <div className="flex items-center gap-4">
              <button className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center hover:scale-105 transition-transform flex-shrink-0">
                <Volume2 className="w-6 h-6 text-white" />
              </button>
              <div className="flex-1">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-gradient-to-r from-blue-500 to-teal-500" />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-muted-foreground">0:45</span>
                  <span className="text-xs text-muted-foreground">2:15</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3 text-center">
              Listen to your AI-generated growth pathway explanation
            </p>
          </div>

          {/* Pathway Roadmap */}
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
            <h3 className="font-semibold text-foreground mb-6">Growth Roadmap</h3>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute top-6 left-6 right-6 h-0.5 bg-gradient-to-r from-blue-500 to-teal-500" />
              
              {/* Steps */}
              <div className="flex justify-between relative">
                {pathwaySteps.map((step, index) => (
                  <div key={index} className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-semibold z-10 border-4 border-white">
                      {index + 1}
                    </div>
                    <span className="text-xs text-center text-foreground font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Video CTA */}
          <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl border border-blue-100 p-6 text-center space-y-4">
            <p className="text-foreground">Want to see a detailed walkthrough?</p>
            <Button variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white">
              <PlayCircle className="w-4 h-4 mr-2" />
              Watch Short Video
            </Button>
          </div>

          <Button
            className="w-full h-12 bg-primary hover:bg-primary/90"
            onClick={onContinue}
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          {/* AI Assistant */}
          <AIAssistant 
            position="inline"
            message="Questions about your pathway? I'm here to explain each step!"
          />
        </div>
      </main>
    </div>
  );
}
