"use client";

type Props = {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
};

export default function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  loading = false,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  tone = "default",
}: Props) {
  if (!open) return null;

  const confirmClass =
    tone === "danger"
      ? "bg-red-600 text-white hover:bg-red-700"
      : "bg-brand-gradient text-white hover:opacity-90";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        <h3 className="text-brand-blue font-bold text-[18px] mb-2">{title}</h3>
        <p className="text-brand-blue/70 text-[14px] mb-5">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-[14px] font-medium text-brand-blue/70 border border-gray-200 rounded-xl hover:border-brand-blue/30 disabled:opacity-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-[14px] font-medium rounded-xl disabled:opacity-50 transition-colors ${confirmClass}`}
          >
            {loading ? "..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
