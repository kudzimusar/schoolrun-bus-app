import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, MapPin, Bell, Settings, Wallet } from "lucide-react";

export default function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around items-center max-w-md mx-auto">
        <Link
          to="/parent-dashboard"
          className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
            isActive("/parent-dashboard")
              ? "text-blue-600 bg-blue-50"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </Link>

        <Link
          to="/parent-dashboard/bus-map"
          className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
            isActive("/parent-dashboard/bus-map")
              ? "text-blue-600 bg-blue-50"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <MapPin className="h-5 w-5" />
          <span className="text-xs mt-1">Map</span>
        </Link>

        <Link
          to="/parent-dashboard/payments"
          className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
            isActive("/parent-dashboard/payments")
              ? "text-blue-600 bg-blue-50"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Wallet className="h-5 w-5" />
          <span className="text-xs mt-1">Payments</span>
        </Link>

        <Link
          to="/parent-dashboard/notifications-history"
          className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
            isActive("/parent-dashboard/notifications-history")
              ? "text-blue-600 bg-blue-50"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Bell className="h-5 w-5" />
          <span className="text-xs mt-1">Alerts</span>
        </Link>

        <Link
          to="/parent-dashboard/settings"
          className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
            isActive("/parent-dashboard/settings")
              ? "text-blue-600 bg-blue-50"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Settings className="h-5 w-5" />
          <span className="text-xs mt-1">Settings</span>
        </Link>
      </div>
    </div>
  );
}
