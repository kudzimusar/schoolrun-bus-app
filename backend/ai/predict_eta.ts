import { api } from "encore.dev/api";
import { aiDB } from "./db";
import { secret } from "encore.dev/config";

const MapboxAccessToken = secret("MapboxAccessToken");

const etaCache = new Map<string, { etaMinutes: number; expiresAt: number }>();

export interface PredictETARequest {
  busId: number;
  routeId: number;
  currentLatitude: number;
  currentLongitude: number;
  targetLatitude: number;
  targetLongitude: number;
}

export interface ETAPrediction {
  id: number;
  busId: number;
  routeId: number;
  predictedETA: number; // minutes
  confidenceScore: number;
  factors: {
    distance: number;
    historicalSpeed: number;
    trafficConditions: string;
    timeOfDay: string;
    weatherConditions?: string;
  };
  validUntil: Date;
}

async function getMapboxETA(lat1: number, lon1: number, lat2: number, lon2: number): Promise<number | undefined> {
  const token = MapboxAccessToken();
  if (!token) return undefined;
  const cacheKey = `${lat1},${lon1}->${lat2},${lon2}`;
  const cached = etaCache.get(cacheKey);
  const now = Date.now();
  if (cached && cached.expiresAt > now) return cached.etaMinutes;
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${lon1},${lat1};${lon2},${lat2}?access_token=${token}&overview=false`;
  const resp = await fetch(url);
  if (!resp.ok) return undefined;
  const data: any = await resp.json();
  const durationSec = data?.routes?.[0]?.duration as number | undefined;
  if (!durationSec) return undefined;
  const etaMin = Math.ceil(durationSec / 60);
  etaCache.set(cacheKey, { etaMinutes: etaMin, expiresAt: now + 2 * 60 * 1000 });
  return etaMin;
}

// Predicts ETA for a bus to reach a specific location using AI analysis.
export const predictETA = api<PredictETARequest, ETAPrediction>(
  { expose: true, method: "POST", path: "/ai/predict-eta" },
  async (req) => {
    // Mapbox ETA if available
    const mapboxETA = await getMapboxETA(req.currentLatitude, req.currentLongitude, req.targetLatitude, req.targetLongitude).catch(() => undefined);

    // Calculate base distance
    const distance = calculateDistance(
      req.currentLatitude, req.currentLongitude,
      req.targetLatitude, req.targetLongitude
    );
    
    // Get historical data for this route
    const historicalData = await aiDB.queryRow<{
      avgSpeed: number;
      avgDelay: number;
    }>`
      SELECT 
        COALESCE(AVG(distance_traveled / NULLIF(average_delay_minutes + 30, 0)), 25) as "avgSpeed",
        COALESCE(AVG(average_delay_minutes), 0) as "avgDelay"
      FROM route_analytics 
      WHERE route_id = ${req.routeId} 
        AND date >= CURRENT_DATE - INTERVAL '30 days'
    `;
    
    const avgSpeed = historicalData?.avgSpeed || 25; // km/h default
    const avgDelay = historicalData?.avgDelay || 0;
    
    // Simple AI prediction based on multiple factors
    const timeOfDay = new Date().getHours();
    const isRushHour = (timeOfDay >= 7 && timeOfDay <= 9) || (timeOfDay >= 15 && timeOfDay <= 18);
    
    // Adjust speed based on conditions
    let adjustedSpeed = avgSpeed;
    if (isRushHour) adjustedSpeed *= 0.7; // 30% slower during rush hour
    
    // Calculate ETA in minutes (fallback)
    const baseETA = (distance / 1000) / adjustedSpeed * 60; // Convert to minutes
    const fallbackETA = Math.round(baseETA + avgDelay);
    const predictedETA = mapboxETA ?? fallbackETA;
    
    // Calculate confidence based on data availability
    const confidenceScore = Math.min(0.95, 0.5 + (historicalData ? 0.3 : 0) + (mapboxETA ? 0.15 : 0));
    
    const factors = {
      distance: Math.round(distance),
      historicalSpeed: Math.round(avgSpeed),
      trafficConditions: isRushHour ? "heavy" : "normal",
      timeOfDay: timeOfDay < 12 ? "morning" : timeOfDay < 18 ? "afternoon" : "evening",
    };
    
    // Store prediction
    const prediction = await aiDB.queryRow<ETAPrediction>`
      INSERT INTO predictions (
        bus_id, route_id, prediction_type, predicted_value, 
        confidence_score, factors, valid_until
      )
      VALUES (
        ${req.busId}, ${req.routeId}, 'eta', ${predictedETA}, 
        ${confidenceScore}, ${JSON.stringify(factors)}, 
        NOW() + INTERVAL '10 minutes'
      )
      RETURNING id, bus_id as "busId", route_id as "routeId", 
                predicted_value as "predictedETA", confidence_score as "confidenceScore",
                factors, valid_until as "validUntil"
    `;
    
    if (!prediction) {
      throw new Error("Failed to create ETA prediction");
    }
    
    return {
      ...prediction,
      factors,
    };
  }
);

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
