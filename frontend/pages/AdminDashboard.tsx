import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Bus, Users, MapPin, BarChart3, Settings, Plus, Route, AlertTriangle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import backend from "~backend/client";
import LoadingSpinner from "../components/LoadingSpinner";

export default function AdminDashboard() {
  const { data: buses, isLoading: busesLoading } = useQuery({
    queryKey: ["buses"],
    queryFn: () => backend.bus.listBuses(),
  });

  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: () => backend.location.listAllLocations(),
  });

  const { data: incidents } = useQuery({
    queryKey: ["incidents"],
    queryFn: () => backend.incident.listIncidents({ status: "open" }),
  });

  const { data: performanceReport } = useQuery({
    queryKey: ["performance", "system"],
    queryFn: () => backend.analytics.getPerformanceReport({ 
      entityType: "system",
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    }),
  });

  if (busesLoading || locationsLoading) {
    return <LoadingSpinner />;
  }

  const activeBuses = buses?.buses.filter(bus => bus.status === 'active').length || 0;
  const totalBuses = buses?.buses.length || 0;
  const busesOnRoute = locations?.locations.filter(loc => loc.status === 'moving').length || 0;
  const criticalIncidents = incidents?.incidents.filter(i => i.severity === 'critical' || i.severity === 'high').length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Administrator Dashboard</h1>
            <div className="flex items-center space-x-4">
              <Link to="/admin-dashboard/routes">
                <Button variant="outline">
                  <Route className="h-4 w-4 mr-2" />
                  Manage Routes
                </Button>
              </Link>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Bus
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Critical Incidents Alert */}
        {criticalIncidents > 0 && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>{criticalIncidents} critical incident(s)</strong> require immediate attention.
              <Link to="/admin-dashboard/incidents" className="ml-2 underline">
                View Details
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Buses</CardTitle>
              <Bus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBuses}</div>
              <p className="text-xs text-muted-foreground">
                {activeBuses} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On Route</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{busesOnRoute}</div>
              <p className="text-xs text-muted-foreground">
                Currently moving
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">
                Registered students
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {performanceReport?.summary.onTimeRate.toFixed(1) || "94.2"}%
              </div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Summary */}
        {performanceReport && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                System Performance
              </CardTitle>
              <CardDescription>Key metrics for the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {performanceReport.summary.onTimeRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600">On-Time Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {performanceReport.summary.fuelEfficiency.toFixed(1)} MPG
                  </p>
                  <p className="text-sm text-gray-600">Fuel Efficiency</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {performanceReport.summary.routeCompletion.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600">Route Completion</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {performanceReport.summary.incidentRate.toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-600">Incidents/100 Trips</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Fleet Overview</CardTitle>
              <CardDescription>Real-time status of all buses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {buses?.buses.slice(0, 5).map((bus) => {
                  const location = locations?.locations.find(loc => loc.busId === bus.id);
                  return (
                    <div key={bus.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Bus className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Bus {bus.number}</p>
                          <p className="text-sm text-gray-600">Capacity: {bus.capacity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={
                          location?.status === 'moving' ? 'bg-green-100 text-green-800' :
                          location?.status === 'stopped' ? 'bg-yellow-100 text-yellow-800' :
                          location?.status === 'delayed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {location?.status || 'offline'}
                        </Badge>
                        {location && (
                          <p className="text-xs text-gray-500 mt-1">
                            Updated {new Date(location.lastUpdated).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
                <Button variant="outline" className="w-full">
                  View All Buses
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system events and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incidents?.incidents.slice(0, 4).map((incident) => (
                  <div key={incident.id} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      incident.severity === 'critical' ? 'bg-red-500' :
                      incident.severity === 'high' ? 'bg-orange-500' :
                      incident.severity === 'medium' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium">{incident.title}</p>
                      <p className="text-xs text-gray-500">
                        Bus {incident.busId} • {new Date(incident.reportedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )) || [
                  <div key="1" className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Bus 123 completed morning route</p>
                      <p className="text-xs text-gray-500">2 minutes ago</p>
                    </div>
                  </div>,
                  <div key="2" className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Bus 456 reported 5-minute delay</p>
                      <p className="text-xs text-gray-500">8 minutes ago</p>
                    </div>
                  </div>,
                  <div key="3" className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">New route created for Oakwood Elementary</p>
                      <p className="text-xs text-gray-500">1 hour ago</p>
                    </div>
                  </div>,
                  <div key="4" className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Bus 789 maintenance completed</p>
                      <p className="text-xs text-gray-500">3 hours ago</p>
                    </div>
                  </div>
                ]}
                <Button variant="outline" className="w-full">
                  View Activity Log
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
