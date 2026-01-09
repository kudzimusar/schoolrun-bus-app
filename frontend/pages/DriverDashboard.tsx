import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation, Users, AlertTriangle, MapPin, Clock, Phone, CheckCircle, Play, Square, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [safetyChecks, setSafetyChecks] = useState({
    walkedToBack: false,
    checkedUnderSeats: false,
    noChildrenRemaining: false,
  });
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

  const assignedBus = buses?.buses[0];
  const currentRoute = routes?.routes.find(route => route.busId === assignedBus?.id);

  const startTracking = () => {
    if (!assignedBus) return;
    if (!("geolocation" in navigator)) {
      toast({ title: "Error", description: "Geolocation not supported", variant: "destructive" });
      return;
    }

    setIsTracking(true);
    toast({ title: "Trip Started", description: "GPS tracking is now active." });

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
        } catch (error) { console.error("Failed to update location:", error); }
      },
      (error) => {
        toast({ title: "GPS Error", description: "Failed to get location.", variant: "destructive" });
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
  };

  const handleEndTripRequest = () => {
    setShowSafetyModal(true);
  };

  const confirmEndTrip = async () => {
    if (!safetyChecks.walkedToBack || !safetyChecks.checkedUnderSeats || !safetyChecks.noChildrenRemaining) {
      toast({
        title: "Safety Check Incomplete",
        description: "Please complete all safety checks before ending the trip.",
        variant: "destructive",
      });
      return;
    }

    if (assignedBus && user) {
      try {
        await (backend as any).bus.completeInspection({
          busId: assignedBus.id,
          driverId: user.id,
          inspectionType: "post_trip_check",
          notes: "All clear. No children remaining on bus.",
        });
      } catch (error) {
        console.error("Failed to record inspection:", error);
      }
    }

    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setIsTracking(false);
    setShowSafetyModal(false);
    setSafetyChecks({ walkedToBack: false, checkedUnderSeats: false, noChildrenRemaining: false });
    
    toast({
      title: "Trip Ended Safely",
      description: "Post-trip inspection recorded. Thank you for keeping our children safe!",
    });
  };

  useEffect(() => {
    return () => { if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current); };
  }, []);

  if (isLoading) return <LoadingSpinner />;

  const handleReportIncident = async () => {
    if (!incidentType || !incidentDescription || !assignedBus) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
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
      toast({ title: "Incident Reported", description: "Report submitted successfully." });
      setIncidentType("");
      setIncidentDescription("");
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit report.", variant: "destructive" });
    } finally {
      setIsReportingIncident(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Driver Dashboard">
        <Button variant="outline" onClick={() => toast({ title: "Emergency Alert Sent" })} className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100">
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
                    {isTracking && <Badge className="bg-green-100 text-green-800 animate-pulse">LIVE TRACKING</Badge>}
                    <Badge className={assignedBus.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>{assignedBus.status}</Badge>
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
                          <p className="font-semibold text-sm">{lastLocation ? `${lastLocation.lat.toFixed(4)}, ${lastLocation.lng.toFixed(4)}` : "Not tracking"}</p>
                        </div>
                      </div>
                    </div>
                    {!isTracking ? (
                      <Button onClick={startTracking} className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg">
                        <Play className="h-5 w-5 mr-2" /> Start Trip
                      </Button>
                    ) : (
                      <Button onClick={handleEndTripRequest} variant="destructive" className="w-full h-12 text-lg">
                        <Square className="h-5 w-5 mr-2" /> End Trip
                      </Button>
                    )}
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 flex flex-col justify-center">
                    <h4 className="font-semibold text-blue-900 mb-1">Trip Instructions</h4>
                    <p className="text-sm text-blue-800">{isTracking ? "Keep this app open. Your location is shared with parents." : "Press 'Start Trip' to begin your route."}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Safety Modal */}
          <Dialog open={showSafetyModal} onOpenChange={setShowSafetyModal}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center text-red-600">
                  <ShieldCheck className="h-6 w-6 mr-2" />
                  No Sleeping Child Check
                </DialogTitle>
                <DialogDescription>
                  Mandatory safety inspection required before ending your trip.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Checkbox 
                    id="walkedToBack" 
                    checked={safetyChecks.walkedToBack}
                    onCheckedChange={(checked) => setSafetyChecks({...safetyChecks, walkedToBack: !!checked})}
                  />
                  <Label htmlFor="walkedToBack" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    I have walked to the back of the bus.
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Checkbox 
                    id="checkedUnderSeats" 
                    checked={safetyChecks.checkedUnderSeats}
                    onCheckedChange={(checked) => setSafetyChecks({...safetyChecks, checkedUnderSeats: !!checked})}
                  />
                  <Label htmlFor="checkedUnderSeats" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    I have checked under all seats.
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Checkbox 
                    id="noChildrenRemaining" 
                    checked={safetyChecks.noChildrenRemaining}
                    onCheckedChange={(checked) => setSafetyChecks({...safetyChecks, noChildrenRemaining: !!checked})}
                  />
                  <Label htmlFor="noChildrenRemaining" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    I confirm no children remain on the bus.
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSafetyModal(false)}>Cancel</Button>
                <Button 
                  onClick={confirmEndTrip}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={!safetyChecks.walkedToBack || !safetyChecks.checkedUnderSeats || !safetyChecks.noChildrenRemaining}
                >
                  Confirm & End Trip
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center"><Navigation className="h-6 w-6 text-blue-600 mr-2" />Current Route</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentRoute ? (
                    <div className="bg-gray-100 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-2">Active Route</p>
                      <p className="font-semibold">{currentRoute.name}</p>
                      <p className="text-sm text-gray-500">{currentRoute.stopCount} stops • {currentRoute.routeType}</p>
                    </div>
                  ) : <div className="bg-gray-100 rounded-lg p-4 text-center"><p className="text-gray-500">No active route assigned</p></div>}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center"><Users className="h-6 w-6 text-green-600 mr-2" />Student Manifest</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded"><span className="text-sm">Emma Johnson</span><Badge variant="outline">Stop 1</Badge></div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded"><span className="text-sm">Jake Johnson</span><Badge variant="outline">Stop 2</Badge></div>
                  <Button variant="outline" className="w-full">View Full Manifest</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="flex items-center"><AlertTriangle className="h-6 w-6 text-orange-600 mr-2" />Quick Actions</CardTitle></CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <Dialog>
                  <DialogTrigger asChild><Button variant="outline" className="h-16 flex-col"><AlertTriangle className="h-6 w-6 mb-1" />Report Incident</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Report Incident</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                      <Select value={incidentType} onValueChange={setIncidentType}><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent><SelectItem value="delay">Traffic Delay</SelectItem><SelectItem value="breakdown">Breakdown</SelectItem></SelectContent></Select>
                      <Textarea placeholder="Description..." value={incidentDescription} onChange={(e) => setIncidentDescription(e.target.value)} />
                      <Button onClick={handleReportIncident} className="w-full" disabled={isReportingIncident}>{isReportingIncident ? "Reporting..." : "Submit Report"}</Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" className="h-16 flex-col bg-red-50 border-red-200 text-red-700 hover:bg-red-100" onClick={() => toast({ title: "Emergency Alert Sent" })}><Phone className="h-6 w-6 mb-1" />Emergency Alert</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
