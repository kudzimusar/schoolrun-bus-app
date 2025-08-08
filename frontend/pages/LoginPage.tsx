import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Bus, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, login } = useAuth();

  // Redirect if already logged in
  if (user) {
    return <Navigate to={`/${user.role}-dashboard`} replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (email && password) {
        await login(email, password);
        
        toast({
          title: "Login successful",
          description: "Welcome back! Redirecting to your dashboard...",
        });

        // The redirect will happen automatically via the auth context
        // But we can also manually navigate based on the user role
        setTimeout(() => {
          // This will be handled by the Navigate component above after login
        }, 100);
      } else {
        toast({
          title: "Login failed",
          description: "Please fill in all fields",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: string) => {
    setIsLoading(true);
    try {
      await login(`demo-${role}@example.com`, "demo123");
      toast({
        title: "Demo login successful",
        description: `Logged in as demo ${role}`,
      });
    } catch (error) {
      console.error("Demo login error:", error);
      toast({
        title: "Demo login failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Bus className="h-10 w-10 text-blue-600 mr-2" />
            <CardTitle className="text-2xl">School Run Bus</CardTitle>
          </div>
          <CardDescription>
            Sign in to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Demo Accounts</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDemoLogin("parent")}
                disabled={isLoading}
              >
                Demo Parent
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDemoLogin("driver")}
                disabled={isLoading}
              >
                Demo Driver
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDemoLogin("admin")}
                disabled={isLoading}
              >
                Demo Admin
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDemoLogin("operator")}
                disabled={isLoading}
              >
                Demo Operator
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Demo credentials: Any email/password combination works
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
