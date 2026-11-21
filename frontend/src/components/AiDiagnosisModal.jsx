import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  CheckCircle2,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import aiDiagnosisService from '../services/aiDiagnosisService';

export default function AiDiagnosisModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');
    setAnalyzing(true);

    try {
      const diagnosis = await aiDiagnosisService.diagnoseIssue(
        description,
        Boolean(photoPreview)
      );
      setResult(diagnosis);
    } catch (err) {
      setError(err.message || 'Unable to analyze issue.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFindMatching = () => {
    if (!result) return;
    const isUrgent = result.urgency === 'Emergency';
    onClose();
    navigate(
      `/technicians?category=${encodeURIComponent(result.detectedCategory)}&urgent=${isUrgent}`
    );
  };

  const handleReset = () => {
    setDescription('');
    setPhotoPreview('');
    setResult(null);
    setError('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-diagnosis-title"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-blue-900 to-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-slate-950">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 id="ai-diagnosis-title" className="text-base font-bold">
                AI Issue Diagnosis Helper
              </h2>
              <p className="text-xs text-slate-300">
                Describe the problem to get category, urgency &amp; cost estimate
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
            aria-label="Close AI Diagnosis Modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          {!result ? (
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <label
                  htmlFor="ai-issue-desc"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  What seems to be the problem?
                </label>
                <textarea
                  id="ai-issue-desc"
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., My kitchen sink pipe is leaking badly, or the AC is not cooling..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                />
              </div>

              <div>
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Photo of Issue <span className="font-normal text-slate-400">(Optional)</span>
                </span>
                {photoPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={photoPreview}
                      alt="Uploaded issue preview"
                      className="h-24 w-32 rounded-xl border border-slate-200 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotoPreview('')}
                      aria-label="Remove uploaded photo"
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-100">
                    <Camera className="h-4 w-4 text-blue-700" />
                    Upload Photo of Broken Item
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={analyzing}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 disabled:opacity-60"
                >
                  <Sparkles className="h-4 w-4" />
                  {analyzing ? 'Analyzing...' : 'Analyze Issue'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                      Recommended Category
                    </p>
                    <p className="text-xl font-extrabold text-slate-900">
                      {result.detectedCategory}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                      result.urgency === 'Emergency'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {result.urgency === 'Emergency' ? (
                      <AlertTriangle className="h-3.5 w-3.5" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    {result.urgency} Priority
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-blue-200/60 pt-3">
                  <div>
                    <p className="text-xs text-slate-500">Estimated Cost (LKR)</p>
                    <p className="text-sm font-bold text-slate-900">{result.estimatedRange}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Match Confidence</p>
                    <p className="text-sm font-bold text-slate-900">{result.confidence}%</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs leading-relaxed text-amber-900">
                <strong className="font-semibold">Quick Safety Tip:</strong> {result.advice}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Analyze Another Issue
                </button>
                <button
                  type="button"
                  onClick={handleFindMatching}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-sm hover:bg-amber-400"
                >
                  Find Matching Technicians
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
