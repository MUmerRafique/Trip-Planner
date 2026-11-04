import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { TripForm } from './components/TripForm';
import { ItineraryView } from './components/ItineraryView';
import { SavedTripsModal } from './components/SavedTripsModal';
import { TripItinerary, TripPreferences } from './types';
import {
  getSavedTrips,
  saveTrip,
  getTripById,
  deleteTrip,
  getActiveTripId,
  setActiveTripId,
} from './lib/storage';
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTrip, setActiveTrip] = useState<TripItinerary | null>(null);
  const [savedTrips, setSavedTrips] = useState<TripItinerary[]>([]);
  const [savedModalOpen, setSavedModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Monitor online / offline state
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load saved trips & active trip on mount
  useEffect(() => {
    const trips = getSavedTrips();
    setSavedTrips(trips);

    const activeId = getActiveTripId();
    if (activeId) {
      const found = getTripById(activeId);
      if (found) {
        setActiveTrip(found);
      }
    }
  }, []);

  // Handle new trip generation with Gemini
  const handleGenerateTrip = async (preferences: TripPreferences) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/generate-trip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate itinerary. Please try again.');
      }

      const tripId = 'trip_' + Date.now();

      // Ensure day/activity IDs exist
      const formattedDays = (data.days || []).map((day: any, dIdx: number) => ({
        ...day,
        dayNumber: day.dayNumber || dIdx + 1,
        morning: {
          ...day.morning,
          id: `act_${tripId}_d${dIdx + 1}_m`,
        },
        afternoon: {
          ...day.afternoon,
          id: `act_${tripId}_d${dIdx + 1}_a`,
        },
        evening: {
          ...day.evening,
          id: `act_${tripId}_d${dIdx + 1}_e`,
        },
        foodRecommendations: (day.foodRecommendations || []).map((food: any, fIdx: number) => ({
          ...food,
          id: `food_${tripId}_d${dIdx + 1}_${fIdx}`,
        })),
      }));

      const newTrip: TripItinerary = {
        id: tripId,
        tripTitle: data.tripTitle || `${preferences.destination} ${preferences.days}-Day Journey`,
        destination: data.destination || preferences.destination,
        coordinates: data.coordinates || { lat: 35.6762, lng: 139.6503, zoom: 12 },
        summary: data.summary || '',
        estimatedBudget: data.estimatedBudget || {
          accommodation: 0,
          food: 0,
          activities: 0,
          transportation: 0,
          miscellaneous: 0,
          total: 0,
          currency: preferences.currency,
        },
        days: formattedDays,
        travelTips: data.travelTips || [],
        createdAt: new Date().toISOString(),
        actualExpenses: [],
        preferences,
      };

      saveTrip(newTrip);
      setActiveTrip(newTrip);
      setSavedTrips(getSavedTrips());
    } catch (err: any) {
      console.error('Generation error:', err);
      setErrorMsg(err.message || 'An error occurred while generating your trip plan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTripUpdated = (updatedTrip: TripItinerary) => {
    saveTrip(updatedTrip);
    setActiveTrip(updatedTrip);
    setSavedTrips(getSavedTrips());
  };

  const handleDeleteTrip = (tripId: string) => {
    deleteTrip(tripId);
    const updatedSaved = getSavedTrips();
    setSavedTrips(updatedSaved);

    if (activeTrip?.id === tripId) {
      setActiveTrip(updatedSaved.length > 0 ? updatedSaved[0] : null);
    }
  };

  const handleNewTripClick = () => {
    setActiveTrip(null);
    setActiveTripId('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header */}
      <Navbar
        activeTrip={activeTrip}
        savedTripsCount={savedTrips.length}
        onOpenSavedTrips={() => setSavedModalOpen(true)}
        onNewTrip={handleNewTripClick}
        isOffline={isOffline}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center justify-between gap-3 shadow-xs max-w-3xl mx-auto">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-rose-700 hover:text-rose-900 font-bold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* View Switcher */}
        {activeTrip ? (
          <ItineraryView
            trip={activeTrip}
            onTripUpdated={handleTripUpdated}
            onNewTrip={handleNewTripClick}
          />
        ) : (
          <TripForm
            onSubmit={handleGenerateTrip}
            isLoading={isLoading}
            isOffline={isOffline}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 font-medium">
          <p>© {new Date().getFullYear()} WayfareAI &bull; Personalized AI Trip Itineraries</p>
          <div className="flex items-center gap-4 text-slate-600">
            <span>Leaflet Maps</span>
            <span>&bull;</span>
            <span>Gemini AI Engine</span>
            <span>&bull;</span>
            <span>Offline Storage Ready</span>
          </div>
        </div>
      </footer>

      {/* Saved Trips Modal */}
      <SavedTripsModal
        isOpen={savedModalOpen}
        onClose={() => setSavedModalOpen(false)}
        savedTrips={savedTrips}
        activeTripId={activeTrip?.id || null}
        onSelectTrip={(trip) => {
          setActiveTrip(trip);
          setActiveTripId(trip.id);
        }}
        onDeleteTrip={handleDeleteTrip}
      />
    </div>
  );
}
