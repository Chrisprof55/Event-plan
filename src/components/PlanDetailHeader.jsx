import { ArrowLeft, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import EventPdfSection from './EventPdfSection';

export default function PlanDetailHeader({
  onBack,
  titleBlock,
  grandTotalLabel,
  onAddItem,
  onEdit,
  onDelete,
  addDisabled,
  editDisabled,
  deleteDisabled,
  deleting,
  addLabel = 'Adicionar item',
  showPdf,
  event,
  pdfUploading,
  onPdfUpload,
  onPdfRemove,
  extra,
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-amber-200/80 bg-post-it/95 shadow-sm backdrop-blur-md supports-[padding:max(0px)]:pt-[max(0px,env(safe-area-inset-top))]">
      <div className="mx-auto w-full max-w-3xl space-y-3 px-5 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={onBack}
            className="touch-target mt-0.5 flex shrink-0 items-center gap-2 rounded-xl bg-white/80 px-4 py-3 text-sm font-semibold text-slate-800 transition active:scale-[0.98] hover:bg-white"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
            <span className="hidden sm:inline">Voltar</span>
          </button>

          <div className="min-w-0 flex-1 space-y-2 py-1">{titleBlock}</div>

          <div className="mt-0.5 flex shrink-0 flex-col gap-2">
            <button
              type="button"
              onClick={onAddItem}
              disabled={addDisabled}
              className="touch-target flex items-center justify-center rounded-xl border border-amber-300/80 bg-white/80 text-slate-500 opacity-70 transition hover:bg-white hover:text-slate-800 hover:opacity-100 disabled:opacity-40"
              aria-label={addLabel}
              title={addLabel}
            >
              <Plus className="h-5 w-5" />
            </button>
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                disabled={editDisabled}
                className="touch-target flex items-center justify-center rounded-xl border border-amber-300/80 bg-white/80 text-slate-700 transition hover:bg-white hover:text-slate-900 disabled:opacity-50"
                aria-label="Editar"
                title="Editar"
              >
                <Pencil className="h-5 w-5" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                disabled={deleteDisabled}
                className="touch-target flex items-center justify-center rounded-xl border border-red-200/80 bg-white/80 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                aria-label="Eliminar"
                title="Eliminar"
              >
                {deleting ? (
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                ) : (
                  <Trash2 className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        </div>

        {grandTotalLabel && (
          <p className="rounded-lg border border-amber-200/80 bg-white/60 px-3 py-2 text-sm text-slate-600">
            <span className="font-medium text-slate-800">Total geral (PDF):</span> {grandTotalLabel}
          </p>
        )}

        {extra}

        {showPdf && (
          <EventPdfSection
            event={event}
            uploading={pdfUploading}
            onUpload={onPdfUpload}
            onRemove={onPdfRemove}
          />
        )}
      </div>
    </header>
  );
}
