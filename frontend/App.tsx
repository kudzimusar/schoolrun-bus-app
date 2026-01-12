import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ParentDashboard from "./pages/ParentDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import BusMap from "./pages/BusMap";
import NotificationsHistory from "./pages/NotificationsHistory";
import SettingsPage from "./pages/SettingsPage";
import RouteManagementPage from "./pages/RouteManagementPage";
import ProfilePage from "./pages/ProfilePage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import Payments from "./pages/Payments";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      refetchInterval: 30000,
    },
  },
});

// Determine the base name for the router
const basename = import.meta.env.MODE === 'production' ? '/schoolrun-bus-app' : '';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router basename={basename}>
          <div className="min-h-screen bg-gray-50">
            <AppInner />
          </div>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AppInner() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/parent-dashboard" element={
        <ProtectedRoute allowedRoles={["parent"]}>
          <ParentDashboard />
        </ProtectedRoute>
      } />
      <Route path="/parent-dashboard/bus-map" element={
        <ProtectedRoute allowedRoles={["parent"]}>
          <BusMap />
        </ProtectedRoute>
      } />
      <Route path="/parent-dashboard/notifications-history" element={
        <ProtectedRoute allowedRoles={["parent"]}>
          <NotificationsHistory />
        </ProtectedRoute>
      } />
      <Route path="/parent-dashboard/settings" element={
        <ProtectedRoute allowedRoles={["parent"]}>
          <SettingsPage />
        </ProtectedRoute>
      } />
      <Route path="/parent-dashboard/payments" element={
        <ProtectedRoute allowedRoles={["parent"]}>
          <Payments />
        </ProtectedRoute>
      } />
      <Route path="/driver-dashboard" element={
        <ProtectedRoute allowedRoles={["driver"]}>
          <DriverDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin-dashboard" element={
        <ProtectedRoute allowedRoles={["admin", "operator"]}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin-dashboard/routes" element={
        <ProtectedRoute allowedRoles={["admin", "operator"]}>
          <RouteManagementPage />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
