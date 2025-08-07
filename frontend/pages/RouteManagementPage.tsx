import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, MapPin, Clock, Edit, Trash2, Bus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

interface Route {
  id: number;
  name: string;
  busNumber: string;
  type: "morning" | "afternoon";
  stops: number;
  isActive: boolean;
}

interface BusStop {
  id: number;
  name: string;
  time: string;
  order: number;
}

export default function RouteManagementPage() {
  const [routes] = useState<Route[]>([
    { id: 1, name: "Route A - Morning", busNumber: "123", type: "morning", stops: 8, isActive: true },
    { id: 2, name: "Route A - Afternoon", busNumber: "123", type: "afternoon", stops: 8, isActive: true },
    { id: 3, name: "Route B - Morning", busNumber: "456", type: "morning", stops: 6, isActive: true },
    { id: 4, name: "Route C - Morning", busNumber: "789", type: "morning", stops: 10, isActive: false },
  ]);

  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [busStops] = useState<BusStop[]>([
    { id: 1, name: "Maple Street & Oak Avenue", time: "08:15", order: 1 },
    { id: 2, name: "Pine Street & Elm Avenue", time: "08:20", order: 2 },
    { id: 3, name: "Cedar Street & Birch Avenue", time: "08:25", order: 3 },
    { id: 4, name: "Willow Street & Ash Avenue", time: "08:30", order: 4 },
    { id: 5, name: "Oakwood Elementary School", time: "08:35", order: 5 },
  ]);

  const [newRoute, setNewRoute] = useState({
    name: "",
    busNumber: "",
    type: "morning" as "morning" | "afternoon",
  });

  const { toast } = useToast();

  const handleCreateRoute = () => {
    if (newRoute.name && newRoute.busNumber) {
      toast({
        title: "Route created",
        description: `${newRoute.name} has been created successfully.`,
      });
      setNewRoute({ name: "", busNumber: "", type: "morning" });
    }
  };

  const handleDeleteRoute = (routeId: number) => {
    toast({
      title: "Route deleted",
      description: "The route has been removed from the system.",
    });
  };

  const getRouteTypeColor = (type: string) => {
    return type === "morning" ? "bg-blue-100 text-blue-800" : "bg-orange-100 text-orange-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/admin-dashboard">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Route Management</h1>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Route
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Route</DialogTitle>
                  <DialogDescription>
                    Add a new bus route to the system
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="route-name">Route Name</Label>
                    <Input
                      id="route-name"
                      placeholder="Enter route name"
                      value={newRoute.name}
                      onChange={(e) => setNewRoute(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bus-number">Bus Number</Label>
                    <Input
                      id="bus-number"
                      placeholder="Enter bus number"
                      value={newRoute.busNumber}
                      onChange={(e) => setNewRoute(prev => ({ ...prev, busNumber: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="route-type">Route Type</Label>
                    <Select value={newRoute.type} onValueChange={(value: "morning" | "afternoon") => setNewRoute(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning</SelectItem>
                        <SelectItem value="afternoon">Afternoon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreateRoute} className="w-full">
                    Create Route
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Routes List */}
          <Card>
            <CardHeader>
              <CardTitle>All Routes</CardTitle>
              <CardDescription>Manage your bus routes and schedules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {routes.map((route) => (
                  <div
                    key={route.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedRoute?.id === route.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedRoute(route)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{route.name}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge className={getRouteTypeColor(route.type)}>
                          {route.type}
                        </Badge>
                        <Badge variant={route.isActive ? "default" : "secondary"}>
                          {route.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Bus className="h-4 w-4 mr-1" />
                          Bus {route.busNumber}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {route.stops} stops
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRoute(route.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Route Details */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedRoute ? `${selectedRoute.name} Details` : "Select a Route"}
              </CardTitle>
              <CardDescription>
                {selectedRoute ? "View and manage route stops and schedule" : "Choose a route from the list to view details"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedRoute ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Bus Number</Label>
                      <p className="text-lg font-semibold">{selectedRoute.busNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Type</Label>
                      <p className="text-lg font-semibold capitalize">{selectedRoute.type}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Total Stops</Label>
                      <p className="text-lg font-semibold">{selectedRoute.stops}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Status</Label>
                      <p className="text-lg font-semibold">{selectedRoute.isActive ? "Active" : "Inactive"}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Bus Stops</h3>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Stop
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {busStops.map((stop) => (
                        <div key={stop.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                              {stop.order}
                            </div>
                            <div>
                              <p className="font-medium">{stop.name}</p>
                              <p className="text-sm text-gray-500 flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {stop.time}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button className="flex-1">Save Changes</Button>
                    <Button variant="outline" className="flex-1">
                      Duplicate Route
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select a route to view its details and manage stops</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
