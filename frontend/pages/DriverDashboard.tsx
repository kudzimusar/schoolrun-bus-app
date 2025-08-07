import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation, Users, AlertTriangle, MapPin, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import backend from "~backend/client";
import LoadingSpinner from "../components/LoadingSpinner";

export default function DriverDashboard() {
  const { data: buses, isLoading } = useQuery({
    queryKey: ["buses"],
    queryFn: () => backend.bus.listBuses(),
  });

  const { data: locations } = useQuery({
    queryKey: ["locations"],
    queryFn: () => backend.location.listAllLocations(),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // For demo purposes, assume driver is assigned to first bus
  const assignedBus = buses?.buses[0];
  const busLocation = assignedBus ? locations?.locations.find(loc => loc.busId === assignedBus.id) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
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
                  <div className="bg-gray-100 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Next Stop</p>
                    <p className="font-semibold">Maple Street & Oak Avenue</p>
                    <p className="text-sm text-gray-500">ETA: 8 minutes</p>
                  </div>
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
                    <Badge variant="outline">Stop 3</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">Michael Chen</span>
                    <Badge variant="outline">Stop 5</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">Sarah Williams</span>
                    <Badge variant="outline">Stop 7</Badge>
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
                <Button variant="outline" className="h-16 flex-col">
                  <AlertTriangle className="h-6 w-6 mb-1" />
                  Report Delay
                </Button>
                <Button variant="outline" className="h-16 flex-col">
                  <Users className="h-6 w-6 mb-1" />
                  Emergency Alert
                </Button>
                <Button variant="outline" className="h-16 flex-col">
                  <MapPin className="h-6 w-6 mb-1" />
                  Update Location
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
