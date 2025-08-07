import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ParentDashboard from "./pages/ParentDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import BusMap from "./pages/BusMap";
import NotificationsHistory from "./pages/NotificationsHistory";
import SettingsPage from "./pages/SettingsPage";
import RouteManagementPage from "./pages/RouteManagementPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      refetchInterval: 30000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppInner />
        </div>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

function AppInner() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/parent-dashboard" element={<ParentDashboard />} />
      <Route path="/parent-dashboard/bus-map" element={<BusMap />} />
      <Route path="/parent-dashboard/notifications-history" element={<NotificationsHistory />} />
      <Route path="/parent-dashboard/settings" element={<SettingsPage />} />
      <Route path="/driver-dashboard" element={<DriverDashboard />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/admin-dashboard/routes" element={<RouteManagementPage />} />
    </Routes>
  );
}
