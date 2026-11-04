import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { TripItinerary, Activity, FoodRecommendation, DayItinerary } from '../types';
import { MapPin, Utensils, Sun, Sunrise, Sunset, Compass, Eye, Filter } from 'lucide-react';

interface InteractiveMapProps {
  trip: TripItinerary;
  selectedDayNumber: number;
  selectedLocation?: { lat: number; lng: number; title: string } | null;
  onSelectLocation?: (location: { lat: number; lng: number; title: string }) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  trip,
  selectedDayNumber,
  selectedLocation,
  onSelectLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [mapScope, setMapScope] = useState<'selected_day' | 'all_days'>('selected_day');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'activities' | 'food'>('all');

  // Custom Icon Generators
  const createCustomMarker = (colorHex: string, labelSymbol: string) => {
    const svgIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="40">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24c0-6.63-5.37-12-12-12z" fill="${colorHex}" stroke="#ffffff" stroke-width="1.5"/>
        <circle cx="12" cy="12" r="7" fill="#ffffff"/>
        <text x="12" y="16" font-size="10" font-weight="bold" text-anchor="middle" fill="${colorHex}">${labelSymbol}</text>
      </svg>
    `;
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: svgIcon,
      iconSize: [28, 40],
      iconAnchor: [14, 40],
      popupAnchor: [0, -36],
    });
  };

  const morningIcon = createCustomMarker('#f59e0b', 'M');
  const afternoonIcon = createCustomMarker('#0284c7', 'A');
  const eveningIcon = createCustomMarker('#7c3aed', 'E');
  const foodIcon = createCustomMarker('#059669', 'F');
  const defaultIcon = createCustomMarker('#0d9488', '★');

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = trip.coordinates?.lat || 20;
      const initialLng = trip.coordinates?.lng || 0;
      const initialZoom = trip.coordinates?.zoom || 12;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: initialZoom,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    // ResizeObserver for canvas fluidity
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Update Markers when trip, selectedDayNumber, mapScope, or categoryFilter changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    const daysToRender: DayItinerary[] =
      mapScope === 'selected_day'
        ? trip.days.filter((d) => d.dayNumber === selectedDayNumber)
        : trip.days;

    const bounds = L.latLngBounds([]);
    let hasPoints = false;

    daysToRender.forEach((day) => {
      // Activities
      if (categoryFilter === 'all' || categoryFilter === 'activities') {
        const segments: { act: Activity; segmentName: string; icon: L.DivIcon }[] = [
          { act: day.morning, segmentName: 'Morning', icon: morningIcon },
          { act: day.afternoon, segmentName: 'Afternoon', icon: afternoonIcon },
          { act: day.evening, segmentName: 'Evening', icon: eveningIcon },
        ];

        segments.forEach(({ act, segmentName, icon }) => {
          if (act && typeof act.lat === 'number' && typeof act.lng === 'number' && !isNaN(act.lat) && !isNaN(act.lng)) {
            const marker = L.marker([act.lat, act.lng], { icon });

            const popupContent = `
              <div class="p-1 max-w-xs font-sans">
                <span class="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 mb-1">
                  Day ${day.dayNumber} &bull; ${segmentName}
                </span>
                <h4 class="font-bold text-sm text-slate-900">${act.title}</h4>
                <p class="text-xs text-slate-600 my-1">${act.locationName}</p>
                <div class="flex items-center justify-between text-xs font-semibold text-teal-700 mt-2 border-t border-slate-100 pt-1">
                  <span>${act.costEstimate ? `${act.costEstimate} ${trip.estimatedBudget.currency}` : 'Free / Included'}</span>
                  <span>${act.time || ''}</span>
                </div>
              </div>
            `;

            marker.bindPopup(popupContent);
            marker.on('click', () => {
              if (onSelectLocation) {
                onSelectLocation({ lat: act.lat, lng: act.lng, title: act.title });
              }
            });

            marker.addTo(markersGroup);
            bounds.extend([act.lat, act.lng]);
            hasPoints = true;
          }
        });
      }

      // Food Recommendations
      if (categoryFilter === 'all' || categoryFilter === 'food') {
        (day.foodRecommendations || []).forEach((food) => {
          if (food && typeof food.lat === 'number' && typeof food.lng === 'number' && !isNaN(food.lat) && !isNaN(food.lng)) {
            const marker = L.marker([food.lat, food.lng], { icon: foodIcon });

            const popupContent = `
              <div class="p-1 max-w-xs font-sans">
                <span class="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 mb-1">
                  Day ${day.dayNumber} &bull; ${food.mealType}
                </span>
                <h4 class="font-bold text-sm text-slate-900">${food.restaurantName}</h4>
                <p class="text-xs text-slate-700 font-medium">${food.dishName}</p>
                <p class="text-xs text-slate-500 my-1">${food.locationName}</p>
                <div class="text-xs font-semibold text-emerald-700 mt-1 border-t border-slate-100 pt-1">
                  ~${food.approxCost} ${trip.estimatedBudget.currency}
                </div>
              </div>
            `;

            marker.bindPopup(popupContent);
            marker.addTo(markersGroup);
            bounds.extend([food.lat, food.lng]);
            hasPoints = true;
          }
        });
      }
    });

    if (hasPoints && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [trip, selectedDayNumber, mapScope, categoryFilter]);

  // Handle flying to selected location from outer clicks
  useEffect(() => {
    if (selectedLocation && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedLocation.lat, selectedLocation.lng], 16, {
        duration: 1.2,
      });
    }
  }, [selectedLocation]);

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Map Header Controls */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <Compass className="w-4 h-4 text-teal-600" />
          <span>Interactive Map</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Day Scope Selector */}
          <div className="inline-flex rounded-lg bg-slate-200 p-0.5">
            <button
              onClick={() => setMapScope('selected_day')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                mapScope === 'selected_day'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Day {selectedDayNumber}
            </button>
            <button
              onClick={() => setMapScope('all_days')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                mapScope === 'all_days'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Days
            </button>
          </div>

          {/* Category Filter */}
          <div className="inline-flex rounded-lg bg-slate-200 p-0.5">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-2 py-1 rounded-md font-medium transition-all ${
                categoryFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setCategoryFilter('activities')}
              className={`px-2 py-1 rounded-md font-medium transition-all ${
                categoryFilter === 'activities'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              Activities
            </button>
            <button
              onClick={() => setCategoryFilter('food')}
              className={`px-2 py-1 rounded-md font-medium transition-all ${
                categoryFilter === 'food'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              Food
            </button>
          </div>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative flex-1 min-h-[360px]">
        <div ref={mapContainerRef} className="absolute inset-0 z-0" />

        {/* Legend Overlay */}
        <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-xs p-2.5 rounded-xl shadow-md border border-slate-200/80 text-[11px] font-medium space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
            Map Legend
          </div>
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            <span>Morning</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block"></span>
            <span>Afternoon</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block"></span>
            <span>Evening</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
            <span>Dining Spot</span>
          </div>
        </div>
      </div>
    </div>
  );
};
