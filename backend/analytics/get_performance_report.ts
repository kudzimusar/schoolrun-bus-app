import { api } from "encore.dev/api";
import { analyticsDB } from "./db";

export interface GetPerformanceReportParams {
  entityType: "bus" | "route" | "driver" | "system";
  entityId?: number;
  startDate?: string;
  endDate?: string;
}

export interface PerformanceMetric {
  metricType: string;
  value: number;
  unit?: string;
  date: string;
}

export interface PerformanceReport {
  entityType: string;
  entityId?: number;
  dateRange: {
    start: string;
    end: string;
  };
  metrics: PerformanceMetric[];
  summary: {
    onTimeRate: number;
    fuelEfficiency: number;
    incidentRate: number;
    routeCompletion: number;
  };
}

// Generates a performance report for buses, routes, drivers, or the entire system.
export const getPerformanceReport = api<GetPerformanceReportParams, PerformanceReport>(
  { expose: true, method: "GET", path: "/analytics/performance" },
  async (params) => {
    const endDate = params.endDate || new Date().toISOString().split('T')[0];
    const startDate = params.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const metrics: PerformanceMetric[] = [];
    
    let query = `
      SELECT metric_type as "metricType", value, unit, date
      FROM performance_metrics 
      WHERE entity_type = $1 
        AND date >= $2 
        AND date <= $3
    `;
    
    const queryParams: any[] = [params.entityType, startDate, endDate];
    
    if (params.entityId) {
      query += ` AND entity_id = $4`;
      queryParams.push(params.entityId);
    } else {
      query += ` AND entity_id IS NULL`;
    }
    
    query += ` ORDER BY date DESC, metric_type`;
    
    for await (const metric of analyticsDB.rawQuery<PerformanceMetric>(query, ...queryParams)) {
      metrics.push({
        ...metric,
        date: metric.date.toString(),
      });
    }
    
    // Calculate summary metrics
    const getLatestMetric = (type: string) => {
      const metric = metrics.find(m => m.metricType === type);
      return metric ? metric.value : 0;
    };
    
    const summary = {
      onTimeRate: getLatestMetric('on_time_rate'),
      fuelEfficiency: getLatestMetric('fuel_efficiency'),
      incidentRate: getLatestMetric('incident_rate'),
      routeCompletion: getLatestMetric('route_completion'),
    };
    
    return {
      entityType: params.entityType,
      entityId: params.entityId,
      dateRange: {
        start: startDate,
        end: endDate,
      },
      metrics,
      summary,
    };
  }
);
