import { useRef, useState } from "react";
import api from "../api";
import { Button } from "@/components/ui/button";

const UploadBox = ({ onUploadSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

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
      className="game-panel flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--theme-button-secondary-border)] px-6 py-7 text-center transition hover:border-[var(--theme-button-secondary-border)]"
      aria-busy={loading}
    >
      {loading ? (
        <div className="space-y-2">
          <h3 className="text-sm font-medium theme-text">
            Processing your notes…
          </h3>
          <p className="text-xs theme-muted">
            This usually takes around 10 seconds. You can keep this tab open.
          </p>
          <div className="mt-3 inline-flex h-4 w-4 animate-spin rounded-full border-2 border-[var(--theme-input-border)] border-t-[var(--theme-accent-2)]" />
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-medium theme-text">
            Drop a PDF here or browse your files
          </p>
          <p className="text-xs theme-muted">
            We&apos;ll generate quiz questions directly from your notes.
          </p>
          <div className="mt-3 flex flex-col items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="pointer-events-auto"
              onClick={() => inputRef.current?.click()}
            >
              Browse
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              disabled={loading}
              className="hidden"
            />
            <p className="text-[11px] theme-subtle">Max 10MB • PDF only</p>
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
