import React from "react";

export default function ActionBar({
  onSave,
  onGeneratePDF,
  onShareImage,
}) {
  return (
    <div className="border-t bg-slate-900 p-3 space-y-3">
      {onSave && (
        <button
          onClick={onSave}
          className="w-full py-2 rounded bg-emerald-600 text-slate-900 font-semibold"
        >
          Save to History
        </button>
      )}

      <button
        onClick={onGeneratePDF}
        className="w-full py-2 rounded bg-slate-700 text-white font-semibold"
      >
        Generate PDF
      </button>

      <button
        onClick={onShareImage}
        className="w-full py-2 rounded bg-blue-600 text-white font-semibold"
      >
        Share as Image
      </button>
    </div>
  );
}
