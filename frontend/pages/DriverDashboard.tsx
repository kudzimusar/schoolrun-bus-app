import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation, Users, AlertTriangle, MapPin, Clock, Phone, CheckCircle, Play, Square } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";
import Header from "../components/Header";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";

export default function DriverDashboard() {
  const { user } = useAuth();
  const [incidentType, setIncidentType] = useState("");
  const [incidentDescription, setIncidentDescription] = useState("");
  const [isReportingIncident, setIsReportingIncident] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [lastLocation, setLastLocation] = useState<{ lat: number; lng: number } | null>(null);
  const watchId = useRef<number | null>(null);
  const { toast } = useToast();

  const { data: buses, isLoading } = useQuery({
    queryKey: ["buses"],
    queryFn: () => backend.bus.listBuses(),
  });

  const { data: routes } = useQuery({
    queryKey: ["routes"],
    queryFn: () => backend.bus.listRoutes(),
  });

  const { data: incidents } = useQuery({
    queryKey: ["incidents"],
    queryFn: () => backend.incident.listIncidents({ status: "open" }),
  });

  // For demo purposes, assume driver is assigned to first bus
  const assignedBus = buses?.buses[0];
  const currentRoute = routes?.routes.find(route => route.busId === assignedBus?.id);

  // GPS Tracking Logic
  const startTracking = () => {
    if (!assignedBus) return;
    if (!("geolocation" in navigator)) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      return;
    }

    setIsTracking(true);
    toast({
      title: "Trip Started",
      description: "GPS tracking is now active.",
    });

    watchId.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, speed, heading } = position.coords;
        setLastLocation({ lat: latitude, lng: longitude });

        try {
          await backend.location.updateLocation({
            busId: assignedBus.id,
            latitude,
            longitude,
            speed: speed || 0,
            heading: heading || 0,
          });
        } catch (error) {
          console.error("Failed to update location:", error);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast({
          title: "GPS Error",
          description: "Failed to get your location. Please check your GPS settings.",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    );
  };

  const stopTracking = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setIsTracking(false);
    toast({
      title: "Trip Ended",
      description: "GPS tracking has been stopped.",
    });
  };

  useEffect(() => {
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const handleReportIncident = async () => {
    if (!incidentType || !incidentDescription || !assignedBus) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsReportingIncident(true);
    try {
      await backend.incident.reportIncident({
        busId: assignedBus.id,
        driverId: user?.id || 3,
        type: incidentType as any,
        severity: "medium",
        title: `${incidentType.replace('_', ' ')} reported`,
        description: incidentDescription,
        latitude: lastLocation?.lat,
        longitude: lastLocation?.lng,
      });

      toast({
        title: "Incident Reported",
        description: "Your incident report has been submitted successfully.",
      });

      setIncidentType("");
      setIncidentDescription("");
    } catch (error) {
      console.error("Failed to report incident:", error);
      toast({
        title: "Error",
        description: "Failed to submit incident report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsReportingIncident(false);
    }
  };

  const handleEmergencyAlert = () => {
    toast({
      title: "Emergency Alert Sent",
      description: "Emergency services and dispatch have been notified.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Driver Dashboard">
        <Button variant="outline" onClick={handleEmergencyAlert} className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100">
          <Phone className="h-4 w-4 mr-2" />
          Emergency
        </Button>
      </Header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6">
          {assignedBus && (
            <Card className={isTracking ? "border-green-500 ring-1 ring-green-500" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Bus {assignedBus.number}</CardTitle>
                    <CardDescription>Your assigned vehicle</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {isTracking && (
                      <Badge className="bg-green-100 text-green-800 animate-pulse">
                        LIVE TRACKING
                      </Badge>
                    )}
                    <Badge className={assignedBus.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {assignedBus.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-blue-600 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Capacity</p>
                          <p className="font-semibold">{assignedBus.capacity} students</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-green-600 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Location</p>
                          <p className="font-semibold text-sm">
                            {lastLocation ? `${lastLocation.lat.toFixed(4)}, ${lastLocation.lng.toFixed(4)}` : "Not tracking"}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {!isTracking ? (
                      <Button onClick={startTracking} className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg">
                        <Play className="h-5 w-5 mr-2" />
                        Start Trip
                      </Button>
                    ) : (
                      <Button onClick={stopTracking} variant="destructive" className="w-full h-12 text-lg">
                        <Square className="h-5 w-5 mr-2" />
                        End Trip
                      </Button>
                    )}
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 flex flex-col justify-center">
                    <h4 className="font-semibold text-blue-900 mb-1">Trip Instructions</h4>
                    <p className="text-sm text-blue-800">
                      {isTracking 
                        ? "Keep this app open during your trip. Your location is being shared with parents in real-time." 
                        : "Press 'Start Trip' when you begin your route to notify parents and start tracking."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Navigation className="h-6 w-6 text-blue-600 mr-2" />
                  Current Route
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentRoute ? (
                    <>
                      <div className="bg-gray-100 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-2">Active Route</p>
                        <p className="font-semibold">{currentRoute.name}</p>
                        <p className="text-sm text-gray-500">
                          {currentRoute.stopCount} stops • {currentRoute.routeType}
                        </p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-2">Next Stop</p>
                        <p className="font-semibold">Maple Street & Oak Avenue</p>
                        <p className="text-sm text-gray-500">ETA: 8 minutes</p>
                      </div>
                    </>
                  ) : (
                    <div className="bg-gray-100 rounded-lg p-4 text-center">
                      <p className="text-gray-500">No active route assigned</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-6 w-6 text-green-600 mr-2" />
                  Student Manifest
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">Emma Johnson</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">Stop 1</Badge>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">Jake Johnson</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">Stop 2</Badge>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">Lily Chen</span>
                    <Badge variant="outline">Stop 3</Badge>
                  </div>
                  <Button variant="outline" className="w-full">
                    View Full Manifest
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-6 w-6 text-orange-600 mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-16 flex-col">
                      <AlertTriangle className="h-6 w-6 mb-1" />
                      Report Incident
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Report Incident</DialogTitle>
                      <DialogDescription>
                        Report any incidents or issues during your route
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="incident-type">Incident Type</Label>
                        <Select value={incidentType} onValueChange={setIncidentType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select incident type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="delay">Traffic Delay</SelectItem>
                            <SelectItem value="breakdown">Vehicle Breakdown</SelectItem>
                            <SelectItem value="accident">Accident</SelectItem>
                            <SelectItem value="route_deviation">Route Deviation</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe the incident..."
                          value={incidentDescription}
                          onChange={(e) => setIncidentDescription(e.target.value)}
                        />
                      </div>
                      <Button 
                        onClick={handleReportIncident} 
                        className="w-full"
                        disabled={isReportingIncident}
                      >
                        {isReportingIncident ? "Reporting..." : "Submit Report"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button 
                  variant="outline" 
                  className="h-16 flex-col bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                  onClick={handleEmergencyAlert}
                >
                  <Phone className="h-6 w-6 mb-1" />
                  Emergency Alert
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Active Incidents */}
          {incidents && incidents.incidents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Active Incidents</CardTitle>
                <CardDescription>Current incidents requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {incidents.incidents.slice(0, 3).map((incident) => (
                    <div key={incident.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div>
                        <p className="font-medium text-orange-900">{incident.title}</p>
                        <p className="text-sm text-orange-700">{incident.description}</p>
                        <p className="text-xs text-orange-600">
                          {new Date(incident.reportedAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge className="bg-orange-100 text-orange-800">
                        {incident.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
