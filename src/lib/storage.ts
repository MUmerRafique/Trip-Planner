import { TripItinerary, SpentExpense, Activity, FoodRecommendation } from '../types';

const TRIPS_KEY = 'ai_trip_planner_saved_trips_v1';
const ACTIVE_TRIP_KEY = 'ai_trip_planner_active_id';

export function getSavedTrips(): TripItinerary[] {
  try {
    const data = localStorage.getItem(TRIPS_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to parse saved trips from localStorage', err);
    return [];
  }
}

export function saveTrip(trip: TripItinerary): void {
  try {
    const trips = getSavedTrips();
    const existingIndex = trips.findIndex((t) => t.id === trip.id);
    if (existingIndex >= 0) {
      trips[existingIndex] = trip;
    } else {
      trips.unshift(trip);
    }
    localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
    setActiveTripId(trip.id);
  } catch (err) {
    console.error('Failed to save trip to localStorage', err);
  }
}

export function getTripById(id: string): TripItinerary | null {
  const trips = getSavedTrips();
  return trips.find((t) => t.id === id) || null;
}

export function deleteTrip(id: string): void {
  try {
    const trips = getSavedTrips().filter((t) => t.id !== id);
    localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
    if (getActiveTripId() === id) {
      localStorage.removeItem(ACTIVE_TRIP_KEY);
    }
  } catch (err) {
    console.error('Failed to delete trip from localStorage', err);
  }
}

export function getActiveTripId(): string | null {
  return localStorage.getItem(ACTIVE_TRIP_KEY);
}

export function setActiveTripId(id: string): void {
  localStorage.setItem(ACTIVE_TRIP_KEY, id);
}

export function addExpenseToTrip(tripId: string, expense: SpentExpense): TripItinerary | null {
  const trip = getTripById(tripId);
  if (!trip) return null;

  const updated: TripItinerary = {
    ...trip,
    actualExpenses: [expense, ...(trip.actualExpenses || [])],
  };

  saveTrip(updated);
  return updated;
}

export function deleteExpenseFromTrip(tripId: string, expenseId: string): TripItinerary | null {
  const trip = getTripById(tripId);
  if (!trip) return null;

  const updated: TripItinerary = {
    ...trip,
    actualExpenses: (trip.actualExpenses || []).filter((e) => e.id !== expenseId),
  };

  saveTrip(updated);
  return updated;
}

export function updateTripActivity(
  tripId: string,
  dayNumber: number,
  segment: 'morning' | 'afternoon' | 'evening',
  newActivity: Activity
): TripItinerary | null {
  const trip = getTripById(tripId);
  if (!trip) return null;

  const updatedDays = trip.days.map((day) => {
    if (day.dayNumber === dayNumber) {
      return {
        ...day,
        [segment]: newActivity,
      };
    }
    return day;
  });

  // Recalculate total activity budget estimate
  let totalActivityCost = 0;
  updatedDays.forEach((day) => {
    totalActivityCost += (day.morning?.costEstimate || 0) + (day.afternoon?.costEstimate || 0) + (day.evening?.costEstimate || 0);
  });

  const updated: TripItinerary = {
    ...trip,
    days: updatedDays,
    estimatedBudget: {
      ...trip.estimatedBudget,
      activities: totalActivityCost,
      total:
        trip.estimatedBudget.accommodation +
        trip.estimatedBudget.food +
        totalActivityCost +
        trip.estimatedBudget.transportation +
        trip.estimatedBudget.miscellaneous,
    },
  };

  saveTrip(updated);
  return updated;
}

export function updateTripFood(
  tripId: string,
  dayNumber: number,
  foodId: string,
  newFood: FoodRecommendation
): TripItinerary | null {
  const trip = getTripById(tripId);
  if (!trip) return null;

  const updatedDays = trip.days.map((day) => {
    if (day.dayNumber === dayNumber) {
      const updatedFoodList = day.foodRecommendations.map((food) => (food.id === foodId ? newFood : food));
      return {
        ...day,
        foodRecommendations: updatedFoodList,
      };
    }
    return day;
  });

  const updated: TripItinerary = {
    ...trip,
    days: updatedDays,
  };

  saveTrip(updated);
  return updated;
}

export function exportTripAsJSON(trip: TripItinerary): void {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(trip, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `${trip.destination.replace(/\s+/g, '_')}_itinerary.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
