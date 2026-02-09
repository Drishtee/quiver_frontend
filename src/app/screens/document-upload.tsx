import { useState, useRef, useEffect } from "react";
import { Upload, Camera, FileText, CheckCircle2, X, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { uploadDocument, listDocuments, deleteDocument } from "../../services/api";
import type { DocumentItem } from "../../services/api";

interface DocumentUploadProps {
  onContinue: () => void;
  onBack?: () => void;
  sessionId: string;
}

type UploadState = "idle" | "uploading" | "success" | "error";

interface DocCardState {
  uploadState: UploadState;
  file?: File;
  previewUrl?: string;
  uploadedDoc?: DocumentItem;
  error?: string;
}

const DOCUMENT_TYPES = [
  {
    id: "aadhaar",
    name: "Aadhaar Card",
    nameHi: "आधार कार्ड",
    description: "Government-issued identity card",
    descHi: "सरकारी पहचान पत्र",
  },
  {
    id: "udyam",
    name: "Udyam Certificate",
    nameHi: "उद्यम प्रमाणपत्र",
    description: "MSME registration certificate",
    descHi: "MSME पंजीकरण प्रमाणपत्र",
  },
  {
    id: "cibil",
    name: "CIBIL Report",
    nameHi: "CIBIL रिपोर्ट",
    description: "Credit score report",
    descHi: "क्रेडिट स्कोर रिपोर्ट",
  },
];

export function DocumentUpload({ onContinue, onBack, sessionId }: DocumentUploadProps) {
  const [docs, setDocs] = useState<Record<string, DocCardState>>({
    aadhaar: { uploadState: "idle" },
    udyam: { uploadState: "idle" },
    cibil: { uploadState: "idle" },
  });

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const cameraInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Load existing documents on mount
  useEffect(() => {
    if (!sessionId) return;
    listDocuments(sessionId)
      .then((res) => {
        const newDocs: Record<string, DocCardState> = {
          aadhaar: { uploadState: "idle" },
          udyam: { uploadState: "idle" },
          cibil: { uploadState: "idle" },
        };
        for (const doc of res.documents) {
          if (newDocs[doc.document_type]) {
            newDocs[doc.document_type] = {
              uploadState: "success",
              uploadedDoc: doc,
            };
          }
        }
        setDocs(newDocs);
      })
      .catch(() => {
        // silently fail — user can still upload fresh
      });
  }, [sessionId]);

  const handleFileSelect = async (docType: string, file: File) => {
    // Generate preview for images
    let previewUrl: string | undefined;
    if (file.type.startsWith("image/")) {
      previewUrl = URL.createObjectURL(file);
    }

    setDocs((prev) => ({
      ...prev,
      [docType]: { uploadState: "uploading", file, previewUrl },
    }));

    try {
      const result = await uploadDocument(sessionId, docType, file);
      setDocs((prev) => ({
        ...prev,
        [docType]: {
          uploadState: "success",
          file,
          previewUrl,
          uploadedDoc: {
            id: result.document_id,
            document_type: result.document_type,
            document_url: result.document_url,
            original_filename: result.original_filename,
            file_size_bytes: file.size,
            content_type: file.type,
            created_at: new Date().toISOString(),
          },
        },
      }));
    } catch (err) {
      setDocs((prev) => ({
        ...prev,
        [docType]: {
          uploadState: "error",
          file,
          previewUrl,
          error: err instanceof Error ? err.message : "Upload failed",
        },
      }));
    }
  };

  const handleRemove = async (docType: string) => {
    const docState = docs[docType];
    if (docState.uploadedDoc) {
      try {
        await deleteDocument(docState.uploadedDoc.id);
      } catch {
        // still remove from UI
      }
    }
    // Revoke object URL if any
    if (docState.previewUrl) {
      URL.revokeObjectURL(docState.previewUrl);
    }
    setDocs((prev) => ({
      ...prev,
      [docType]: { uploadState: "idle" },
    }));
  };

  const handleInputChange = (docType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(docType, file);
    }
    // Reset input value so re-selecting the same file works
    e.target.value = "";
  };

  const uploadedCount = Object.values(docs).filter((d) => d.uploadState === "success").length;

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-20 mobile-full-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm py-3 px-5 sticky top-0 z-50">
        <div className="max-w-md mx-auto flex items-center">
          {onBack && (
            <button onClick={onBack} className="mr-2 p-1 -ml-1 rounded-lg hover:bg-gray-100 active:bg-gray-200">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
          )}
          <img src="/logo.jpg" alt="Quiver" className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-cover mr-2 md:mr-3" />
          <span className="text-base md:text-xl font-display font-bold text-primary">Quiver</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6 md:px-6 md:py-12">
        <div className="space-y-6 md:space-y-8">
          <div className="space-y-2 md:space-y-3">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
              Upload Documents <span className="text-gray-400 text-base font-normal">(Optional)</span>
            </h2>
            <p className="text-sm text-gray-600">दस्तावेज़ अपलोड करें</p>
            <p className="text-sm md:text-base text-gray-500">
              Upload your documents now or skip and add them later
            </p>
          </div>

          {/* Document Cards */}
          <div className="space-y-3 md:space-y-4">
            {DOCUMENT_TYPES.map((doc) => {
              const state = docs[doc.id];

              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-sm p-4 md:p-5"
                >
                  <div className="space-y-3 md:space-y-4">
                    {/* Header row */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm md:text-base">{doc.name}</h3>
                        <p className="text-xs text-gray-600">{doc.nameHi}</p>
                        <p className="text-xs md:text-sm text-gray-500">{doc.description}</p>
                      </div>
                      {state.uploadState === "success" ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                      ) : state.uploadState === "uploading" ? (
                        <Loader2 className="w-6 h-6 text-primary animate-spin flex-shrink-0" />
                      ) : state.uploadState === "error" ? (
                        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0" />
                      )}
                    </div>

                    {/* Upload state area */}
                    {state.uploadState === "success" && state.uploadedDoc && (
                      <div className="space-y-2">
                        {/* Image preview */}
                        {state.previewUrl && (
                          <div className="rounded-lg overflow-hidden border border-green-100">
                            <img
                              src={state.previewUrl}
                              alt={doc.name}
                              className="w-full h-32 object-cover"
                            />
                          </div>
                        )}
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="text-sm text-green-900 truncate">
                              {state.uploadedDoc.original_filename}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemove(doc.id)}
                            className="text-xs text-red-600 hover:underline min-h-touch flex items-center gap-1 px-2 flex-shrink-0"
                          >
                            <X className="w-3 h-3" />
                            Remove
                          </button>
                        </div>
                      </div>
                    )}

                    {state.uploadState === "uploading" && (
                      <div className="flex items-center justify-center p-4 bg-primary/5 rounded-lg border border-primary/10">
                        <Loader2 className="w-5 h-5 text-primary animate-spin mr-2" />
                        <span className="text-sm text-primary">Uploading...</span>
                      </div>
                    )}

                    {state.uploadState === "error" && (
                      <div className="space-y-2">
                        <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                          <p className="text-sm text-red-700">{state.error || "Upload failed"}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (state.file) handleFileSelect(doc.id, state.file);
                            }}
                            className="flex-1 min-h-[44px] border border-red-200 rounded-lg flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 text-sm"
                          >
                            Retry
                          </button>
                          <button
                            onClick={() =>
                              setDocs((prev) => ({
                                ...prev,
                                [doc.id]: { uploadState: "idle" },
                              }))
                            }
                            className="flex-1 min-h-[44px] border border-gray-200 rounded-lg flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-50 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {state.uploadState === "idle" && (
                      <div className="flex gap-2">
                        {/* Hidden file inputs */}
                        <input
                          ref={(el) => { fileInputRefs.current[doc.id] = el; }}
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => handleInputChange(doc.id, e)}
                          className="hidden"
                        />
                        <input
                          ref={(el) => { cameraInputRefs.current[doc.id] = el; }}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={(e) => handleInputChange(doc.id, e)}
                          className="hidden"
                        />

                        <button
                          onClick={() => fileInputRefs.current[doc.id]?.click()}
                          className="flex-1 min-h-[48px] border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center gap-2 text-gray-500 hover:border-accent hover:text-accent active:bg-accent/5 transition-colors"
                        >
                          <Upload className="w-4 h-4" />
                          <span className="text-sm">Choose File</span>
                        </button>
                        <button
                          onClick={() => cameraInputRefs.current[doc.id]?.click()}
                          className="min-h-[48px] px-4 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center gap-2 text-gray-500 hover:border-primary hover:text-primary active:bg-primary/5 transition-colors"
                        >
                          <Camera className="w-4 h-4" />
                          <span className="text-sm">Photo</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Helper Text */}
          <div className="bg-gray-50 rounded-lg md:rounded-xl p-3 md:p-4 border border-gray-200">
            <p className="text-xs md:text-sm text-gray-900">
              <strong>Note:</strong> You can upload these documents later from your profile. They're helpful but not required to continue.
            </p>
            <p className="text-xs text-gray-600 mt-1">
              <strong>नोट:</strong> ये दस्तावेज़ आवश्यक नहीं हैं। आप इन्हें बाद में भी अपलोड कर सकते हैं।
            </p>
          </div>

          {/* Continue Button */}
          <div className="sticky bottom-0 -mx-4 md:mx-0 px-4 py-4 md:p-0 bg-white md:bg-transparent border-t md:border-0 border-gray-200">
            <button
              className="w-full min-h-[52px] md:h-12 bg-accent hover:bg-accent/90 active:bg-accent/80 text-white font-bold rounded-xl"
              onClick={onContinue}
            >
              {uploadedCount > 0 ? "Done" : "Back to Dashboard"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
