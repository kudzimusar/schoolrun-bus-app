import React from "react";
import { Link } from "react-router-dom";
import { Bus, Users, MapPin, Bell, LogIn } from "lucide-react";
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
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            A comprehensive school bus tracking and communication platform for parents, drivers, and administrators
          </p>
          <Link to="/login">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <LogIn className="h-5 w-5 mr-2" />
              Get Started
            </Button>
          </Link>
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
              <Link to="/login">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Parent Access
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
              <Link to="/login">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Driver Access
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
              <Link to="/login">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Admin Access
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-gray-600 mb-4">
            Demo Mode: Use any email/password combination to test the application
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/parent-dashboard">
              <Button variant="outline" size="sm">
                Demo Parent Dashboard
              </Button>
            </Link>
            <Link to="/driver-dashboard">
              <Button variant="outline" size="sm">
                Demo Driver Dashboard
              </Button>
            </Link>
            <Link to="/admin-dashboard">
              <Button variant="outline" size="sm">
                Demo Admin Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
