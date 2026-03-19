import { useToastStore } from '../store/toastStore';

export default function Toast() {
  const message = useToastStore((s) => s.message);
  if (!message) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-xl bg-green-700 text-white shadow-lg transition-all duration-300"
      role="alert"
    >
      {message}
    </div>
  );
}
