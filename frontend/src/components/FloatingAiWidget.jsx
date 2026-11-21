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
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Issue Helper"
        className="fixed bottom-6 right-6 z-40 flex cursor-pointer items-center gap-2.5 rounded-full border border-white/20 bg-gradient-to-r from-blue-700 to-indigo-700 px-4 py-3 text-sm font-semibold text-white shadow-2xl transition-all duration-200 hover:scale-105 hover:from-blue-800 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 sm:px-5 sm:py-3.5 print:hidden"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </span>
        <Sparkles className="h-4 w-4 text-amber-400" />
        <span className="hidden sm:inline">AI Issue Helper</span>
      </button>

      <AiDiagnosisModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
