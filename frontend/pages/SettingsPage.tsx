import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Bell, User, Shield, Smartphone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../hooks/useAuth";
import backend from "~backend/client";

export default function SettingsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({
    busApproaching: true,
    busArrived: true,
    busDelayed: true,
    routeChanged: true,
    emergency: true,
  });
  const [approachTime, setApproachTime] = useState("5");
  const [profile, setProfile] = useState({
    name: user?.name || "Sarah Johnson",
    email: user?.email || "sarah.johnson@example.com",
    phone: "+1 (555) 123-4567",
  });
  const { toast } = useToast();

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveNotifications = async () => {
    try {
      await backend.notification.updatePreferences({
        userId: user?.id || 1,
        busApproaching: notifications.busApproaching,
        busArrived: notifications.busArrived,
        busDelayed: notifications.busDelayed,
        routeChanged: notifications.routeChanged,
        emergency: notifications.emergency,
        approachTimeMinutes: parseInt(approachTime),
      });
      
      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error) {
      console.error("Failed to save notification preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save notification preferences.",
        variant: "destructive",
      });
    }
  };

  const handleSaveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link to={`/${user?.role}-dashboard`}>
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information and contact details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={handleSaveProfile}>Save Profile</Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Choose which notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="bus-approaching">Bus Approaching</Label>
                  <p className="text-sm text-gray-500">
                    Get notified when the bus is near your stop
                  </p>
                </div>
                <Switch
                  id="bus-approaching"
                  checked={notifications.busApproaching}
                  onCheckedChange={(checked) => handleNotificationChange('busApproaching', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="bus-arrived">Bus Arrived</Label>
                  <p className="text-sm text-gray-500">
                    Get notified when the bus arrives at your stop
                  </p>
                </div>
                <Switch
                  id="bus-arrived"
                  checked={notifications.busArrived}
                  onCheckedChange={(checked) => handleNotificationChange('busArrived', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="bus-delayed">Bus Delays</Label>
                  <p className="text-sm text-gray-500">
                    Get notified about bus delays or schedule changes
                  </p>
                </div>
                <Switch
                  id="bus-delayed"
                  checked={notifications.busDelayed}
                  onCheckedChange={(checked) => handleNotificationChange('busDelayed', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="route-changed">Route Changes</Label>
                  <p className="text-sm text-gray-500">
                    Get notified about route modifications
                  </p>
                </div>
                <Switch
                  id="route-changed"
                  checked={notifications.routeChanged}
                  onCheckedChange={(checked) => handleNotificationChange('routeChanged', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emergency">Emergency Alerts</Label>
                  <p className="text-sm text-gray-500">
                    Get notified about emergency situations
                  </p>
                </div>
                <Switch
                  id="emergency"
                  checked={notifications.emergency}
                  onCheckedChange={(checked) => handleNotificationChange('emergency', checked)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="approach-time">Approach Notification Time</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="approach-time"
                  type="number"
                  min="1"
                  max="30"
                  value={approachTime}
                  onChange={(e) => setApproachTime(e.target.value)}
                  className="w-20"
                />
                <span className="text-sm text-gray-500">minutes before arrival</span>
              </div>
            </div>

            <Button onClick={handleSaveNotifications}>Save Notification Settings</Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security & Privacy
            </CardTitle>
            <CardDescription>
              Manage your account security and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full">
              Change Password
            </Button>
            <Button variant="outline" className="w-full">
              Two-Factor Authentication
            </Button>
            <Button variant="outline" className="w-full">
              Privacy Settings
            </Button>
            <Separator />
            <Button variant="destructive" className="w-full">
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
