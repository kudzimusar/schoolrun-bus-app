import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Bus, Mail, Lock, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../hooks/useAuth";

interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: string;
  description: string;
}

const demoUsers: DemoUser[] = [
  {
    id: "parent1",
    name: "Sarah Johnson",
    email: "parent1@example.com",
    role: "parent",
    description: "Parent with 2 children (Emma & Jake)"
  },
  {
    id: "parent2", 
    name: "Michael Chen",
    email: "parent2@example.com",
    role: "parent",
    description: "Parent with 1 child (Lily)"
  },
  {
    id: "demo-parent",
    name: "Demo Parent",
    email: "demo-parent@example.com", 
    role: "parent",
    description: "Demo parent account with sample data"
  },
  {
    id: "driver1",
    name: "Robert Smith",
    email: "driver1@example.com",
    role: "driver", 
    description: "Driver assigned to Bus 123"
  },
  {
    id: "demo-driver",
    name: "Demo Driver",
    email: "demo-driver@example.com",
    role: "driver",
    description: "Demo driver account with sample routes"
  },
  {
    id: "admin1",
    name: "Lisa Anderson", 
    email: "admin1@example.com",
    role: "admin",
    description: "School administrator"
  },
  {
    id: "demo-admin",
    name: "Demo Admin",
    email: "demo-admin@example.com",
    role: "admin", 
    description: "Demo admin account with full access"
  },
  {
    id: "operator1",
    name: "David Wilson",
    email: "operator1@example.com",
    role: "operator",
    description: "Transport operator with fleet management"
  },
  {
    id: "demo-operator",
    name: "Demo Operator",
    email: "demo-operator@example.com",
    role: "operator",
    description: "Demo operator account with system access"
  }
];

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedDemoUser, setSelectedDemoUser] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, login, signup } = useAuth();

  // Redirect if already logged in
  if (user) {
    return <Navigate to={`/${user.role}-dashboard`} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignup) {
        if (email && password && name && role) {
          await signup(email, password, name, role, phone);
          
          toast({
            title: "Account created successfully",
            description: "Welcome! Redirecting to your dashboard...",
          });
        } else {
          toast({
            title: "Signup failed",
            description: "Please fill in all required fields",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      } else {
        if (email && password) {
          await login(email, password);
          
          toast({
            title: "Login successful",
            description: "Welcome back! Redirecting to your dashboard...",
          });
        } else {
          toast({
            title: "Login failed",
            description: "Please fill in all fields",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast({
        title: isSignup ? "Signup failed" : "Login failed",
        description: isSignup 
          ? "Failed to create account. Please try again." 
          : "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoRole: string) => {
    setIsLoading(true);
    try {
      await login(`demo-${demoRole}@example.com`, "demo123");
      toast({
        title: "Demo login successful",
        description: `Logged in as demo ${demoRole}`,
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

  const handleQuickLogin = async () => {
    if (!selectedDemoUser) {
      toast({
        title: "No user selected",
        description: "Please select a user from the dropdown",
        variant: "destructive",
      });
      return;
    }

    const demoUser = demoUsers.find(u => u.id === selectedDemoUser);
    if (!demoUser) return;

    setIsLoading(true);
    try {
      await login(demoUser.email, "demo123");
      toast({
        title: "Quick login successful",
        description: `Logged in as ${demoUser.name}`,
      });
    } catch (error) {
      console.error("Quick login error:", error);
      toast({
        title: "Quick login failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setRole("");
    setPhone("");
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    resetForm();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "parent": return "text-blue-600";
      case "driver": return "text-green-600";
      case "admin": return "text-purple-600";
      case "operator": return "text-orange-600";
      default: return "text-gray-600";
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
            {isSignup ? "Create your account" : "Sign in to access your dashboard"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Quick Access Section */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center mb-3">
              <Users className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="font-medium text-blue-900">Quick Access</h3>
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="demo-user-select" className="text-sm text-blue-800">
                  Select a demo user to login instantly:
                </Label>
                <Select value={selectedDemoUser} onValueChange={setSelectedDemoUser}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Choose a demo user..." />
                  </SelectTrigger>
                  <SelectContent>
                    {demoUsers.map((demoUser) => (
                      <SelectItem key={demoUser.id} value={demoUser.id}>
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <span className="font-medium">{demoUser.name}</span>
                            <span className={`ml-2 text-xs ${getRoleColor(demoUser.role)}`}>
                              ({demoUser.role})
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleQuickLogin} 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading || !selectedDemoUser}
              >
                {isLoading ? "Logging in..." : "Quick Login"}
              </Button>
            </div>
            {selectedDemoUser && (
              <div className="mt-3 p-2 bg-white rounded border">
                <p className="text-xs text-gray-600">
                  {demoUsers.find(u => u.id === selectedDemoUser)?.description}
                </p>
              </div>
            )}
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or use manual login</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required={isSignup}
                  />
                </div>
              </div>
            )}

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

            {isSignup && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={setRole} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="driver">Driver</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="operator">Transport Operator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (isSignup ? "Creating Account..." : "Signing in...") : (isSignup ? "Create Account" : "Sign In")}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={toggleMode}
              className="text-sm"
              disabled={isLoading}
            >
              {isSignup 
                ? "Already have an account? Sign in" 
                : "Don't have an account? Sign up"}
            </Button>
          </div>

          {!isSignup && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Quick Demo Access</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDemoLogin("parent")}
                  disabled={isLoading}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  Demo Parent
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDemoLogin("driver")}
                  disabled={isLoading}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  Demo Driver
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDemoLogin("admin")}
                  disabled={isLoading}
                  className="text-purple-600 border-purple-200 hover:bg-purple-50"
                >
                  Demo Admin
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDemoLogin("operator")}
                  disabled={isLoading}
                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  Demo Operator
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isSignup 
                ? "Create an account to get started with the School Run Bus App" 
                : "Demo credentials: Any email/password combination works"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
