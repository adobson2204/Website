import { X } from "lucide-react";

export default function ErrorNotification({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 max-w-[90vw]">
      <div className="flex items-center justify-between">
        <span className="text-sm">{message}</span>
        <button onClick={onDismiss} className="ml-2">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
