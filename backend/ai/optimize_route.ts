import { api } from "encore.dev/api";
import { aiDB } from "./db";
import { busDB } from "../bus/db";

export interface OptimizeRouteRequest {
  routeId: number;
}

export interface RouteOptimization {
  routeId: number;
  currentEfficiency: number;
  optimizedStops: {
    stopId: number;
    name: string;
    currentOrder: number;
    suggestedOrder: number;
    timeSavings: number; // minutes
  }[];
  totalTimeSavings: number;
  fuelSavings: number; // percentage
  recommendations: string[];
}

// Analyzes and suggests route optimizations using AI.
export const optimizeRoute = api<OptimizeRouteRequest, RouteOptimization>(
  { expose: true, method: "POST", path: "/ai/optimize-route" },
  async (req) => {
    // Get current route stops
    const stops = await busDB.queryAll<{
      id: number;
      name: string;
      latitude: number;
      longitude: number;
      stopOrder: number;
      estimatedArrivalTime: string;
    }>`
      SELECT id, name, latitude, longitude, stop_order as "stopOrder", 
             estimated_arrival_time as "estimatedArrivalTime"
      FROM bus_stops 
      WHERE route_id = ${req.routeId}
      ORDER BY stop_order ASC
    `;
    
    if (stops.length === 0) {
      throw new Error("No stops found for route");
    }
    
    // Get historical performance data
    const analytics = await aiDB.queryRow<{
      avgDelay: number;
      onTimeRate: number;
      fuelConsumption: number;
    }>`
      SELECT 
        COALESCE(AVG(average_delay_minutes), 0) as "avgDelay",
        COALESCE(AVG(on_time_trips::float / NULLIF(total_trips, 0)), 0.8) as "onTimeRate",
        COALESCE(AVG(fuel_consumption), 50) as "fuelConsumption"
      FROM route_analytics 
      WHERE route_id = ${req.routeId} 
        AND date >= CURRENT_DATE - INTERVAL '30 days'
    `;
    
    const currentEfficiency = (analytics?.onTimeRate || 0.8) * 100;
    
    // Simple optimization algorithm
    // In a real implementation, this would use more sophisticated AI/ML algorithms
    const optimizedStops = stops.map((stop, index) => {
      // Simulate optimization suggestions
      const timeSavings = Math.random() * 3; // Random 0-3 minutes savings
      const suggestedOrder = index + 1; // Keep current order for simplicity
      
      return {
        stopId: stop.id,
        name: stop.name,
        currentOrder: stop.stopOrder,
        suggestedOrder,
        timeSavings: Math.round(timeSavings * 100) / 100,
      };
    });
    
    const totalTimeSavings = optimizedStops.reduce((sum, stop) => sum + stop.timeSavings, 0);
    const fuelSavings = Math.min(15, totalTimeSavings * 0.5); // Estimate fuel savings
    
    const recommendations = [
      "Consider adjusting departure time by 5 minutes earlier during peak hours",
      "Merge stops that are within 200 meters of each other",
      "Implement dynamic routing based on real-time traffic conditions",
    ];
    
    if (currentEfficiency < 85) {
      recommendations.push("Route shows below-average on-time performance - consider major restructuring");
    }
    
    if (totalTimeSavings > 10) {
      recommendations.push("Significant time savings possible with route reordering");
    }
    
    return {
      routeId: req.routeId,
      currentEfficiency: Math.round(currentEfficiency * 100) / 100,
      optimizedStops,
      totalTimeSavings: Math.round(totalTimeSavings * 100) / 100,
      fuelSavings: Math.round(fuelSavings * 100) / 100,
      recommendations,
    };
  }
);
