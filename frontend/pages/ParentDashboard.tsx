import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { MapPin, Clock, Bell, Settings, ArrowRight, AlertTriangle, UserCheck, LogIn, LogOut } from "lucide-react";
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
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <UserCheck className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{child.name}</CardTitle>
                        <CardDescription>
                          {child.busId ? `Bus ${child.busId}` : "No bus assigned"}
                        </CardDescription>
                      </div>
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
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {/* Student Status Section */}
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                        <h4 className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-3">Current Status</h4>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {/* Mocking the last status for demo purposes */}
                            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center mr-3 shadow-sm">
                              <LogIn className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Boarded Bus</p>
                              <p className="text-xs text-gray-500">Today at 7:45 AM</p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800 border-green-200">SAFE</Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {busLocation && (
                          <>
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-4 w-4 mr-2 text-blue-500" />
                              ETA: <span className="font-semibold ml-1">{busLocation.etaMinutes ? `${busLocation.etaMinutes} min` : "Calculating..."}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="h-4 w-4 mr-2 text-green-500" />
                              Last updated: {new Date(busLocation.lastUpdated).toLocaleTimeString()}
                            </div>
                          </>
                        )}
                        {!busLocation && child.busId && (
                          <div className="flex items-center text-sm text-gray-500">
                            <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                            Bus location unavailable
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col justify-end gap-3">
                      <Link to="/parent-dashboard/bus-map" state={{ busId: child.busId }} className="w-full">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled={!child.busId}>
                          Track Live Location
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                      <Button variant="outline" className="w-full">
                        View Attendance History
                      </Button>
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
                <Link to="/parent-dashboard/settings" className="w-full">
                  <Button variant="outline" className="w-full h-16 flex-col">
                    <Settings className="h-6 w-6 mb-1" />
                    Notification Settings
                  </Button>
                </Link>
                <Link to="/parent-dashboard/notifications-history" className="w-full">
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
