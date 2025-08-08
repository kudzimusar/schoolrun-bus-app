import React from "react";
import { Link } from "react-router-dom";
import { Bus, Users, MapPin, Bell, LogIn, UserCheck } from "lucide-react";
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
            A comprehensive school bus tracking and communication platform for parents, drivers, and administrators in Zimbabwe
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <LogIn className="h-5 w-5 mr-2" />
                Get Started
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                <UserCheck className="h-5 w-5 mr-2" />
                Quick Demo Access
              </Button>
            </Link>
          </div>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-6 w-6 text-green-600 mr-2" />
                Real-Time Tracking
              </CardTitle>
              <CardDescription>
                Track your child's bus location in real-time with accurate GPS positioning and landmark-based stops
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
                Receive timely alerts via EcoCash/OneMoney integration when the bus is approaching or if there are delays
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-6 w-6 text-purple-600 mr-2" />
                Multi-Language Support
              </CardTitle>
              <CardDescription>
                Available in English, Shona, and Ndebele with tailored dashboards for all user types
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-12">
          <h2 className="text-2xl font-bold text-center mb-6">Zimbabwe-Specific Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-600">Mobile Money Integration</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• EcoCash payment support</li>
                <li>• OneMoney wallet top-ups</li>
                <li>• Multi-currency display (USD/ZWL)</li>
                <li>• Offline payment processing</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-600">Local Adaptations</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Landmark-based bus stops</li>
                <li>• Offline route downloads</li>
                <li>• Harare-optimized mapping</li>
                <li>• Community-friendly interface</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-blue-600">Parents</CardTitle>
              <CardDescription>Track your children's buses and receive notifications in your preferred language</CardDescription>
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
              <CardTitle className="text-green-600">Drivers</CardTitle>
              <CardDescription>Navigate routes with offline maps and manage student manifests efficiently</CardDescription>
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
              <CardTitle className="text-purple-600">Administrators</CardTitle>
              <CardDescription>Manage fleet operations with AI-powered route optimization and analytics</CardDescription>
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

        <div className="text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-2">🚀 Demo Mode Available</h3>
            <p className="text-sm text-yellow-700 mb-4">
              Test the full application with pre-loaded Zimbabwe-specific data including Harare routes, EcoCash integration, and multi-language support.
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/parent-dashboard">
                <Button variant="outline" size="sm" className="border-yellow-400 text-yellow-700 hover:bg-yellow-100">
                  Demo Parent Dashboard
                </Button>
              </Link>
              <Link to="/driver-dashboard">
                <Button variant="outline" size="sm" className="border-yellow-400 text-yellow-700 hover:bg-yellow-100">
                  Demo Driver Dashboard
                </Button>
              </Link>
              <Link to="/admin-dashboard">
                <Button variant="outline" size="sm" className="border-yellow-400 text-yellow-700 hover:bg-yellow-100">
                  Demo Admin Dashboard
                </Button>
              </Link>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Use the Quick Access feature on the login page to instantly access any role-based account
          </p>
        </div>
      </div>
    </div>
  );
}
