import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Bell, User, Shield, Smartphone, Mail, Languages } from "lucide-react";
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
  const [language, setLanguage] = useState("english");
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

  const getLabel = (english: string, shona: string, ndebele: string) => {
    if (language === 'shona') return shona;
    if (language === 'ndebele') return ndebele;
    return english;
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
            <h1 className="text-2xl font-bold text-gray-900">
              {getLabel('Settings', 'Zvirongwa', 'Izilungiselelo')}
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Languages className="h-5 w-5 mr-2" />
              {getLabel('Language', 'Mutauro', 'Ulimi')}
            </CardTitle>
            <CardDescription>
              {getLabel('Choose your preferred language', 'Sarudza mutauro wako', 'Khetha ulimi lwakho')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Button onClick={() => setLanguage('english')} variant={language === 'english' ? 'default' : 'outline'}>English</Button>
              <Button onClick={() => setLanguage('shona')} variant={language === 'shona' ? 'default' : 'outline'}>Shona</Button>
              <Button onClick={() => setLanguage('ndebele')} variant={language === 'ndebele' ? 'default' : 'outline'}>Ndebele</Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              {getLabel('Notification Preferences', 'Zviziviso', 'Izaziso')}
            </CardTitle>
            <CardDescription>
              {getLabel('Choose which notifications you want to receive', 'Sarudza zviziviso zvaunoda kugamuchira', 'Khetha izaziso ofuna ukuzithola')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="bus-approaching">{getLabel('Bus Approaching', 'Bhazi Rava Kusvika', 'Ibhasi Isiyesondela')}</Label>
                <Switch
                  id="bus-approaching"
                  checked={notifications.busApproaching}
                  onCheckedChange={(checked) => handleNotificationChange('busApproaching', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="bus-arrived">{getLabel('Bus Arrived', 'Bhazi Rasvika', 'Ibhasi Isifikile')}</Label>
                <Switch
                  id="bus-arrived"
                  checked={notifications.busArrived}
                  onCheckedChange={(checked) => handleNotificationChange('busArrived', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="bus-delayed">{getLabel('Bus Delays', 'Kunonoka kweBhazi', 'Ukulibala Kwebhasi')}</Label>
                <Switch
                  id="bus-delayed"
                  checked={notifications.busDelayed}
                  onCheckedChange={(checked) => handleNotificationChange('busDelayed', checked)}
                />
              </div>
            </div>
            <Button onClick={handleSaveNotifications}>{getLabel('Save Changes', 'Sevha Shanduko', 'Londoloza Izinguquko')}</Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              {getLabel('Security & Privacy', 'Chengetedzo', 'Ukuvikeleka')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full">
              {getLabel('Change Password', 'Chinja Pasiwedhi', 'Guqula Iphasiwedi')}
            </Button>
            <Button variant="destructive" className="w-full">
              {getLabel('Delete Account', 'Bvisa Akaundi', 'Susa I-akhawunti')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
