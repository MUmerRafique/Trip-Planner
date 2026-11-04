import React from 'react';
import { BookmarkCheck, X, Trash2, Calendar, MapPin, Download, ArrowRight, Compass } from 'lucide-react';
import { TripItinerary } from '../types';
import { exportTripAsJSON } from '../lib/storage';

interface SavedTripsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedTrips: TripItinerary[];
  activeTripId: string | null;
  onSelectTrip: (trip: TripItinerary) => void;
  onDeleteTrip: (tripId: string) => void;
}

export const SavedTripsModal: React.FC<SavedTripsModalProps> = ({
  isOpen,
  onClose,
  savedTrips,
  activeTripId,
  onSelectTrip,
  onDeleteTrip,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5 max-h-[85vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <BookmarkCheck className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Saved Itineraries</h3>
              <p className="text-xs text-slate-500 font-medium">
                Offline access to all your created trip plans ({savedTrips.length})
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

        {/* Trips List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {savedTrips.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
              <Compass className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-bold text-sm text-slate-700">No Saved Trips Yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Generate your first itinerary using the AI Trip Planner, and it will automatically be saved for offline access.
              </p>
            </div>
          ) : (
            savedTrips.map((trip) => {
              const isActive = trip.id === activeTripId;
              const currency = trip.estimatedBudget?.currency || 'USD';

              return (
                <div
                  key={trip.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isActive
                      ? 'border-teal-500 bg-teal-50/50 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1 cursor-pointer flex-1" onClick={() => { onSelectTrip(trip); onClose(); }}>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-slate-900">{trip.tripTitle}</h4>
                      {isActive && (
                        <span className="px-2 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-bold">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-teal-600" />
                        {trip.destination}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {trip.days.length} Days
                      </span>
                      <span>
                        Est: {trip.estimatedBudget?.total?.toLocaleString()} {currency}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                    <button
                      onClick={() => exportTripAsJSON(trip)}
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      title="Export JSON"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDeleteTrip(trip.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Trip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => { onSelectTrip(trip); onClose(); }}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
