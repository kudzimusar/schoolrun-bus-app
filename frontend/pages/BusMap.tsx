import React, { useEffect, useRef, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Clock, Navigation as NavigationIcon, AlertTriangle, Zap, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import backend from "~backend/client";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";

export default function BusMap() {
  const location = useLocation();
  const { user } = useAuth();
  const busId = location.state?.busId;
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 });
  const [mapboxgl, setMapboxgl] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Load mapbox-gl dynamically
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("mapbox-gl").then((module) => {
        setMapboxgl(module.default || module);
      });
    }
  }, []);

  const { data: busLocation, isLoading, refetch } = useQuery({
    queryKey: ["busLocation", busId],
    queryFn: () => backend.location.getBusLocation({ busId }),
    enabled: !!busId,
    refetchInterval: 10000,
  });

  const { data: etaPrediction } = useQuery({
    queryKey: ["etaPrediction", busId],
    queryFn: () => backend.ai.predictETA({
      busId,
      routeId: 1,
      currentLatitude: busLocation?.latitude || 40.7128,
      currentLongitude: busLocation?.longitude || -74.0060,
      targetLatitude: 40.7158,
      targetLongitude: -74.0090,
    }),
    enabled: !!busId && !!busLocation,
    refetchInterval: 60000,
  });

  const { data: incidents } = useQuery({
    queryKey: ["busIncidents", busId],
    queryFn: () => backend.incident.listIncidents({ busId, status: "open" }),
    enabled: !!busId,
  });

  useEffect(() => {
    if (busLocation) {
      setMapCenter({ lat: busLocation.latitude, lng: busLocation.longitude });
      setLastUpdated(new Date(busLocation.lastUpdated));
    }
  }, [busLocation]);

  // Initialize Mapbox
  useEffect(() => {
    if (!mapRef.current || mapInstance.current || !import.meta.env.VITE_MAPBOX_TOKEN || !mapboxgl) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
    mapInstance.current = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [mapCenter.lng, mapCenter.lat],
      zoom: 14,
    });

    mapInstance.current.addControl(new mapboxgl.NavigationControl());

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, [mapboxgl]);

  // Update map center and marker on location changes
  useEffect(() => {
    if (!mapInstance.current || !mapboxgl) return;

    // Smoothly move the marker
    if (!markerRef.current) {
      const el = document.createElement('div');
      el.className = 'bus-marker';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.backgroundColor = '#2563eb';
      el.style.borderRadius = '50%';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v7h2"></path><circle cx="7" cy="17" r="2"></circle><path d="M9 17h6"></path><circle cx="17" cy="17" r="2"></circle></svg>';

      markerRef.current = new mapboxgl.Marker(el)
        .setLngLat([mapCenter.lng, mapCenter.lat])
        .addTo(mapInstance.current);
    } else {
      markerRef.current.setLngLat([mapCenter.lng, mapCenter.lat]);
    }

    // Centering the map on the bus
    mapInstance.current.easeTo({
      center: [mapCenter.lng, mapCenter.lat],
      duration: 1000
    });
  }, [mapCenter, mapboxgl]);

  // Live updates via streaming endpoint
  useEffect(() => {
    let closed = false;
    let stream: any;
    (async () => {
      try {
        stream = await (backend as any).location["liveBusLocations"]?.();
        if (!stream) {
          // Fallback to explicit client call if not in generated client
          const base = (backend as any)["baseClient"] || { createStreamOut: (path: string) => new (window as any).StreamOut(import.meta.env.VITE_CLIENT_TARGET + path) };
          stream = await (backend as any)["location"]?.["baseClient"]?.createStreamOut?.("/location/live");
          if (!stream && (backend as any)["createStreamOut"]) {
            stream = await (backend as any).createStreamOut("/location/live");
          }
        }
        if (!stream) return;
        for await (const evt of stream as AsyncIterable<any>) {
          if (closed) break;
          if (evt?.busId === busId) {
            setMapCenter({ lat: evt.latitude, lng: evt.longitude });
            setLastUpdated(new Date());
          }
        }
      } catch {
        // Ignore streaming errors
      }
    })();
    return () => {
      closed = true;
      try { stream?.close?.(); } catch {}
    };
  }, [busId]);

  if (!busId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No bus selected</p>
            <Link to={`/${user?.role}-dashboard`}>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link to={`/${user?.role}-dashboard`}>
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Bus {busId} Tracking</h1>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {incidents && incidents.incidents.length > 0 && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Active Incident:</strong> {incidents.incidents[0].title} - {incidents.incidents[0].description}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardHeader className="bg-white border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    <NavigationIcon className="h-5 w-5 text-blue-600 mr-2" />
                    Live Map
                  </CardTitle>
                  <Badge className="bg-blue-100 text-blue-800 animate-pulse">
                    LIVE UPDATES
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative">
                  {import.meta.env.VITE_MAPBOX_TOKEN ? (
                    <div ref={mapRef} className="h-[500px] w-full" />
                  ) : (
                    <div className="bg-gray-100 h-[500px] flex items-center justify-center flex-col p-6 text-center">
                      <MapPin className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600 font-medium">Mapbox token missing</p>
                      <p className="text-sm text-gray-500 mt-2">Please set VITE_MAPBOX_TOKEN in your environment settings to enable the live map.</p>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded shadow-md text-xs text-gray-600 border">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {busLocation && (
              <Card>
                <CardHeader>
                  <CardTitle>Bus Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="text-sm font-medium">Status</span>
                    </div>
                    <Badge className={getStatusColor(busLocation.status)}>
                      {busLocation.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <NavigationIcon className="h-5 w-5 text-green-600 mr-3" />
                      <span className="text-sm font-medium">ETA</span>
                    </div>
                    <span className="font-bold text-blue-700">
                      {etaPrediction ? `${etaPrediction.predictedETA} min` : 
                       busLocation.etaMinutes ? `${busLocation.etaMinutes} min` : "Calculating..."}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-purple-600 mr-3" />
                      <span className="text-sm font-medium">Coordinates</span>
                    </div>
                    <span className="text-xs font-mono text-gray-600">
                      {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {etaPrediction && (
              <Card className="border-blue-100 bg-blue-50/30">
                <CardHeader>
                  <CardTitle className="text-md flex items-center text-blue-900">
                    <Zap className="h-4 w-4 text-blue-600 mr-2" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-blue-800">
                    <p className="mb-2"><strong>Traffic:</strong> {etaPrediction.factors.trafficConditions}</p>
                    <p><strong>Confidence:</strong> {Math.round(etaPrediction.confidenceScore * 100)}%</p>
                  </div>
                  <div className="w-full bg-blue-100 rounded-full h-1.5">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full" 
                      style={{ width: `${etaPrediction.confidenceScore * 100}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
