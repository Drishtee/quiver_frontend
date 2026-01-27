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
          <div className="bg-white rounded-xl shadow-lg px-4 py-3 max-w-[200px] border border-border">
            <p className="text-sm text-foreground">{message}</p>
          </div>
        )}
        <button className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 shadow-lg flex items-center justify-center hover:scale-105 transition-transform">
          <MessageCircle className="w-6 h-6 text-white" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center flex-shrink-0">
        <MessageCircle className="w-5 h-5 text-white" />
      </div>
      <p className="text-sm text-foreground">{message}</p>
    </div>
  );
}
