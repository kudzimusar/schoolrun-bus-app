import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { MapPin, Clock, Bell, Settings, ArrowRight, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import backend from "~backend/client";
import Navigation from "../components/Navigation";
import Header from "../components/Header";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";

export default function ParentDashboard() {
  const { user } = useAuth();
  
  const { data: children, isLoading: childrenLoading } = useQuery({
    queryKey: ["children", user?.id || 1],
    queryFn: () => backend.user.listChildren({ parentId: user?.id || 1 }),
  });

  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: () => backend.location.listAllLocations(),
  });

  const { data: notifications } = useQuery({
    queryKey: ["notifications", user?.id || 1],
    queryFn: () => backend.notification.listNotifications({ userId: user?.id || 1 }),
  });

  const { data: incidents } = useQuery({
    queryKey: ["incidents"],
    queryFn: () => backend.incident.listIncidents({ status: "open" }),
  });

  if (childrenLoading || locationsLoading) {
    return <LoadingSpinner />;
  }

  const getBusLocation = (busId?: number) => {
    if (!busId || !locations?.locations) return null;
    return locations.locations.find(loc => loc.busId === busId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "moving": return "bg-green-100 text-green-800";
      case "delayed": return "bg-red-100 text-red-800";
      case "stopped": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const unreadCount = notifications?.notifications.filter(n => !n.isRead).length || 0;
  const activeIncidents = incidents?.incidents.filter(i => 
    children?.children.some(child => child.busId === i.busId)
  ) || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Parent Dashboard">
        <Link to="/parent-dashboard/notifications-history">
          <Button variant="outline" size="sm" className="relative">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </Link>
        <Link to="/parent-dashboard/settings">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </Link>
      </Header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6">
          {/* Active Incidents Alert */}
          {activeIncidents.length > 0 && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Active Incident:</strong> {activeIncidents[0].title} - {activeIncidents[0].description}
              </AlertDescription>
            </Alert>
          )}

          {children?.children.map((child) => {
            const busLocation = getBusLocation(child.busId);
            
            return (
              <Card key={child.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{child.name}</CardTitle>
                      <CardDescription>
                        {child.busId ? `Bus ${child.busId}` : "No bus assigned"}
                      </CardDescription>
                    </div>
                    {busLocation && (
                      <Badge className={getStatusColor(busLocation.status)}>
                        {busLocation.status === "moving" ? "On Route" : 
                         busLocation.status === "delayed" ? "Delayed" : 
                         busLocation.status === "stopped" ? "At Stop" : "Unknown"}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      {busLocation && (
                        <>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            ETA: {busLocation.etaMinutes ? `${busLocation.etaMinutes} min` : "Calculating..."}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            Last updated: {new Date(busLocation.lastUpdated).toLocaleTimeString()}
                          </div>
                        </>
                      )}
                      {!busLocation && child.busId && (
                        <div className="flex items-center text-sm text-gray-500">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Bus location unavailable
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <Link to="/parent-dashboard/bus-map" state={{ busId: child.busId }}>
                        <Button className="w-full md:w-auto" disabled={!child.busId}>
                          View on Map
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {(!children?.children || children.children.length === 0) && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No children registered. Please contact your school administrator.</p>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your account and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <Link to="/parent-dashboard/settings">
                  <Button variant="outline" className="w-full h-16 flex-col">
                    <Settings className="h-6 w-6 mb-1" />
                    Notification Settings
                  </Button>
                </Link>
                <Link to="/parent-dashboard/notifications-history">
                  <Button variant="outline" className="w-full h-16 flex-col">
                    <Bell className="h-6 w-6 mb-1" />
                    View All Alerts
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Navigation />
    </div>
  );
}
