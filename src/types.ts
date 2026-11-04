export type InterestCategory = 'food' | 'history' | 'nature' | 'culture' | 'shopping' | 'relaxation';

export type DietaryPreference = 'Vegetarian' | 'Vegan' | 'Halal' | 'Kosher' | 'Gluten-Free' | 'Dairy-Free' | 'Pescatarian' | 'Nut Allergy' | 'None';

export type BudgetTier = 'Backpacker' | 'Moderate' | 'Luxury';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'INR' | 'CHF' | 'SGD';

export interface TripPreferences {
  destination: string;
  days: number;
  interests: InterestCategory[];
  dietaryPreferences: DietaryPreference[];
  budgetTier: BudgetTier;
  currency: Currency;
  additionalNotes?: string;
}

export interface Activity {
  id: string;
  title: string;
  time?: string;
  description: string;
  costEstimate: number;
  locationName: string;
  lat: number;
  lng: number;
  category: InterestCategory | 'sightseeing';
  tips?: string;
}

export interface FoodRecommendation {
  id: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  restaurantName: string;
  dishName: string;
  description: string;
  dietaryTags: string[];
  approxCost: number;
  locationName: string;
  lat: number;
  lng: number;
}

export interface DayItinerary {
  dayNumber: number;
  theme: string;
  morning: Activity;
  afternoon: Activity;
  evening: Activity;
  foodRecommendations: FoodRecommendation[];
}

export interface BudgetBreakdown {
  accommodation: number;
  food: number;
  activities: number;
  transportation: number;
  miscellaneous: number;
  total: number;
  currency: Currency;
}

export interface SpentExpense {
  id: string;
  dayNumber: number;
  category: 'accommodation' | 'food' | 'activities' | 'transportation' | 'shopping' | 'other';
  description: string;
  amount: number;
  date: string;
}

export interface TripItinerary {
  id: string;
  tripTitle: string;
  destination: string;
  coordinates: {
    lat: number;
    lng: number;
    zoom: number;
  };
  summary: string;
  estimatedBudget: BudgetBreakdown;
  days: DayItinerary[];
  travelTips: string[];
  createdAt: string;
  actualExpenses: SpentExpense[];
  preferences: TripPreferences;
}

export interface AdjustActivityPayload {
  tripId: string;
  dayNumber: number;
  segment: 'morning' | 'afternoon' | 'evening';
  currentActivity: Activity;
  instruction: string;
  destination: string;
  dietaryPreferences: DietaryPreference[];
  currency: Currency;
}

export interface AdjustFoodPayload {
  tripId: string;
  dayNumber: number;
  foodId: string;
  currentFood: FoodRecommendation;
  instruction: string;
  destination: string;
  dietaryPreferences: DietaryPreference[];
  currency: Currency;
}
