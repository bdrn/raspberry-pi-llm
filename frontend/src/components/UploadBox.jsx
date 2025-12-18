import { useState } from "react";
import api from "../api";
import { Button } from "@/components/ui/button";

const UploadBox = ({ onUploadSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/upload", formData);

      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }
    } catch (err) {
      console.error(err);
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
      e.target.value = null;
    }
  };

  return (
    <section
      className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/70 px-6 py-7 text-center transition hover:border-sky-400 hover:bg-slate-900"
      aria-busy={loading}
    >
      {loading ? (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-50">
            Processing your notes…
          </h3>
          <p className="text-xs text-slate-400">
            This usually takes around 10 seconds. You can keep this tab open.
          </p>
          <div className="mt-3 inline-flex h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-sky-400" />
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-50">
            Drop a PDF here or browse your files
          </p>
          <p className="text-xs text-slate-400">
            We&apos;ll generate quiz questions directly from your notes.
          </p>
          <div className="mt-3 flex flex-col items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="pointer-events-auto border-slate-600 bg-slate-900 text-slate-50 hover:bg-slate-800"
            >
              <label className="cursor-pointer">
                Browse…
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="hidden"
                />
              </label>
            </Button>
            <p className="text-[11px] text-slate-500">Max 10MB • PDF only</p>
          </div>
          {error && (
            <p className="pt-1 text-xs font-medium text-red-400">{error}</p>
          )}
        </div>
      )}
    </section>
  );
};

export default UploadBox;
