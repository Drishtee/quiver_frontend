import { MessageCircle } from "lucide-react";

interface AIAssistantProps {
  message?: string;
  position?: "fixed" | "inline";
}

export function AIAssistant({ message = "Ask me anything", position = "fixed" }: AIAssistantProps) {
  if (position === "fixed") {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3">
        {message && (
          <div className="bg-white rounded-xl shadow-lg px-4 py-3 max-w-[200px] border border-gray-200">
            <p className="text-sm text-gray-900">{message}</p>
          </div>
        )}
        <button className="w-14 h-14 rounded-full bg-accent shadow-lg flex items-center justify-center hover:scale-105 transition-transform">
          <MessageCircle className="w-6 h-6 text-white" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
      <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
        <MessageCircle className="w-5 h-5 text-white" />
      </div>
      <p className="text-sm text-gray-900">{message}</p>
    </div>
  );
}
