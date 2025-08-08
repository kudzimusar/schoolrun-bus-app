import { api } from "encore.dev/api";
import { analyticsDB } from "./db";

export interface RecordMetricRequest {
  metricType: "on_time_rate" | "fuel_efficiency" | "route_completion" | "incident_rate";
  entityType: "bus" | "route" | "driver" | "system";
  entityId?: number;
  value: number;
  unit?: string;
  date?: string;
}

export interface MetricRecord {
  id: number;
  metricType: string;
  entityType: string;
  entityId?: number;
  value: number;
  unit?: string;
  date: string;
  createdAt: Date;
}

// Records a performance metric for analysis.
export const recordMetric = api<RecordMetricRequest, MetricRecord>(
  { expose: true, method: "POST", path: "/analytics/metrics" },
  async (req) => {
    const date = req.date || new Date().toISOString().split('T')[0];
    
    const metric = await analyticsDB.queryRow<MetricRecord>`
      INSERT INTO performance_metrics (metric_type, entity_type, entity_id, value, unit, date)
      VALUES (${req.metricType}, ${req.entityType}, ${req.entityId}, ${req.value}, ${req.unit}, ${date})
      ON CONFLICT (metric_type, entity_type, entity_id, date)
      DO UPDATE SET 
        value = EXCLUDED.value,
        unit = EXCLUDED.unit
      RETURNING id, metric_type as "metricType", entity_type as "entityType", 
                entity_id as "entityId", value, unit, date, created_at as "createdAt"
    `;
    
    if (!metric) {
      throw new Error("Failed to record metric");
    }
    
    return {
      ...metric,
      date: metric.date.toString(),
    };
  }
);
