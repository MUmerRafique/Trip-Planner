import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Google Gen AI
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing in environment variables.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API Endpoint: Generate Complete Trip Itinerary
app.post("/api/generate-trip", async (req, res) => {
  try {
    const {
      destination,
      days = 3,
      interests = ["food", "history", "nature"],
      dietaryPreferences = ["None"],
      budgetTier = "Moderate",
      currency = "USD",
      additionalNotes = "",
    } = req.body;

    if (!destination || typeof destination !== "string") {
      return res.status(400).json({ error: "Destination is required" });
    }

    const ai = getAiClient();
    const numDays = Math.min(Math.max(Number(days) || 3, 1), 14);

    const prompt = `You are an expert travel consultant and local guide creating a detailed, highly accurate day-by-day travel itinerary for "${destination}" for ${numDays} day(s).
Target Audience Preferences:
- Main Interests: ${interests.join(", ")}
- Dietary Requirements: ${dietaryPreferences.join(", ")}
- Budget Category: ${budgetTier}
- Preferred Currency: ${currency}
${additionalNotes ? `- Special Requests: ${additionalNotes}` : ""}

Requirements:
1. Provide realistic latitude and longitude coordinates for ${destination} as well as for every activity and food recommendation so they can be plotted on an interactive Leaflet map.
2. For EACH of the ${numDays} days, create realistic, non-generic Morning, Afternoon, and Evening activities.
3. High focus on interests: ${interests.join(", ")}.
4. Food recommendations MUST strictly satisfy the dietary preferences (${dietaryPreferences.join(", ")}). Each meal should list specific dishes and restaurants or culinary areas in ${destination}.
5. Costs should be realistic estimates in ${currency}.
6. Provide a budget breakdown object for total accommodation, food, activities, transportation, and misc.

Return JSON in exact schema format specified.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "You are an expert travel planner API. Output clean, valid JSON only. All coordinates must be accurate real numbers. Ensure all days 1 through N are fully populated.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tripTitle: { type: Type.STRING },
            destination: { type: Type.STRING },
            coordinates: {
              type: Type.OBJECT,
              properties: {
                lat: { type: Type.NUMBER },
                lng: { type: Type.NUMBER },
                zoom: { type: Type.NUMBER },
              },
              required: ["lat", "lng", "zoom"],
            },
            summary: { type: Type.STRING },
            estimatedBudget: {
              type: Type.OBJECT,
              properties: {
                accommodation: { type: Type.NUMBER },
                food: { type: Type.NUMBER },
                activities: { type: Type.NUMBER },
                transportation: { type: Type.NUMBER },
                miscellaneous: { type: Type.NUMBER },
                total: { type: Type.NUMBER },
                currency: { type: Type.STRING },
              },
              required: [
                "accommodation",
                "food",
                "activities",
                "transportation",
                "miscellaneous",
                "total",
                "currency",
              ],
            },
            travelTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  theme: { type: Type.STRING },
                  morning: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      time: { type: Type.STRING },
                      description: { type: Type.STRING },
                      costEstimate: { type: Type.NUMBER },
                      locationName: { type: Type.STRING },
                      lat: { type: Type.NUMBER },
                      lng: { type: Type.NUMBER },
                      category: { type: Type.STRING },
                      tips: { type: Type.STRING },
                    },
                    required: [
                      "title",
                      "description",
                      "costEstimate",
                      "locationName",
                      "lat",
                      "lng",
                      "category",
                    ],
                  },
                  afternoon: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      time: { type: Type.STRING },
                      description: { type: Type.STRING },
                      costEstimate: { type: Type.NUMBER },
                      locationName: { type: Type.STRING },
                      lat: { type: Type.NUMBER },
                      lng: { type: Type.NUMBER },
                      category: { type: Type.STRING },
                      tips: { type: Type.STRING },
                    },
                    required: [
                      "title",
                      "description",
                      "costEstimate",
                      "locationName",
                      "lat",
                      "lng",
                      "category",
                    ],
                  },
                  evening: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      time: { type: Type.STRING },
                      description: { type: Type.STRING },
                      costEstimate: { type: Type.NUMBER },
                      locationName: { type: Type.STRING },
                      lat: { type: Type.NUMBER },
                      lng: { type: Type.NUMBER },
                      category: { type: Type.STRING },
                      tips: { type: Type.STRING },
                    },
                    required: [
                      "title",
                      "description",
                      "costEstimate",
                      "locationName",
                      "lat",
                      "lng",
                      "category",
                    ],
                  },
                  foodRecommendations: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        mealType: { type: Type.STRING },
                        restaurantName: { type: Type.STRING },
                        dishName: { type: Type.STRING },
                        description: { type: Type.STRING },
                        dietaryTags: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        approxCost: { type: Type.NUMBER },
                        locationName: { type: Type.STRING },
                        lat: { type: Type.NUMBER },
                        lng: { type: Type.NUMBER },
                      },
                      required: [
                        "mealType",
                        "restaurantName",
                        "dishName",
                        "description",
                        "dietaryTags",
                        "approxCost",
                        "locationName",
                        "lat",
                        "lng",
                      ],
                    },
                  },
                },
                required: [
                  "dayNumber",
                  "theme",
                  "morning",
                  "afternoon",
                  "evening",
                  "foodRecommendations",
                ],
              },
            },
          },
          required: [
            "tripTitle",
            "destination",
            "coordinates",
            "summary",
            "estimatedBudget",
            "days",
            "travelTips",
          ],
        },
      },
    });

    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText);

    res.json(data);
  } catch (error: any) {
    console.error("Error generating trip:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to generate itinerary" });
  }
});

// API Endpoint: Real-time Activity Adjustment
app.post("/api/adjust-activity", async (req, res) => {
  try {
    const {
      currentActivity,
      dayNumber,
      segment,
      instruction,
      destination,
      dietaryPreferences = ["None"],
      currency = "USD",
    } = req.body;

    if (!instruction) {
      return res.status(400).json({ error: "Instruction is required" });
    }

    const ai = getAiClient();

    const prompt = `The user wants to modify a specific ${segment} activity for Day ${dayNumber} of their trip to ${destination}.
Current Activity:
Title: ${currentActivity?.title || "N/A"}
Description: ${currentActivity?.description || "N/A"}
Location: ${currentActivity?.locationName || destination}
Cost: ${currentActivity?.costEstimate || 0} ${currency}

User's Adjustment Request: "${instruction}"
Dietary Restrictions (if food involved): ${dietaryPreferences.join(", ")}

Generate a new, revised activity segment that incorporates the user's request, located in or near ${destination}. Provide updated title, time, description, costEstimate in ${currency}, locationName, accurate lat/lng coordinates, category, and tips.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            time: { type: Type.STRING },
            description: { type: Type.STRING },
            costEstimate: { type: Type.NUMBER },
            locationName: { type: Type.STRING },
            lat: { type: Type.NUMBER },
            lng: { type: Type.NUMBER },
            category: { type: Type.STRING },
            tips: { type: Type.STRING },
          },
          required: [
            "title",
            "description",
            "costEstimate",
            "locationName",
            "lat",
            "lng",
            "category",
          ],
        },
      },
    });

    const jsonText = response.text || "{}";
    const updatedActivity = JSON.parse(jsonText);

    res.json({ updatedActivity });
  } catch (error: any) {
    console.error("Error adjusting activity:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to adjust activity" });
  }
});

// API Endpoint: Real-time Food Recommendation Adjustment
app.post("/api/adjust-food", async (req, res) => {
  try {
    const {
      currentFood,
      dayNumber,
      instruction,
      destination,
      dietaryPreferences = ["None"],
      currency = "USD",
    } = req.body;

    if (!instruction) {
      return res.status(400).json({ error: "Instruction is required" });
    }

    const ai = getAiClient();

    const prompt = `The user wants to replace or adjust a local food recommendation for Day ${dayNumber} in ${destination}.
Current Food Spot:
Meal: ${currentFood?.mealType || "lunch"}
Restaurant: ${currentFood?.restaurantName || "N/A"}
Dish: ${currentFood?.dishName || "N/A"}
Description: ${currentFood?.description || "N/A"}
Dietary Preferences: ${dietaryPreferences.join(", ")}

User Request: "${instruction}"

Generate an updated or replacement local food recommendation in ${destination} adhering to dietary preferences. Provide mealType, restaurantName, dishName, description, dietaryTags, approxCost in ${currency}, locationName, lat, and lng.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mealType: { type: Type.STRING },
            restaurantName: { type: Type.STRING },
            dishName: { type: Type.STRING },
            description: { type: Type.STRING },
            dietaryTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            approxCost: { type: Type.NUMBER },
            locationName: { type: Type.STRING },
            lat: { type: Type.NUMBER },
            lng: { type: Type.NUMBER },
          },
          required: [
            "mealType",
            "restaurantName",
            "dishName",
            "description",
            "dietaryTags",
            "approxCost",
            "locationName",
            "lat",
            "lng",
          ],
        },
      },
    });

    const updatedFood = JSON.parse(response.text || "{}");
    res.json({ updatedFood });
  } catch (error: any) {
    console.error("Error adjusting food:", error);
    res.status(500).json({ error: error.message || "Failed to adjust food" });
  }
});

// API Endpoint: Destination Inspiration / Suggestions
app.post("/api/suggest-destinations", async (req, res) => {
  try {
    const { interests = [], dietaryPreferences = [], budgetTier = "Moderate" } = req.body;
    const ai = getAiClient();

    const prompt = `Suggest 4 inspiring travel destinations around the world that excel for people interested in ${interests.join(
      ", "
    )} with dietary requirements (${dietaryPreferences.join(", ")}) and budget category "${budgetTier}".
For each destination return city name, country, 1-line tag, description, and key highlight.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              city: { type: Type.STRING },
              country: { type: Type.STRING },
              tagline: { type: Type.STRING },
              description: { type: Type.STRING },
              topHighlight: { type: Type.STRING },
            },
            required: ["city", "country", "tagline", "description", "topHighlight"],
          },
        },
      },
    });

    res.json(JSON.parse(response.text || "[]"));
  } catch (error: any) {
    console.error("Error suggesting destinations:", error);
    res.status(500).json({ error: "Failed to fetch suggestions" });
  }
});

// Vite middleware & Static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Trip Planner server running on http://localhost:${PORT}`);
  });
}

startServer();
