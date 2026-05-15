import { useRef } from 'react';
import { ExternalLink, FileUp, Loader2, Trash2 } from 'lucide-react';

export default function EventPdfSection({ event, uploading, onUpload, onRemove }) {
  const inputRef = useRef(null);

  if (!event) return null;

  const openPicker = () => inputRef.current?.click();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      await onUpload(file);
    } catch (err) {
      window.alert(err.message ?? 'Não foi possível carregar o PDF.');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        onChange={handleFile}
      />

      {event.pdfUrl ? (
        <>
          <a
            href={event.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 max-w-full items-center gap-2 rounded-xl border border-amber-200/80 bg-white/80 px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-white"
          >
            <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
            <span className="truncate">{event.pdfFileName || 'PDF do evento'}</span>
          </a>
          <button
            type="button"
            onClick={openPicker}
            disabled={uploading}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-300 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-white disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <FileUp className="h-4 w-4" aria-hidden />
            )}
            Substituir
          </button>
          <button
            type="button"
            onClick={onRemove}
            disabled={uploading}
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-red-200/80 bg-white/80 px-3 py-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            aria-label="Remover PDF"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={openPicker}
          disabled={uploading}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-dashed border-amber-300/90 bg-white/60 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-amber-400 hover:bg-white disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <FileUp className="h-4 w-4" aria-hidden />
          )}
          Carregar PDF do evento
        </button>
      )}
    </div>
  );
}
