import { useState } from "react";
import { ProgressIndicator } from "../components/progress-indicator";
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
    <div className="min-h-screen bg-white pb-24 md:pb-20 mobile-full-screen">
      {/* Header - Mobile-first */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm py-3 px-5 sticky top-0 z-50">
        <div className="max-w-md mx-auto">
          <h1 className="text-base md:text-lg font-semibold text-gray-900">Upload Documents</h1>
        </div>
      </header>

      {/* Main Content - Mobile-first */}
      <main className="max-w-md mx-auto px-4 py-6 md:px-6 md:py-12">
        <div className="space-y-6 md:space-y-8">
          {/* Progress */}
          <ProgressIndicator current={5} total={6} />

          <div className="space-y-2 md:space-y-3">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
              Upload Documents (Optional)
            </h2>
            <p className="text-sm md:text-base text-gray-500">
              Upload your documents now or skip and add them later
            </p>
          </div>

          {/* Document Cards - Mobile-first with larger touch targets */}
          <div className="space-y-3 md:space-y-4">
            {documentTypes.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-sm p-4 md:p-5"
              >
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base">{doc.name}</h3>
                      <p className="text-xs md:text-sm text-gray-500">{doc.description}</p>
                    </div>
                    {documents[doc.id].uploaded ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0" />
                    )}
                  </div>

                  {documents[doc.id].uploaded ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-green-900 truncate">{documents[doc.id].fileName}</span>
                      </div>
                      <button
                        onClick={() => handleRemove(doc.id)}
                        className="text-xs text-red-600 hover:underline min-h-touch flex items-center px-2 flex-shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleFileUpload(doc.id)}
                      className="w-full min-h-[52px] md:h-12 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center gap-2 text-gray-500 hover:border-accent hover:text-accent active:bg-accent/5 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      <span className="text-sm md:text-base">Upload {doc.name}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Helper Text */}
          <div className="bg-gray-50 rounded-lg md:rounded-xl p-3 md:p-4 border border-gray-200">
            <p className="text-xs md:text-sm text-gray-900">
              <strong>Note:</strong> You can upload these documents later from your profile. They're helpful but not required to continue.
            </p>
          </div>

          {/* Continue Button - Sticky on mobile */}
          <div className="sticky bottom-0 -mx-4 md:mx-0 px-4 py-4 md:p-0 bg-white md:bg-transparent border-t md:border-0 border-gray-200">
            <button
              className="w-full min-h-[52px] md:h-12 bg-accent hover:bg-accent/90 active:bg-accent/80 text-white font-bold rounded-xl"
              onClick={onContinue}
            >
              Continue
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
