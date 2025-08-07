import React from "react";
import { Link } from "react-router-dom";
import { Bus, Users, MapPin, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Bus className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">School Run Bus App</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A comprehensive school bus tracking and communication platform for parents, drivers, and administrators
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-6 w-6 text-green-600 mr-2" />
                Real-Time Tracking
              </CardTitle>
              <CardDescription>
                Track your child's bus location in real-time with accurate GPS positioning
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-6 w-6 text-orange-600 mr-2" />
                Smart Notifications
              </CardTitle>
              <CardDescription>
                Receive timely alerts when the bus is approaching or if there are delays
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-6 w-6 text-purple-600 mr-2" />
                Multi-Role Access
              </CardTitle>
              <CardDescription>
                Tailored dashboards for parents, drivers, and school administrators
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <CardTitle>Parents</CardTitle>
              <CardDescription>Track your children's buses and receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/parent-dashboard">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Parent Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CardTitle>Drivers</CardTitle>
              <CardDescription>Navigate routes and manage student manifests</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/driver-dashboard">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Driver Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CardTitle>Administrators</CardTitle>
              <CardDescription>Manage fleet, routes, and monitor performance</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin-dashboard">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Admin Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
