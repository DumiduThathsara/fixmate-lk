import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  ImagePlus,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import aiDiagnosisService from '../services/aiDiagnosisService';

const SUGGESTION_CHIPS = [
  '💧 Kitchen sink pipe leaking',
  '❄️ AC not cooling properly',
  '⚡ Main trip switch keeps tripping',
  "🔌 Washing machine won't drain",
];

function GeminiSparkleLogo({ className = 'h-6 w-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="fixmate-gemini-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="60%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <path
        d="M12 2C12.4 7.2 16.8 11.6 22 12C16.8 12.4 12.4 16.8 12 22C11.6 16.8 7.2 12.4 2 12C7.2 11.6 11.6 7.2 12 2Z"
        fill="url(#fixmate-gemini-grad)"
      />
    </svg>
  );
}

export default function FloatingAiWidget() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState(null); // { dataUrl, base64, mimeType }
  const [thinking, setThinking] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, thinking, isOpen]);

  if (pathname.startsWith('/admin')) {
    return null;
  }

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      const commaIdx = dataUrl.indexOf(',');
      const base64 = commaIdx >= 0 ? dataUrl.substring(commaIdx + 1) : dataUrl;
      setAttachedImage({
        dataUrl,
        base64,
        mimeType: file.type || 'image/jpeg',
      });
    };
    reader.readAsDataURL(file);
  };

  const sendMessage = async (overrideText) => {
    const text = (overrideText !== undefined ? overrideText : inputText).trim();
    if (!text || thinking) return;

    const currentImage = overrideText !== undefined ? null : attachedImage;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      imageUrl: currentImage?.dataUrl || null,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (overrideText === undefined) {
      setInputText('');
      setAttachedImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }

    setThinking(true);
    try {
      const diagnosis = await aiDiagnosisService.diagnoseIssue({
        description: text,
        imageBase64: currentImage?.base64 || null,
        mimeType: currentImage?.mimeType || null,
      });

      const aiMsg = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        diagnosis,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'ai',
          error: err.message || 'Unable to analyze your request right now.',
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTextareaChange = (e) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const handleResetChat = () => {
    setMessages([]);
    setInputText('');
    setAttachedImage(null);
    setThinking(false);
  };

  const handleNavigateTechnicians = (diagnosis) => {
    const isUrgent = diagnosis.urgency === 'Emergency';
    setIsOpen(false);
    navigate(
      `/technicians?category=${encodeURIComponent(diagnosis.detectedCategory)}&urgent=${isUrgent}`
    );
  };

  return (
    <>
      {/* Floating Circular Trigger Button */}
      <div className="fixed bottom-20 right-5 z-40 md:bottom-6 md:right-6 print:hidden">
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

      {/* Google Gemini-Style Conversational Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-xs sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="fixmate-ai-title"
        >
          <div className="flex h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl sm:h-[38rem] sm:max-h-[88vh] sm:rounded-3xl">
            {/* Clean Gemini Header */}
            <header className="flex items-center justify-between border-b border-slate-100 bg-white/90 px-5 py-3.5 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <GeminiSparkleLogo className="h-7 w-7 shrink-0" />
                <div className="flex items-center gap-2">
                  <h2 id="fixmate-ai-title" className="text-base font-bold text-slate-900">
                    FixMate AI
                  </h2>
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                    Powered by Gemini
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={handleResetChat}
                    title="New Chat"
                    aria-label="New Chat"
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">New Chat</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close FixMate AI"
                  className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </header>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {messages.length === 0 ? (
                /* Empty / Welcome State */
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xs">
                    <GeminiSparkleLogo className="h-8 w-8" />
                  </div>
                  <h3 className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 bg-clip-text text-xl font-extrabold text-transparent sm:text-2xl">
                    Hello! How can I help with your home repair?
                  </h3>
                  <p className="mt-2 max-w-md text-xs text-slate-500 sm:text-sm">
                    Describe an issue in English, Singlish, or Sinhala — or attach a photo of a
                    broken pipe, AC, or wiring.
                  </p>

                  <div className="mt-6 grid w-full max-w-lg grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {SUGGESTION_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => sendMessage(chip)}
                        className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-left text-xs font-medium text-slate-700 transition-all hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-800"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Conversational Thread */
                <div className="space-y-5">
                  {messages.map((msg) => {
                    if (msg.role === 'user') {
                      return (
                        <div key={msg.id} className="flex justify-end">
                          <div className="max-w-[82%] space-y-2 rounded-2xl rounded-br-sm bg-blue-700 px-4 py-3 text-sm text-white shadow-xs">
                            {msg.imageUrl && (
                              <img
                                src={msg.imageUrl}
                                alt="Attached issue"
                                className="max-h-40 rounded-xl border border-white/20 object-cover"
                              />
                            )}
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={msg.id} className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white shadow-xs">
                          <GeminiSparkleLogo className="h-5 w-5" />
                        </span>

                        {msg.error ? (
                          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {msg.error}
                          </div>
                        ) : (
                          <div className="max-w-[88%] flex-1 space-y-3">
                            <p className="text-sm leading-relaxed text-slate-700">
                              Based on your description, this looks like a{' '}
                              <strong className="text-slate-900">
                                {msg.diagnosis.detectedCategory}
                              </strong>{' '}
                              issue ({msg.diagnosis.confidence}% confidence). Here is my quick
                              assessment:
                            </p>

                            {/* Embedded Diagnosis Summary Card */}
                            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-xs">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                                  {msg.diagnosis.detectedCategory}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                                    msg.diagnosis.urgency === 'Emergency'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-emerald-100 text-emerald-700'
                                  }`}
                                >
                                  {msg.diagnosis.urgency === 'Emergency' ? (
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                  ) : (
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  )}
                                  {msg.diagnosis.urgency} Priority
                                </span>
                              </div>

                              <div className="mt-3 border-t border-slate-200/80 pt-3">
                                <p className="text-xs font-medium text-slate-500">
                                  Estimated Cost (LKR)
                                </p>
                                <p className="text-base font-extrabold text-slate-900">
                                  {msg.diagnosis.estimatedRange}
                                </p>
                              </div>

                              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/90 p-3 text-xs leading-relaxed text-amber-900">
                                <strong className="font-semibold">Safety Tip:</strong>{' '}
                                {msg.diagnosis.advice}
                              </div>

                              <button
                                type="button"
                                onClick={() => handleNavigateTechnicians(msg.diagnosis)}
                                className="mt-3.5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-blue-800"
                              >
                                Find {msg.diagnosis.detectedCategory} Technicians
                                <ArrowRight className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Gemini Thinking / Shimmer State */}
                  {thinking && (
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 animate-pulse items-center justify-center rounded-full border border-blue-200 bg-blue-50">
                        <GeminiSparkleLogo className="h-5 w-5" />
                      </span>
                      <div className="w-full max-w-sm space-y-2 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div className="h-3 w-3/4 animate-pulse rounded-full bg-gradient-to-r from-blue-200 via-indigo-200 to-slate-200" />
                        <div className="h-3 w-1/2 animate-pulse rounded-full bg-gradient-to-r from-slate-200 via-blue-200 to-indigo-200" />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Gemini-Style Bottom Pill Prompt Bar */}
            <div className="border-t border-slate-100 bg-white px-4 py-3 sm:px-5">
              {attachedImage && (
                <div className="mb-2 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 pr-2.5">
                  <img
                    src={attachedImage.dataUrl}
                    alt="Selected attachment"
                    className="h-9 w-9 rounded-lg object-cover"
                  />
                  <span className="text-xs font-medium text-slate-600">Photo attached</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAttachedImage(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    aria-label="Remove attached photo"
                    className="rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              <div className="flex items-end gap-2 rounded-2xl bg-slate-100 p-2 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach photo of broken item"
                  aria-label="Attach photo"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-200/70 hover:text-blue-700"
                >
                  <ImagePlus className="h-5 w-5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={inputText}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask FixMate AI or describe your issue..."
                  className="max-h-28 flex-1 resize-none bg-transparent py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none"
                />

                <button
                  type="button"
                  disabled={!inputText.trim() || thinking}
                  onClick={() => sendMessage()}
                  aria-label="Send message"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-xs transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
