import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowLeft, Bell, Clock, Bus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import backend from "~backend/client";
import LoadingSpinner from "../components/LoadingSpinner";

export default function NotificationsHistory() {
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications", 1], // Using hardcoded user ID for demo
    queryFn: () => backend.notification.listNotifications({ userId: 1 }),
  });

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await backend.notification.markAsRead({ notificationId });
      // In a real app, you'd refetch or update the cache here
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "bus_approaching": return <Clock className="h-5 w-5 text-blue-600" />;
      case "bus_arrived": return <Bus className="h-5 w-5 text-green-600" />;
      case "bus_delayed": return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case "route_changed": return <Bell className="h-5 w-5 text-orange-600" />;
      case "emergency": return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "bus_approaching": return "bg-blue-100 text-blue-800";
      case "bus_arrived": return "bg-green-100 text-green-800";
      case "bus_delayed": return "bg-red-100 text-red-800";
      case "route_changed": return "bg-orange-100 text-orange-800";
      case "emergency": return "bg-red-100 text-red-800";
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
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="space-y-4">
          {notifications?.notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`hover:shadow-md transition-shadow ${!notification.isRead ? 'ring-2 ring-blue-200' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Badge className={getNotificationColor(notification.type)}>
                          {notification.type.replace('_', ' ')}
                        </Badge>
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-xs"
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {new Date(notification.sentAt).toLocaleString()}
                      </span>
                      {notification.busId && (
                        <span>Bus {notification.busId}</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {(!notifications?.notifications || notifications.notifications.length === 0) && (
            <Card>
              <CardContent className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No notifications yet</p>
                <p className="text-sm text-gray-400 mt-2">
                  You'll receive notifications about bus arrivals, delays, and route changes
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
