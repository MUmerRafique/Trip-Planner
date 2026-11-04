import React from 'react';
import { Compass, BookmarkCheck, Plus, Download, Wifi, WifiOff, Globe, Sparkles } from 'lucide-react';
import { TripItinerary } from '../types';
import { exportTripAsJSON } from '../lib/storage';

interface NavbarProps {
  activeTrip: TripItinerary | null;
  savedTripsCount: number;
  onOpenSavedTrips: () => void;
  onNewTrip: () => void;
  isOffline: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTrip,
  savedTripsCount,
  onOpenSavedTrips,
  onNewTrip,
  isOffline,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onNewTrip}>
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                Wayfare<span className="text-teal-600">AI</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                <Sparkles className="w-2.5 h-2.5 text-teal-600" />
                Planner
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Day-by-Day Itineraries & Food Guide
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Offline Status Badge */}
          {isOffline ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200" title="Offline Mode: Viewing saved trips from device storage">
              <WifiOff className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Offline Mode</span>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span>AI Connected</span>
            </div>
          )}

          {/* Export Current Trip */}
          {activeTrip && (
            <button
              onClick={() => exportTripAsJSON(activeTrip)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 text-xs font-semibold transition-colors"
              title="Download Itinerary JSON for offline backup"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          {/* Saved Trips Drawer Trigger */}
          <button
            onClick={onOpenSavedTrips}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/80 hover:bg-teal-100 text-xs font-bold transition-all shadow-2xs"
          >
            <BookmarkCheck className="w-4 h-4 text-teal-600" />
            <span>Saved Trips</span>
            {savedTripsCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-teal-600 text-white text-[10px] font-extrabold">
                {savedTripsCount}
              </span>
            )}
          </button>

          {/* New Trip Button */}
          <button
            onClick={onNewTrip}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Trip</span>
          </button>
        </div>
      </div>
    </header>
  );
};
