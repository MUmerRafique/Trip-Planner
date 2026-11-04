import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Sunrise,
  Sun,
  Sunset,
  UtensilsCrossed,
  Sparkles,
  Info,
  DollarSign,
  Share2,
  BookmarkCheck,
  Clock,
  Compass,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Lightbulb,
  FileText,
} from 'lucide-react';
import {
  TripItinerary,
  DayItinerary,
  Activity,
  FoodRecommendation,
  DietaryPreference,
} from '../types';
import { InteractiveMap } from './InteractiveMap';
import { BudgetTracker } from './BudgetTracker';
import { RealTimeAdjustModal } from './RealTimeAdjustModal';

interface ItineraryViewProps {
  trip: TripItinerary;
  onTripUpdated: (updatedTrip: TripItinerary) => void;
  onNewTrip: () => void;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  trip,
  onTripUpdated,
  onNewTrip,
}) => {
  const [selectedDayNumber, setSelectedDayNumber] = useState(1);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'map' | 'budget'>('itinerary');
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; title: string } | null>(null);

  // Modal State for Real-Time Adjustments
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustType, setAdjustType] = useState<'activity' | 'food'>('activity');
  const [adjustSegment, setAdjustSegment] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [adjustItem, setAdjustItem] = useState<Activity | FoodRecommendation | null>(null);

  const selectedDay: DayItinerary =
    trip.days.find((d) => d.dayNumber === selectedDayNumber) || trip.days[0];

  const currency = trip.estimatedBudget?.currency || 'USD';

  const handleOpenAdjustActivity = (
    segment: 'morning' | 'afternoon' | 'evening',
    activity: Activity
  ) => {
    setAdjustType('activity');
    setAdjustSegment(segment);
    setAdjustItem(activity);
    setAdjustModalOpen(true);
  };

  const handleOpenAdjustFood = (food: FoodRecommendation) => {
    setAdjustType('food');
    setAdjustItem(food);
    setAdjustModalOpen(true);
  };

  const handleApplyAdjustment = (updatedItem: any) => {
    if (adjustType === 'activity') {
      const updatedDays = trip.days.map((day) => {
        if (day.dayNumber === selectedDayNumber) {
          return {
            ...day,
            [adjustSegment]: updatedItem,
          };
        }
        return day;
      });

      const updatedTrip: TripItinerary = {
        ...trip,
        days: updatedDays,
      };

      onTripUpdated(updatedTrip);
    } else {
      const updatedDays = trip.days.map((day) => {
        if (day.dayNumber === selectedDayNumber) {
          const updatedFoodList = day.foodRecommendations.map((f) =>
            f.id === (adjustItem as FoodRecommendation)?.id ? updatedItem : f
          );
          return {
            ...day,
            foodRecommendations: updatedFoodList,
          };
        }
        return day;
      });

      const updatedTrip: TripItinerary = {
        ...trip,
        days: updatedDays,
      };

      onTripUpdated(updatedTrip);
    }
  };

  const focusMapLocation = (lat: number, lng: number, title: string) => {
    setSelectedLocation({ lat, lng, title });
    if (window.innerWidth < 1024) {
      setActiveTab('map');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner Overview */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold uppercase tracking-wider">
                {trip.days.length} {trip.days.length === 1 ? 'Day' : 'Days'} Trip
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                {trip.preferences?.budgetTier || 'Moderate'} Budget
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
                Dietary: {(trip.preferences?.dietaryPreferences || ['None']).join(', ')}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {trip.tripTitle}
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {trip.summary}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNewTrip}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all"
            >
              Plan Another Trip
            </button>
          </div>
        </div>

        {/* Navigation View Tabs (Mobile Friendly) */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('itinerary')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'itinerary'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Day-by-Day Plan</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'map'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Interactive Map</span>
          </button>

          <button
            onClick={() => setActiveTab('budget')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'budget'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Budget & Expenses</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      {activeTab === 'budget' ? (
        <BudgetTracker trip={trip} onTripUpdated={onTripUpdated} />
      ) : activeTab === 'map' ? (
        <div className="h-[600px]">
          <InteractiveMap
            trip={trip}
            selectedDayNumber={selectedDayNumber}
            selectedLocation={selectedLocation}
            onSelectLocation={setSelectedLocation}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Itinerary Days & Activities (8 Cols) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* Day Selector Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {trip.days.map((day) => (
                <button
                  key={day.dayNumber}
                  onClick={() => setSelectedDayNumber(day.dayNumber)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all shrink-0 border text-left ${
                    selectedDayNumber === day.dayNumber
                      ? 'bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-600/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-[10px] uppercase font-semibold opacity-80">Day {day.dayNumber}</div>
                  <div className="truncate max-w-[120px]">{day.theme}</div>
                </button>
              ))}
            </div>

            {/* Selected Day Theme Header */}
            {selectedDay && (
              <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-1">
                <div className="text-teal-400 text-xs font-extrabold uppercase tracking-wider">
                  Day {selectedDay.dayNumber} Overview
                </div>
                <h2 className="text-xl font-extrabold">{selectedDay.theme}</h2>
              </div>
            )}

            {/* Day Segments: Morning, Afternoon, Evening */}
            {selectedDay && (
              <div className="space-y-4">
                {/* Morning Activity Card */}
                {selectedDay.morning && (
                  <ActivityCard
                    segmentName="Morning"
                    icon={<Sunrise className="w-5 h-5 text-amber-500" />}
                    activity={selectedDay.morning}
                    currency={currency}
                    onFocusMap={() =>
                      focusMapLocation(
                        selectedDay.morning.lat,
                        selectedDay.morning.lng,
                        selectedDay.morning.title
                      )
                    }
                    onAdjust={() => handleOpenAdjustActivity('morning', selectedDay.morning)}
                  />
                )}

                {/* Afternoon Activity Card */}
                {selectedDay.afternoon && (
                  <ActivityCard
                    segmentName="Afternoon"
                    icon={<Sun className="w-5 h-5 text-sky-600" />}
                    activity={selectedDay.afternoon}
                    currency={currency}
                    onFocusMap={() =>
                      focusMapLocation(
                        selectedDay.afternoon.lat,
                        selectedDay.afternoon.lng,
                        selectedDay.afternoon.title
                      )
                    }
                    onAdjust={() => handleOpenAdjustActivity('afternoon', selectedDay.afternoon)}
                  />
                )}

                {/* Evening Activity Card */}
                {selectedDay.evening && (
                  <ActivityCard
                    segmentName="Evening"
                    icon={<Sunset className="w-5 h-5 text-purple-600" />}
                    activity={selectedDay.evening}
                    currency={currency}
                    onFocusMap={() =>
                      focusMapLocation(
                        selectedDay.evening.lat,
                        selectedDay.evening.lng,
                        selectedDay.evening.title
                      )
                    }
                    onAdjust={() => handleOpenAdjustActivity('evening', selectedDay.evening)}
                  />
                )}

                {/* Food Recommendations for this Day */}
                {selectedDay.foodRecommendations && selectedDay.foodRecommendations.length > 0 && (
                  <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UtensilsCrossed className="w-5 h-5 text-emerald-700" />
                        <h3 className="font-extrabold text-base text-emerald-950">
                          Local Food Recommendations & Dietary Guide
                        </h3>
                      </div>
                      <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900">
                        Day {selectedDay.dayNumber} Dining
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedDay.foodRecommendations.map((food, idx) => (
                        <div
                          key={food.id || idx}
                          className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-2xs space-y-2 flex flex-col justify-between"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                {food.mealType}
                              </span>
                              <span className="text-xs font-bold text-emerald-800">
                                ~{food.approxCost} {currency}
                              </span>
                            </div>

                            <h4 className="font-bold text-sm text-slate-900">{food.restaurantName}</h4>
                            <p className="text-xs font-semibold text-teal-800">{food.dishName}</p>
                            <p className="text-xs text-slate-600 leading-relaxed">{food.description}</p>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap gap-1">
                              {(food.dietaryTags || []).map((tag, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>

                            <button
                              onClick={() => handleOpenAdjustFood(food)}
                              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1"
                            >
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              <span>Adjust Food</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Destination Travel Tips Card */}
            {trip.travelTips && trip.travelTips.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  <h3 className="font-extrabold text-base text-slate-900">Local Travel Tips & Etiquette</h3>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  {trip.travelTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 font-medium">
                      <span className="text-teal-600 font-bold">&bull;</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Interactive Map (4-5 Cols) */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            <div className="sticky top-20 h-[580px]">
              <InteractiveMap
                trip={trip}
                selectedDayNumber={selectedDayNumber}
                selectedLocation={selectedLocation}
                onSelectLocation={setSelectedLocation}
              />
            </div>
          </div>
        </div>
      )}

      {/* Real-Time Adjustment Popup Modal */}
      <RealTimeAdjustModal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        type={adjustType}
        dayNumber={selectedDayNumber}
        segmentName={adjustSegment}
        item={adjustItem}
        destination={trip.destination}
        dietaryPreferences={trip.preferences?.dietaryPreferences || ['None']}
        currency={currency}
        onApplyAdjustment={handleApplyAdjustment}
      />
    </div>
  );
};

// Subcomponent: Activity Segment Card
interface ActivityCardProps {
  segmentName: string;
  icon: React.ReactNode;
  activity: Activity;
  currency: string;
  onFocusMap: () => void;
  onAdjust: () => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  segmentName,
  icon,
  activity,
  currency,
  onFocusMap,
  onAdjust,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow p-5 sm:p-6 space-y-3">
      {/* Segment Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
            {segmentName} Activity
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-xl">
            {activity.costEstimate ? `${activity.costEstimate} ${currency}` : 'Free / Included'}
          </span>
        </div>
      </div>

      {/* Activity Details */}
      <div className="space-y-2">
        <h3 className="font-extrabold text-lg text-slate-900">{activity.title}</h3>
        <p className="text-xs text-slate-600 leading-relaxed font-medium">{activity.description}</p>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
          <div className="flex items-center gap-1 font-semibold text-teal-800">
            <MapPin className="w-3.5 h-3.5 text-teal-600" />
            <span>{activity.locationName}</span>
          </div>

          {activity.time && (
            <div className="flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{activity.time}</span>
            </div>
          )}
        </div>

        {activity.tips && (
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 font-medium flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
            <span><strong>Tip:</strong> {activity.tips}</span>
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="pt-2 flex items-center justify-between border-t border-slate-100">
        <button
          onClick={onFocusMap}
          className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 transition-colors"
        >
          <Compass className="w-3.5 h-3.5 text-teal-600" />
          <span>View on Map</span>
        </button>

        <button
          onClick={onAdjust}
          className="px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200/80 text-xs font-bold transition-colors flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Adjust with AI</span>
        </button>
      </div>
    </div>
  );
};
