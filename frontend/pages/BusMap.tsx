import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Clock, Navigation as NavigationIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import backend from "~backend/client";
import LoadingSpinner from "../components/LoadingSpinner";

export default function BusMap() {
  const location = useLocation();
  const busId = location.state?.busId;
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 }); // Default to NYC

  const { data: busLocation, isLoading } = useQuery({
    queryKey: ["busLocation", busId],
    queryFn: () => backend.location.getBusLocation({ busId }),
    enabled: !!busId,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  useEffect(() => {
    if (busLocation) {
      setMapCenter({
        lat: busLocation.latitude,
        lng: busLocation.longitude,
      });
    }
  }, [busLocation]);

  if (!busId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No bus selected</p>
            <Link to="/parent-dashboard">
              <Button className="mt-4">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "moving": return "bg-green-100 text-green-800";
      case "delayed": return "bg-red-100 text-red-800";
      case "stopped": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link to="/parent-dashboard">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Bus {busId} Location</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {busLocation && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Bus Status</CardTitle>
                <Badge className={getStatusColor(busLocation.status)}>
                  {busLocation.status === "moving" ? "On Route" : 
                   busLocation.status === "delayed" ? "Delayed" : 
                   busLocation.status === "stopped" ? "At Stop" : "Unknown"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">ETA</p>
                    <p className="font-semibold">
                      {busLocation.etaMinutes ? `${busLocation.etaMinutes} min` : "Calculating..."}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-semibold text-sm">
                      {busLocation.latitude.toFixed(4)}, {busLocation.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <NavigationIcon className="h-5 w-5 text-purple-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="font-semibold text-sm">
                      {new Date(busLocation.lastUpdated).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Live Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Interactive map would be displayed here</p>
                <p className="text-sm text-gray-500 mt-2">
                  Integration with Google Maps or similar mapping service
                </p>
                {busLocation && (
                  <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
                    <p className="text-sm font-medium">Bus Location:</p>
                    <p className="text-sm text-gray-600">
                      Lat: {busLocation.latitude.toFixed(6)}, Lng: {busLocation.longitude.toFixed(6)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
