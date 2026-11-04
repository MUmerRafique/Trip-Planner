import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  UtensilsCrossed,
  Sparkles,
  Wallet,
  Globe,
  Compass,
  Check,
  Building,
  Trees,
  Landmark,
  ShoppingBag,
  HeartHandshake,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  TripPreferences,
  InterestCategory,
  DietaryPreference,
  BudgetTier,
  Currency,
} from '../types';

interface TripFormProps {
  onSubmit: (preferences: TripPreferences) => void;
  isLoading: boolean;
  isOffline: boolean;
}

const INTEREST_OPTIONS: { id: InterestCategory; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'food', label: 'Food & Culinary', icon: <UtensilsCrossed className="w-4 h-4 text-amber-500" />, desc: 'Local delicacies, markets & food tours' },
  { id: 'history', label: 'History & Culture', icon: <Landmark className="w-4 h-4 text-sky-600" />, desc: 'Temples, historical sites & monuments' },
  { id: 'nature', label: 'Nature & Outdoors', icon: <Trees className="w-4 h-4 text-emerald-600" />, desc: 'Parks, scenic trails, beaches & mountains' },
  { id: 'culture', label: 'Art & Museums', icon: <Building className="w-4 h-4 text-purple-600" />, desc: 'Galleries, local heritage & shows' },
  { id: 'shopping', label: 'Shopping & Bazaars', icon: <ShoppingBag className="w-4 h-4 text-rose-500" />, desc: 'Local handicrafts, boutiques & night markets' },
  { id: 'relaxation', label: 'Wellness & Chill', icon: <HeartHandshake className="w-4 h-4 text-teal-600" />, desc: 'Thermal spas, quiet cafes & easy walks' },
];

const DIETARY_OPTIONS: DietaryPreference[] = [
  'None',
  'Vegetarian',
  'Vegan',
  'Halal',
  'Kosher',
  'Gluten-Free',
  'Dairy-Free',
  'Pescatarian',
  'Nut Allergy',
];

const POPULAR_DESTINATIONS = [
  { name: 'Tokyo, Japan', days: 5, tags: ['food', 'history'], dietary: ['Vegetarian', 'None'] },
  { name: 'Rome, Italy', days: 4, tags: ['history', 'food'], dietary: ['Gluten-Free', 'Vegetarian'] },
  { name: 'Barcelona, Spain', days: 5, tags: ['nature', 'food'], dietary: ['Halal', 'None'] },
  { name: 'Banff, Canada', days: 4, tags: ['nature', 'relaxation'], dietary: ['Vegan', 'None'] },
  { name: 'Marrakech, Morocco', days: 3, tags: ['history', 'shopping'], dietary: ['Halal', 'Vegetarian'] },
  { name: 'Paris, France', days: 4, tags: ['culture', 'food'], dietary: ['None'] },
];

export const TripForm: React.FC<TripFormProps> = ({ onSubmit, isLoading, isOffline }) => {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [interests, setInterests] = useState<InterestCategory[]>(['food', 'history', 'nature']);
  const [dietaryPreferences, setDietaryPreferences] = useState<DietaryPreference[]>(['None']);
  const [budgetTier, setBudgetTier] = useState<BudgetTier>('Moderate');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const toggleInterest = (id: InterestCategory) => {
    if (interests.includes(id)) {
      if (interests.length > 1) {
        setInterests(interests.filter((i) => i !== id));
      }
    } else {
      setInterests([...interests, id]);
    }
  };

  const toggleDietary = (pref: DietaryPreference) => {
    if (pref === 'None') {
      setDietaryPreferences(['None']);
      return;
    }

    const filtered = dietaryPreferences.filter((p) => p !== 'None');
    if (filtered.includes(pref)) {
      const next = filtered.filter((p) => p !== pref);
      setDietaryPreferences(next.length === 0 ? ['None'] : next);
    } else {
      setDietaryPreferences([...filtered, pref]);
    }
  };

  const handleQuickDestinationSelect = (dest: (typeof POPULAR_DESTINATIONS)[0]) => {
    setDestination(dest.name);
    setDays(dest.days);
    setInterests(dest.tags as InterestCategory[]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;

    onSubmit({
      destination: destination.trim(),
      days,
      interests,
      dietaryPreferences,
      budgetTier,
      currency,
      additionalNotes: additionalNotes.trim(),
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Welcome Header */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Tailor-Made Day-by-Day AI Itineraries</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          Where would you like to travel next?
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
          Enter your dream destination, trip duration, interests, and dietary preferences. Our AI creates a personalized day-by-day plan with interactive map locations and budget tracking.
        </p>
      </div>

      {/* Main Form Box */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200 p-6 sm:p-8 space-y-8">
        {/* Destination & Duration Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Destination Input */}
          <div className="md:col-span-2 space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-teal-600" />
              <span>Destination City or Region *</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Kyoto, Japan or Florence, Italy"
                className="w-full pl-4 pr-10 py-3.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-900 placeholder:text-slate-400 font-semibold text-base transition-all bg-slate-50/50"
              />
              <Compass className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Number of Days */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal-600" />
                <span>Duration</span>
              </span>
              <span className="text-teal-700 font-extrabold text-sm">{days} {days === 1 ? 'Day' : 'Days'}</span>
            </label>

            <div className="flex items-center gap-2">
              <input
                type="range"
                min={1}
                max={14}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
              <span>1 Day</span>
              <span>7 Days</span>
              <span>14 Days</span>
            </div>
          </div>
        </div>

        {/* Interests Selection */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1">
              What are your top interests? (Select multiple)
            </label>
            <p className="text-xs text-slate-500">
              The AI will prioritize these themes in morning, afternoon, and evening segments.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {INTEREST_OPTIONS.map((item) => {
              const isSelected = interests.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleInterest(item.id)}
                  className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex items-start gap-3 select-none ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50/60 shadow-xs ring-1 ring-teal-500/20'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 hover:border-slate-300'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${isSelected ? 'bg-white shadow-xs' : 'bg-slate-200/70'}`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold ${isSelected ? 'text-teal-950' : 'text-slate-800'}`}>
                        {item.label}
                      </span>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dietary Preferences Section */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-1">
              <UtensilsCrossed className="w-4 h-4 text-amber-500" />
              <span>Dietary Preferences & Requirements</span>
            </label>
            <p className="text-xs text-slate-500">
              Every day's dining plan will recommend verified restaurants & local dishes tailored to your diet.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {DIETARY_OPTIONS.map((pref) => {
              const isSelected = dietaryPreferences.includes(pref);
              return (
                <button
                  type="button"
                  key={pref}
                  onClick={() => toggleDietary(pref)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-2xs ring-1 ring-amber-400/30'
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-700" />}
                  <span>{pref}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Budget & Currency Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-slate-100">
          {/* Budget Tier */}
          <div className="md:col-span-2 space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>Travel Style / Budget Level</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Backpacker', 'Moderate', 'Luxury'] as BudgetTier[]).map((tier) => (
                <button
                  type="button"
                  key={tier}
                  onClick={() => setBudgetTier(tier)}
                  className={`p-3 rounded-xl text-center border font-bold text-xs transition-all ${
                    budgetTier === tier
                      ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-sm">
                    {tier === 'Backpacker' && '🎒'}
                    {tier === 'Moderate' && '🏨'}
                    {tier === 'Luxury' && '👑'}
                  </div>
                  <div className="mt-1">{tier}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-sky-600" />
              <span>Currency</span>
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="w-full py-3 px-3.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-900 font-bold text-sm bg-slate-50/50"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="CAD">CAD ($)</option>
              <option value="AUD">AUD ($)</option>
              <option value="INR">INR (₹)</option>
              <option value="CHF">CHF (Fr)</option>
              <option value="SGD">SGD ($)</option>
            </select>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-slate-500" />
            <span>Special Requests or Notes (Optional)</span>
          </label>
          <input
            type="text"
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="e.g. Traveling with family, prefer walkable routes, early morning starts..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-900 placeholder:text-slate-400 text-xs font-medium bg-slate-50/50"
          />
        </div>

        {/* Action Button */}
        <div className="pt-2">
          {isOffline ? (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                You are currently offline. You can view, search, and manage your saved itineraries from the <strong>Saved Trips</strong> menu above. Reconnect to generate new AI trips.
              </span>
            </div>
          ) : (
            <button
              type="submit"
              disabled={isLoading || !destination.trim()}
              className="w-full py-4 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:hover:bg-teal-600 text-white font-extrabold text-base transition-all shadow-lg shadow-teal-600/30 flex items-center justify-center gap-3 group"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>AI Crafting Your Personal Itinerary...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-teal-200 group-hover:rotate-12 transition-transform" />
                  <span>Plan My Trip</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          )}
        </div>
      </form>

      {/* Quick Destination Inspiration Cards */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Compass className="w-4 h-4 text-teal-600" />
            <span>Need Inspiration? Try Popular Destinations</span>
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {POPULAR_DESTINATIONS.map((dest) => (
            <button
              key={dest.name}
              type="button"
              onClick={() => handleQuickDestinationSelect(dest)}
              className="p-3 rounded-2xl bg-white hover:bg-teal-50/80 border border-slate-200 hover:border-teal-300 text-left transition-all shadow-2xs group cursor-pointer"
            >
              <p className="font-bold text-xs text-slate-900 group-hover:text-teal-900 truncate">
                {dest.name}
              </p>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">
                {dest.days} Days &bull; {dest.tags[0]}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
