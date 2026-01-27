import { useState } from "react";
import { Button } from "../components/ui/button";
import { ProgressIndicator } from "../components/progress-indicator";
import { AIAssistant } from "../components/ai-assistant";
import { Upload, FileText, CheckCircle2, XCircle } from "lucide-react";

interface DocumentUploadProps {
  onContinue: () => void;
}

interface DocumentStatus {
  uploaded: boolean;
  fileName?: string;
}

export function DocumentUpload({ onContinue }: DocumentUploadProps) {
  const [documents, setDocuments] = useState<Record<string, DocumentStatus>>({
    pan: { uploaded: false },
    aadhaar: { uploaded: false },
    business: { uploaded: false }
  });

  const handleFileUpload = (docType: string) => {
    // Simulate file upload
    setDocuments({
      ...documents,
      [docType]: { uploaded: true, fileName: `${docType}_document.pdf` }
    });
  };

  const handleRemove = (docType: string) => {
    setDocuments({
      ...documents,
      [docType]: { uploaded: false }
    });
  };

  const documentTypes = [
    { id: "pan", name: "PAN Card", description: "For identity verification" },
    { id: "aadhaar", name: "Aadhaar Card", description: "For address proof" },
    { id: "business", name: "Business Proof", description: "Registration or license" }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="border-b border-border bg-white sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4">
          <h1 className="text-lg font-semibold text-foreground">Upload Documents</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Progress */}
          <ProgressIndicator current={5} total={6} />

          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">
              Upload Documents (Optional)
            </h2>
            <p className="text-muted-foreground">
              Upload your documents now or skip and add them later
            </p>
          </div>

          {/* Document Cards */}
          <div className="space-y-4">
            {documentTypes.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-border shadow-sm p-5"
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{doc.name}</h3>
                      <p className="text-sm text-muted-foreground">{doc.description}</p>
                    </div>
                    {documents[doc.id].uploaded ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0" />
                    )}
                  </div>

                  {documents[doc.id].uploaded ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-900">{documents[doc.id].fileName}</span>
                      </div>
                      <button
                        onClick={() => handleRemove(doc.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleFileUpload(doc.id)}
                      className="w-full h-12 border-2 border-dashed border-border rounded-lg flex items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload {doc.name}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Helper Text */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-sm text-foreground">
              <strong>Note:</strong> You can upload these documents later from your profile. They're helpful but not required to continue.
            </p>
          </div>

          <Button
            className="w-full h-12 bg-primary hover:bg-primary/90"
            onClick={onContinue}
          >
            Continue
          </Button>

          {/* AI Assistant */}
          <AIAssistant 
            position="inline"
            message="Questions about which documents to upload? I can help!"
          />
        </div>
      </main>
    </div>
  );
}
