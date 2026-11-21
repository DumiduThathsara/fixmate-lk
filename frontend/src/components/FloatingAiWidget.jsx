import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import AiDiagnosisModal from './AiDiagnosisModal';

export default function FloatingAiWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 print:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="AI Issue Helper"
          className="group relative flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-2 border-white/20 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white shadow-2xl transition-all duration-200 hover:scale-110 hover:from-blue-700 hover:to-indigo-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
        >
          <Sparkles className="h-7 w-7 text-amber-300" />

          {/* Online Pulse Dot */}
          <span className="absolute right-0.5 top-0.5 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-slate-900 bg-emerald-400" />
          </span>

          {/* Hover Tooltip */}
          <span className="pointer-events-none absolute right-16 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            AI Issue Helper
          </span>
        </button>
      </div>

      <AiDiagnosisModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
