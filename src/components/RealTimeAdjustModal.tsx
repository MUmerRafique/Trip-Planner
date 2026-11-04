import React, { useState } from 'react';
import { Sparkles, X, RefreshCw, Send, CheckCircle2, MessageSquareText } from 'lucide-react';
import { Activity, FoodRecommendation, DietaryPreference, Currency } from '../types';

interface RealTimeAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'activity' | 'food';
  dayNumber: number;
  segmentName?: string;
  item: Activity | FoodRecommendation | null;
  destination: string;
  dietaryPreferences: DietaryPreference[];
  currency: Currency;
  onApplyAdjustment: (newContent: any) => void;
}

const QUICK_SUGGESTIONS_ACTIVITY = [
  'Find a free or budget-friendly alternative nearby',
  'Change to an outdoor park or scenic nature walk',
  'Make this segment more relaxed and less walking',
  'Suggest an authentic cultural or historical museum',
  'Replace with a local shopping street or market',
];

const QUICK_SUGGESTIONS_FOOD = [
  'Find a strictly Vegan / Plant-based local specialty spot',
  'Suggest a casual street food market nearby',
  'Replace with a cozy cafe or dessert house',
  'Find a Michelin-recommended or top-rated dining spot',
  'Ensure gluten-free options are highlighted',
];

export const RealTimeAdjustModal: React.FC<RealTimeAdjustModalProps> = ({
  isOpen,
  onClose,
  type,
  dayNumber,
  segmentName,
  item,
  destination,
  dietaryPreferences,
  currency,
  onApplyAdjustment,
}) => {
  const [instruction, setInstruction] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !item) return null;

  const suggestions = type === 'activity' ? QUICK_SUGGESTIONS_ACTIVITY : QUICK_SUGGESTIONS_FOOD;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const endpoint = type === 'activity' ? '/api/adjust-activity' : '/api/adjust-food';
      const payload =
        type === 'activity'
          ? {
              currentActivity: item,
              dayNumber,
              segment: segmentName,
              instruction: instruction.trim(),
              destination,
              dietaryPreferences,
              currency,
            }
          : {
              currentFood: item,
              dayNumber,
              instruction: instruction.trim(),
              destination,
              dietaryPreferences,
              currency,
            };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Adjustment failed');
      }

      if (type === 'activity') {
        onApplyAdjustment(data.updatedActivity);
      } else {
        onApplyAdjustment(data.updatedFood);
      }

      onClose();
      setInstruction('');
    } catch (err: any) {
      console.error('Error in real-time adjustment:', err);
      setErrorMessage(err.message || 'Failed to adjust segment with AI');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Adjust {type === 'activity' ? `${segmentName} Activity` : 'Food Recommendation'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Day {dayNumber} &bull; {destination}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Segment Snapshot */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
          <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Current Item:</span>
          <p className="font-bold text-slate-800 text-sm">
            {type === 'activity' ? (item as Activity).title : (item as FoodRecommendation).restaurantName}
          </p>
          <p className="text-slate-600 line-clamp-2">{item.description}</p>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <MessageSquareText className="w-3.5 h-3.5 text-teal-600" />
            <span>Quick Prompt Presets</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setInstruction(sug)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 hover:text-teal-900 border border-slate-200 text-slate-700 text-[11px] font-semibold text-left transition-colors"
              >
                + {sug}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Describe your desired adjustment
            </label>
            <textarea
              rows={3}
              required
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g. I prefer a quiet temple visit instead, or recommend a local noodle shop with halal options..."
              className="w-full p-3 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-xs font-medium text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !instruction.trim()}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm shadow-teal-600/20"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>AI Regenerating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Update with AI</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
