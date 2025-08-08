import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation, Users, AlertTriangle, MapPin, Clock, Phone, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";
import LoadingSpinner from "../components/LoadingSpinner";

export default function DriverDashboard() {
  const [incidentType, setIncidentType] = useState("");
  const [incidentDescription, setIncidentDescription] = useState("");
  const [isReportingIncident, setIsReportingIncident] = useState(false);
  const { toast } = useToast();

  const { data: buses, isLoading } = useQuery({
    queryKey: ["buses"],
    queryFn: () => backend.bus.listBuses(),
  });

  const { data: locations } = useQuery({
    queryKey: ["locations"],
    queryFn: () => backend.location.listAllLocations(),
  });

  const { data: routes } = useQuery({
    queryKey: ["routes"],
    queryFn: () => backend.bus.listRoutes(),
  });

  const { data: incidents } = useQuery({
    queryKey: ["incidents"],
    queryFn: () => backend.incident.listIncidents({ status: "open" }),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // For demo purposes, assume driver is assigned to first bus
  const assignedBus = buses?.buses[0];
  const busLocation = assignedBus ? locations?.locations.find(loc => loc.busId === assignedBus.id) : null;
  const currentRoute = routes?.routes.find(route => route.busId === assignedBus?.id);

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
        driverId: 3, // Hardcoded driver ID for demo
        type: incidentType as any,
        severity: "medium",
        title: `${incidentType.replace('_', ' ')} reported`,
        description: incidentDescription,
        latitude: busLocation?.latitude,
        longitude: busLocation?.longitude,
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

  const handleUpdateLocation = async () => {
    if (!assignedBus) return;

    try {
      // Simulate location update with slight variation
      const lat = 40.7128 + (Math.random() - 0.5) * 0.01;
      const lng = -74.0060 + (Math.random() - 0.5) * 0.01;
      
      await backend.location.updateLocation({
        busId: assignedBus.id,
        latitude: lat,
        longitude: lng,
        speed: Math.random() * 30 + 10, // 10-40 mph
        heading: Math.random() * 360,
      });

      toast({
        title: "Location Updated",
        description: "Your bus location has been updated successfully.",
      });
    } catch (error) {
      console.error("Failed to update location:", error);
      toast({
        title: "Error",
        description: "Failed to update location. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
            <Button variant="outline" onClick={handleEmergencyAlert} className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100">
              <Phone className="h-4 w-4 mr-2" />
              Emergency
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6">
          {assignedBus && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Bus {assignedBus.number}</CardTitle>
                    <CardDescription>Your assigned vehicle</CardDescription>
                  </div>
                  <Badge className={assignedBus.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {assignedBus.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Capacity</p>
                      <p className="font-semibold">{assignedBus.capacity} students</p>
                    </div>
                  </div>
                  {busLocation && (
                    <>
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-green-600 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Current Location</p>
                          <p className="font-semibold text-sm">
                            {busLocation.latitude.toFixed(4)}, {busLocation.longitude.toFixed(4)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-purple-600 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <p className="font-semibold capitalize">{busLocation.status}</p>
                        </div>
                      </div>
                    </>
                  )}
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
                  <Button className="w-full">
                    <Navigation className="h-4 w-4 mr-2" />
                    Start Navigation
                  </Button>
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
              <div className="grid md:grid-cols-3 gap-4">
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
                    <div className="space-y-4">
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

                <Button 
                  variant="outline" 
                  className="h-16 flex-col"
                  onClick={handleUpdateLocation}
                >
                  <MapPin className="h-6 w-6 mb-1" />
                  Update Location
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
